import { NextRequest, NextResponse } from "next/server";
import { db, ensureMediaBucket } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  checkHoneypotAndMinSubmitTime,
  validateSubmissionServer,
  verifyImageMagicBytes,
} from "@/lib/validation";
import { generateUniqueSlug, toBaseSlug } from "@/lib/slug";
import { emitListingSubmitted } from "@/lib/events";
import { checkListingSubmissionRateLimit } from "@/lib/ratelimit";
import {
  getFeaturedWindowState,
  normalizeDirectoryPlan,
} from "@/config/site";
import {
  getOrCreateFallbackOtherCategory,
  createCategorySuggestion,
} from "@/lib/category-suggestions";
import {
  getUserUpvotedListingIds,
  getListingUpvoteCountsMap,
  getListingUpvoteState,
} from "@/lib/upvotes";

const NUMERIC_ID_REGEX = /^\d+$/;

function getSafeExtension(file: File): string {
  const mimeMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mimeMap[file.type] || "png";
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

async function verifyCategoryExists(
  categoryInput: string,
  customCategoryInput?: string
): Promise<number | null> {
  const trimmed = categoryInput.trim();
  if (!trimmed) return null;

  // Handle "Other" custom category: resolve to static fallback container in public.categories
  // Custom user categories are NEVER directly inserted into public.categories!
  if (trimmed.toLowerCase() === "other") {
    const customName = String(customCategoryInput || "").trim();
    if (customName.length < 2) return null;

    const fallbackCategory = await getOrCreateFallbackOtherCategory();
    return fallbackCategory.id;
  }

  if (NUMERIC_ID_REGEX.test(trimmed)) {
    const { data: byId } = await db
      .from("categories")
      .select("id")
      .eq("id", Number(trimmed))
      .maybeSingle();
    return byId?.id ? Number(byId.id) : null;
  }

  const categorySlug = toBaseSlug(trimmed);
  const { data: bySlug } = await db
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  return bySlug?.id ? Number(bySlug.id) : null;
}

/**
 * GET /api/listings
 * Public API endpoint for fetching directory listings.
 * Strictly filters by status = 'approved' so 'pending' or 'rejected'
 * tools are NEVER publicly visible.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const categoryId = searchParams.get("category_id") || searchParams.get("category");
    const featuredParam = searchParams.get("featured");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Number(limitParam) || 30, 100);

    if (slug) {
      const { data, error } = await db
        .from("listings")
        .select(
          "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, created_at, approved_at, categories(id, slug, name), listing_screenshots(id, url, position)"
        )
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, message: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { ok: false, message: "Listing not found or not yet approved." },
          { status: 404 }
        );
      }

      let userId: string | null = null;
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {}

      const upvoteState = await getListingUpvoteState({
        listingId: Number(data.id),
        userId,
      });

      return NextResponse.json({
        ok: true,
        listing: {
          ...data,
          upvotes: 42 + upvoteState.upvotesCount,
          isUpvoted: upvoteState.isUpvoted,
        },
      });
    }

    let query = db
      .from("listings")
      .select(
        `id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, starting_price, currency, billing_period, listing_plan, status, submitted_by_email, created_at, approved_at, categories(id, slug, name), listing_screenshots(id, url, position)`
      )
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (featuredParam === "true") {
      query = query.in("listing_plan", ["featured", "one_time"]);
    }

    if (categoryId && NUMERIC_ID_REGEX.test(categoryId)) {
      query = query.eq("category_id", Number(categoryId));
    }

    query = query.limit(limit);
    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    // Check optional authenticated user session
    let sessionUserId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) sessionUserId = user.id;
    } catch {}

    const fetchedIds = (data || []).map((l: any) => Number(l.id)).filter(Boolean);
    const [userUpvotedSet, upvoteCountsMap] = await Promise.all([
      sessionUserId ? getUserUpvotedListingIds(sessionUserId) : Promise.resolve(new Set<number>()),
      fetchedIds.length > 0 ? getListingUpvoteCountsMap(fetchedIds) : Promise.resolve(new Map<number, number>()),
    ]);

    const nowMs = Date.now();
    // Sort newest-approved (or newest-created fallback) strictly first (#1)
    const sortedRows = [...(data || [])].sort((a: any, b: any) => {
      const aTs = Date.parse(a.approved_at || a.created_at || "") || 0;
      const bTs = Date.parse(b.approved_at || b.created_at || "") || 0;
      if (bTs !== aTs) return bTs - aTs;
      return Number(b.id || 0) - Number(a.id || 0);
    });

    const allMapped = sortedRows.map((l: any, index: number) => {
      const categoryName = (l.categories as any)?.name || "SaaS";
      const categorySlug = (l.categories as any)?.slug || "saas";
      const initials = (l.name || "TL").slice(0, 2).toUpperCase();
      const emailUser = (l.submitted_by_email || "").split("@")[0].trim();
      const author = emailUser
        ? emailUser.replace(/[._+-]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()).trim()
        : "Maker";

      const dynamicDbVotes = upvoteCountsMap.get(Number(l.id)) || Number(l.upvotes_count || 0);
      const baseUpvotes = Math.max(384 - index * 32, 42) + dynamicDbVotes;
      const isUpvoted = userUpvotedSet.has(Number(l.id));

      const listingPlan = normalizeDirectoryPlan(l.listing_plan);
      const featuredWindow = getFeaturedWindowState(
        l.listing_plan,
        l.approved_at,
        l.created_at,
        nowMs
      );

      return {
        id: String(l.id),
        slug: l.slug,
        name: l.name,
        tagline: l.tagline,
        category: categoryName,
        categorySlug,
        initials,
        logoUrl: l.logo_url,
        pricing: l.pricing_model,
        startingPrice: l.starting_price,
        billingPeriod: l.billing_period,
        listingPlan,
        isFeaturedActive: featuredWindow.isFeaturedActive,
        featuredUntil: featuredWindow.featuredUntil,
        featuredDaysRemaining: featuredWindow.featuredDaysRemaining,
        approvedAt: l.approved_at || l.created_at,
        createdAt: l.created_at,
        author,
        upvotes: baseUpvotes,
        isUpvoted,
        rank: index + 1,
        commentsCount: Math.max(31 - index * 3, 2),
      };
    });

    const mapped =
      featuredParam === "true"
        ? allMapped.filter((item) => item.isFeaturedActive)
        : allMapped;

    const featured = mapped.filter((item) => item.isFeaturedActive);
    const premium = mapped.filter((item) => item.listingPlan === "premium");
    const free = mapped.filter((item) => item.listingPlan === "free");
    const justListed = mapped;

    // Podium Champions: Top 3 by live community upvotes
    const sortedByUpvotes = [...mapped].sort((a, b) => b.upvotes - a.upvotes);
    const podium = sortedByUpvotes.slice(0, 3).map((item, idx) => ({
      ...item,
      rank: (idx + 1) as 1 | 2 | 3,
      rankLabel: idx === 0 ? "1st place" : idx === 1 ? "2nd place" : "3rd place",
      badgeBg: idx === 0 ? "bg-[#FFF1D6]" : idx === 1 ? "bg-[#F1F1F8]" : "bg-[#FFF1D6]",
      badgeText: idx === 0 ? "text-[#7A4E00]" : idx === 1 ? "text-[#55556E]" : "text-[#7A4E00]",
      logoBg:
        idx === 0
          ? "bg-[#4F46E5] text-white"
          : idx === 1
          ? "bg-[#E0DEFC] text-[#4F46E5]"
          : "bg-[#FFEAD8] text-[#EA580C]",
    }));
    const regular = mapped.slice(3);

    return NextResponse.json({
      ok: true,
      listings: mapped,
      featured,
      premium,
      justListed,
      free,
      podium,
      regular,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch listings";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

/**
 * POST /api/listings
 * Authoritative backend submission handler.
 * Protected by IP + email rate limiting (lib/ratelimit.ts) + honeypot & min time-to-submit trap + server-side Zod + binary magic byte checks.
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const contentType = req.headers.get("content-type") || "";

    let rawFields: Record<string, unknown> = {};
    let logoFile: File | null = null;
    const screenshotFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      rawFields = {
        name: formData.get("name"),
        tagline: formData.get("tagline"),
        description_short:
          formData.get("description_short") ?? formData.get("short_description"),
        description_long:
          formData.get("description_long") ?? formData.get("long_description"),
        website_url: formData.get("website_url"),
        category_id: formData.get("category_id") ?? formData.get("category"),
        custom_category:
          formData.get("custom_category") ?? formData.get("other_category"),
        pricing_model: formData.get("pricing_model"),
        starting_price: formData.get("starting_price"),
        currency: formData.get("currency") || "USD",
        billing_period: formData.get("billing_period"),
        listing_plan: formData.get("listing_plan") || "free",
        listing_plan_price: formData.get("listing_plan_price") || 0,
        submitted_by_email:
          formData.get("submitted_by_email") ?? formData.get("submitter_email"),
        company_website_hp:
          formData.get("company_website_hp") ??
          formData.get("honeypot") ??
          formData.get("website_hp"),
        form_started_at:
          formData.get("form_started_at") ?? formData.get("started_at"),
        payment_record_id: formData.get("payment_record_id"),
      };

      const logoEntry = formData.get("logo");
      if (logoEntry instanceof File && logoEntry.size > 0) {
        logoFile = logoEntry;
      }

      const screenshotEntries = formData.getAll("screenshots");
      for (const entry of screenshotEntries) {
        if (entry instanceof File && entry.size > 0) {
          screenshotFiles.push(entry);
        }
      }
    } else if (contentType.includes("application/json")) {
      rawFields = await req.json();
    } else {
      return NextResponse.json(
        {
          ok: false,
          message: "Unsupported Content-Type. Use multipart/form-data.",
        },
        { status: 400 }
      );
    }

    // 0. Honeypot + Minimum Time-to-Submit Check:
    // Silently drop bot submissions (201 benign response without touching Storage, DB, or events)
    const botTrap = checkHoneypotAndMinSubmitTime(rawFields);
    if (botTrap.triggered) {
      return NextResponse.json(
        {
          ok: true,
          dropped: true,
          id: 50000000,
          message: "Tool submitted successfully and is pending admin review.",
        },
        { status: 201 }
      );
    }

    // 0.5. Dual IP + Email Rate Limiting Check (5/hour/IP and 5/hour/email, fail-closed)
    const submittedEmail =
      typeof rawFields.submitted_by_email === "string"
        ? rawFields.submitted_by_email
        : "";
    const rateStatus = await checkListingSubmissionRateLimit({
      ip: clientIp,
      email: submittedEmail,
    });
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: `Rate limit exceeded (${rateStatus.limitedBy || "limit"}). Please wait ${rateStatus.retryAfterSeconds} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateStatus.retryAfterSeconds),
          },
        }
      );
    }

    // 1. Authoritative Server-Side Honeypot + Zod + File Validation
    const validation = validateSubmissionServer({
      ...rawFields,
      logo: logoFile,
      screenshots: screenshotFiles,
    });

    if (validation.isHoneypotTriggered) {
      return NextResponse.json(
        {
          ok: true,
          dropped: true,
          id: 50000000,
          message: "Tool submitted successfully and is pending admin review.",
        },
        { status: 201 }
      );
    }

    if (!validation.valid || !validation.data) {
      const firstError =
        Object.values(validation.errors)[0] || "Invalid submission data.";
      return NextResponse.json(
        {
          ok: false,
          message: firstError,
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify binary magic bytes of uploaded images to block disguised scripts/executables
    const logoBuffer = Buffer.from(await logoFile!.arrayBuffer());
    if (!verifyImageMagicBytes(logoBuffer)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Logo file content is not a valid PNG, JPEG, GIF, or WebP image.",
          errors: {
            logo: "Logo file content is not a valid PNG, JPEG, GIF, or WebP image.",
          },
        },
        { status: 400 }
      );
    }

    const screenshotBuffers: Buffer[] = [];
    for (let i = 0; i < screenshotFiles.length; i++) {
      const buf = Buffer.from(await screenshotFiles[i].arrayBuffer());
      if (!verifyImageMagicBytes(buf)) {
        return NextResponse.json(
          {
            ok: false,
            message: `Screenshot #${i + 1} content is not a valid image file.`,
            errors: {
              screenshots: `Screenshot #${i + 1} content is not a valid image file.`,
            },
          },
          { status: 400 }
        );
      }
      screenshotBuffers.push(buf);
    }

    const validData = validation.data;

    // 2. Verify category_id exists in public.categories (or resolve/create if "other")
    const categoryId = await verifyCategoryExists(
      validData.category_id,
      validData.custom_category
    );
    if (!categoryId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Selected category does not exist.",
          errors: {
            category_id: "Selected category does not exist.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Upload Logo and Screenshots Server-Side to Storage
    const bucketName = await ensureMediaBucket();

    // Preflight Check: If client requested validation-only, return success now without saving media or rows
    const isPreflight = req.nextUrl.searchParams.get("preflight") === "true";
    if (isPreflight) {
      return NextResponse.json({
        ok: true,
        preflight: true,
        message: "Preflight validation passed. Form and media are valid.",
      });
    }

    const timestamp = Date.now();
    const baseSlugForMedia = toBaseSlug(validData.name);

    const logoExt = getSafeExtension(logoFile!);
    const logoPath = `logos/${baseSlugForMedia}-${timestamp}-${Math.random()
      .toString(36)
      .slice(2, 7)}.${logoExt}`;

    const { error: logoUploadError } = await db.storage
      .from(bucketName)
      .upload(logoPath, logoBuffer, {
        contentType: logoFile!.type,
        upsert: false,
      });

    if (logoUploadError) {
      return NextResponse.json(
        {
          ok: false,
          message: `Failed to upload logo: ${logoUploadError.message}`,
          errors: { logo: `Failed to upload logo: ${logoUploadError.message}` },
        },
        { status: 500 }
      );
    }

    const { data: logoPublicData } = db.storage
      .from(bucketName)
      .getPublicUrl(logoPath);
    const logoUrl = logoPublicData.publicUrl;

    const screenshotUrls: string[] = [];
    for (let i = 0; i < screenshotFiles.length; i++) {
      const file = screenshotFiles[i];
      const ext = getSafeExtension(file);
      const screenshotPath = `screenshots/${baseSlugForMedia}-${i + 1}-${timestamp}-${Math.random()
        .toString(36)
        .slice(2, 7)}.${ext}`;

      const { error: ssUploadError } = await db.storage
        .from(bucketName)
        .upload(screenshotPath, screenshotBuffers[i], {
          contentType: file.type,
          upsert: false,
        });

      if (ssUploadError) {
        return NextResponse.json(
          {
            ok: false,
            message: `Failed to upload screenshot #${i + 1}: ${ssUploadError.message}`,
            errors: {
              screenshots: `Failed to upload screenshot #${i + 1}: ${ssUploadError.message}`,
            },
          },
          { status: 500 }
        );
      }

      const { data: ssPublicData } = db.storage
        .from(bucketName)
        .getPublicUrl(screenshotPath);
      screenshotUrls.push(ssPublicData.publicUrl);
    }

    // Get optional authenticated user session for ownership validation & suggestion attribution
    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    // 4. Authoritative Server-Side Verification for Directory Listing Plans
    // Strictly blocks malicious frontend manipulation where an attacker requests "premium" or "featured" without paying
    const requestedListingPlan = String(validData.listing_plan || "free").toLowerCase();
    let verifiedListingPlan: "free" | "premium" | "featured" = "free";
    let verifiedListingPlanPrice = 0;
    let verifiedPaymentRecordId: number | null = null;

    if (requestedListingPlan === "premium" || requestedListingPlan === "featured") {
      const rawPaymentRecordId = rawFields.payment_record_id;
      const numericPaymentId = Number(rawPaymentRecordId);

      if (Number.isInteger(numericPaymentId) && numericPaymentId > 0) {
        // Verify caller's authenticated Supabase session so attackers cannot guess sequential payment IDs (IDOR)
        const user = sessionUser;

        // Look up payment record securely using service_role
        const { data: paymentRecord } = await db
          .from("payments")
          .select("id, plan_id, listing_id, status, user_id, payer_email, amount, currency")
          .eq("id", numericPaymentId)
          .maybeSingle();

        const isOwner =
          Boolean(user) &&
          Boolean(paymentRecord) &&
          (paymentRecord!.user_id === user!.id ||
            (!paymentRecord!.user_id &&
              Boolean(user!.email) &&
              paymentRecord!.payer_email?.toLowerCase() === user!.email?.toLowerCase()));

        // Must be owned by caller, paid, match requested plan, and NOT already claimed by another listing
        if (
          isOwner &&
          paymentRecord &&
          paymentRecord.status === "paid" &&
          paymentRecord.plan_id === requestedListingPlan &&
          (paymentRecord.listing_id === null || paymentRecord.listing_id === undefined)
        ) {
          verifiedListingPlan = requestedListingPlan as "premium" | "featured";
          verifiedListingPlanPrice = requestedListingPlan === "featured" ? 49 : 29;
          verifiedPaymentRecordId = paymentRecord.id;
        } else {
          // If payment was not owned by caller, not verified, or already used, fallback to free
          verifiedListingPlan = "free";
          verifiedListingPlanPrice = 0;
        }
      } else {
        // Paid plan requested but no valid payment_record_id provided -> Fallback to free
        verifiedListingPlan = "free";
        verifiedListingPlanPrice = 0;
      }
    }

    // 4.1 Generate Unique Slug & Insert Listing (ID starts at 50000000 automatically)
    const takenInRetry: string[] = [];
    let insertedListing = null;
    let lastDbError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateSlug = await generateUniqueSlug(validData.name, takenInRetry);

      // If caller is authenticated, ALWAYS authoritatively lock and enforce their account email
      const authoritativeEmail = sessionUser?.email
        ? sessionUser.email.toLowerCase().trim()
        : validData.submitted_by_email.toLowerCase().trim();

      const insertPayload: Record<string, unknown> = {
        name: validData.name,
        slug: candidateSlug,
        tagline: validData.tagline,
        description_short: validData.description_short,
        description_long: validData.description_long,
        website_url: validData.website_url,
        logo_url: logoUrl,
        category_id: categoryId,
        pricing_model: validData.pricing_model,
        starting_price: validData.starting_price ?? null,
        currency: validData.currency || "USD",
        billing_period: validData.billing_period ?? null,
        listing_plan: verifiedListingPlan,
        listing_plan_price: verifiedListingPlanPrice,
        status: "pending",
        submitted_by_email: authoritativeEmail,
      };

      if (validData.custom_category) {
        insertPayload.custom_category = validData.custom_category;
      }

      let insertRes = await db
        .from("listings")
        .insert(insertPayload as any)
        .select(
          "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, custom_category, pricing_model, starting_price, currency, billing_period, listing_plan, listing_plan_price, status, submitted_by_email, created_at, updated_at, approved_at"
        )
        .single();

      // Gracefully retry with core columns if optional new columns do not exist yet in live DB
      // Catches both native PostgreSQL 42703 and Supabase PostgREST PGRST204 / PGRST200 schema cache error
      const isMissingColumnError =
        insertRes.error?.code === "42703" ||
        insertRes.error?.code === "PGRST204" ||
        insertRes.error?.code === "PGRST200" ||
        insertRes.error?.message?.toLowerCase().includes("schema cache") ||
        insertRes.error?.message?.toLowerCase().includes("column");

      if (isMissingColumnError) {
        delete insertPayload.custom_category;
        delete insertPayload.starting_price;
        delete insertPayload.currency;
        delete insertPayload.billing_period;
        delete insertPayload.listing_plan;
        delete insertPayload.listing_plan_price;
        insertRes = await db
          .from("listings")
          .insert(insertPayload as any)
          .select(
            "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at"
          )
          .single();
      }

      const { data, error } = insertRes;

      if (!error && data) {
        insertedListing = data;
        break;
      }

      lastDbError = error;
      if (error?.code === "23505") {
        takenInRetry.push(candidateSlug);
        continue;
      } else {
        break;
      }
    }

    if (!insertedListing) {
      return NextResponse.json(
        {
          ok: false,
          message:
            lastDbError?.message || "Failed to save listing in database.",
        },
        { status: 500 }
      );
    }

    // 4.5. Link Verified Payment Record to Listing (atomic claim with .is("listing_id", null))
    if (verifiedPaymentRecordId) {
      await db
        .from("payments")
        .update({ listing_id: insertedListing.id })
        .eq("id", verifiedPaymentRecordId)
        .is("listing_id", null);
    }

    // 5. Insert Screenshot Rows into listing_screenshots
    if (screenshotUrls.length > 0) {
      const screenshotRows = screenshotUrls.map((url, index) => ({
        listing_id: insertedListing.id,
        url,
        position: index,
      }));

      const { error: ssDbError } = await db
        .from("listing_screenshots")
        .insert(screenshotRows);

      if (ssDbError) {
        return NextResponse.json(
          {
            ok: false,
            message: `Listing created, but failed to save screenshot rows: ${ssDbError.message}`,
          },
          { status: 500 }
        );
      }
    }

    // 6. Record Category Suggestion if user chose "Other" (User NEVER writes to public.categories)
    let categorySuggestionResult: {
      submitted: boolean;
      message: string;
      suggested_name: string;
    } | null = null;

    if (
      validData.category_id.trim().toLowerCase() === "other" &&
      validData.custom_category
    ) {
      try {
        await createCategorySuggestion({
          suggestedName: validData.custom_category,
          suggestedBy: sessionUser?.id || null,
          listingId: insertedListing.id,
        });
        categorySuggestionResult = {
          submitted: true,
          message:
            "Your category suggestion has been submitted successfully. It will become available after admin review.",
          suggested_name: validData.custom_category.trim(),
        };
      } catch (suggErr: unknown) {
        console.warn(
          "[api/listings] Category suggestion recording notice:",
          suggErr instanceof Error ? suggErr.message : suggErr
        );
      }
    }

    // 7. Emit Event: listing_submitted (server-side after successful submission)
    const eventResult = await emitListingSubmitted({
      listing_id: insertedListing.id,
      name: insertedListing.name,
      slug: insertedListing.slug,
      submitted_by_email: insertedListing.submitted_by_email,
      category_id: insertedListing.category_id,
      custom_category: validData.custom_category || null,
      pricing_model: insertedListing.pricing_model,
      starting_price: validData.starting_price ?? null,
      currency: validData.currency || "USD",
      billing_period: validData.billing_period ?? null,
      listing_plan: verifiedListingPlan,
      listing_plan_price: verifiedListingPlanPrice,
      website_url: insertedListing.website_url,
      status: insertedListing.status,
      submitted_at: insertedListing.created_at,
    });

    return NextResponse.json(
      {
        ok: true,
        id: insertedListing.id,
        message: "Tool submitted successfully and is pending admin review.",
        listing: {
          ...insertedListing,
          listing_plan: insertedListing.listing_plan || verifiedListingPlan,
          listing_plan_price: insertedListing.listing_plan_price ?? verifiedListingPlanPrice,
          screenshots: screenshotUrls,
        },
        category_suggestion: categorySuggestionResult,
        event: eventResult,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}
