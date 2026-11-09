export interface LaunchProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "AI & Agents" | "Developer Tools" | "Design & UX" | "Productivity" | "Analytics & Data";
  upvotes: number;
  isUpvoted?: boolean;
  rank?: 1 | 2 | 3 | number;
  commentsCount: number;
  pricing: "Free" | "Freemium" | "Paid" | "Free Trial";
  launchDate: "today" | "yesterday";
  founder: {
    name: string;
    handle: string;
    role: string;
    avatar?: string;
  };
  tags: string[];
  metrics?: {
    mrr?: string;
    users?: string;
    growth?: string;
    featured?: boolean;
  };
}

export const MOCK_CATEGORIES = [
  { id: "all", label: "All Products", count: 42 },
  { id: "AI & Agents", label: "AI & Agents", count: 18 },
  { id: "Developer Tools", label: "Developer Tools", count: 12 },
  { id: "Productivity", label: "Productivity", count: 9 },
  { id: "Design & UX", label: "Design & UX", count: 7 },
  { id: "Analytics & Data", label: "Analytics & Data", count: 6 },
];

export const MOCK_PRODUCTS: LaunchProduct[] = [
  {
    id: "p-1",
    name: "Cortex AI",
    tagline: "Autonomous customer success agents for modern B2B SaaS teams",
    description:
      "Cortex ingests docs, issue trackers, and ticketing history to autonomously resolve 68% of enterprise support tickets in real-time.",
    category: "AI & Agents",
    upvotes: 384,
    isUpvoted: true,
    rank: 1,
    commentsCount: 42,
    pricing: "Free Trial",
    launchDate: "today",
    founder: {
      name: "Austin Miller",
      handle: "@austinm",
      role: "Solo Founder",
    },
    tags: ["Autonomous Agents", "Support", "LLMs"],
    metrics: { growth: "+24% daily", featured: true, mrr: "$12.4k MRR" },
  },
  {
    id: "p-2",
    name: "VectorFlow",
    tagline: "Instant vector database deployment with zero cold starts",
    description:
      "Serverless embedding indexer engineered for real-time semantic search and low-latency RAG applications at scale.",
    category: "Developer Tools",
    upvotes: 279,
    isUpvoted: false,
    rank: 2,
    commentsCount: 31,
    pricing: "Freemium",
    launchDate: "today",
    founder: {
      name: "Elena Rostova",
      handle: "@erostova",
      role: "Founder & CTO",
    },
    tags: ["Vector DB", "RAG", "Infrastructure"],
    metrics: { growth: "+18% daily", featured: true, users: "4.2k Devs" },
  },
  {
    id: "p-3",
    name: "Prism Studio",
    tagline: "Turn design system tokens into production React code",
    description:
      "A bi-directional sync engine connecting Figma styles, Tailwind v4 theme variables, and shadcn component libraries.",
    category: "Design & UX",
    upvotes: 215,
    isUpvoted: false,
    rank: 3,
    commentsCount: 19,
    pricing: "Paid",
    launchDate: "today",
    founder: {
      name: "Devon Vance",
      handle: "@dvance",
      role: "Design Engineer",
    },
    tags: ["Design Systems", "Tailwind", "React"],
    metrics: { growth: "+12% daily", featured: true },
  },
  {
    id: "p-4",
    name: "PulseGrid",
    tagline: "Minimalist server health and cron monitoring for indie hackers",
    description:
      "Dead simple heartbeat checks, webhook pingers, and SSL certificate expiration alerts straight to Slack and Telegram.",
    category: "Productivity",
    upvotes: 168,
    isUpvoted: false,
    commentsCount: 14,
    pricing: "Free",
    launchDate: "today",
    founder: {
      name: "Marcus Chen",
      handle: "@mchen_dev",
      role: "Indie Maker",
    },
    tags: ["DevOps", "Monitoring", "Indie"],
    metrics: { growth: "+8% daily", featured: false },
  },
  {
    id: "p-5",
    name: "QueryCraft",
    tagline: "Natural language SQL generator connected directly to your read replicas",
    description:
      "Generate complex analytical queries with schema-aware LLM agents, verify query plans, and export directly to CSV or BI tools.",
    category: "Analytics & Data",
    upvotes: 512,
    isUpvoted: true,
    rank: 1,
    commentsCount: 56,
    pricing: "Freemium",
    launchDate: "yesterday",
    founder: {
      name: "Sarah Jenkins",
      handle: "@sjenkins_ai",
      role: "Co-Founder",
    },
    tags: ["SQL", "Analytics", "Postgres"],
    metrics: { growth: "+41%", featured: true, mrr: "$28k MRR" },
  },
  {
    id: "p-6",
    name: "ShipFast Native",
    tagline: "React Native boilerplate with pre-built in-app purchases and auth",
    description:
      "Deploy cross-platform mobile apps in days with Stripe & Apple Pay integrations, Supabase backend, and Expo Router.",
    category: "Developer Tools",
    upvotes: 429,
    isUpvoted: false,
    rank: 2,
    commentsCount: 38,
    pricing: "Paid",
    launchDate: "yesterday",
    founder: {
      name: "Kyle Brody",
      handle: "@kylebrody",
      role: "Maker",
    },
    tags: ["Mobile", "React Native", "Stripe"],
    metrics: { growth: "+19%", featured: true },
  },
  {
    id: "p-7",
    name: "HyperDraft",
    tagline: "AI video storyboard generator for founders and marketing teams",
    description:
      "Turn product release notes into 30-second teaser animations and social video scripts with customized brand avatars.",
    category: "Productivity",
    upvotes: 367,
    isUpvoted: false,
    rank: 3,
    commentsCount: 28,
    pricing: "Free Trial",
    launchDate: "yesterday",
    founder: {
      name: "Nico Ramirez",
      handle: "@nicoram",
      role: "Founder",
    },
    tags: ["Video AI", "Marketing", "Social"],
    metrics: { growth: "+15%", featured: false },
  },
];

export interface SponsorProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  url: string;
  gradient: string;
  initials: string;
}

export const MOCK_SPONSORS: SponsorProduct[] = [
  {
    id: "sp-1",
    name: "Supaship",
    tagline: "Ship your Next.js SaaS in hours, not weeks. Auth, Stripe & DB ready.",
    category: "Boilerplate",
    url: "https://supaship.dev",
    gradient: "from-[#5B5BF0] to-[#818CF8]",
    initials: "SS",
  },
  {
    id: "sp-2",
    name: "AetherDB",
    tagline: "Serverless Postgres with instant branching and sub-10ms global read latency.",
    category: "Database",
    url: "https://aetherdb.io",
    gradient: "from-[#0F0F10] to-[#374151]",
    initials: "AD",
  },
  {
    id: "sp-3",
    name: "AgentFlow",
    tagline: "Visual orchestration canvas for multi-agent workflows and autonomous execution.",
    category: "AI Platform",
    url: "https://agentflow.ai",
    gradient: "from-[#059669] to-[#34D399]",
    initials: "AF",
  },
];

export interface TrendingProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  upvotes: number;
  rank: number;
  isHot?: boolean;
  avatarGradient: string;
  initials: string;
}

export const MOCK_TRENDING_PRODUCTS: TrendingProduct[] = [
  {
    id: "tr-1",
    name: "Cortex AI",
    tagline: "Autonomous customer success agents for modern B2B SaaS teams",
    category: "AI & Agents",
    upvotes: 384,
    rank: 1,
    isHot: true,
    avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
    initials: "CA",
  },
  {
    id: "tr-2",
    name: "VectorFlow",
    tagline: "Instant vector database deployment with zero cold starts",
    category: "Developer Tools",
    upvotes: 279,
    rank: 2,
    avatarGradient: "from-[#059669] to-[#34D399]",
    initials: "VF",
  },
  {
    id: "tr-3",
    name: "Prism Studio",
    tagline: "Turn design system tokens into production React code",
    category: "Design & UX",
    upvotes: 215,
    rank: 3,
    avatarGradient: "from-[#D97706] to-[#FBBF24]",
    initials: "PS",
  },
  {
    id: "tr-4",
    name: "PulseGrid",
    tagline: "Minimalist server health and cron monitoring for indie hackers",
    category: "Productivity",
    upvotes: 168,
    rank: 4,
    avatarGradient: "from-[#4338CA] to-[#6366F1]",
    initials: "PG",
  },
  {
    id: "tr-5",
    name: "PromptSmith",
    tagline: "Prompt optimization and latency regression testing for LLMs",
    category: "AI & Agents",
    upvotes: 142,
    rank: 5,
    avatarGradient: "from-[#7C3AED] to-[#A78BFA]",
    initials: "PM",
  },
  {
    id: "tr-6",
    name: "Supaship Native",
    tagline: "Turn your Next.js web application into native iOS & Android binaries",
    category: "Developer Tools",
    upvotes: 126,
    rank: 6,
    avatarGradient: "from-[#0F0F10] to-[#3A3A40]",
    initials: "SN",
  },
];

export interface LeaderboardProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  upvotes: number;
  isUpvoted?: boolean;
  rank: number;
  commentsCount: number;
  url: string;
  avatarGradient: string;
  initials: string;
  maker: {
    name: string;
    avatarInitials: string;
    avatarColor: string;
    role: string;
  };
}

export const LEADERBOARD_DATA: Record<"today" | "week" | "month", LeaderboardProduct[]> = {
  today: [
    {
      id: "lb-t-1",
      name: "Cortex AI",
      tagline: "Autonomous customer success agents for modern B2B SaaS teams. Integrates with your docs and ticketing in 5 minutes.",
      category: "AI & Agents",
      upvotes: 384,
      isUpvoted: true,
      rank: 1,
      commentsCount: 42,
      url: "https://cortex.ai",
      avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
      initials: "CA",
      maker: {
        name: "Austin Miller",
        avatarInitials: "AM",
        avatarColor: "bg-[#5B5BF0]",
        role: "Founder",
      },
    },
    {
      id: "lb-t-2",
      name: "VectorFlow",
      tagline: "Instant vector database deployment with zero cold starts, automatic sharding, and real-time semantic caching.",
      category: "Developer Tools",
      upvotes: 279,
      isUpvoted: false,
      rank: 2,
      commentsCount: 31,
      url: "https://vectorflow.dev",
      avatarGradient: "from-[#059669] to-[#34D399]",
      initials: "VF",
      maker: {
        name: "Elena Rostova",
        avatarInitials: "ER",
        avatarColor: "bg-[#059669]",
        role: "CTO",
      },
    },
    {
      id: "lb-t-3",
      name: "Prism Studio",
      tagline: "Turn design system tokens into production React code with bi-directional Figma and Tailwind v4 synchronization.",
      category: "Design & UX",
      upvotes: 215,
      isUpvoted: false,
      rank: 3,
      commentsCount: 19,
      url: "https://prismstudio.design",
      avatarGradient: "from-[#D97706] to-[#FBBF24]",
      initials: "PS",
      maker: {
        name: "Devon Vance",
        avatarInitials: "DV",
        avatarColor: "bg-[#D97706]",
        role: "Designer",
      },
    },
    {
      id: "lb-t-4",
      name: "PulseGrid",
      tagline: "Minimalist server health and cron monitoring with instant Telegram alerts",
      category: "Productivity",
      upvotes: 168,
      rank: 4,
      commentsCount: 14,
      url: "https://pulsegrid.io",
      avatarGradient: "from-[#4338CA] to-[#6366F1]",
      initials: "PG",
      maker: { name: "Marcus Chen", avatarInitials: "MC", avatarColor: "bg-[#4338CA]", role: "Maker" },
    },
    {
      id: "lb-t-5",
      name: "PromptSmith",
      tagline: "Automated latency regression testing and cost optimization for LLM prompts",
      category: "AI & Agents",
      upvotes: 142,
      rank: 5,
      commentsCount: 18,
      url: "https://promptsmith.ai",
      avatarGradient: "from-[#7C3AED] to-[#A78BFA]",
      initials: "PM",
      maker: { name: "Sarah Jenkins", avatarInitials: "SJ", avatarColor: "bg-[#7C3AED]", role: "Founder" },
    },
    {
      id: "lb-t-6",
      name: "Supaship Native",
      tagline: "Compile Next.js web apps directly to production iOS and Android binary stores",
      category: "Developer Tools",
      upvotes: 126,
      rank: 6,
      commentsCount: 12,
      url: "https://supaship.dev",
      avatarGradient: "from-[#0F0F10] to-[#3A3A40]",
      initials: "SN",
      maker: { name: "Kyle Brody", avatarInitials: "KB", avatarColor: "bg-[#0F0F10]", role: "Indie" },
    },
    {
      id: "lb-t-7",
      name: "TraceStack",
      tagline: "Distributed OpenTelemetry logging with zero infrastructure configuration overhead",
      category: "Developer Tools",
      upvotes: 114,
      rank: 7,
      commentsCount: 9,
      url: "https://tracestack.io",
      avatarGradient: "from-[#2563EB] to-[#60A5FA]",
      initials: "TS",
      maker: { name: "Liam Vance", avatarInitials: "LV", avatarColor: "bg-[#2563EB]", role: "Engineer" },
    },
    {
      id: "lb-t-8",
      name: "FormPulse",
      tagline: "Convert static HTML contact forms into multi-step interactive lead qualifiers",
      category: "Productivity",
      upvotes: 98,
      rank: 8,
      commentsCount: 7,
      url: "https://formpulse.co",
      avatarGradient: "from-[#DC2626] to-[#F87171]",
      initials: "FP",
      maker: { name: "Chloe Dupont", avatarInitials: "CD", avatarColor: "bg-[#DC2626]", role: "Founder" },
    },
  ],
  week: [
    {
      id: "lb-w-1",
      name: "QueryCraft",
      tagline: "Natural language SQL generator connected directly to read replicas with explain analyze verification.",
      category: "Analytics & Data",
      upvotes: 1420,
      isUpvoted: true,
      rank: 1,
      commentsCount: 184,
      url: "https://querycraft.ai",
      avatarGradient: "from-[#5B5BF0] to-[#818CF8]",
      initials: "QC",
      maker: { name: "Sarah Jenkins", avatarInitials: "SJ", avatarColor: "bg-[#5B5BF0]", role: "Co-Founder" },
    },
    {
      id: "lb-w-2",
      name: "HyperDraft",
      tagline: "AI video storyboard generator turning product release notes into 30s marketing teasers.",
      category: "Design & UX",
      upvotes: 1180,
      isUpvoted: false,
      rank: 2,
      commentsCount: 142,
      url: "https://hyperdraft.video",
      avatarGradient: "from-[#059669] to-[#34D399]",
      initials: "HD",
      maker: { name: "Nico Ramirez", avatarInitials: "NR", avatarColor: "bg-[#059669]", role: "Creator" },
    },
    {
      id: "lb-w-3",
      name: "ShipFast Native",
      tagline: "React Native boilerplate with pre-configured Stripe in-app subscriptions and biometric auth.",
      category: "Developer Tools",
      upvotes: 984,
      isUpvoted: false,
      rank: 3,
      commentsCount: 96,
      url: "https://shipfastnative.com",
      avatarGradient: "from-[#D97706] to-[#FBBF24]",
      initials: "SF",
      maker: { name: "Marc Lou", avatarInitials: "ML", avatarColor: "bg-[#D97706]", role: "Maker" },
    },
    {
      id: "lb-w-4",
      name: "AetherDB",
      tagline: "Serverless Postgres with instant branching and microsecond cold starts",
      category: "Developer Tools",
      upvotes: 812,
      rank: 4,
      commentsCount: 64,
      url: "https://aetherdb.io",
      avatarGradient: "from-[#0F0F10] to-[#374151]",
      initials: "AD",
      maker: { name: "Alex Thorne", avatarInitials: "AT", avatarColor: "bg-[#0F0F10]", role: "Lead" },
    },
    {
      id: "lb-w-5",
      name: "AgentFlow",
      tagline: "Visual orchestration canvas for autonomous multi-agent systems and MCP servers",
      category: "AI & Agents",
      upvotes: 746,
      rank: 5,
      commentsCount: 52,
      url: "https://agentflow.ai",
      avatarGradient: "from-[#4338CA] to-[#6366F1]",
      initials: "AF",
      maker: { name: "Rachel Adams", avatarInitials: "RA", avatarColor: "bg-[#4338CA]", role: "Founder" },
    },
    {
      id: "lb-w-6",
      name: "DocuSense",
      tagline: "Self-hosting knowledge base that automatically synchronizes with Slack channels",
      category: "Productivity",
      upvotes: 692,
      rank: 6,
      commentsCount: 41,
      url: "https://docusense.io",
      avatarGradient: "from-[#2563EB] to-[#60A5FA]",
      initials: "DS",
      maker: { name: "Tariq Malik", avatarInitials: "TM", avatarColor: "bg-[#2563EB]", role: "Maker" },
    },
  ],
  month: [
    {
      id: "lb-m-1",
      name: "Superagent 3.0",
      tagline: "Open-source framework for building, testing, and deploying production LLM agents in Docker containers.",
      category: "AI & Agents",
      upvotes: 4320,
      isUpvoted: true,
      rank: 1,
      commentsCount: 412,
      url: "https://superagent.sh",
      avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
      initials: "SA",
      maker: { name: "Austin Miller", avatarInitials: "AM", avatarColor: "bg-[#5B5BF0]", role: "Author" },
    },
    {
      id: "lb-m-2",
      name: "Linear Sync Pro",
      tagline: "Bi-directional GitHub Issue and Linear synchronizer with conflict resolution and automated branching.",
      category: "Developer Tools",
      upvotes: 3810,
      isUpvoted: false,
      rank: 2,
      commentsCount: 318,
      url: "https://linearsync.pro",
      avatarGradient: "from-[#059669] to-[#34D399]",
      initials: "LS",
      maker: { name: "Karim Benali", avatarInitials: "KB", avatarColor: "bg-[#059669]", role: "Founder" },
    },
    {
      id: "lb-m-3",
      name: "Tailwind UI Kit v4",
      tagline: "240+ responsive Tailwind CSS v4 component blocks crafted specifically for B2B dashboards and SaaS pages.",
      category: "Design & UX",
      upvotes: 3240,
      isUpvoted: false,
      rank: 3,
      commentsCount: 284,
      url: "https://tailwindv4kit.com",
      avatarGradient: "from-[#D97706] to-[#FBBF24]",
      initials: "TK",
      maker: { name: "Devon Vance", avatarInitials: "DV", avatarColor: "bg-[#D97706]", role: "Maker" },
    },
    {
      id: "lb-m-4",
      name: "Calibrate AI",
      tagline: "Deterministic benchmark datasets to evaluate LLM accuracy against industry ground truth",
      category: "AI & Agents",
      upvotes: 2790,
      rank: 4,
      commentsCount: 198,
      url: "https://calibrate.ai",
      avatarGradient: "from-[#7C3AED] to-[#A78BFA]",
      initials: "CA",
      maker: { name: "Sophie Wei", avatarInitials: "SW", avatarColor: "bg-[#7C3AED]", role: "Founder" },
    },
    {
      id: "lb-m-5",
      name: "StripeMeter",
      tagline: "Usage-based billing middleware with real-time meter event streaming and overage warnings",
      category: "Developer Tools",
      upvotes: 2410,
      rank: 5,
      commentsCount: 154,
      url: "https://stripemeter.io",
      avatarGradient: "from-[#0F0F10] to-[#374151]",
      initials: "SM",
      maker: { name: "Dan Abrams", avatarInitials: "DA", avatarColor: "bg-[#0F0F10]", role: "Maker" },
    },
  ],
};
