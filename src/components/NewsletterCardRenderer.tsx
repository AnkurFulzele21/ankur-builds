"use client";

import { useState } from "react";
import { ArrowUpRight, ExternalLink, Star } from "lucide-react";
import {
  DEFAULT_DESIGN,
  getContentBlocks,
  getFontStack,
  type NewsletterDesign,
  type TemplateBlock,
} from "@/lib/newsletter-blocks";

interface NewsletterCardRendererProps {
  blocks: TemplateBlock[];
  design?: NewsletterDesign;
  postId?: string;
  interactivePoll?: boolean;
  initialAvgRating?: number;
  initialVoteCount?: number;
}

/**
 * Full Beehiiv + MailCheap Editorial Renderer.
 * Renders all 16 scratch + editorial blocks respecting custom NewsletterDesign settings.
 */
export function NewsletterCardRenderer({
  blocks,
  design = DEFAULT_DESIGN,
  postId,
  interactivePoll = false,
  initialAvgRating = 0,
  initialVoteCount = 0,
}: NewsletterCardRendererProps) {
  const [votedRating, setVotedRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [submitting, setSubmitting] = useState(false);

  const visibleBlocks = getContentBlocks(blocks);
  const accent = design.accentColor || "#F04E18";
  const ink = design.textColor || "#111827";
  const muted = design.mutedColor || "#6B7280";

  async function submitVote(rating: number) {
    if (!interactivePoll || !postId || submitting) return;
    setSubmitting(true);
    setVotedRating(rating);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, rating }),
      });
      if (res.ok) {
        const data = await res.json();
        setAvgRating(data.avgRating ?? rating);
        setVoteCount(data.totalVotes ?? voteCount + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: getFontStack(design.fontFamily),
        color: ink,
      }}
      className="space-y-6"
    >
      {visibleBlocks.map((block) => {
        /* ── HEADING ── */
        if (block.type === "heading") {
          const alignClass =
            block.align === "center"
              ? "text-center"
              : block.align === "right"
              ? "text-right"
              : "text-left";
          const sizeClass =
            block.level === "h1"
              ? "text-[28px] sm:text-[32px]"
              : block.level === "h3"
              ? "text-[19px] sm:text-[21px]"
              : "text-[23px] sm:text-[26px]";
          return (
            <section key={block.id} className={alignClass}>
              {block.kicker && (
                <p
                  style={{ color: accent }}
                  className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                >
                  {block.kicker}
                </p>
              )}
              <h2
                style={{ color: block.color || ink }}
                className={`${sizeClass} font-extrabold leading-tight tracking-tight`}
              >
                {block.text}
              </h2>
            </section>
          );
        }

        /* ── IMAGE ── */
        if (block.type === "image") {
          if (!block.url) return null;
          const widthClass =
            block.width === "compact"
              ? "mx-auto max-w-[340px]"
              : block.width === "medium"
              ? "mx-auto max-w-[500px]"
              : "w-full";
          const imgEl = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt={block.alt || block.caption || "Image"}
              className={`w-full object-cover ${
                block.rounded ? "rounded-xl" : "rounded-none"
              } border border-black/10`}
            />
          );
          return (
            <figure key={block.id} className={widthClass}>
              {block.linkUrl ? (
                <a href={block.linkUrl} target="_blank" rel="noreferrer" className="block">
                  {imgEl}
                </a>
              ) : (
                imgEl
              )}
              {block.caption && (
                <figcaption
                  style={{ color: muted }}
                  className="mt-2 text-center text-[12.5px] italic"
                >
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        /* ── BUTTON (MailCheap / Beehiiv style) ── */
        if (block.type === "button") {
          const alignClass =
            block.align === "left"
              ? "text-left"
              : block.align === "right"
              ? "text-right"
              : "text-center";
          const radiusClass =
            block.radius === "pill"
              ? "rounded-full"
              : block.radius === "square"
              ? "rounded-none"
              : "rounded-lg";
          const sizeClass =
            block.size === "sm"
              ? "px-4 py-2 text-[13px]"
              : block.size === "lg"
              ? "px-7 py-3.5 text-[15.5px]"
              : "px-5 py-2.5 text-[14px]";
          return (
            <div key={block.id} className={`py-1 ${alignClass}`}>
              <a
                href={block.url || "#"}
                style={{
                  backgroundColor: block.bgColor || accent,
                  color: block.textColor || "#FFFFFF",
                }}
                className={`inline-block font-bold transition hover:opacity-90 ${radiusClass} ${sizeClass}`}
              >
                {block.label || "Click Here"}
              </a>
            </div>
          );
        }

        /* ── CALLOUT BOX (MailCheap :::box + Beehiiv Callout) ── */
        if (block.type === "callout") {
          const borderStyle =
            block.variant === "left-bar"
              ? {
                  backgroundColor: block.bgColor || "#FFF8F5",
                  borderLeft: `4px solid ${block.borderColor || accent}`,
                }
              : block.variant === "boxed"
              ? {
                  backgroundColor: block.bgColor || "#F9FAFB",
                  border: `1.5px solid ${block.borderColor || "#E5E7EB"}`,
                }
              : {
                  backgroundColor: block.bgColor || "#F4F4F5",
                };
          return (
            <section
              key={block.id}
              style={borderStyle}
              className={
                block.variant === "left-bar"
                  ? "rounded-r-xl px-5 py-4"
                  : "rounded-xl px-5 py-4"
              }
            >
              {(block.emoji || block.title) && (
                <p className="flex items-center gap-2 text-[15px] font-bold">
                  {block.emoji && <span>{block.emoji}</span>}
                  <span>{block.title}</span>
                </p>
              )}
              {block.body && (
                <p className="mt-1.5 whitespace-pre-line text-[15px] leading-[1.7] opacity-90">
                  {block.body}
                </p>
              )}
            </section>
          );
        }

        /* ── PULL QUOTE ── */
        if (block.type === "quote") {
          return (
            <blockquote
              key={block.id}
              style={{ borderLeftColor: block.accentColor || accent }}
              className="border-l-4 py-1 pl-5"
            >
              <p className="text-[19px] font-semibold italic leading-[1.55]">
                &ldquo;{block.quote}&rdquo;
              </p>
              {(block.author || block.role) && (
                <footer style={{ color: muted }} className="mt-2 text-[13.5px] font-medium">
                  — <strong style={{ color: ink }}>{block.author}</strong>
                  {block.role ? `, ${block.role}` : ""}
                </footer>
              )}
            </blockquote>
          );
        }

        /* ── DIVIDER ── */
        if (block.type === "divider") {
          const pad =
            block.spacing === "sm"
              ? "my-2"
              : block.spacing === "lg"
              ? "my-8"
              : "my-4";
          return (
            <hr
              key={block.id}
              className={pad}
              style={{
                borderTopWidth: block.style === "thick" ? "3px" : "1px",
                borderTopStyle:
                  block.style === "dashed"
                    ? "dashed"
                    : block.style === "dotted"
                    ? "dotted"
                    : "solid",
                borderTopColor: block.color || "#E5E7EB",
              }}
            />
          );
        }

        /* ── SPACER ── */
        if (block.type === "spacer") {
          return <div key={block.id} style={{ height: `${block.height || 24}px` }} />;
        }

        /* ── 2-COLUMN LAYOUT ── */
        if (block.type === "columns") {
          return (
            <section key={block.id} className="grid gap-5 sm:grid-cols-2">
              {[block.left, block.right].map((col, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-xl border border-black/10 bg-black/[0.02] p-4"
                >
                  {col.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={col.imageUrl}
                      alt={col.heading}
                      className="mb-3 aspect-[16/10] w-full rounded-lg object-cover"
                    />
                  )}
                  {col.heading && (
                    <h3 className="text-[17px] font-bold leading-snug">{col.heading}</h3>
                  )}
                  {col.text && (
                    <p className="mt-1.5 flex-1 text-[14.5px] leading-[1.65] opacity-85">
                      {col.text}
                    </p>
                  )}
                  {col.linkLabel && (
                    <a
                      href={col.linkUrl || "#"}
                      style={{ color: accent }}
                      className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-bold underline underline-offset-4"
                    >
                      {col.linkLabel}
                    </a>
                  )}
                </div>
              ))}
            </section>
          );
        }

        /* ── BOOKMARK / LINK EMBED CARD ── */
        if (block.type === "embed_card") {
          return (
            <a
              key={block.id}
              href={block.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-black/12 bg-black/[0.02] transition hover:border-black/25 sm:flex-row"
            >
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p
                    style={{ color: muted }}
                    className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {block.domain || "Link"}
                  </p>
                  <h3 className="mt-1 text-[16px] font-bold leading-snug group-hover:underline">
                    {block.title}
                  </h3>
                  {block.description && (
                    <p
                      style={{ color: muted }}
                      className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed"
                    >
                      {block.description}
                    </p>
                  )}
                </div>
              </div>
              {block.imageUrl && (
                <div className="h-36 shrink-0 sm:h-auto sm:w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.imageUrl}
                    alt={block.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </a>
          );
        }

        /* ── CODE SNIPPET ── */
        if (block.type === "code") {
          return (
            <section
              key={block.id}
              className="overflow-hidden rounded-xl border border-black/15 bg-[#0F172A] text-[#F8FAFC]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/60">
                <span>{block.language || "code"}</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
                <code>{block.code}</code>
              </pre>
            </section>
          );
        }

        /* ── INTRO + "IN TODAY'S ISSUE" TOC ── */
        if (block.type === "intro") {
          const validToc = (block.tocItems || []).filter((item) => item.trim());
          return (
            <section key={block.id} className="border-b border-black/10 pb-6">
              {block.greeting && (
                <p className="text-[17px] font-bold leading-snug">{block.greeting}</p>
              )}
              {block.lead && (
                <p className="mt-2.5 text-[16px] leading-[1.75] opacity-85">{block.lead}</p>
              )}
              {validToc.length > 0 && (
                <div className="mt-5 rounded-xl border border-black/10 bg-black/[0.025] px-5 py-4">
                  <p className="text-[12.5px] font-bold uppercase tracking-wider">
                    {block.tocHeading || "In today's issue:"}
                  </p>
                  <ul className="mt-2.5 space-y-2 text-[15px] leading-[1.6] opacity-90">
                    {validToc.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span
                          style={{ backgroundColor: accent }}
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        }

        /* ── RUNDOWN / MORNING BREW EDITORIAL STORY ── */
        if (block.type === "story") {
          const validDetails = (block.details || []).filter((d) => d.trim());
          return (
            <section key={block.id} className="border-b border-black/10 pb-6">
              {block.kicker && (
                <p
                  style={{ color: accent }}
                  className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em]"
                >
                  {block.kicker}
                </p>
              )}
              <h2 className="mt-1.5 text-[24px] font-extrabold leading-[1.22] tracking-tight sm:text-[27px]">
                {block.headline}
              </h2>

              {block.imageUrl && (
                <figure className="mt-4">
                  <div className="overflow-hidden rounded-xl border border-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.imageUrl}
                      alt={block.headline}
                      className="w-full object-cover"
                    />
                  </div>
                  {block.imageCaption && (
                    <figcaption
                      style={{ color: muted }}
                      className="mt-2 text-center text-[12.5px] italic"
                    >
                      {block.imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {block.rundown && (
                <p className="mt-4 text-[16px] leading-[1.75] opacity-90">
                  <strong className="font-bold">The Rundown: </strong>
                  {block.rundown}
                </p>
              )}

              {validDetails.length > 0 && (
                <div className="mt-4">
                  <p className="text-[16px] font-bold">The details:</p>
                  <ul className="mt-2 list-disc space-y-2.5 pl-5 text-[15.5px] leading-[1.72] opacity-85">
                    {validDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              {block.whyItMatters && (
                <div
                  style={{ borderLeftColor: accent }}
                  className="mt-5 rounded-r-xl border-l-[3px] bg-black/[0.03] px-4 py-3.5 text-[15.5px] leading-[1.72]"
                >
                  <strong className="font-bold">Why it matters: </strong>
                  {block.whyItMatters}
                </div>
              )}

              {block.ctaLabel && (
                <div className="mt-4">
                  <a
                    href={block.ctaUrl || "#"}
                    style={{ color: accent }}
                    className="inline-flex items-center gap-1 text-[14.5px] font-bold underline underline-offset-4"
                  >
                    {block.ctaLabel}
                  </a>
                </div>
              )}
            </section>
          );
        }

        /* ── QUICK HITS ── */
        if (block.type === "quick_hits") {
          const validItems = (block.items || []).filter(
            (i) => i.title.trim() || i.description.trim()
          );
          return (
            <section key={block.id} className="border-b border-black/10 pb-6">
              {block.kicker && (
                <p
                  style={{ color: accent }}
                  className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em]"
                >
                  {block.kicker}
                </p>
              )}
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight">
                {block.heading || "Quick Hits"}
              </h2>
              <ul className="mt-4 space-y-3.5">
                {validItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-[15.5px] leading-[1.7] opacity-90"
                  >
                    <span
                      style={{ backgroundColor: accent }}
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    />
                    <div>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 font-bold underline decoration-2 underline-offset-2"
                        >
                          {item.title}
                          <ArrowUpRight className="inline h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <strong className="font-bold">{item.title}</strong>
                      )}
                      {item.description && <span> — {item.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        /* ── FREEFORM RICH TEXT ── */
        if (block.type === "richtext") {
          return (
            <section key={block.id}>
              {block.heading && (
                <h2 className="mb-3 text-[22px] font-extrabold tracking-tight">
                  {block.heading}
                </h2>
              )}
              <div
                className="space-y-4 text-[16px] leading-[1.78] opacity-90 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#F04E18] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:pt-2 [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h3]:pt-1 [&_h3]:text-[17px] [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            </section>
          );
        }

        /* ── TOGETHER WITH / SPONSOR CALLOUT ── */
        if (block.type === "spotlight") {
          return (
            <section key={block.id}>
              <div className="rounded-xl border border-black/12 bg-black/[0.025] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-3">
                  <span
                    style={{ color: muted }}
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                  >
                    {block.badge || "TOGETHER WITH"}
                  </span>
                  {block.dateLabel && (
                    <span style={{ color: muted }} className="text-[11.5px] font-medium">
                      {block.dateLabel}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-[20px] font-extrabold leading-snug">{block.title}</h3>
                {block.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.imageUrl}
                    alt={block.title}
                    className="mt-4 max-h-64 w-full rounded-lg border border-black/10 object-cover"
                  />
                )}
                <p className="mt-3 text-[15px] leading-[1.7] opacity-85">{block.description}</p>
                {block.ctaLabel && (
                  <a
                    href={block.ctaUrl || "#"}
                    style={{ backgroundColor: accent }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:opacity-90"
                  >
                    {block.ctaLabel}
                  </a>
                )}
              </div>
            </section>
          );
        }

        /* ── READER FEEDBACK POLL ── */
        if (block.type === "poll") {
          const pct = avgRating > 0 ? Math.round((avgRating / 5) * 100) : 0;
          return (
            <section key={block.id} className="border-t border-black/10 pt-6 text-center">
              <p
                style={{ color: muted }}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
              >
                READER FEEDBACK
              </p>
              <h3 className="mt-1.5 text-[19px] font-extrabold">{block.question}</h3>
              <p style={{ color: muted }} className="mt-1 text-[14px]">
                {block.sublabel}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = votedRating !== null && star <= votedRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => submitVote(star)}
                      style={active ? { borderColor: accent, color: accent } : undefined}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                        active
                          ? "bg-black/[0.04]"
                          : "border-black/15 bg-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={`Rate ${star} out of 5`}
                    >
                      <Star className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
                    </button>
                  );
                })}
              </div>

              {votedRating !== null && (
                <p style={{ color: accent }} className="mt-3 text-[13.5px] font-semibold">
                  {votedRating >= 4
                    ? "Awesome — glad you enjoyed this issue!"
                    : "Thanks for the honest feedback!"}
                </p>
              )}

              {voteCount > 0 && (
                <div
                  style={{ color: muted }}
                  className="mx-auto mt-4 inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-[12.5px]"
                >
                  <span style={{ color: ink }} className="font-bold">
                    {pct}% Positive
                  </span>
                  <span>·</span>
                  <span>
                    {avgRating.toFixed(1)}/5 ({voteCount}{" "}
                    {voteCount === 1 ? "vote" : "votes"})
                  </span>
                </div>
              )}
            </section>
          );
        }

        /* ── LEGACY HERO / PASTEL_CARD ── */
        if (block.type === "hero") {
          return (
            <section key={block.id} className="border-b border-black/10 pb-6">
              {block.eyebrow && (
                <p
                  style={{ color: accent }}
                  className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em]"
                >
                  {block.eyebrow}
                </p>
              )}
              <h2 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-tight">
                {block.title}
              </h2>
              {block.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.imageUrl}
                  alt={block.title}
                  className="mt-4 w-full rounded-xl border border-black/10 object-cover"
                />
              )}
              <p className="mt-3 text-[16px] leading-[1.75] opacity-85">{block.subtitle}</p>
              {block.ctaLabel && (
                <a
                  href={block.ctaUrl || "#"}
                  style={{ color: accent }}
                  className="mt-4 inline-flex items-center gap-1 text-[14.5px] font-bold underline underline-offset-4"
                >
                  {block.ctaLabel}
                </a>
              )}
            </section>
          );
        }

        if (block.type === "pastel_card") {
          return (
            <section key={block.id} className="border-b border-black/10 pb-6">
              <p
                style={{ color: accent }}
                className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em]"
              >
                {block.label}
              </p>
              <h2 className="mt-1 text-[23px] font-extrabold tracking-tight">
                {block.highlightStat}
              </h2>
              <p className="mt-3 text-[16px] leading-[1.75] opacity-85">{block.description}</p>
              {block.bullets && block.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15.5px] leading-[1.7] opacity-85">
                  {block.bullets.filter(Boolean).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              {block.ctaLabel && (
                <a
                  href={block.ctaUrl || "#"}
                  style={{ color: accent }}
                  className="mt-4 inline-flex items-center gap-1 text-[14.5px] font-bold underline underline-offset-4"
                >
                  {block.ctaLabel}
                </a>
              )}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
