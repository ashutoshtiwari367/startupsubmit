import React from "react";
import type { Metadata } from "next";
import CategoryPage, {
  generateMetadata as baseGenerateMetadata,
} from "../../category/[slug]/page";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return baseGenerateMetadata(props);
}

export default async function CategoriesSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  return CategoryPage(props);
}
