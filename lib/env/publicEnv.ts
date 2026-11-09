export const publicEnv = {
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "launchos.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://launchos.com",
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tbatttczyklqaxgbqlke.supabase.co",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_JfRBjUG1CaO96fxTBCnPbw_ZQqNOnia",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || "",
} as const;
