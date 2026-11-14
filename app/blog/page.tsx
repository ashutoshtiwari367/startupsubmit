import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllBlogPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/seo";
import { Sparkles, Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - Launch Playbooks & SaaS Growth | LaunchOS",
  description:
    "Tactical guides, launch teardowns, and monetization strategies for software founders and indie hackers.",
  alternates: {
    canonical: `${getSiteUrl()}/blog`,
  },
  openGraph: {
    title: "LaunchOS Blog",
    description: "Tactical guides and launch teardowns for SaaS founders.",
    url: `${getSiteUrl()}/blog`,
    type: "website",
  },
};

export default function BlogDirectoryPage() {
  const posts = getAllBlogPosts();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            LaunchOS Blog
          </h1>
          <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
            Battle-tested frameworks, launch playbooks, and pricing teardowns to help you grow your software product.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <div className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden shadow-xs hover:border-[#D4D4E4] transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FFF1D6] text-[#7A4E00] border border-[#FCD34D] px-2.5 py-0.5 text-[11px] font-bold">
                    Featured Article
                  </span>
                  <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] px-2.5 py-0.5 text-[11px] font-semibold">
                    {featuredPost.category}
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight leading-snug">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="hover:text-[#4F46E5] transition-colors"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed line-clamp-3">
                  {featuredPost.tagline}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#F1F1F8]">
                  <div className="flex items-center gap-3 text-xs text-[#55556E]">
                    <div className="h-7 w-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-[10px]">
                      {featuredPost.author.initials}
                    </div>
                    <div>
                      <span className="font-bold text-[#14142B] block">
                        {featuredPost.author.name}
                      </span>
                      <span className="text-[11px] text-[#55556E]">
                        {featuredPost.author.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#55556E] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
                      <span>{featuredPost.publishedAt}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#55556E]" />
                      <span>{featuredPost.readTime}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] group"
                  >
                    <span>Read full article</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full min-h-[260px] relative overflow-hidden bg-[#F6F6FB]">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="space-y-6">
          <h3 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
            Latest Playbooks &amp; Guides
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden shadow-xs hover:border-[#D4D4E4] transition-all flex flex-col justify-between"
              >
                <div className="h-48 overflow-hidden bg-[#F6F6FB] relative">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-[#4F46E5] shadow-xs">
                    {post.category}
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#14142B] tracking-tight leading-snug">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-[#4F46E5] transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-[#55556E] leading-relaxed line-clamp-2">
                      {post.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F1F1F8] flex items-center justify-between text-xs text-[#55556E] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#4F46E5]" />
                      <span>{post.publishedAt}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#55556E]" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:underline"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Launch CTA Banner */}
        <div className="rounded-2xl border border-[#E0DEFC] bg-gradient-to-r from-[#F7F6FF] via-white to-[#F7F6FF] p-6 sm:p-8 text-center space-y-4">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="p-2 rounded-xl bg-[#4F46E5] text-white inline-block">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B]">
              Ready to launch your own product?
            </h3>
            <p className="text-xs sm:text-sm text-[#55556E]">
              Put your SaaS in front of thousands of founders, early adopters, and active buyers today.
            </p>
          </div>
          <div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-heading font-bold transition-all shadow-xs"
            >
              <span>Submit Your Product</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

