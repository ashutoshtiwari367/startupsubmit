import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Footer Links Audit, Legal Pages & Blog System", () => {
  it("verifies Footer.tsx has zero broken hash links and all items point to valid routes", () => {
    const footerPath = path.join(__dirname, "..", "components", "Footer.tsx");
    assert.ok(fs.existsSync(footerPath), "Footer.tsx must exist");
    const footerCode = fs.readFileSync(footerPath, "utf8");

    // Must not contain dummy hash anchors
    assert.ok(!footerCode.includes('href="#blog"'), "Must not contain #blog hash");
    assert.ok(!footerCode.includes('href="#terms"'), "Must not contain #terms hash");
    assert.ok(!footerCode.includes('href="#privacy"'), "Must not contain #privacy hash");
    assert.ok(!footerCode.includes('href="#guidelines"'), "Must not contain #guidelines hash");
    assert.ok(!footerCode.includes('href="#refund"'), "Must not contain #refund hash");
    assert.ok(!footerCode.includes('href="#badges"'), "Must not contain #badges hash");
    assert.ok(!footerCode.includes('href="#seo"'), "Must not contain #seo hash");

    // Must link to /blog with label "Blog" (not "Founder Blog")
    assert.ok(footerCode.includes('href="/blog"'), "Must link to /blog");
    assert.ok(!footerCode.includes("Founder Blog"), "Footer must label link as 'Blog', not 'Founder Blog'");
    assert.ok(footerCode.includes('href="/pricing"'), "Must link to /pricing");
    assert.ok(footerCode.includes('href="/badges"'), "Must link to /badges");
    assert.ok(footerCode.includes('href="/faq"'), "Must link to /faq (replaced SEO Guide)");
    assert.ok(footerCode.includes('href="/terms"'), "Must link to /terms");
    assert.ok(footerCode.includes('href="/privacy"'), "Must link to /privacy");
    assert.ok(footerCode.includes('href="/guidelines"'), "Must link to /guidelines");
    assert.ok(footerCode.includes('href="/refund"'), "Must link to /refund");
    assert.ok(footerCode.includes('href="/submit"'), "Must link to /submit");
    assert.ok(footerCode.includes('href="/winners"'), "Must link to /winners");
    assert.ok(footerCode.includes('href="/categories"'), "Must link to /categories");

    // Must not contain DAILY NEWSLETTER
    assert.ok(!footerCode.includes("DAILY NEWSLETTER"), "Footer.tsx must remove daily newsletter section");
  });

  it("verifies all four legal & policy pages exist with comprehensive content", () => {
    const termsPath = path.join(__dirname, "..", "app", "terms", "page.tsx");
    const privacyPath = path.join(__dirname, "..", "app", "privacy", "page.tsx");
    const guidelinesPath = path.join(__dirname, "..", "app", "guidelines", "page.tsx");
    const refundPath = path.join(__dirname, "..", "app", "refund", "page.tsx");

    assert.ok(fs.existsSync(termsPath), "/terms page must exist");
    assert.ok(fs.existsSync(privacyPath), "/privacy page must exist");
    assert.ok(fs.existsSync(guidelinesPath), "/guidelines page must exist");
    assert.ok(fs.existsSync(refundPath), "/refund page must exist");

    const termsCode = fs.readFileSync(termsPath, "utf8");
    const privacyCode = fs.readFileSync(privacyPath, "utf8");
    const guidelinesCode = fs.readFileSync(guidelinesPath, "utf8");
    const refundCode = fs.readFileSync(refundPath, "utf8");

    // Terms verification
    assert.ok(termsCode.includes("Terms of Service"), "Terms must contain title");
    assert.ok(termsCode.includes("Intellectual Property"), "Terms must cover IP and submissions");

    // Privacy verification
    assert.ok(privacyCode.includes("Privacy Policy"), "Privacy must contain title");
    assert.ok(privacyCode.includes("Privacy-Preserving Analytics"), "Privacy must detail analytics protection");

    // Guidelines verification
    assert.ok(guidelinesCode.includes("Community Guidelines"), "Guidelines must contain title");
    assert.ok(guidelinesCode.includes("What We Approve"), "Guidelines must define approved software criteria");

    // Refund verification
    assert.ok(refundCode.includes("Refund Policy"), "Refund must contain title");
    assert.ok(refundCode.includes("Review Turnaround SLA"), "Refund must describe 24h turnaround SLA");
  });

  it("verifies Blog library and 2 unique dummy blog posts exist with required fields", async () => {
    const blogLibPath = path.join(__dirname, "..", "lib", "blog.ts");
    assert.ok(fs.existsSync(blogLibPath), "lib/blog.ts must exist");

    const { getAllBlogPosts, getBlogPostBySlug } = await import("../lib/blog.ts");
    const posts = getAllBlogPosts();

    assert.ok(Array.isArray(posts) && posts.length >= 2, "Must contain at least 2 blog posts");

    // Check unique titles, slugs, images, content, meta
    const slugs = new Set(posts.map((p) => p.slug));
    const titles = new Set(posts.map((p) => p.title));
    assert.equal(slugs.size, posts.length, "All blog post slugs must be unique");
    assert.equal(titles.size, posts.length, "All blog post titles must be unique");

    for (const post of posts) {
      assert.ok(post.slug && post.slug.length > 0, "Post must have a valid slug");
      assert.ok(post.title && post.title.length > 0, "Post must have a title");
      assert.ok(post.tagline && post.tagline.length > 0, "Post must have a short description");
      assert.ok(post.featuredImage && post.featuredImage.startsWith("http"), "Post must have a featured image URL");
      assert.ok(post.metaTitle && post.metaTitle.length > 0, "Post must have metaTitle");
      assert.ok(post.metaDescription && post.metaDescription.length > 0, "Post must have metaDescription");
      assert.ok(post.content && post.content.sections.length > 0, "Post must have structured content sections");
    }

    // Lookup by slug
    const post1 = getBlogPostBySlug("how-to-launch-saas-2026");
    assert.ok(post1, "Post 1 must be retrievable by slug");
    assert.equal(post1.category, "Launch Strategy");

    const post2 = getBlogPostBySlug("saas-pricing-models-guide");
    assert.ok(post2, "Post 2 must be retrievable by slug");
    assert.equal(post2.category, "Monetization");
  });

  it("verifies Blog Directory (/blog) and Single Blog Page (/blog/[slug]) exist with dynamic metadata", () => {
    const blogDirPage = path.join(__dirname, "..", "app", "blog", "page.tsx");
    const singleBlogPage = path.join(__dirname, "..", "app", "blog", "[slug]", "page.tsx");

    assert.ok(fs.existsSync(blogDirPage), "app/blog/page.tsx must exist");
    assert.ok(fs.existsSync(singleBlogPage), "app/blog/[slug]/page.tsx must exist");

    const blogDirCode = fs.readFileSync(blogDirPage, "utf8");
    const singleBlogCode = fs.readFileSync(singleBlogPage, "utf8");

    assert.ok(blogDirCode.includes("getAllBlogPosts"), "Blog directory must load blog posts");
    assert.ok(singleBlogCode.includes("generateMetadata"), "Single blog page must export generateMetadata");
    assert.ok(singleBlogCode.includes("getBlogPostBySlug"), "Single blog page must query by slug");
  });

  it("verifies Resource pages (/badges, /faq) exist", () => {
    const badgesPath = path.join(__dirname, "..", "app", "badges", "page.tsx");
    const faqPath = path.join(__dirname, "..", "app", "faq", "page.tsx");

    assert.ok(fs.existsSync(badgesPath), "app/badges/page.tsx must exist");
    assert.ok(fs.existsSync(faqPath), "app/faq/page.tsx must exist");
  });

  it("verifies /sitemap/2.xml chunk includes /blog and blog articles", async () => {
    const { sitemapChunkIds, buildSitemapChunk, sitemapToXml } = await import("../lib/seo/sitemap.ts");

    const mockConfig = {
      siteUrl: "https://launchos.com",
      staticRoutes: [{ path: "/", priority: 1.0 }],
      blog: {
        basePath: "/blog",
        chunkSize: 1000,
        getEntries: async () => {
          const { getAllBlogPosts } = await import("../lib/blog.ts");
          return getAllBlogPosts().map((p) => ({
            slug: p.slug,
            lastModified: p.publishedAt,
          }));
        },
      },
    };

    const chunkIds = await sitemapChunkIds(mockConfig);

    // Must include chunk id 2
    assert.ok(
      chunkIds.some((c) => c.id === 2),
      "sitemapChunkIds must include id: 2 for blog sitemap"
    );

    // Build chunk 2
    const chunk2Entries = await buildSitemapChunk(mockConfig, 2);
    assert.ok(chunk2Entries.length >= 3, "Chunk 2 must contain /blog and at least 2 articles");

    const urls = chunk2Entries.map((e) => e.url);
    assert.ok(urls.some((u) => u.endsWith("/blog")), "Chunk 2 must contain main /blog directory page");
    assert.ok(
      urls.some((u) => u.includes("/blog/how-to-launch-saas-2026")),
      "Chunk 2 must contain /blog/how-to-launch-saas-2026"
    );
    assert.ok(
      urls.some((u) => u.includes("/blog/saas-pricing-models-guide")),
      "Chunk 2 must contain /blog/saas-pricing-models-guide"
    );

    const xml = sitemapToXml(chunk2Entries);
    assert.ok(xml.includes("<loc>"), "Generated chunk 2 XML must contain <loc> elements");
    assert.ok(xml.includes("/blog"), "Generated chunk 2 XML must contain /blog");
  });

  it("verifies SubmitForm 5 screenshot boxes and 25MB total limit enforcement", async () => {
    const submitFormPath = path.join(__dirname, "..", "components", "SubmitForm.tsx");
    const submitFormSource = fs.readFileSync(submitFormPath, "utf8");

    // 1. SubmitForm has 5 distinct screenshot boxes with "+ Add Image" (no Box 1 / Box 2 labels)
    assert.ok(
      submitFormSource.includes("+ Add Image"),
      "SubmitForm must show '+ Add Image' inside empty boxes"
    );
    assert.ok(
      !submitFormSource.includes("Box 1 (Hero)"),
      "SubmitForm must not show 'Box 1 (Hero)'"
    );
    assert.ok(
      submitFormSource.includes("[0, 1, 2, 3, 4]"),
      "SubmitForm must iterate over 5 distinct slot indices"
    );
    assert.ok(
      submitFormSource.includes("25 MB"),
      "SubmitForm UI must display 25 MB max limit"
    );

    // 2. Server-side validation exports MAX_TOTAL_SCREENSHOTS_SIZE_BYTES and enforces 25MB limit
    const validationLibPath = path.join(__dirname, "..", "lib", "validation.ts");
    const validationSource = fs.readFileSync(validationLibPath, "utf8");

    assert.ok(
      validationSource.includes("MAX_TOTAL_SCREENSHOTS_SIZE_BYTES = 25 * 1024 * 1024"),
      "lib/validation.ts must define MAX_TOTAL_SCREENSHOTS_SIZE_BYTES = 25 * 1024 * 1024"
    );
    assert.ok(
      validationSource.includes("totalScreenshotsBytes > MAX_TOTAL_SCREENSHOTS_SIZE_BYTES"),
      "lib/validation.ts must enforce totalScreenshotsBytes > MAX_TOTAL_SCREENSHOTS_SIZE_BYTES"
    );
    assert.ok(
      validationSource.includes("Total screenshots size cannot exceed 25MB"),
      "lib/validation.ts must set error message for exceeding 25MB limit"
    );

    // Verify submitListing schema limits
    const submitLimitsPath = path.join(__dirname, "..", "lib", "schemas", "submitListing.ts");
    const submitLimitsSource = fs.readFileSync(submitLimitsPath, "utf8");
    assert.ok(
      submitLimitsSource.includes("MAX_TOTAL_SCREENSHOTS_SIZE_BYTES: 25 * 1024 * 1024"),
      "SUBMIT_LIMITS must specify MAX_TOTAL_SCREENSHOTS_SIZE_BYTES"
    );

    // 3. API route check
    const apiRoutePath = path.join(__dirname, "..", "app", "api", "listings", "route.ts");
    const apiRouteSource = fs.readFileSync(apiRoutePath, "utf8");
    assert.ok(
      apiRouteSource.includes("totalScreenshotsBytes > 25 * 1024 * 1024"),
      "API route must strictly block total screenshots size > 25MB"
    );
  });
});

