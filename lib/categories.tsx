import React from "react";
import {
  Bot,
  Zap,
  Megaphone,
  Sparkles,
  Code2,
  PenTool,
  Layers,
  Compass,
  Video,
  Search,
  Share2,
  MessageSquare,
  GraduationCap,
  BarChart3,
  Puzzle,
  Cpu,
  Palette,
  Coins,
  Image as ImageIcon,
  Briefcase,
  Layout,
  Headphones,
  UserCheck,
  Music,
  Users,
  FileText,
  ShoppingBag,
  Mail,
  HeartPulse,
  Laptop,
  Globe,
  Terminal,
  Smartphone,
  Activity,
  FileCheck,
} from "lucide-react";

export interface MasterCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export const ALL_35_CATEGORIES: MasterCategoryItem[] = [
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Machine learning, neural networks, LLMs, and foundation models",
    count: 0,
    iconBg: "bg-[#F0EEFF]",
    iconColor: "text-[#4F46E5]",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    id: "productivity",
    name: "Productivity",
    slug: "productivity",
    description: "Workflow automation, task management, notes, and focus utilities",
    count: 0,
    iconBg: "bg-[#FEFCE8]",
    iconColor: "text-[#7A4E00]",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: "marketing",
    name: "Marketing",
    slug: "marketing",
    description: "Growth, advertising, funnel optimization, and acquisition tools",
    count: 0,
    iconBg: "bg-[#FFF4ED]",
    iconColor: "text-[#EA580C]",
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    id: "ai-agents",
    name: "AI Agents",
    slug: "ai-agents",
    description: "Autonomous agents, multi-agent frameworks, and AI workflows",
    count: 0,
    iconBg: "bg-[#F7F6FF]",
    iconColor: "text-[#4F46E5]",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    slug: "developer-tools",
    description: "CLIs, SDKs, dev infrastructure, testing, and debugging utilities",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#0F8A5F]",
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    id: "writing",
    name: "Writing",
    slug: "writing",
    description: "AI copywriters, grammar checkers, technical docs, and storytelling",
    count: 0,
    iconBg: "bg-[#FAF5FF]",
    iconColor: "text-[#9333EA]",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    id: "building-products",
    name: "Building Products",
    slug: "building-products",
    description: "Product management, roadmaps, customer feedback, and shipping tools",
    count: 0,
    iconBg: "bg-[#EBF5FF]",
    iconColor: "text-[#0284C7]",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: "directories",
    name: "Directories",
    slug: "directories",
    description: "Product launch boards, curated lists, and niche directory platforms",
    count: 0,
    iconBg: "bg-[#F0FDFA]",
    iconColor: "text-[#0D9488]",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    id: "video",
    name: "Video",
    slug: "video",
    description: "Video editing, screen recording, streaming, and generative video tools",
    count: 0,
    iconBg: "bg-[#FFF1F2]",
    iconColor: "text-[#E11D48]",
    icon: <Video className="h-5 w-5" />,
  },
  {
    id: "seo",
    name: "SEO",
    slug: "seo",
    description: "Backlink checkers, keyword intelligence, rank trackers, and SERP tooling",
    count: 0,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#2563EB]",
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: "social-media",
    name: "Social Media",
    slug: "social-media",
    description: "Post schedulers, audience growth, engagement bots, and social analytics",
    count: 0,
    iconBg: "bg-[#FDF2F8]",
    iconColor: "text-[#DB2777]",
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    id: "chatbots",
    name: "Chatbots",
    slug: "chatbots",
    description: "Conversational AI, custom knowledge bots, and customer live chat",
    count: 0,
    iconBg: "bg-[#F5F3FF]",
    iconColor: "text-[#7C3AED]",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: "education",
    name: "Education",
    slug: "education",
    description: "EdTech, online courses, flashcards, and student learning software",
    count: 0,
    iconBg: "bg-[#FEFCE8]",
    iconColor: "text-[#CA8A04]",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: "analytics",
    name: "Analytics",
    slug: "analytics",
    description: "Web analytics, product telemetry, dashboards, and data visualization",
    count: 0,
    iconBg: "bg-[#ECFEFF]",
    iconColor: "text-[#0891B2]",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "no-code",
    name: "No Code",
    slug: "no-code",
    description: "Visual app builders, workflow triggers, and rapid prototyping tools",
    count: 0,
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#EA580C]",
    icon: <Puzzle className="h-5 w-5" />,
  },
  {
    id: "automation",
    name: "Automation",
    slug: "automation",
    description: "Zapier alternatives, robotic process automation, and webhook runners",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#16A34A]",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    id: "design",
    name: "Design",
    slug: "design",
    description: "UI/UX components, vector graphics, prototyping, and design systems",
    count: 0,
    iconBg: "bg-[#FDF2F8]",
    iconColor: "text-[#DB2777]",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: "fintech",
    name: "Fintech",
    slug: "fintech",
    description: "Invoicing, billing, accounting, payments, and financial management",
    count: 0,
    iconBg: "bg-[#ECFEFF]",
    iconColor: "text-[#0D9488]",
    icon: <Coins className="h-5 w-5" />,
  },
  {
    id: "image",
    name: "Image",
    slug: "image",
    description: "AI image generators, background removers, and photo enhancement tools",
    count: 0,
    iconBg: "bg-[#FAF5FF]",
    iconColor: "text-[#9333EA]",
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    id: "sales",
    name: "Sales",
    slug: "sales",
    description: "CRMs, lead enrichment, cold email outreach, and pipeline tracking",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#15803D]",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "website-builders",
    name: "Website Builders",
    slug: "website-builders",
    description: "Landing page generators, static site builders, and portfolio tools",
    count: 0,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#1D4ED8]",
    icon: <Layout className="h-5 w-5" />,
  },
  {
    id: "customer-support",
    name: "Customer Support",
    slug: "customer-support",
    description: "Help desks, ticket routing, feedback widgets, and support portals",
    count: 0,
    iconBg: "bg-[#FEF2F2]",
    iconColor: "text-[#DC2626]",
    icon: <Headphones className="h-5 w-5" />,
  },
  {
    id: "freelancer-tools",
    name: "Freelancer Tools",
    slug: "freelancer-tools",
    description: "Contracts, time tracking, proposal generators, and client portals",
    count: 0,
    iconBg: "bg-[#FFFBEB]",
    iconColor: "text-[#D97706]",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    id: "audio-music",
    name: "Audio & Music",
    slug: "audio-music",
    description: "Voice cloning, podcast mastering, AI music generation, and audio editors",
    count: 0,
    iconBg: "bg-[#FDF4FF]",
    iconColor: "text-[#C026D3]",
    icon: <Music className="h-5 w-5" />,
  },
  {
    id: "community",
    name: "Community",
    slug: "community",
    description: "Forums, community moderation, memberships, and discussion platforms",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#059669]",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "content-creation",
    name: "Content Creation",
    slug: "content-creation",
    description: "Multi-channel publishing, content repurposing, and media generation",
    count: 0,
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#C2410C]",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "e-commerce",
    name: "E-commerce",
    slug: "e-commerce",
    description: "Online storefronts, inventory, checkout, and merchant tooling",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#16A34A]",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    slug: "email-marketing",
    description: "Newsletter delivery, campaign sequences, deliverability, and warmups",
    count: 0,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#2563EB]",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    id: "health-fitness",
    name: "Health & Fitness",
    slug: "health-fitness",
    description: "Wellness trackers, workout planners, mental health, and nutrition apps",
    count: 0,
    iconBg: "bg-[#FFF1F2]",
    iconColor: "text-[#E11D48]",
    icon: <HeartPulse className="h-5 w-5" />,
  },
  {
    id: "remote-work",
    name: "Remote Work",
    slug: "remote-work",
    description: "HR, distributed workforce, asynchronous collaboration, and team operations",
    count: 0,
    iconBg: "bg-[#F5F3FF]",
    iconColor: "text-[#6D28D9]",
    icon: <Laptop className="h-5 w-5" />,
  },
  {
    id: "chrome-extensions",
    name: "Chrome Extensions",
    slug: "chrome-extensions",
    description: "Browser utilities, web scrapers, and sidebar productivity add-ons",
    count: 0,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#1D4ED8]",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "developer-apis",
    name: "Developer APIs",
    slug: "developer-apis",
    description: "Public REST/GraphQL APIs, webhooks, authentication, and data feeds",
    count: 0,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#0F8A5F]",
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    id: "ios",
    name: "iOS",
    slug: "ios",
    description: "Native iOS, iPadOS, and macOS apps crafted for Apple platforms",
    count: 0,
    iconBg: "bg-[#F8FAFC]",
    iconColor: "text-[#0F172A]",
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: "monitoring",
    name: "Monitoring",
    slug: "monitoring",
    description: "Uptime monitoring, error tracing, server health, and log aggregation",
    count: 0,
    iconBg: "bg-[#FEF2F2]",
    iconColor: "text-[#B91C1C]",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    id: "pdf-documents",
    name: "PDF & Documents",
    slug: "pdf-documents",
    description: "PDF editors, digital signatures, optical character recognition, and docs",
    count: 0,
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#EA580C]",
    icon: <FileCheck className="h-5 w-5" />,
  },
];

export const MASTER_CATEGORIES: MasterCategoryItem[] = ALL_35_CATEGORIES;

export interface CategoryToolItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  pricingModel: "Free" | "Freemium" | "Paid";
  priceDisplay?: string;
  upvotes: number;
  commentsCount: number;
  initials: string;
  logoBg: string;
  logoUrl?: string;
  websiteUrl: string;
  isVerified?: boolean;
  listingPlan?: "free" | "premium" | "featured";
  approvedAt?: string;
  founder?: {
    name: string;
    role?: string;
  };
}

export function getCategoryBySlug(slug: string): MasterCategoryItem | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/_/g, "-");
  return (
    ALL_35_CATEGORIES.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.id.toLowerCase() === clean ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean
    ) || null
  );
}

export function getRelatedCategories(currentSlug: string, count = 5): MasterCategoryItem[] {
  const current = getCategoryBySlug(currentSlug);
  return ALL_35_CATEGORIES.filter((c) => c.slug !== current?.slug).slice(0, count);
}

/**
 * Returns tailored tools for a given category.
 * Strictly returns empty array by default to prevent fake/dummy tools from appearing.
 */
export function getCuratedToolsForCategory(slug: string): CategoryToolItem[] {
  return [];
}
