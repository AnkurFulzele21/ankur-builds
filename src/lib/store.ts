import fs from "node:fs/promises";
import path from "node:path";

export interface NewsletterPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Vibe Coding" | "SaaS Building" | "AI & Agents" | "Growth" | "Build Log";
  readTime: string;
  publishedAt: string;
  featured: boolean;
}

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  status: "Live" | "Building" | "Open Source";
  metricLabel: string;
  url: string;
  sparkline: number[];
}

export const PORTFOLIO_PROJECTS: ProjectItem[] = [
  {
    id: "courseforge",
    name: "CourseForge LMS",
    tagline: "Multi-tenant LMS SaaS with Next.js, Supabase RLS, Cloudflare R2 & Razorpay.",
    status: "Building",
    metricLabel: "36 Routes · Full Stack",
    url: "http://localhost:3000",
    sparkline: [12, 18, 16, 24, 30, 38, 45],
  },
  {
    id: "viral-x-machine",
    name: "Viral X Machine",
    tagline: "Zero-API-cost dual-stream X scraper + Naval/Welsh AI remix engine + Streamlit UI.",
    status: "Open Source",
    metricLabel: "n8n + Python + SQLite",
    url: "https://x.com/AnkurBuilds",
    sparkline: [8, 14, 22, 19, 29, 34, 42],
  },
  {
    id: "saas-vibes",
    name: "SaaS Vibes",
    tagline: "Weekly newsletter on vibe-coding SaaS products, AI workflows, and indie distribution.",
    status: "Live",
    metricLabel: "Weekly Issue",
    url: "/newsletter",
    sparkline: [10, 15, 20, 26, 33, 40, 50],
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");

const SEED_POSTS: NewsletterPost[] = [
  {
    id: "issue-1",
    slug: "how-i-built-a-multi-tenant-lms-saas-in-one-weekend",
    title: "How I Built a Multi-Tenant LMS SaaS in One Weekend (Next.js + Supabase + R2)",
    excerpt:
      "Most people spend 6 months planning their SaaS architecture. Here is the exact 20% stack I used to ship auth, PostgreSQL RLS, Razorpay webhooks, and a course player in days.",
    category: "SaaS Building",
    readTime: "4 min read",
    publishedAt: "2026-11-22",
    featured: true,
    content: `Most developers over-engineer before getting their first user.

When I started building CourseForge, I set one rule: **zero unnecessary complexity**.

### The Exact Stack That Shipped It
1. **Next.js App Router + Tailwind CSS:** One codebase for the landing page, student portal, course player, and admin studio.
2. **Supabase PostgreSQL + Row Level Security:** Instead of writing 50 middleware permission checks, PostgreSQL itself verifies \`auth.uid()\` on every single query.
3. **Cloudflare R2:** \$0 egress fees for streaming course videos—unlike AWS S3, bandwidth won't eat your margins.
4. **Webhook-Driven Payments (Razorpay):** Never trust a browser redirect to unlock a paid course. Let the signed webhook unlock \`enrollments\` automatically.

### The Biggest Lesson
Shipping beats perfection every single time. Build the ugly working version first, connect the real database on day one, and polish the UI once real rows are flowing.`,
  },
  {
    id: "issue-2",
    slug: "spec-first-vibe-coding-without-spaghetti-code",
    title: "Spec-First Vibe Coding: How to Ship 5x Faster Without Spaghetti Code",
    excerpt:
      "Prompting AI blindly gives you a pretty demo that breaks in production. Here is the 3-step spec checklist I use before letting AI write a single line of code.",
    category: "Vibe Coding",
    readTime: "3 min read",
    publishedAt: "2026-11-18",
    featured: false,
    content: `AI coding agents are ridiculously fast—which means they can build the wrong architecture 10x faster if your spec is vague.

### My 3-Step Vibe Coding Rule
1. **Lock the Database Schema First:** Write your SQL tables and relationships before building UI screens. Good schemas prevent 80% of bugs.
2. **Pick One Design Language:** Don't let every page invent new colors. Pick a clean warm-monochrome palette and reuse one shared shell component.
3. **Verify Every Build Step:** Run \`tsc --noEmit\` and a production build after every milestone so errors never pile up.

Ship small, verify fast, repeat.`,
  },
  {
    id: "issue-3",
    slug: "automating-x-growth-with-n8n-and-zero-api-cost",
    title: "Growing @AnkurBuilds From Scratch Using n8n & Cross-Niche Viral Hooks",
    excerpt:
      "Distribution beats code. Here is how I automated daily viral hook research across psychology, writing, and indie hacking without paying for X's API.",
    category: "Growth",
    readTime: "3 min read",
    publishedAt: "2026-11-15",
    featured: false,
    content: `Nobody discovers a great SaaS sitting quietly on localhost.

Instead of staring at a blank tweet box every morning, I built a local **Dual-Stream Viral Engine**:
- **Stream A:** Scrapes proven high-engagement formats from outside tech (Naval, Justin Welsh, psychology, storytelling).
- **Stream B:** Captures fresh conversations inside SaaS, vibe coding, and AI agents.
- **Anti-AI-Slop Gate:** Strips corporate buzzwords, hashtags, and em-dashes so every draft sounds like a real builder.

Result: 15 minutes of reviewing and shipping content every morning, leaving the rest of the day to build products.`,
  },
];

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getAllPosts(): Promise<NewsletterPost[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(POSTS_FILE, "utf-8");
    return JSON.parse(raw) as NewsletterPost[];
  } catch {
    await fs.writeFile(POSTS_FILE, JSON.stringify(SEED_POSTS, null, 2), "utf-8");
    return SEED_POSTS;
  }
}

export async function getPostBySlug(slug: string): Promise<NewsletterPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function createPost(input: {
  title: string;
  excerpt: string;
  content: string;
  category: NewsletterPost["category"];
  featured: boolean;
}): Promise<NewsletterPost> {
  const posts = await getAllPosts();
  const baseSlug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = posts.some((p) => p.slug === baseSlug)
    ? `${baseSlug}-${Date.now().toString().slice(-4)}`
    : baseSlug || `post-${Date.now()}`;

  const wordCount = input.content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(wordCount / 200));

  const newPost: NewsletterPost = {
    id: `post-${Date.now()}`,
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim() || input.content.trim().slice(0, 150) + "...",
    content: input.content.trim(),
    category: input.category,
    readTime: `${mins} min read`,
    publishedAt: new Date().toISOString().slice(0, 10),
    featured: input.featured,
  };

  const updated = input.featured
    ? [newPost, ...posts.map((p) => ({ ...p, featured: false }))]
    : [newPost, ...posts];

  await fs.writeFile(POSTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return newPost;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SUBS_FILE, "utf-8");
    return JSON.parse(raw) as Subscriber[];
  } catch {
    await fs.writeFile(SUBS_FILE, "[]", "utf-8");
    return [];
  }
}

export async function addSubscriber(email: string): Promise<{ added: boolean; total: number }> {
  const normalized = email.trim().toLowerCase();
  const subs = await getSubscribers();
  if (subs.some((s) => s.email === normalized)) {
    return { added: false, total: subs.length };
  }
  subs.unshift({ email: normalized, subscribedAt: new Date().toISOString() });
  await fs.writeFile(SUBS_FILE, JSON.stringify(subs, null, 2), "utf-8");
  return { added: true, total: subs.length };
}
