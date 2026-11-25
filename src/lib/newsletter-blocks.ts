export type PastelTone = "pink" | "mint" | "lavender";

export type TextAlign = "left" | "center" | "right";
export type FontChoice = "sans" | "serif" | "mono";
export type WidthChoice = "600px" | "680px" | "760px";
export type HeaderStyleChoice = "minimal" | "magazine" | "centered";

export interface NewsletterDesign {
  pageBg: string;
  surfaceBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  fontFamily: FontChoice;
  contentWidth: WidthChoice;
  headerStyle: HeaderStyleChoice;
  showByline: boolean;
  showThumbnail: boolean;
  showSubscribeBox: boolean;
  showKeepReading: boolean;
  issueLabel: string;
  tags: string[];
}

export interface RelatedIssueItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  subtitle: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  read_time: string;
}

export const DEFAULT_DESIGN: NewsletterDesign = {
  pageBg: "#FFFFFF",
  surfaceBg: "#FFFFFF",
  textColor: "#111827",
  mutedColor: "#6B7280",
  accentColor: "#F04E18",
  fontFamily: "sans",
  contentWidth: "680px",
  headerStyle: "minimal",
  showByline: true,
  showThumbnail: true,
  showSubscribeBox: true,
  showKeepReading: true,
  issueLabel: "",
  tags: [],
};

export type QuickHitItem = {
  title: string;
  description: string;
  url: string;
};

export type ColumnItem = {
  imageUrl: string;
  heading: string;
  text: string;
  linkLabel: string;
  linkUrl: string;
};

export type TemplateBlock =
  | {
      id: string;
      type: "design_settings";
      design: NewsletterDesign;
    }
  | {
      id: string;
      type: "heading";
      level: "h1" | "h2" | "h3";
      kicker: string;
      text: string;
      align: TextAlign;
      color: string;
    }
  | {
      id: string;
      type: "image";
      url: string;
      caption: string;
      alt: string;
      linkUrl: string;
      width: "full" | "medium" | "compact";
      rounded: boolean;
    }
  | {
      id: string;
      type: "button";
      label: string;
      url: string;
      align: TextAlign;
      bgColor: string;
      textColor: string;
      radius: "pill" | "rounded" | "square";
      size: "sm" | "md" | "lg";
    }
  | {
      id: string;
      type: "callout";
      emoji: string;
      title: string;
      body: string;
      bgColor: string;
      borderColor: string;
      variant: "left-bar" | "boxed" | "subtle";
    }
  | {
      id: string;
      type: "quote";
      quote: string;
      author: string;
      role: string;
      accentColor: string;
    }
  | {
      id: string;
      type: "divider";
      style: "solid" | "dashed" | "dotted" | "thick";
      color: string;
      spacing: "sm" | "md" | "lg";
    }
  | {
      id: string;
      type: "spacer";
      height: number;
    }
  | {
      id: string;
      type: "columns";
      left: ColumnItem;
      right: ColumnItem;
    }
  | {
      id: string;
      type: "embed_card";
      url: string;
      domain: string;
      title: string;
      description: string;
      imageUrl: string;
    }
  | {
      id: string;
      type: "code";
      language: string;
      code: string;
    }
  | {
      id: string;
      type: "intro";
      greeting: string;
      lead: string;
      tocHeading: string;
      tocItems: string[];
    }
  | {
      id: string;
      type: "story";
      kicker: string;
      headline: string;
      imageUrl: string;
      imageCaption: string;
      rundown: string;
      details: string[];
      whyItMatters: string;
      ctaLabel: string;
      ctaUrl: string;
    }
  | {
      id: string;
      type: "quick_hits";
      kicker: string;
      heading: string;
      items: QuickHitItem[];
    }
  | {
      id: string;
      type: "hero";
      eyebrow: string;
      title: string;
      subtitle: string;
      imageUrl: string;
      ctaLabel: string;
      ctaUrl: string;
    }
  | {
      id: string;
      type: "pastel_card";
      tone: PastelTone;
      label: string;
      highlightStat: string;
      description: string;
      bullets: string[];
      ctaLabel: string;
      ctaUrl: string;
    }
  | {
      id: string;
      type: "richtext";
      heading: string;
      html: string;
    }
  | {
      id: string;
      type: "spotlight";
      badge: string;
      title: string;
      dateLabel: string;
      imageUrl: string;
      description: string;
      ctaLabel: string;
      ctaUrl: string;
    }
  | {
      id: string;
      type: "poll";
      question: string;
      sublabel: string;
    };

export type ContentBlockType = Exclude<TemplateBlock["type"], "design_settings">;

/** Extract saved NewsletterDesign from template_blocks (zero DB migration required). */
export function extractDesign(blocks: TemplateBlock[] | null | undefined): NewsletterDesign {
  if (!Array.isArray(blocks)) return DEFAULT_DESIGN;
  const found = blocks.find((b) => b.type === "design_settings");
  if (found && found.type === "design_settings") {
    return { ...DEFAULT_DESIGN, ...found.design };
  }
  return DEFAULT_DESIGN;
}

/** Return only visible content blocks (excluding design_settings metadata). */
export function getContentBlocks(blocks: TemplateBlock[] | null | undefined): TemplateBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b) => b.type !== "design_settings");
}

/** Merge design settings + content blocks for saving into template_blocks JSONB. */
export function packBlocksWithDesign(
  blocks: TemplateBlock[],
  design: NewsletterDesign
): TemplateBlock[] {
  const clean = blocks.filter((b) => b.type !== "design_settings");
  return [{ id: "__design__", type: "design_settings", design }, ...clean];
}

export function getFontStack(font: FontChoice): string {
  if (font === "serif") return 'Georgia, Cambria, "Times New Roman", Times, serif';
  if (font === "mono")
    return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
}

export function createBlock(
  type: ContentBlockType,
  opts?: { title?: string; thumbnailUrl?: string; accentColor?: string; tone?: PastelTone }
): TemplateBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const accent = opts?.accentColor || "#F04E18";

  switch (type) {
    case "heading":
      return {
        id,
        type: "heading",
        level: "h2",
        kicker: "",
        text: "Section Heading",
        align: "left",
        color: "",
      };
    case "richtext":
      return {
        id,
        type: "richtext",
        heading: "",
        html: "<p>Start writing your paragraph here. Use <strong>bold</strong>, <em>italic</em>, bullet lists, links, or blockquotes...</p>",
      };
    case "image":
      return {
        id,
        type: "image",
        url: "",
        caption: "",
        alt: "Newsletter image",
        linkUrl: "",
        width: "full",
        rounded: true,
      };
    case "button":
      return {
        id,
        type: "button",
        label: "Read More →",
        url: "https://ankurfulzele.in/newsletter",
        align: "center",
        bgColor: accent,
        textColor: "#FFFFFF",
        radius: "rounded",
        size: "md",
      };
    case "callout":
      return {
        id,
        type: "callout",
        emoji: "💡",
        title: "Key Takeaway",
        body: "Highlight an important note, tip, warning, or takeaway that stands out while scanning.",
        bgColor: "#FFF8F5",
        borderColor: accent,
        variant: "left-bar",
      };
    case "quote":
      return {
        id,
        type: "quote",
        quote: "Ship small, ship often, and let real users tell you what to build next.",
        author: "Ankur Fulzele",
        role: "Founder, SaaS Vibes",
        accentColor: accent,
      };
    case "divider":
      return {
        id,
        type: "divider",
        style: "solid",
        color: "#E5E7EB",
        spacing: "md",
      };
    case "spacer":
      return {
        id,
        type: "spacer",
        height: 28,
      };
    case "columns":
      return {
        id,
        type: "columns",
        left: {
          imageUrl: "",
          heading: "Column 1 Title",
          text: "Compare two tools, features, or side-by-side takeaways cleanly.",
          linkLabel: "Explore →",
          linkUrl: "/newsletter",
        },
        right: {
          imageUrl: "",
          heading: "Column 2 Title",
          text: "Stacks automatically on mobile screens and works in Gmail & Apple Mail.",
          linkLabel: "Explore →",
          linkUrl: "/newsletter",
        },
      };
    case "embed_card":
      return {
        id,
        type: "embed_card",
        url: "https://ankurfulzele.in",
        domain: "ankurfulzele.in",
        title: "Featured Resource or Tweet Link",
        description: "A crisp bookmark card for sharing articles, GitHub repos, or product launches.",
        imageUrl: "",
      };
    case "code":
      return {
        id,
        type: "code",
        language: "typescript",
        code: `// Ship fast with clean code\nexport async function ship() {\n  return { revenue: "$10k MRR", vibes: "immaculate" };\n}`,
      };
    case "intro":
      return {
        id,
        type: "intro",
        greeting: "Good morning, builders.",
        lead: "Welcome back to SaaS Vibes — here is what you need to know in 4 minutes.",
        tocHeading: "In today's SaaS Vibes:",
        tocItems: [
          "Main story headline or takeaway",
          "Tool or tactic you can apply today",
          "Quick hits worth bookmarking",
        ],
      };
    case "story":
      return {
        id,
        type: "story",
        kicker: "DEEP DIVE",
        headline: "Your Bold Editorial Story Headline",
        imageUrl: "",
        imageCaption: "Image source: SaaS Vibes",
        rundown: "One punchy 2-sentence summary of what happened and why readers should care.",
        details: [
          "Key fact or stat #1 that supports the story.",
          "Key detail #2 with a specific example or number.",
          "Key detail #3 on what builders are doing next.",
        ],
        whyItMatters:
          "Your sharp founder takeaway — connect the dots and tell readers what this means for their SaaS or workflow.",
        ctaLabel: "Read more →",
        ctaUrl: "/newsletter",
      };
    case "quick_hits":
      return {
        id,
        type: "quick_hits",
        kicker: "QUICK HITS",
        heading: "What else is shipping this week",
        items: [
          {
            title: "Tool or News Headline",
            description: "One-sentence summary of why it's interesting.",
            url: "https://",
          },
        ],
      };
    case "spotlight":
      return {
        id,
        type: "spotlight",
        badge: "TOGETHER WITH",
        title: "Featured Partner or Tool This Week",
        dateLabel: "Sponsored / Featured",
        imageUrl: "",
        description: "Highlight a sponsor, product launch, or resource in a clean bordered callout.",
        ctaLabel: "Check It Out →",
        ctaUrl: "/",
      };
    case "poll":
      return {
        id,
        type: "poll",
        question: "How did you like today's issue?",
        sublabel: "Tap a star to vote — works inside Gmail & Web!",
      };
    case "hero":
      return {
        id,
        type: "hero",
        eyebrow: "WEEKLY ISSUE · SAAS VIBES",
        title: opts?.title || "Your Bold Newsletter Headline",
        subtitle: "A punchy 2-line intro that hooks readers immediately.",
        imageUrl: opts?.thumbnailUrl || "",
        ctaLabel: "Read More →",
        ctaUrl: "/newsletter",
      };
    case "pastel_card":
      return {
        id,
        type: "pastel_card",
        tone: opts?.tone || "pink",
        label: "Key Takeaway",
        highlightStat: "Highlight",
        description: "Share a concise insight, metric, or tool breakdown.",
        bullets: ["Actionable point #1", "Actionable point #2"],
        ctaLabel: "Learn more →",
        ctaUrl: "/newsletter",
      };
  }
}

/**
 * Default Beehiiv / Morning Brew / The Rundown AI editorial issue template.
 */
export function createDefaultTemplateBlocks(title = "Weekly Dispatch"): TemplateBlock[] {
  return [
    {
      id: "blk-intro",
      type: "intro",
      greeting: "Good morning, builders.",
      lead:
        "Welcome back to SaaS Vibes — the 4-minute breakdown of what's actually working in indie SaaS, vibe coding, and AI shipping right now.",
      tocHeading: "In today's SaaS Vibes:",
      tocItems: [
        title || "How solo builders are shipping profitable micro-SaaS in a weekend",
        "The $0 newsletter stack replacing $99/mo SaaS tools",
        "3 quick hits & trending tools worth bookmarking this week",
      ],
    },
    {
      id: "blk-story-1",
      type: "story",
      kicker: "DEEP DIVE",
      headline: title || "Why Solo Founders Are Ditching Bloated Stacks for Vibe Coding",
      imageUrl: "",
      imageCaption: "Image source: SaaS Vibes",
      rundown:
        "A new wave of solo founders is shipping revenue-generating SaaS products in 48 hours by pairing AI coding agents with dead-simple infrastructure like Next.js and Supabase.",
      details: [
        "Distribution beats feature bloat: founders who ship a focused v1 on Friday and post a demo on X are hitting their first 100 users before writing a single settings page.",
        "Hosting and database costs stay at $0/month until real traction arrives, removing the classic excuse for waiting.",
        "Owning your email list directly in Supabase + Resend/MailCheap means zero platform lock-in as you scale.",
      ],
      whyItMatters:
        "The moat in 2026 isn't writing boilerplate code — it's taste, speed of iteration, and talking to users daily.",
      ctaLabel: "Read the full stack breakdown →",
      ctaUrl: "/newsletter",
    },
    {
      id: "blk-spotlight",
      type: "spotlight",
      badge: "TOGETHER WITH SAAS VIBES",
      title: "Build & Ship Your Own Newsletter Engine for $0/mo",
      dateLabel: "Featured Tool",
      imageUrl: "",
      description:
        "Stop paying $99/month before you even hit 2,500 subscribers. Use our open-source Next.js + Supabase + React Email playbook to own your audience from day one.",
      ctaLabel: "Explore the Playbook →",
      ctaUrl: "/newsletter",
    },
    {
      id: "blk-quick-hits",
      type: "quick_hits",
      kicker: "QUICK HITS",
      heading: "What else is shipping this week",
      items: [
        {
          title: "Supabase 1 GB Free Storage",
          description:
            "Host every newsletter cover thumbnail and inline image directly alongside your subscriber database.",
          url: "https://supabase.com",
        },
        {
          title: "React Email + Resend",
          description:
            "Compile clean editorial blocks into Gmail & Apple Mail safe HTML automatically on publish.",
          url: "https://react.email",
        },
      ],
    },
    {
      id: "blk-poll",
      type: "poll",
      question: "How did you like today's issue?",
      sublabel: "Tap a star to vote — takes 1 second and helps me make the next one better.",
    },
  ];
}

export function createEssayTemplateBlocks(title = "Founder Essay"): TemplateBlock[] {
  return [
    {
      id: `blk-h-${Date.now()}`,
      type: "heading",
      level: "h2",
      kicker: "FOUNDER NOTE",
      text: title || "The Real Reason Most Side Projects Never Launch",
      align: "left",
      color: "",
    },
    {
      id: `blk-rt-${Date.now() + 1}`,
      type: "richtext",
      heading: "",
      html: "<p>Write your personal story or deep-dive essay here. Keep paragraphs short and punchy so readers glide through every sentence.</p><p>Add links, bold highlights, and concrete numbers from your own builds.</p>",
    },
    {
      id: `blk-q-${Date.now() + 2}`,
      type: "quote",
      quote: "The best marketing strategy for an indie hacker is shipping something people can try in 10 seconds.",
      author: "Ankur Fulzele",
      role: "SaaS Vibes",
      accentColor: "#F04E18",
    },
    {
      id: `blk-c-${Date.now() + 3}`,
      type: "callout",
      emoji: "🚀",
      title: "Action Step for This Week",
      body: "Pick one tiny feature, ship it in 3 hours, record a 30-second Loom, and post it on X.",
      bgColor: "#FFF8F5",
      borderColor: "#F04E18",
      variant: "left-bar",
    },
    {
      id: `blk-b-${Date.now() + 4}`,
      type: "button",
      label: "Reply & Tell Me What You're Shipping →",
      url: "https://x.com/AnkurBuilds",
      align: "center",
      bgColor: "#111827",
      textColor: "#FFFFFF",
      radius: "pill",
      size: "md",
    },
    {
      id: `blk-p-${Date.now() + 5}`,
      type: "poll",
      question: "How did you like today's essay?",
      sublabel: "Tap a star to vote!",
    },
  ];
}

export function createProductDigestBlocks(): TemplateBlock[] {
  return [
    {
      id: `blk-h-${Date.now()}`,
      type: "heading",
      level: "h2",
      kicker: "WEEKLY TOOLBOX",
      text: "Top Tools & Code Worth Shipping With This Week",
      align: "left",
      color: "",
    },
    {
      id: `blk-col-${Date.now() + 1}`,
      type: "columns",
      left: {
        imageUrl: "",
        heading: "Tool #1: Fast Prototyping",
        text: "Turn rough ideas into clickable web apps in a single afternoon.",
        linkLabel: "Try it →",
        linkUrl: "/newsletter",
      },
      right: {
        imageUrl: "",
        heading: "Tool #2: Zero-Cost Backend",
        text: "Auth, Postgres, and Storage ready in 2 minutes flat.",
        linkLabel: "Try it →",
        linkUrl: "https://supabase.com",
      },
    },
    {
      id: `blk-code-${Date.now() + 2}`,
      type: "code",
      language: "bash",
      code: "npx create-next-app@latest my-saas --ts --tailwind",
    },
    {
      id: `blk-qh-${Date.now() + 3}`,
      type: "quick_hits",
      kicker: "LINKS",
      heading: "More worth bookmarking",
      items: [
        {
          title: "SaaS Vibes Archive",
          description: "Browse every past issue and teardown.",
          url: "/newsletter",
        },
      ],
    },
  ];
}

export function createMarcLouTemplateBlocks(
  title = "How I Shipped a SaaS in 48 Hours"
): TemplateBlock[] {
  const ts = Date.now();
  return [
    {
      id: `blk-ml-open-${ts}`,
      type: "richtext",
      heading: "",
      html: "<p><em>India. 09:15 am. Coffee in my hand, cursor open.</em></p><p>Hey there 👋</p><p>This week I spent 48 hours building a tiny SaaS from scratch instead of overthinking the landing page.</p><p>Here is the exact playbook (steal it):</p>",
    },
    {
      id: `blk-ml-h1-${ts}`,
      type: "heading",
      level: "h2",
      kicker: "THE LESSON",
      text: title || "Stop Over-Engineering — Ship the Ugly v1",
      align: "left",
      color: "",
    },
    {
      id: `blk-ml-img-${ts}`,
      type: "image",
      url: "",
      caption: "Screenshot or before/after visual of what you built",
      alt: "Build screenshot",
      linkUrl: "",
      width: "full",
      rounded: true,
    },
    {
      id: `blk-ml-body-${ts}`,
      type: "richtext",
      heading: "",
      html: "<p>Most founders spend 3 weeks picking auth providers and color palettes. Nobody cares until they can click a live link.</p><ul><li><strong>Step 1:</strong> Pick 1 painful problem you hit this week.</li><li><strong>Step 2:</strong> Build the smallest possible workflow in 1 weekend.</li><li><strong>Step 3:</strong> Record a 30-second demo and post it on X.</li></ul>",
    },
    {
      id: `blk-ml-callout-${ts}`,
      type: "callout",
      emoji: "🚀",
      title: "Build-in-Public Update",
      body: "This week's numbers: +140 new SaaS Vibes readers, 2 new features shipped, and $0 spent on ads.",
      bgColor: "#FFF8F5",
      borderColor: "#F04E18",
      variant: "left-bar",
    },
    {
      id: `blk-ml-signoff-${ts}`,
      type: "richtext",
      heading: "",
      html: "<p>Back to shipping. Have a productive week!</p><p>— <strong>Ankur</strong></p>",
    },
    {
      id: `blk-ml-footer-${ts}`,
      type: "quick_hits",
      kicker: "WHENEVER YOU'RE READY",
      heading: "Here are 3 ways I can help you ship faster:",
      items: [
        {
          title: "SaaS Vibes Archive",
          description: "Read every past breakdown on vibe coding & profitable micro-SaaS.",
          url: "/newsletter",
        },
        {
          title: "Follow @AnkurBuilds on X",
          description: "Daily build-in-public experiments, prompts, and revenue screenshots.",
          url: "https://x.com/AnkurBuilds",
        },
        {
          title: "Reply to this email",
          description: "Tell me what you're building this week — I read every single reply.",
          url: "mailto:hello@ankurfulzele.in",
        },
      ],
    },
    {
      id: `blk-ml-poll-${ts}`,
      type: "poll",
      question: "How did you like today's issue?",
      sublabel: "Tap a star to vote — takes 1 second!",
    },
  ];
}

export function createRundownAITemplateBlocks(
  title = "The AI Workflow Changing How Solo Founders Ship"
): TemplateBlock[] {
  const ts = Date.now();
  return [
    {
      id: `blk-rd-intro-${ts}`,
      type: "intro",
      greeting: "Good morning, builders.",
      lead:
        "Here's everything happening in AI, vibe coding, and indie SaaS today — distilled into a 4-minute scan.",
      tocHeading: "In today's SaaS Vibes:",
      tocItems: [
        title || "The #1 shift in AI-assisted SaaS shipping this week",
        "New developer tool cutting MVP build time by 70%",
        "Together With: Build your own $0/mo newsletter engine",
        "4 quick hits worth bookmarking before Monday",
      ],
    },
    {
      id: `blk-rd-s1-${ts}`,
      type: "story",
      kicker: "LATEST DEVELOPMENTS",
      headline: title || "Solo Founders Are Shipping Full SaaS Products in a Single Weekend",
      imageUrl: "",
      imageCaption: "Image source: SaaS Vibes",
      rundown:
        "A new generation of indie builders is bypassing months of boilerplate by pairing AI coding agents with Next.js and Supabase, launching profitable products in under 48 hours.",
      details: [
        "Teams of 1 are now shipping UI, auth, billing, and email pipelines in the time it used to take to write a spec.",
        "Early distribution on X beats polished settings pages — founders posting raw Loom demos are converting their first 50 users overnight.",
        "Infrastructure stays free on Supabase + Resend tiers until real MRR arrives.",
      ],
      whyItMatters:
        "Speed of iteration is the new unfair advantage. When shipping costs hours instead of months, you can test 10 ideas and double down on the winner.",
      ctaLabel: "Read the full teardown →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-rd-sp-${ts}`,
      type: "spotlight",
      badge: "TOGETHER WITH SAAS VIBES",
      title: "Own Your Audience Without Paying $99/mo",
      dateLabel: "Featured Stack",
      imageUrl: "",
      description:
        "See how we built a complete Beehiiv-style drag-and-drop newsletter studio on Next.js, Supabase, and Resend.",
      ctaLabel: "Check It Out →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-rd-s2-${ts}`,
      type: "story",
      kicker: "TOOLS & GROWTH",
      headline: "Why Plain-Text + Clean Editorial Emails Beat Heavy Templates",
      imageUrl: "",
      imageCaption: "Image source: Resend Deliverability",
      rundown:
        "Inbox providers are aggressively filtering bloated marketing HTML. Clean editorial newsletters with real reply addresses land straight in Primary.",
      details: [
        "Matching link domains to your verified sending subdomain boosts inbox placement.",
        "Disabling invasive open/click pixel redirects keeps spam filters happy.",
        "Adding a 1-click reader poll drives engagement signals that improve sender reputation.",
      ],
      whyItMatters:
        "The best newsletter copy in the world is worthless if it lands in Spam. Keep your layout clean, fast, and human.",
      ctaLabel: "",
      ctaUrl: "",
    },
    {
      id: `blk-rd-qh-${ts}`,
      type: "quick_hits",
      kicker: "QUICK HITS",
      heading: "Everything else you should know",
      items: [
        {
          title: "Next.js 16 + Turbopack",
          description: "Near-instant local rebuilds while shipping your SaaS MVP.",
          url: "https://nextjs.org",
        },
        {
          title: "Supabase Free Tier",
          description: "Postgres + Auth + 1 GB media storage for $0/month.",
          url: "https://supabase.com",
        },
        {
          title: "Resend Email API",
          description: "Developer-first React Email delivery with 3,000 free emails/month.",
          url: "https://resend.com",
        },
      ],
    },
    {
      id: `blk-rd-poll-${ts}`,
      type: "poll",
      question: "How did you like today's Rundown?",
      sublabel: "Tap a star to vote — takes 1 second!",
    },
  ];
}

export function createWeekdayBriefTemplateBlocks(
  title = "How a Solo Builder Vibe-Coded & Marketed a SaaS to $1M+"
): TemplateBlock[] {
  const ts = Date.now();
  return [
    {
      id: `blk-wd-intro-${ts}`,
      type: "intro",
      greeting: "Good morning, builders.",
      lead:
        "Welcome to the SaaS Vibes Weekday Brief — one deep-dive story on how a real founder vibe-coded a product, marketed it without ads, and scaled it to millions.",
      tocHeading: "In today's Weekday Brief:",
      tocItems: [
        title || "The backstory: how the product started in a weekend",
        "The exact marketing & distribution engine behind the growth",
        "3 tactical lessons you can steal for your own SaaS today",
      ],
    },
    {
      id: `blk-wd-story1-${ts}`,
      type: "story",
      kicker: "VIBE-CODED SAAS STORY",
      headline: title || "How a Solo Founder Turned a 48-Hour Prototype Into $1M+ ARR",
      imageUrl: "",
      imageCaption: "Image source: SaaS Vibes",
      rundown:
        "Instead of raising VC money or spending 6 months on a stealth build, the founder shipped a single-purpose MVP in one weekend and let public demos do the selling.",
      details: [
        "The Spark: Built to solve an annoying daily workflow bottleneck using AI coding tools and off-the-shelf APIs.",
        "The Launch: Posted a 45-second raw screen recording on X showing the exact 'aha' moment — zero corporate polish.",
        "The Monetization: Priced simply with a clear one-time or recurring tier from day one to validate real buyer intent.",
      ],
      whyItMatters:
        "You don't need a 10-person engineering team to build a million-dollar SaaS anymore. Focused scope + relentless shipping beats bloated roadmaps.",
      ctaLabel: "Read the full founder breakdown →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-wd-story2-${ts}`,
      type: "story",
      kicker: "HOW IT WAS MARKETED",
      headline: "The Distribution Playbook That Took It From $0 to Millions",
      imageUrl: "",
      imageCaption: "Image source: Growth Breakdown",
      rundown:
        "Great products die in silence. Here is the exact repeatable marketing loop that turned early curiosity into compounding organic revenue.",
      details: [
        "Build-in-public storytelling: Shared real revenue milestones, failures, and behind-the-scenes UI tweaks every week.",
        "Free micro-tools as SEO/viral magnets: Launched tiny free calculators and utilities that funneled traffic straight into the main SaaS.",
        "Creator & affiliate flywheel: Turned early power users into paid evangelists with a clean 30% recurring commission.",
      ],
      whyItMatters:
        "Code is only 30% of the game. Spend just as much energy engineering your distribution hooks as you do your product.",
      ctaLabel: "",
      ctaUrl: "",
    },
    {
      id: `blk-wd-qh-${ts}`,
      type: "quick_hits",
      kicker: "STEAL THIS STACK",
      heading: "Key takeaways for your next build",
      items: [
        {
          title: "Launch before you feel ready",
          description: "Get a live URL in front of 20 real users within 72 hours of starting.",
          url: "/newsletter",
        },
        {
          title: "Lead with a 30-second video demo",
          description: "Show the transformation in the first 3 seconds — skip the feature tour.",
          url: "https://x.com/AnkurBuilds",
        },
      ],
    },
    {
      id: `blk-wd-poll-${ts}`,
      type: "poll",
      question: "How did you like today's Weekday Brief?",
      sublabel: "Tap a star to vote — takes 1 second!",
    },
  ];
}

export function createWeekendBriefTemplateBlocks(
  title = "Weekend Brief: Trending SaaS, Top Tools, Repos & Distribution"
): TemplateBlock[] {
  const ts = Date.now();
  return [
    {
      id: `blk-we-intro-${ts}`,
      type: "intro",
      greeting: "Good morning, builders. Happy weekend.",
      lead:
        "Grab your coffee — here's your 5-card SaaS Vibes Weekend Brief covering what's trending in SaaS, our SaaS of the Week, the best new vibe-coding tools, repos, and a distribution play you can run Monday.",
      tocHeading: "In today's Weekend Brief:",
      tocItems: [
        title || "Trending in SaaS: The biggest hook & shift this week",
        "SaaS of the Week: Product spotlight & why it's winning",
        "Vibe Toolkit: Top AI & open-source tools worth trying",
        "Skills & Repos: Must-bookmark GitHub repos & agent skills",
        "Distribution Play: One actionable growth & marketing tactic",
      ],
    },
    {
      id: `blk-we-card1-${ts}`,
      type: "story",
      kicker: "01 · TRENDING IN SAAS",
      headline: title || "The Biggest Shift Happening in the SaaS World Right Now",
      imageUrl: "",
      imageCaption: "Image source: SaaS Vibes",
      rundown:
        "Start with the sharpest hook in the SaaS & AI industry this week — what just happened, who's talking about it, and why every builder is paying attention.",
      details: [
        "Key headline stat or launch milestone grabbing everyone's feed this week.",
        "How indie founders and SaaS teams are reacting or pivoting around it.",
        "What changed compared to 6 months ago.",
      ],
      whyItMatters:
        "Spot the wave early so you can build, position, or ship around it before the crowd catches up.",
      ctaLabel: "Read the source →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-we-card2-${ts}`,
      type: "story",
      kicker: "02 · SAAS OF THE WEEK",
      headline: "SaaS of the Week: [Product Name] — Simple UI, Serious Traction",
      imageUrl: "",
      imageCaption: "Image source: Product Spotlight",
      rundown:
        "A breakdown of one standout SaaS product crushing it right now — what problem it solves, how it's priced, and what makes its onboarding click.",
      details: [
        "Core Hook: Solves one razor-sharp pain point in under 60 seconds.",
        "Pricing & Business Model: Clear, friction-free pricing that converts cold traffic.",
        "Standout UX Detail: The one clever design or workflow touch worth copying.",
      ],
      whyItMatters:
        "Studying winning micro-SaaS products trains your product taste faster than any textbook.",
      ctaLabel: "Check out the SaaS →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-we-card3-${ts}`,
      type: "story",
      kicker: "03 · VIBE TOOLKIT",
      headline: "Vibe Toolkit: 3 Tools & Skills Supercharging Your Shipping Speed",
      imageUrl: "",
      imageCaption: "Image source: Vibe Toolkit",
      rundown:
        "Curated AI tools, open-source utilities, and agent workflows you can plug into your stack this weekend to build faster with less boilerplate.",
      details: [
        "Tool #1 — [Name]: What it does and when to reach for it.",
        "Tool #2 — [Name]: Saves hours on UI, auth, or email automation.",
        "Tool #3 — [Name]: Free or open-source alternative to expensive SaaS.",
      ],
      whyItMatters:
        "The right toolkit lets a solo builder ship with the output of a 5-person product team.",
      ctaLabel: "Explore the toolkit →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-we-card4-${ts}`,
      type: "story",
      kicker: "04 · SKILLS & REPOS",
      headline: "Skills & Repos: Open-Source Gems Worth Starring This Weekend",
      imageUrl: "",
      imageCaption: "Image source: GitHub",
      rundown:
        "Hand-picked GitHub repositories, starter kits, and AI agent skills that give you production-ready building blocks out of the box.",
      details: [
        "Repo #1 — [owner/repo]: Clean boilerplate or UI component library to fork immediately.",
        "Repo #2 — [owner/repo]: Open-source backend, scraper, or automation engine.",
        "Agent Skill — [Skill Name]: Reusable prompt/skill that upgrades your coding agent.",
      ],
      whyItMatters:
        "Never rebuild solved infrastructure from scratch — fork great open-source code and focus on your unique product.",
      ctaLabel: "View repos & skills →",
      ctaUrl: "https://github.com",
    },
    {
      id: `blk-we-card5-${ts}`,
      type: "story",
      kicker: "05 · DISTRIBUTION PLAY",
      headline: "Distribution Play: How to Get Your First 100 Users Without Ads",
      imageUrl: "",
      imageCaption: "Image source: SaaS Vibes Growth",
      rundown:
        "One concrete, repeatable marketing and distribution tactic you can execute in 60 minutes on Monday to drive real signups to your product.",
      details: [
        "The Tactic: Exact channel, post format, or cold outreach angle to use.",
        "The Script / Hook: How to frame the problem so your target user clicks immediately.",
        "Expected Result: How to measure conversions and double down on what works.",
      ],
      whyItMatters:
        "Distribution compounds. Running one deliberate growth play every Monday beats waiting for organic traffic to magically appear.",
      ctaLabel: "Try this play on Monday →",
      ctaUrl: "/newsletter",
    },
    {
      id: `blk-we-poll-${ts}`,
      type: "poll",
      question: "How did you like today's Weekend Brief?",
      sublabel: "Tap a star to vote — takes 1 second!",
    },
  ];
}

export const PASTEL_STYLES: Record<
  PastelTone,
  { bg: string; border: string; accent: string; badgeBg: string }
> = {
  pink: {
    bg: "#FCE7F3",
    border: "#F9A8D4",
    accent: "#9D174D",
    badgeBg: "#FBCFE8",
  },
  mint: {
    bg: "#DCFCE7",
    border: "#86EFAC",
    accent: "#166534",
    badgeBg: "#BBF7D0",
  },
  lavender: {
    bg: "#F3E8FF",
    border: "#D8B4FE",
    accent: "#6B21A8",
    badgeBg: "#E9D5FF",
  },
};
