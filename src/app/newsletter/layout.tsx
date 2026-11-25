import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/newsletter",
  },
  title: "SaaS Vibes — Ship SaaS on vibes.",
  description:
    "Ship SaaS on vibes. Every Wednesday & Sunday: real vibe-coded SaaS teardowns, tested dev tools, GitHub repos & distribution plays you can actually steal.",
  openGraph: {
    title: "SaaS Vibes — Ship SaaS on vibes.",
    description:
      "Ship SaaS on vibes. Every Wednesday & Sunday: real vibe-coded SaaS teardowns, tested dev tools, GitHub repos, and distribution plays you can actually steal.",
    siteName: "SaaS Vibes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Vibes — Ship SaaS on vibes.",
    description:
      "Ship SaaS on vibes. Real vibe-coded SaaS teardowns, tested repos & distribution plays every Wednesday & Sunday.",
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SaaS Vibes",
    slogan: "Ship SaaS on vibes.",
    url: `${siteUrl}/newsletter`,
    description:
      "Every Wednesday & Sunday: real vibe-coded SaaS teardowns, tested dev tools, GitHub repos & distribution plays for indie builders.",
    publisher: {
      "@type": "Person",
      name: "Ankur Fulzele",
      url: siteUrl,
      sameAs: ["https://x.com/AnkurBuilds"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
