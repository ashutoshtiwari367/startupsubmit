import { NextRequest, NextResponse } from "next/server";
import { db, ensureMediaBucket } from "@/lib/db";
import {
  checkHoneypotAndMinSubmitTime,
  validateSubmissionServer,
  verifyImageMagicBytes,
} from "@/lib/validation";
import { generateUniqueSlug, toBaseSlug } from "@/lib/slug";
import { emitListingSubmitted } from "@/lib/events";
import { checkListingSubmissionRateLimit } from "@/lib/ratelimit";

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

  // Handle "Other" custom category: resolve or create in public.categories
  if (trimmed.toLowerCase() === "other") {
    const customName = String(customCategoryInput || "").trim();
    if (customName.length < 2) return null;

    const customSlug = toBaseSlug(customName);
    const { data: existingBySlug } = await db
      .from("categories")
      .select("id")
      .eq("slug", customSlug)
      .maybeSingle();

    if (existingBySlug?.id) {
      return Number(existingBySlug.id);
    }

    const { data: createdCategory } = await db
      .from("categories")
      .upsert(
        {
          slug: customSlug,
          name: customName,
          description: "Custom user-submitted category",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    return createdCategory?.id ? Number(createdCategory.id) : null;
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
    const categoryId = searchParams.get("category_id");

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

      return NextResponse.json({ ok: true, listing: data });
    }

    let query = db
      .from("listings")
      .select(
        "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, created_at, approved_at, categories(id, slug, name), listing_screenshots(id, url, position)"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (categoryId && NUMERIC_ID_REGEX.test(categoryId)) {
      query = query.eq("category_id", Number(categoryId));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      listings: data || [],
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

    // 4. Generate Unique Slug & Insert Listing (ID starts at 50000000 automatically)
    const takenInRetry: string[] = [];
    let insertedListing = null;
    let lastDbError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateSlug = await generateUniqueSlug(validData.name, takenInRetry);

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
        listing_plan: validData.listing_plan || "free",
        listing_plan_price: validData.listing_plan_price || 0,
        status: "pending",
        submitted_by_email: validData.submitted_by_email,
      };

      if (validData.custom_category) {
        insertPayload.custom_category = validData.custom_category;
      }

      let insertRes = await db
        .from("listings")
        .insert(insertPayload as any)
        .select(
          "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at"
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

    // 4.5. Link Verified Payment Record to Listing (if paid tier submission)
    const rawPaymentRecordId = rawFields.payment_record_id;
    if (
      rawPaymentRecordId !== undefined &&
      rawPaymentRecordId !== null &&
      String(rawPaymentRecordId).trim() !== ""
    ) {
      const numericPaymentId = Number(rawPaymentRecordId);
      if (Number.isInteger(numericPaymentId) && numericPaymentId > 0) {
        await db
          .from("payments")
          .update({ listing_id: insertedListing.id })
          .eq("id", numericPaymentId);
      }
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

    // 6. Emit Event: listing_submitted (server-side after successful submission)
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
      listing_plan: validData.listing_plan || "free",
      listing_plan_price: validData.listing_plan_price || 0,
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
          screenshots: screenshotUrls,
        },
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
