import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { SubscribeBox } from "@/components/SubscribeBox";
import { ScrollToSubscribeButton } from "@/components/ScrollToSubscribeButton";
import { NewsletterCardRenderer } from "@/components/NewsletterCardRenderer";
import { createClient } from "@/lib/supabase/server";
import type { NewsletterPostRow } from "@/lib/beehiiv-db";
import {
  extractDesign,
  getContentBlocks,
  getFontStack,
  type TemplateBlock,
} from "@/lib/newsletter-blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_posts")
    .select("title, subtitle, excerpt, thumbnail_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return { title: "SaaS Vibes Newsletter" };
  }
  const desc = data.subtitle || data.excerpt || "Ship SaaS on vibes. Weekly AI & micro-SaaS breakdown from SaaS Vibes.";
  return {
    alternates: {
      canonical: `/newsletter/${slug}`,
    },
    title: `${data.title} — SaaS Vibes`,
    description: desc,
    openGraph: {
      title: data.title,
      description: desc,
      type: "article",
      images: data.thumbnail_url ? [{ url: data.thumbnail_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: desc,
      images: data.thumbnail_url ? [data.thumbnail_url] : undefined,
    },
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "Recent";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NewsletterArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("newsletter_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const post = data as NewsletterPostRow | null;
  if (!post) notFound();

  const { data: votes } = await supabase
    .from("poll_votes")
    .select("rating")
    .eq("post_id", post.id);

  const voteList = (votes || []) as { rating: number }[];
  const voteCount = voteList.length;
  const avgRating =
    voteCount > 0 ? voteList.reduce((sum, v) => sum + v.rating, 0) / voteCount : 0;

  const rawBlocks: TemplateBlock[] = Array.isArray(post.template_blocks)
    ? post.template_blocks
    : [];
  const design = extractDesign(rawBlocks);
  const contentBlocks = getContentBlocks(rawBlocks);
  const hasVisualBlocks = contentBlocks.length > 0;
  const paragraphs = (post.content_markdown || "").split(/\n\n+/);

  const centered = design.headerStyle === "centered";
  const magazine = design.headerStyle === "magazine";

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/newsletter/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.subtitle || post.excerpt || "Ship SaaS on vibes.",
    image: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Person",
      name: "Ankur Fulzele",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "SaaS Vibes",
      url: `${siteUrl}/newsletter`,
    },
  };

  return (
    <div
      style={{
        backgroundColor: design.pageBg,
        color: design.textColor,
        fontFamily: getFontStack(design.fontFamily),
      }}
      className="min-h-screen selection:bg-[#F04E18] selection:text-white"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Minimal Standalone SaaS Vibes Header */}
      <header
        style={{ backgroundColor: design.pageBg }}
        className="sticky top-0 z-30 border-b border-black/10 px-5 py-3.5 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 font-display text-[14px] font-bold tracking-[-0.02em] opacity-75 transition hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            All Issues
          </Link>

          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 font-display text-[17px] font-extrabold tracking-[-0.03em] transition hover:opacity-85"
          >
            <span
              style={{ backgroundColor: design.accentColor }}
              className="flex h-6 w-6 items-center justify-center rounded-md font-display text-[11px] font-extrabold text-white"
            >
              SV
            </span>
            SaaS Vibes
          </Link>

          <ScrollToSubscribeButton accentColor={design.accentColor} />
        </div>
      </header>

      {/* Customizable Single-Column Editorial Container */}
      <main
        style={{
          maxWidth: design.contentWidth,
          backgroundColor: design.surfaceBg,
        }}
        className={`mx-auto px-5 pb-20 pt-10 sm:pt-12 ${design.pageBg !== design.surfaceBg
          ? "my-8 rounded-2xl border border-black/10 px-7 shadow-sm sm:px-10"
          : ""
          }`}
      >
        {/* Header / Masthead */}
        <div className={centered ? "text-center" : "text-left"}>
          <div
            style={{ color: design.mutedColor }}
            className={`flex flex-wrap items-center gap-2 text-[12.5px] font-medium ${centered ? "justify-center" : ""
              }`}
          >
            {design.issueLabel && (
              <span
                style={{ backgroundColor: design.accentColor }}
                className="rounded-full px-3 py-0.5 font-display text-[12px] font-bold tracking-[-0.01em] text-white"
              >
                {design.issueLabel}
              </span>
            )}
            {(design.tags && design.tags.length > 0 ? design.tags : [post.category]).map(
              (tag) => (
                <span
                  key={tag}
                  style={{ color: design.accentColor }}
                  className="rounded-full border border-current/25 px-3 py-0.5 font-display text-[12px] font-bold tracking-[-0.01em]"
                >
                  {tag}
                </span>
              )
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.read_time}
            </span>
          </div>

          <h1
            className={`mt-4 font-display font-extrabold leading-[1.12] tracking-[-0.03em] ${magazine
              ? "text-[36px] sm:text-[46px]"
              : "text-[32px] sm:text-[42px]"
              }`}
          >
            {post.title}
          </h1>

          {(post.subtitle || post.excerpt) && (
            <p
              style={{ color: design.mutedColor }}
              className="mt-3.5 text-[18px] leading-[1.55] sm:text-[19px]"
            >
              {post.subtitle || post.excerpt}
            </p>
          )}
        </div>

        {/* Author Byline Bar */}
        {design.showByline && (
          <div className="mt-6 flex items-center justify-between gap-4 border-y border-black/10 py-3.5">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: design.textColor, color: design.surfaceBg }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-extrabold"
              >
                AF
              </div>
              <div>
                <p className="text-[14px] font-bold leading-tight">Ankur Fulzele</p>
                <p style={{ color: design.mutedColor }} className="text-[12.5px]">
                  Founder &amp; Writer at SaaS Vibes
                </p>
              </div>
            </div>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${post.title} — via @AnkurBuilds`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 px-3.5 py-1.5 text-[12px] font-semibold transition hover:border-current"
            >
              Share on X
            </a>
          </div>
        )}

        {/* Hero Cover Thumbnail */}
        {design.showThumbnail && post.thumbnail_url && (
          <div className="mt-7 overflow-hidden rounded-xl border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="mt-8">
          {hasVisualBlocks ? (
            <NewsletterCardRenderer
              blocks={contentBlocks}
              design={design}
              postId={post.id}
              interactivePoll
              initialAvgRating={avgRating}
              initialVoteCount={voteCount}
            />
          ) : (
            <div className="space-y-4 text-[16px] leading-[1.78] opacity-90">
              {paragraphs.map((block, idx) => {
                const t = block.trim();
                if (!t) return null;
                if (t.startsWith("## ")) {
                  return (
                    <h2
                      key={idx}
                      className="pt-4 text-[24px] font-extrabold tracking-tight"
                    >
                      {t.replace(/^##\s+/, "")}
                    </h2>
                  );
                }
                if (t.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="pt-2 text-[19px] font-bold">
                      {t.replace(/^###\s+/, "")}
                    </h3>
                  );
                }
                if (t.startsWith("> ")) {
                  return (
                    <blockquote
                      key={idx}
                      style={{ borderLeftColor: design.accentColor }}
                      className="border-l-[3px] py-2 pl-4 italic opacity-85"
                    >
                      {t.replace(/^>\s+/, "")}
                    </blockquote>
                  );
                }
                if (t.startsWith("- ")) {
                  return (
                    <ul key={idx} className="list-disc space-y-2 pl-5">
                      {t.split("\n").map((line, li) => (
                        <li key={li}>{line.replace(/^-\s+/, "")}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{t}</p>;
              })}
            </div>
          )}
        </article>

        {/* Bottom Editorial Subscribe Box */}
        {design.showSubscribeBox && (
          <section
            id="subscribe-footer"
            className="mt-12 rounded-2xl border border-black/10 bg-black/[0.025] p-6 sm:p-8"
          >
            <p
              style={{ color: design.accentColor }}
              className="font-display text-[13px] font-bold tracking-[-0.01em]"
            >
              SaaS Vibes Newsletter
            </p>
            <h2 className="mt-1.5 text-[22px] font-extrabold tracking-tight">
              Enjoyed this breakdown? Get the next one in your inbox.
            </h2>
            <p
              style={{ color: design.mutedColor }}
              className="mt-1.5 text-[14.5px] leading-relaxed"
            >
              One scannable, 4-minute issue every week on vibe coding, AI tools, and shipping
              profitable SaaS. Zero fluff.
            </p>
            <div className="mt-5">
              <SubscribeBox />
            </div>
          </section>
        )}

        {/* Minimal Editorial Legal Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-6 text-[12px] font-medium opacity-70">
          <span>© {new Date().getFullYear()} SaaS Vibes · Ankur Fulzele</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/unsubscribe" className="hover:underline">
              Unsubscribe
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

