import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/seo";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | LaunchOS",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: canonicalUrl,
      images: [{ url: post.featuredImage, alt: post.title }],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[880px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-mono text-[#55556E]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 hover:text-[#4F46E5] transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all articles</span>
          </Link>
          <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] px-2.5 py-0.5 text-[11px] font-semibold">
            {post.category}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#14142B] tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
            {post.tagline}
          </p>

          <div className="pt-3 border-t border-[#E6E6F0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#55556E]">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-heading font-bold text-xs shadow-2xs">
                {post.author.initials}
              </div>
              <div>
                <span className="font-heading font-bold text-[#14142B] block text-sm">
                  {post.author.name}
                </span>
                <span className="text-xs text-[#55556E]">
                  {post.author.role} &bull; {post.author.handle}
                </span>
              </div>
            </div>

            {/* Meta Details */}
            <div className="flex items-center gap-3 font-mono">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
                <span>{post.publishedAt}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#55556E]" />
                <span>{post.readTime}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-2xl border border-[#E6E6F0] overflow-hidden bg-white shadow-xs">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto max-h-[420px] object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 leading-relaxed text-[#14142B]">
          {/* Introduction */}
          <div className="text-sm sm:text-base text-[#3A3A52] leading-relaxed border-l-4 border-[#4F46E5] pl-4 italic bg-[#F7F6FF]/60 py-3 rounded-r-xl">
            {post.content.introduction}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {post.content.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                  {section.heading}
                </h2>

                <div className="space-y-3 text-sm sm:text-base text-[#55556E] leading-relaxed">
                  {section.body.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                  <div className="rounded-xl border border-[#E0DEFC] bg-[#F8F7FF] p-4 space-y-2 mt-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5] block">
                      KEY TAKEAWAYS
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#14142B]">
                      {section.keyTakeaways.map((takeaway, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#0F8A5F] shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="pt-6 border-t border-[#F1F1F8] space-y-3">
            <h3 className="font-heading font-extrabold text-lg text-[#14142B]">
              Final Thoughts
            </h3>
            <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-[#F1F1F8] flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#55556E] font-medium mr-1">
              TAGS:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F6F6FB] text-[#55556E] border border-[#E6E6F0] px-2.5 py-0.5 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Launch CTA */}
        <div className="rounded-2xl border border-[#E0DEFC] bg-gradient-to-r from-[#F7F6FF] via-white to-[#F7F6FF] p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <span className="p-2 rounded-xl bg-[#4F46E5] text-white inline-block">
            <Sparkles className="h-5 w-5" />
          </span>
          <h3 className="font-heading font-extrabold text-xl text-[#14142B]">
            Launch Your Software on LaunchOS
          </h3>
          <p className="text-xs sm:text-sm text-[#55556E] max-w-md mx-auto">
            Get high-authority dofollow backlinks, real early-adopter feedback, and compete on the daily leaderboard.
          </p>
          <div className="pt-2">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-heading font-bold transition-all shadow-xs"
            >
              <span>Submit a Product</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#E6E6F0]">
            <h3 className="font-heading font-extrabold text-lg text-[#14142B]">
              More From LaunchOS Founder Blog
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group rounded-xl border border-[#E6E6F0] bg-white p-4 hover:border-[#E0DEFC] hover:bg-[#F8F7FF] transition-all block space-y-2 shadow-2xs"
                >
                  <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] px-2 py-0.5 text-[10px] font-semibold">
                    {rel.category}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-[#14142B] group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <div className="text-[11px] font-mono text-[#55556E]">
                    {rel.readTime} &bull; {rel.publishedAt}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

