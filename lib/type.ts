// lib/types.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  category: string;
  pricingType: 'Free' | 'Freemium' | 'Paid';
  upvotes: number;
  isFeatured?: boolean;
  createdAt: string;
}