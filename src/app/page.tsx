import { createClient } from "@/lib/supabase/server";
import { LandingExperience } from "@/components/LandingExperience";
import type { NewsletterPostRow, PortfolioProjectRow, SiteSettings } from "@/lib/beehiiv-db";

export const dynamic = "force-dynamic";

export default async function PortfolioHomePage() {
  const supabase = await createClient();

  const [settingsRes, projectsRes, postsRes, subCountRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("portfolio_projects").select("*").order("position", { ascending: true }),
    supabase
      .from("newsletter_posts")
      .select("*")
      .eq("status", "published")
      .eq("publish_to_web", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(6),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const settings: SiteSettings = (settingsRes.data as SiteSettings) || {
    id: "default",
    owner_name: "Ankur Fulzele",
    owner_handle: "@AnkurBuilds",
    location: "India · Solo SaaS Builder",
    bio: "I vibe-code micro-SaaS products with AI and ship fast in public. Sharing real code, prompts, tech stacks, and indie startup lessons every week.",
    publication_name: "SaaS Vibes",
    publication_tagline: "Ship SaaS on vibes.",
    sender_name: "Ankur Fulzele",
    sender_email: "hello@ankurfulzele.in",
    twitter_url: "https://x.com/AnkurBuilds",
  };

  const projects = (projectsRes.data as PortfolioProjectRow[]) ?? [];
  const posts = (postsRes.data as NewsletterPostRow[]) ?? [];
  const subscriberCount = subCountRes.count ?? 0;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Ankur Fulzele",
        alternateName: "@AnkurBuilds",
        url: siteUrl,
        description:
          "Solo SaaS builder & founder of SaaS Vibes. Vibe-coding micro-SaaS products with AI and shipping in public.",
        sameAs: [settings.twitter_url || "https://x.com/AnkurBuilds"],
      },
      {
        "@type": "WebSite",
        name: "Ankur Fulzele — Ship SaaS on vibes.",
        url: siteUrl,
        description:
          "Ship SaaS on vibes. Interactive studio of Ankur Fulzele and the SaaS Vibes Wednesday & Sunday newsletter.",
      },
    ],
  };

  return (
    <>
      <link rel="preload" href="/models/human_brain.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/models/coffee_shop_cup.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/models/macbook_laptop.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/models/newspaper.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/models/dumbell_low-poly.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/assets/section1/faces/normal.png?v=7" as="image" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingExperience
        settings={settings}
        projects={projects}
        posts={posts}
        subscriberCount={subscriberCount}
      />
    </>
  );
}
