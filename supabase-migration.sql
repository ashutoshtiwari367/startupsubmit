-- Run this in your Supabase SQL Editor if you want native columns:
ALTER TABLE startups ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS brand_color text;
