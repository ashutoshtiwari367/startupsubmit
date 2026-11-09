import "server-only";

const DEFAULT_SUPABASE_URL = "https://tbatttczyklqaxgbqlke.supabase.co";

const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYXR0dGN6eWtscWF4Z2JxbGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDIxMDk3MCwiZXhwIjoyMTA5Nzg2OTcwfQ.CH-0bhEHyz_QCDJdKY7EDm5Yoq8Mbfr8ZH7ndIO8O2U";

const DEFAULT_ADMIN_SECRET = "launchpad_admin_secret_2026";
const DEFAULT_ADMIN_EMAILS = "admin@launchos.com";

export const serverSecrets = {
  supabaseUrl:
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY,
  adminSecret: process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET,
  adminEmailsRaw: process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS,
  adminEmails: (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://launchos.com",
  wordpressUrl:
    process.env.WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    "",
  blogSyncSecret: process.env.BLOG_SYNC_SECRET || "",
  turnstileSecret:
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  r2Endpoint: process.env.R2_ENDPOINT || "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  r2Bucket: process.env.R2_BUCKET || "",
  r2PublicBase: process.env.R2_PUBLIC_BASE || "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || "",
} as const;

export const config = {
  defaultBrandId: process.env.DEFAULT_APP_ID || process.env.DEFAULT_BRAND_ID || "saas-launchpad",
  supabaseUrl: serverSecrets.supabaseUrl,
  supabaseServiceKey: serverSecrets.supabaseServiceKey,
  storageProvider: (process.env.STORAGE_PROVIDER || "supabase") as "supabase" | "r2",
  mediaBucket: process.env.MEDIA_BUCKET || "listings-media",
  signedUrlTtlSeconds: Number(process.env.SIGNED_URL_TTL || "3600"),
  burstMaxPerMinute: Number(process.env.BURST_MAX_PER_MINUTE || "10"),
  listingsRateLimitPerHour: Number(process.env.LISTINGS_RATE_LIMIT_PER_HOUR || "5"),
  listingsRateLimitWindowMs: Number(
    process.env.LISTINGS_RATE_LIMIT_WINDOW_MS || String(60 * 60 * 1000)
  ),
  minSubmitTimeMs: Number(process.env.MIN_SUBMIT_TIME_MS || "2000"),
  baseCurrency: "USD",
  maxTaglineChars: 60,
  maxShortDescChars: 250,
  maxLongDescChars: 2000,
  maxScreenshots: 5,
  subjectCookie: "launchpad_sid",
  adminCookie: "launchpad_admin_session",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || String(5 * 60 * 1000)),
} as const;
