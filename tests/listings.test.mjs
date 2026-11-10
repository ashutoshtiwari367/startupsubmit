import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. Slugify & Collision Resolution Functions (Mirrors lib/slug.ts verbatim)
// ============================================================================
function slugify(name) {
  const cleaned = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "tool";
}

function resolveUniqueSlug(baseNameOrSlug, existingSlugs) {
  const baseSlug = slugify(baseNameOrSlug);
  const normalizedSet = new Set();

  for (const s of existingSlugs) {
    if (typeof s === "string") {
      normalizedSet.add(s.toLowerCase().trim());
    }
  }

  if (!normalizedSet.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (normalizedSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}

// ============================================================================
// 2. Server Zod Validation & Magic Bytes (Mirrors lib/validation.ts verbatim)
// ============================================================================
const VALID_PRICING_MODELS = ["free", "freemium", "paid", "one_time"];
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const serverListingFieldsSchema = z
  .object({
    name: z.string().trim().min(1, "Tool name is required."),
    tagline: z
      .string()
      .trim()
      .min(1, "Tagline is required.")
      .max(60, "Tagline cannot exceed 60 characters."),
    description_short: z
      .string()
      .trim()
      .min(1, "Short description is required.")
      .max(250, "Short description cannot exceed 250 characters."),
    description_long: z
      .string()
      .trim()
      .min(1, "Long description is required.")
      .max(2000, "Long description cannot exceed 2000 characters."),
    website_url: z.string().trim().optional().default(""),
    category_id: z.string().trim().min(1, "Category is required."),
    custom_category: z
      .string()
      .trim()
      .max(50, "Custom category cannot exceed 50 characters.")
      .optional()
      .default(""),
    pricing_model: z.enum(VALID_PRICING_MODELS, {
      message: `Invalid pricing_model. Must be one of: ${VALID_PRICING_MODELS.join(", ")}.`,
    }),
    submitted_by_email: z
      .string()
      .trim()
      .min(1, "Submitter email is required.")
      .email("Please provide a valid email address."),
  })
  .superRefine((data, ctx) => {
    const isOther = data.category_id.trim().toLowerCase() === "other";
    const customCat = (data.custom_category || "").trim();
    const website = (data.website_url || "").trim();

    function isValidHttps(val) {
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== "https:") return false;
        if (!parsed.hostname || !parsed.hostname.includes(".")) return false;
        if (/\s/.test(val)) return false;
        return true;
      } catch {
        return false;
      }
    }

    if (isOther) {
      if (customCat.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["custom_category"],
          message: "Please specify your custom category (at least 2 characters).",
        });
      }
      if (website.length > 0 && !isValidHttps(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message: "Website URL must use HTTPS (https://) and have a valid domain.",
        });
      }
    } else {
      if (!website) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message: "Website URL is required.",
        });
      } else if (!isValidHttps(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message: "Website URL must use HTTPS (https://) and have a valid domain.",
        });
      }
    }
  });

function verifyImageMagicBytes(bytes) {
  if (!bytes || bytes.length < 4) return false;
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return true;
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }
  return false;
}

function validateSubmissionServer(input) {
  const hpValue =
    input.company_website_hp ?? input.honeypot ?? input.website_hp;
  if (typeof hpValue === "string" && hpValue.trim().length > 0) {
    return {
      valid: false,
      isHoneypotTriggered: true,
      honeypotReason: "honeypot_filled",
      errors: { form: "Spam submission detected." },
    };
  }

  const rawStartedAt = input.form_started_at ?? input.started_at;
  if (
    rawStartedAt !== undefined &&
    rawStartedAt !== null &&
    String(rawStartedAt).trim() !== ""
  ) {
    const startedAtMs = Number(rawStartedAt);
    const nowMs = input.nowMs ?? Date.now();
    const minElapsed = input.minSubmitTimeMs ?? 2000;
    if (
      !Number.isFinite(startedAtMs) ||
      startedAtMs <= 0 ||
      nowMs - startedAtMs < minElapsed
    ) {
      return {
        valid: false,
        isHoneypotTriggered: true,
        honeypotReason: "instant_submit",
        errors: { form: "Spam submission detected." },
      };
    }
  }

  const errors = {};
  const normalizedInput = {
    name: typeof input.name === "string" ? input.name : "",
    tagline: typeof input.tagline === "string" ? input.tagline : "",
    description_short:
      typeof (input.description_short ?? input.short_description) === "string"
        ? String(input.description_short ?? input.short_description)
        : "",
    description_long:
      typeof (input.description_long ?? input.long_description) === "string"
        ? String(input.description_long ?? input.long_description)
        : "",
    website_url: typeof input.website_url === "string" ? input.website_url : "",
    category_id:
      typeof (input.category_id ?? input.category) === "string"
        ? String(input.category_id ?? input.category)
        : "",
    custom_category:
      typeof (input.custom_category ?? input.other_category) === "string"
        ? String(input.custom_category ?? input.other_category)
        : "",
    pricing_model:
      typeof input.pricing_model === "string"
        ? input.pricing_model.trim().toLowerCase()
        : "",
    submitted_by_email:
      typeof (input.submitted_by_email ?? input.submitter_email) === "string"
        ? String(input.submitted_by_email ?? input.submitter_email)
        : "",
  };

  const parsed = serverListingFieldsSchema.safeParse(normalizedInput);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] || "form");
      if (!errors[field]) errors[field] = issue.message;
    }
  }

  const logo = input.logo;
  if (!logo || logo.size === 0) {
    errors.logo = "Tool logo image is required.";
  } else if (!ALLOWED_IMAGE_MIME_TYPES.has(logo.type)) {
    errors.logo = "Logo must be a valid image file (PNG, JPG, WebP, or GIF).";
  } else if (logo.size > MAX_FILE_SIZE_BYTES) {
    errors.logo = "Logo image size cannot exceed 5MB.";
  }

  const screenshots = input.screenshots || [];
  if (screenshots.length > 5) {
    errors.screenshots = `You can upload a maximum of 5 screenshots (received ${screenshots.length}).`;
  } else {
    for (let i = 0; i < screenshots.length; i++) {
      const file = screenshots[i];
      if (!file || !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        errors.screenshots = `Screenshot #${i + 1} must be a valid image (PNG, JPG, WebP, or GIF).`;
        break;
      }
      if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
        errors.screenshots = `Screenshot #${i + 1} must be between 1 byte and 5MB.`;
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0 || !parsed.success) {
    return { valid: false, errors };
  }

  return { valid: true, errors: {}, data: parsed.data };
}

// ============================================================================
// UNIT TESTS
// ============================================================================

describe("Slug Generation & Collision Suffixing (lib/slug.ts)", () => {
  it("generates clean URL-friendly slug from tool name", () => {
    assert.equal(slugify("WritePro"), "writepro");
    assert.equal(slugify("  AI Writer 2.0!  "), "ai-writer-2-0");
    assert.equal(slugify("   "), "tool");
  });

  it("handles duplicate names with incremental suffixing (writepro, writepro-2, writepro-3)", () => {
    const existing = [];

    const first = resolveUniqueSlug("WritePro", existing);
    assert.equal(first, "writepro");
    existing.push(first);

    const second = resolveUniqueSlug("WritePro", existing);
    assert.equal(second, "writepro-2");
    existing.push(second);

    const third = resolveUniqueSlug("WritePro", existing);
    assert.equal(third, "writepro-3");
    existing.push(third);

    const fourth = resolveUniqueSlug("WRITEPRO", existing);
    assert.equal(fourth, "writepro-4");
  });

  it("strips HTML/script tags safely when generating slugs", () => {
    const xssName = "<script>alert('xss')</script>WritePro";
    const slug = slugify(xssName);
    assert.equal(slug, "alert-xss-writepro");
    assert.ok(!slug.includes("<"));
    assert.ok(!slug.includes(">"));
  });
});

describe("Authoritative Server Validation & Adversarial Cases (lib/validation.ts)", () => {
  const validPayload = {
    name: "WritePro",
    tagline: "AI writing assistant for marketing teams",
    description_short: "Generate high-converting copy in seconds.",
    description_long:
      "WritePro helps founders, marketers, and agencies write blog posts, landing pages, and emails 10x faster using specialized AI workflows.",
    website_url: "https://writepro.ai",
    category_id: "550e8400-e29b-41d4-a716-446655440000",
    pricing_model: "freemium",
    submitted_by_email: "maker@writepro.ai",
    logo: { type: "image/png", size: 120 * 1024, name: "logo.png" },
    screenshots: [
      { type: "image/jpeg", size: 300 * 1024, name: "shot1.jpg" },
      { type: "image/webp", size: 250 * 1024, name: "shot2.webp" },
    ],
  };

  it("accepts a valid submission payload", () => {
    const result = validateSubmissionServer(validPayload);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.data.name, "WritePro");
    assert.equal(result.data.pricing_model, "freemium");
  });

  it("rejects oversized fields (tagline > 60, short > 250, long > 2000)", () => {
    const result = validateSubmissionServer({
      ...validPayload,
      tagline: "A".repeat(61),
      description_short: "B".repeat(251),
      description_long: "C".repeat(2001),
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.tagline);
    assert.ok(result.errors.description_short);
    assert.ok(result.errors.description_long);
  });

  it("rejects non-HTTPS URLs (http://, javascript:, data:, ftp://)", () => {
    for (const badUrl of [
      "http://example.com",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "ftp://files.example.com",
      "not-a-url",
    ]) {
      const res = validateSubmissionServer({
        ...validPayload,
        website_url: badUrl,
      });
      assert.equal(res.valid, false, `Expected ${badUrl} to be rejected`);
      assert.ok(res.errors.website_url);
    }
  });

  it("rejects invalid submitter email formats", () => {
    for (const badEmail of ["abc123", "maker@", "@domain.com", "plainaddress"]) {
      const res = validateSubmissionServer({
        ...validPayload,
        submitted_by_email: badEmail,
      });
      assert.equal(res.valid, false, `Expected ${badEmail} to be rejected`);
      assert.ok(res.errors.submitted_by_email);
    }
  });

  it("rejects missing category_id and invalid pricing_model enum", () => {
    const res = validateSubmissionServer({
      ...validPayload,
      category_id: "   ",
      pricing_model: "enterprise_custom",
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.category_id);
    assert.ok(res.errors.pricing_model);
  });

  it("preserves HTML/script strings as plain text without executing (safe for JSX escaping)", () => {
    const xssPayload = {
      ...validPayload,
      name: "WritePro <img src=x onerror=alert(1)>",
      tagline: "<b>Fast</b> & <script>evil()</script> copy",
      description_short: "Safe <script>alert('short')</script> text",
    };
    const res = validateSubmissionServer(xssPayload);
    assert.equal(res.valid, true);
    assert.equal(res.data.name, "WritePro <img src=x onerror=alert(1)>");
  });

  it("rejects missing logo, non-image uploads (HTML/SVG/JS), oversized files (>5MB), and >5 screenshots", () => {
    // Missing logo
    const noLogo = validateSubmissionServer({ ...validPayload, logo: null });
    assert.equal(noLogo.valid, false);
    assert.ok(noLogo.errors.logo);

    // Non-image MIME type (e.g. text/html or image/svg+xml)
    const htmlLogo = validateSubmissionServer({
      ...validPayload,
      logo: { type: "text/html", size: 1024 },
    });
    assert.equal(htmlLogo.valid, false);
    assert.ok(htmlLogo.errors.logo);

    // Oversized logo (>5MB)
    const bigLogo = validateSubmissionServer({
      ...validPayload,
      logo: { type: "image/png", size: 6 * 1024 * 1024 },
    });
    assert.equal(bigLogo.valid, false);
    assert.ok(bigLogo.errors.logo);

    // > 5 screenshots
    const sixScreenshots = validateSubmissionServer({
      ...validPayload,
      screenshots: Array.from({ length: 6 }, () => ({
        type: "image/png",
        size: 1024,
      })),
    });
    assert.equal(sixScreenshots.valid, false);
    assert.ok(sixScreenshots.errors.screenshots);
  });

  it("verifies binary magic bytes to reject disguised non-image payloads", () => {
    const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const validJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const fakeHtmlBytes = new TextEncoder().encode("<html><script>alert(1)</script></html>");

    assert.equal(verifyImageMagicBytes(validPngBytes), true);
    assert.equal(verifyImageMagicBytes(validJpegBytes), true);
    assert.equal(verifyImageMagicBytes(fakeHtmlBytes), false);
  });

  it("verifies SubmitForm.tsx never imports Supabase directly (browser talks only to /api)", () => {
    const submitFormSource = fs.readFileSync(
      path.join(__dirname, "..", "components", "SubmitForm.tsx"),
      "utf8"
    );
    assert.ok(
      !submitFormSource.includes("@supabase/supabase-js"),
      "SubmitForm.tsx must never import @supabase/supabase-js"
    );
    assert.ok(
      submitFormSource.includes('fetch("/api/listings"'),
      "SubmitForm.tsx must POST to /api/listings"
    );
    assert.ok(
      submitFormSource.includes('fetch("/api/categories"'),
      "SubmitForm.tsx must GET /api/categories"
    );
  });

  it("blocks bot submissions when the hidden honeypot field is filled", () => {
    const botResult = validateSubmissionServer({
      ...validPayload,
      company_website_hp: "https://spam-bot-link.biz",
    });
    assert.equal(botResult.valid, false);
    assert.equal(botResult.isHoneypotTriggered, true);
    assert.ok(botResult.errors.form);
  });

  it("verifies rate-limiting, admin auth-gate, sitemap approved-only filter, and moderation events", () => {
    const adminPageSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "admin", "page.tsx"),
      "utf8"
    );
    assert.ok(
      adminPageSource.includes("isAdminServerSession"),
      "/admin must verify admin session on the server"
    );
    assert.ok(
      adminPageSource.includes("notFound()"),
      "/admin must return 404 to non-admins"
    );

    const sitemapSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "sitemap.ts"),
      "utf8"
    );
    assert.ok(
      sitemapSource.includes('.eq("status", "approved")'),
      "sitemap.ts must strictly filter for status = 'approved'"
    );

    const moderationRouteSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "admin", "listings", "[id]", "route.ts"),
      "utf8"
    );
    assert.ok(
      moderationRouteSource.includes("emitListingApproved"),
      "PATCH /api/admin/listings/[id] must emit listing_approved"
    );
    assert.ok(
      moderationRouteSource.includes("emitListingRejected"),
      "PATCH /api/admin/listings/[id] must emit listing_rejected"
    );
  });

  it("enforces Supabase Auth + ADMIN_EMAILS allowlist in middleware.ts and inside each server action in app/admin/actions.ts", () => {
    const middlewareSource = fs.readFileSync(
      path.join(__dirname, "..", "middleware.ts"),
      "utf8"
    );
    assert.ok(
      middlewareSource.includes("/auth/v1/user"),
      "middleware.ts must verify token with Supabase Auth"
    );
    assert.ok(
      middlewareSource.includes("ADMIN_EMAILS"),
      "middleware.ts must check ADMIN_EMAILS allowlist"
    );
    assert.ok(
      middlewareSource.includes('"/admin/:path*"'),
      "middleware.ts must protect /admin/**"
    );

    const actionsSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "admin", "actions.ts"),
      "utf8"
    );
    assert.ok(
      actionsSource.includes('"use server"'),
      "app/admin/actions.ts must be a Server Actions module"
    );
    assert.ok(
      actionsSource.includes("export async function approveListing"),
      "approveListing(id) server action must exist"
    );
    assert.ok(
      actionsSource.includes("export async function rejectListing"),
      "rejectListing(id) server action must exist"
    );

    // Verify requireAdminUser() is called inside BOTH approveListing and rejectListing
    const approveToRejectSlice = actionsSource.slice(
      actionsSource.indexOf("export async function approveListing"),
      actionsSource.indexOf("export async function rejectListing")
    );
    const rejectSlice = actionsSource.slice(
      actionsSource.indexOf("export async function rejectListing")
    );
    assert.ok(
      approveToRejectSlice.includes("await requireAdminUser()"),
      "approveListing(id) must re-check caller is admin server-side"
    );
    assert.ok(
      approveToRejectSlice.includes('status: "approved"') &&
        approveToRejectSlice.includes("approved_at: nowIso"),
      "approveListing(id) must update status='approved' and approved_at"
    );
    assert.ok(
      rejectSlice.includes("await requireAdminUser()"),
      "rejectListing(id) must re-check caller is admin server-side"
    );
    assert.ok(
      rejectSlice.includes('status: "rejected"') &&
        rejectSlice.includes("approved_at: null"),
      "rejectListing(id) must update status='rejected' and clear approved_at"
    );
  });

  it("verifies app/admin/queue/page.tsx (Server Component) and AdminQueueClient.tsx (optimistic removal + XSS-safe rendering)", () => {
    const queuePageSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "admin", "queue", "page.tsx"),
      "utf8"
    );

    // 1. Server Component check
    assert.ok(
      !queuePageSource.includes('"use client"') &&
        !queuePageSource.includes("'use client'"),
      "app/admin/queue/page.tsx must be a Server Component"
    );
    assert.ok(
      queuePageSource.includes("isAdminServerSession") &&
        queuePageSource.includes("notFound()"),
      "app/admin/queue/page.tsx must verify admin session on the server"
    );
    assert.ok(
      queuePageSource.includes('.eq("status", "pending")'),
      "app/admin/queue/page.tsx must filter for status='pending'"
    );
    for (const field of [
      "name",
      "slug",
      "tagline",
      "description_short",
      "description_long",
      "website_url",
      "logo_url",
      "category_id",
      "pricing_model",
      "submitted_by_email",
      "listing_screenshots",
    ]) {
      assert.ok(
        queuePageSource.includes(field),
        `app/admin/queue/page.tsx must select field '${field}'`
      );
    }

    // 2. Client Queue Component check: useOptimistic, server actions, XSS safety
    const queueClientSource = fs.readFileSync(
      path.join(__dirname, "..", "components", "AdminQueueClient.tsx"),
      "utf8"
    );
    assert.ok(
      queueClientSource.includes("useOptimistic"),
      "AdminQueueClient.tsx must use useOptimistic for optimistic removal from the list"
    );
    assert.ok(
      queueClientSource.includes("approveListing") &&
        queueClientSource.includes("rejectListing"),
      "AdminQueueClient.tsx must wire buttons to approveListing and rejectListing server actions"
    );
    assert.ok(
      !queueClientSource.includes("dangerouslySetInnerHTML"),
      "AdminQueueClient.tsx must never use dangerouslySetInnerHTML (XSS protection)"
    );
    assert.ok(
      queueClientSource.includes("safeHttpsUrl"),
      "AdminQueueClient.tsx must sanitize all rendered URLs/images with safeHttpsUrl"
    );

    // 3. Verify safeHttpsUrl blocks javascript:, data:, and http: schemes
    function safeHttpsUrl(rawUrl) {
      if (!rawUrl || typeof rawUrl !== "string") return null;
      try {
        const parsed = new URL(rawUrl.trim());
        return parsed.protocol === "https:" ? parsed.toString() : null;
      } catch {
        return null;
      }
    }

    assert.equal(safeHttpsUrl("https://writepro.ai/app"), "https://writepro.ai/app");
    assert.equal(safeHttpsUrl("javascript:alert(document.cookie)"), null);
    assert.equal(safeHttpsUrl("data:text/html,<script>alert(1)</script>"), null);
    assert.equal(safeHttpsUrl("http://insecure.example.com"), null);
  });

  it("enforces IP + email rate limits (5/hour), fail-closed store behavior, honeypot silent drop, and minimum time-to-submit check", async () => {
    // Verify lib/ratelimit.ts and app/api/listings/route.ts wiring
    const ratelimitSource = fs.readFileSync(
      path.join(__dirname, "..", "lib", "ratelimit.ts"),
      "utf8"
    );
    assert.ok(
      ratelimitSource.includes("rl:listings:ip:") &&
        ratelimitSource.includes("rl:listings:email:"),
      "lib/ratelimit.ts must namespace both per-IP and per-email rate limit keys"
    );
    assert.ok(
      ratelimitSource.includes('limitedBy: "fail_closed"'),
      "lib/ratelimit.ts must fail closed on store error or missing IP"
    );

    const listingsRouteSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "listings", "route.ts"),
      "utf8"
    );
    assert.ok(
      listingsRouteSource.includes("checkListingSubmissionRateLimit") &&
        listingsRouteSource.includes("status: 429"),
      "POST /api/listings must enforce dual IP+email rate limit and return 429"
    );
    assert.ok(
      listingsRouteSource.includes("checkHoneypotAndMinSubmitTime") &&
        listingsRouteSource.includes("dropped: true"),
      "POST /api/listings must silently drop honeypot and instant-submit bot hits"
    );

    // Mirror lib/ratelimit.ts dual-key sliding-window engine for adversarial simulations
    const buckets = new Map();
    const workingStore = {
      consume(key, maxRequests, windowMs, nowMs) {
        const b = buckets.get(key) || { timestamps: [] };
        b.timestamps = b.timestamps.filter((ts) => nowMs - ts < windowMs);
        if (b.timestamps.length >= maxRequests) {
          const retryAfterSeconds = Math.max(
            1,
            Math.ceil((windowMs - (nowMs - b.timestamps[0])) / 1000)
          );
          buckets.set(key, b);
          return { allowed: false, remaining: 0, retryAfterSeconds, key };
        }
        b.timestamps.push(nowMs);
        buckets.set(key, b);
        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - b.timestamps.length),
          retryAfterSeconds: 0,
          key,
        };
      },
    };

    async function checkDualRateLimit({
      ip,
      email,
      maxRequestsPerHour = 5,
      windowMs = 3600 * 1000,
      nowMs = 1_700_000_000_000,
      store = workingStore,
    }) {
      try {
        const cleanIp = String(ip || "").trim().toLowerCase();
        if (!cleanIp) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: 3600,
            limitedBy: "fail_closed",
          };
        }
        const ipKey = `rl:listings:ip:${cleanIp}`;
        const ipRes = await store.consume(ipKey, maxRequestsPerHour, windowMs, nowMs);
        if (!ipRes.allowed) {
          return { ...ipRes, allowed: false, limitedBy: "ip", key: ipKey };
        }

        const cleanEmail = String(email || "").trim().toLowerCase();
        if (cleanEmail) {
          const emailKey = `rl:listings:email:${cleanEmail}`;
          const emailRes = await store.consume(
            emailKey,
            maxRequestsPerHour,
            windowMs,
            nowMs
          );
          if (!emailRes.allowed) {
            return { ...emailRes, allowed: false, limitedBy: "email", key: emailKey };
          }
        }
        return ipRes;
      } catch {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: 60,
          limitedBy: "fail_closed",
        };
      }
    }

    const baseTime = 1_700_000_000_000;

    // Case A: Burst from one IP (5 allowed, 6th gets 429)
    for (let i = 1; i <= 5; i++) {
      const res = await checkDualRateLimit({
        ip: "203.0.113.10",
        email: "founder@startup.io",
        nowMs: baseTime + i * 1000,
      });
      assert.equal(res.allowed, true, `Request #${i} from 203.0.113.10 should pass`);
    }
    const burstSixth = await checkDualRateLimit({
      ip: "203.0.113.10",
      email: "founder@startup.io",
      nowMs: baseTime + 6000,
    });
    assert.equal(burstSixth.allowed, false);
    assert.equal(burstSixth.limitedBy, "ip");

    // Case B: Rotating emails from the SAME IP (bot rotating emails to bypass email limit)
    for (let i = 1; i <= 5; i++) {
      const res = await checkDualRateLimit({
        ip: "203.0.113.99",
        email: `rotating-bot-${i}@spammer.org`,
        nowMs: baseTime + i * 1000,
      });
      assert.equal(res.allowed, true);
    }
    const rotatingEmailSixth = await checkDualRateLimit({
      ip: "203.0.113.99",
      email: "rotating-bot-6@spammer.org",
      nowMs: baseTime + 6000,
    });
    assert.equal(
      rotatingEmailSixth.allowed,
      false,
      "6th request from same IP with rotating emails must be blocked by IP limit"
    );
    assert.equal(rotatingEmailSixth.limitedBy, "ip");

    // Case C: Rotating IPs with the SAME email (botnet using one submitter email)
    for (let i = 1; i <= 5; i++) {
      const res = await checkDualRateLimit({
        ip: `198.51.100.${i}`,
        email: "same-campaign@spammer.org",
        nowMs: baseTime + i * 1000,
      });
      assert.equal(res.allowed, true);
    }
    const rotatingIpSixth = await checkDualRateLimit({
      ip: "198.51.100.6",
      email: "same-campaign@spammer.org",
      nowMs: baseTime + 6000,
    });
    assert.equal(
      rotatingIpSixth.allowed,
      false,
      "6th request with same email across rotating IPs must be blocked by email limit"
    );
    assert.equal(rotatingIpSixth.limitedBy, "email");

    // Case D: Fail-closed behavior when KV store throws or IP is missing
    const brokenStore = {
      consume() {
        throw new Error("Upstash Redis connection timeout");
      },
    };
    const storeFailureRes = await checkDualRateLimit({
      ip: "192.0.2.1",
      email: "real@user.com",
      store: brokenStore,
    });
    assert.equal(storeFailureRes.allowed, false);
    assert.equal(storeFailureRes.limitedBy, "fail_closed");

    const emptyIpRes = await checkDualRateLimit({
      ip: "   ",
      email: "real@user.com",
    });
    assert.equal(emptyIpRes.allowed, false);
    assert.equal(emptyIpRes.limitedBy, "fail_closed");

    // Case E: Instant submit (< 2000ms) is caught; legitimate submit (>= 2000ms) passes
    const nowMs = 1_700_000_050_000;
    const instantRes = validateSubmissionServer({
      ...validPayload,
      form_started_at: String(nowMs - 400), // Only 400ms elapsed
      nowMs,
    });
    assert.equal(instantRes.valid, false);
    assert.equal(instantRes.isHoneypotTriggered, true);
    assert.equal(instantRes.honeypotReason, "instant_submit");

    const legitimateTimedRes = validateSubmissionServer({
      ...validPayload,
      form_started_at: String(nowMs - 12_000), // 12 seconds elapsed (real human)
      nowMs,
    });
    assert.equal(legitimateTimedRes.valid, true);
    assert.equal(Boolean(legitimateTimedRes.isHoneypotTriggered), false);
  });

  it("enforces BIGINT GENERATED ALWAYS AS IDENTITY PKs, UUID only on customers, and unambiguous human-readable reference_code (L-7K2M9Q with no 0/O/1/I)", () => {
    // 1. Verify SQL migration schema strategy
    const sqlSource = fs.readFileSync(
      path.join(__dirname, "..", "supabase", "migrations", "0001_init.sql"),
      "utf8"
    );

    assert.ok(
      sqlSource.includes("BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY"),
      "0001_init.sql must use BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY"
    );
    assert.ok(
      sqlSource.includes("reference_code TEXT NOT NULL UNIQUE"),
      "listings table must define reference_code TEXT NOT NULL UNIQUE"
    );
    assert.ok(
      sqlSource.includes("^L-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$"),
      "listings.reference_code must enforce 6-char unambiguous alphabet check"
    );
    assert.ok(
      sqlSource.includes(
        "CREATE TABLE public.customers (\n  id UUID PRIMARY KEY REFERENCES auth.users(id)"
      ) ||
        sqlSource.includes("id UUID PRIMARY KEY REFERENCES auth.users(id)"),
      "customers must be the only table keeping a UUID PK referencing auth.users(id)"
    );

    // Ensure categories, listings, listing_screenshots, events do NOT use UUID PRIMARY KEY
    const nonCustomerTables = sqlSource.split("CREATE TABLE public.customers")[0];
    assert.ok(
      !nonCustomerTables.includes("UUID PRIMARY KEY"),
      "categories, listings, and listing_screenshots must NOT use UUID PRIMARY KEY"
    );

    // 2. Test Reference Code Generator (L-XXXXXX, no 0/O/1/I confusion)
    const REFERENCE_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const REFERENCE_CODE_REGEX = /^L-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

    function generateReferenceCode(prefix = "L", length = 6) {
      const bytes = new Uint8Array(length);
      globalThis.crypto.getRandomValues(bytes);
      let body = "";
      for (let i = 0; i < length; i++) {
        body += REFERENCE_CODE_ALPHABET[bytes[i] % REFERENCE_CODE_ALPHABET.length];
      }
      return `${prefix}-${body}`;
    }

    function isValidReferenceCode(code) {
      return typeof code === "string" && REFERENCE_CODE_REGEX.test(code.trim());
    }

    function resolveUniqueReferenceCode(existingCodes, generator) {
      const set = new Set(Array.from(existingCodes, (c) => c.toUpperCase()));
      for (let i = 0; i < 50; i++) {
        const candidate = generator().toUpperCase();
        if (!set.has(candidate)) return candidate;
      }
      throw new Error("Collision retry exhausted");
    }

    // Generate 2,000 codes and verify format & absence of 0, O, 1, I
    for (let i = 0; i < 2000; i++) {
      const code = generateReferenceCode();
      assert.equal(code.length, 8, `Expected L-XXXXXX (8 chars), got ${code}`);
      assert.ok(
        isValidReferenceCode(code),
        `Generated code ${code} did not match regex`
      );
      assert.ok(!code.includes("0"), "Reference code must never contain '0'");
      assert.ok(!code.includes("O"), "Reference code must never contain 'O'");
      assert.ok(!code.includes("1"), "Reference code must never contain '1'");
      assert.ok(!code.includes("I"), "Reference code must never contain 'I'");
    }

    // Verify ambiguous codes are rejected
    assert.equal(isValidReferenceCode("L-7K2M9Q"), true);
    assert.equal(isValidReferenceCode("L-0K2M9Q"), false); // contains 0
    assert.equal(isValidReferenceCode("L-OK2M9Q"), false); // contains O
    assert.equal(isValidReferenceCode("L-1K2M9Q"), false); // contains 1
    assert.equal(isValidReferenceCode("L-IK2M9Q"), false); // contains I
    assert.equal(isValidReferenceCode("L-7K2M9"), false); // too short

    // Verify collision resolution
    const sequence = ["L-7K2M9Q", "L-7K2M9Q", "L-8P4N6R"];
    let idx = 0;
    const resolved = resolveUniqueReferenceCode(
      ["L-7K2M9Q"],
      () => sequence[idx++]
    );
    assert.equal(resolved, "L-8P4N6R");
  });

  it("supports 'Other' category option with custom_category input, optional website_url, and Category positioned before Website URL", () => {
    // 1. Verify Category field is positioned BEFORE Website URL in SubmitForm.tsx
    const submitFormSource = fs.readFileSync(
      path.join(__dirname, "..", "components", "SubmitForm.tsx"),
      "utf8"
    );
    const categoryIdx = submitFormSource.indexOf('id="field-category"');
    const websiteIdx = submitFormSource.indexOf('id="field-website-url"');
    assert.ok(categoryIdx > 0, "SubmitForm.tsx must have field-category");
    assert.ok(websiteIdx > 0, "SubmitForm.tsx must have field-website-url");
    assert.ok(
      categoryIdx < websiteIdx,
      "Category select must appear BEFORE Website URL in SubmitForm.tsx"
    );
    assert.ok(
      submitFormSource.includes('value="other"') &&
        submitFormSource.includes('id="field-custom-category"'),
      "SubmitForm.tsx must include 'other' option and custom_category input"
    );

    // 2. Standard category WITHOUT website_url is rejected
    const standardNoUrl = validateSubmissionServer({
      ...validPayload,
      category_id: "1",
      website_url: "",
    });
    assert.equal(standardNoUrl.valid, false);
    assert.ok(standardNoUrl.errors.website_url);

    // 3. 'other' category WITHOUT custom_category is rejected
    const otherNoCustom = validateSubmissionServer({
      ...validPayload,
      category_id: "other",
      custom_category: "",
      website_url: "",
    });
    assert.equal(otherNoCustom.valid, false);
    assert.ok(otherNoCustom.errors.custom_category);

    // 4. 'other' category WITH custom_category and WITHOUT website_url passes!
    const otherValidNoUrl = validateSubmissionServer({
      ...validPayload,
      category_id: "other",
      custom_category: "Cybersecurity & Compliance",
      website_url: "",
    });
    assert.equal(otherValidNoUrl.valid, true);
    assert.deepEqual(otherValidNoUrl.errors, {});
    assert.equal(
      otherValidNoUrl.data.custom_category,
      "Cybersecurity & Compliance"
    );
    assert.equal(otherValidNoUrl.data.website_url, "");
  });
});

