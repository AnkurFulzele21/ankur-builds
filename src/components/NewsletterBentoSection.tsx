"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { SubscribeBox } from "@/components/SubscribeBox";
import type { NewsletterPostRow } from "@/lib/beehiiv-db";

interface NewsletterBentoSectionProps {
  posts: NewsletterPostRow[];
  subscriberCount: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "Recent";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/**
 * Apple-Glass Premium 3x2 Newsletter Grid with Trevor Noah Scroll-Scrubbed Upward Storytelling Parallax:
 * - As you scroll down with the mouse wheel, the heading, Row 1 cards, Row 2 cards, CTA button, and
 *   Subscribe card each glide smoothly upward at staggered parallax depths (just like trevornoah.com/watch-listen @ 00:18-00:28!).
 * - Hovering any card pops it HUGE (`scale: 1.22`, `rotate: ±5deg`, `z-50`) into a crisp white Polaroid frame.
 */
export function NewsletterBentoSection({
  posts,
  subscriberCount,
}: NewsletterBentoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 88, damping: 24 });

  // Stronger storytelling upward parallax layers (02:53-03:24 in Video 3.32.21 PM!)
  const headerY = useTransform(smooth, [0, 0.32, 1], [150, 0, -120]);
  const headerOpacity = useTransform(smooth, [0.02, 0.2], [0, 1]);

  const row1Y = useTransform(smooth, [0.08, 0.44, 1], [230, 0, -105]);
  const row1Opacity = useTransform(smooth, [0.08, 0.26], [0, 1]);

  const row2Y = useTransform(smooth, [0.16, 0.54, 1], [310, 0, -85]);
  const row2Opacity = useTransform(smooth, [0.16, 0.35], [0, 1]);

  const ctaY = useTransform(smooth, [0.24, 0.6, 1], [120, 0, -40]);
  const ctaOpacity = useTransform(smooth, [0.24, 0.44], [0, 1]);

  // Clamped upward reveal (never drops downward into the footer and never shifts on click!)
  const subscribeY = useTransform(smooth, [0.3, 0.66, 1], [48, 0, -18]);
  const subscribeScale = useTransform(smooth, [0.3, 0.62], [0.96, 1]);
  const subscribeOpacity = useTransform(smooth, [0.3, 0.5], [0, 1]);

  const topSix = Array.from({ length: 6 }, (_, idx) => posts[idx] || null);

  return (
    <section
      id="newsletter-sec"
      ref={sectionRef}
      className="relative z-20 bg-transparent px-5 pb-28 pt-10 text-white sm:px-8 sm:pb-36 sm:pt-14"
    >
      <div className="mx-auto max-w-6xl">
        {/* Scroll-Scrubbed Upward Storytelling Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center will-change-transform"
        >
          <p className="font-display text-xl font-bold tracking-[-0.03em] text-[#0E1B2A]/90 sm:text-2xl">
            Read Weekly
          </p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.04em] text-[#F8EAE0] sm:text-6xl">
            SaaS Vibes Newsletter
          </h2>
        </motion.div>

        {/* 3x2 Apple-Glass Grid — Uniform vertical flow on mobile/tablet so cards NEVER overlap! */}
        <motion.div
          style={{ y: row1Y, opacity: row1Opacity }}
          className="mt-12 grid grid-cols-1 gap-6 will-change-transform sm:mt-20 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3"
        >
          {topSix.map((post, idx) => {
            const isHovered = hoveredIdx === idx;
            const tiltAngle = idx % 2 === 0 ? -4 : 4;
            const href = post ? `/newsletter/${post.slug}` : "/newsletter";
            const title = post?.title || `Issue #0${idx + 1} — Shipping Micro-SaaS With AI`;
            const category = post?.category || "Vibe Coding";
            const readTime = post?.read_time || "4 min";
            const dateStr = post ? formatDate(post.published_at || post.created_at) : "Upcoming";

            return (
              <div
                key={post?.id || `slot-${idx}`}
                style={{
                  zIndex: isHovered ? 50 : 10,
                }}
              >
                <motion.div
                  data-cursor="read"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  animate={{
                    scale: isHovered ? 1.08 : 1,
                    rotate: isHovered ? tiltAngle : 0,
                    y: isHovered ? -10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`relative cursor-pointer rounded-[24px] transition-colors duration-200 ${
                    isHovered
                      ? "bg-white p-4 pb-7 text-[#0E1B2A] shadow-[0_34px_75px_rgba(14,27,42,0.52)]"
                      : "border border-white/25 bg-[#1A0D09]/22 p-3.5 pb-5 text-white shadow-[0_10px_30px_rgba(14,27,42,0.16)] backdrop-blur-xl"
                  }`}
                >
                  <Link href={href} className="block">
                    {/* 16:9 Rounded Thumbnail */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[#0E1B2A]">
                      {post?.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.thumbnail_url}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#1B3344] via-[#0E1B2A] to-[#1D1726] p-4 text-left">
                          <span className="self-start rounded-full bg-white/15 px-2.5 py-0.5 font-mono-tech text-[10px] font-bold uppercase text-[#F8EAE0] backdrop-blur-md">
                            {category}
                          </span>
                          <p className="line-clamp-2 font-display text-lg font-bold leading-tight text-white">
                            {title}
                          </p>
                        </div>
                      )}

                      {/* Bottom-right duration / read-time pill */}
                      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-2 py-0.5 font-mono-tech text-[10.5px] font-bold text-white backdrop-blur-sm">
                        {readTime}
                      </span>
                    </div>

                    {/* Clean Apple-Style Card Typography */}
                    <div className="mt-4 px-1 text-left">
                      <h3
                        className={`line-clamp-1 font-display text-[17px] font-bold leading-snug tracking-[-0.02em] ${isHovered ? "text-[#0E1B2A]" : "text-white"
                          }`}
                      >
                        {title}
                      </h3>
                      <p
                        className={`mt-1.5 font-sans text-[12.5px] font-medium ${isHovered ? "text-[#0E1B2A]/60" : "text-white/75"
                          }`}
                      >
                        {category} · {dateStr}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Tighter Spacing + Big, Bold Magnetic "View All Newsletters" Pill Button */}
        <motion.div
          style={{ y: ctaY, opacity: ctaOpacity }}
          className="mt-12 text-center will-change-transform sm:mt-14"
        >
          <Link
            href="/newsletter"
            data-magnetic="true"
            className="inline-flex items-center gap-3 rounded-full bg-white px-11 py-5 font-display text-[18px] font-extrabold tracking-tight text-[#0E1B2A] shadow-[0_16px_38px_rgba(14,27,42,0.32)] transition-colors duration-200 hover:bg-[#F8EAE0] sm:px-14 sm:py-5 sm:text-[20px]"
          >
            View All Newsletters
            <ArrowUpRight className="h-6 w-6 stroke-[2.5]" />
          </Link>
        </motion.div>

        {/* Wide Matching Apple-Glass Subscribe Card — stays locked in frame, zero downward drop or footer clipping! */}
        <motion.div
          style={{
            y: subscribeY,
            scale: subscribeScale,
            opacity: subscribeOpacity,
          }}
          className="relative z-30 mx-auto mt-14 max-w-5xl rounded-[30px] border border-white/30 bg-[#1A0D09]/26 p-7 shadow-lg backdrop-blur-2xl will-change-transform sm:mt-16 sm:p-10"
        >
          {/* Floating Glass Mail Icon neatly inside top-right corner (NEVER cropped!) */}
          <motion.div
            animate={{ y: [0, -7, 0], rotate: [-6, 0, -6] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            className="pointer-events-none absolute right-6 top-6 hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md sm:flex"
          >
            <Mail className="h-5 w-5" />
          </motion.div>

          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 font-mono-tech text-[10.5px] font-bold uppercase tracking-widest text-[#F8EAE0]">
                <Sparkles className="h-3.5 w-3.5" />
                {subscriberCount} Builders Subscribed
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                Get the weekly playbook straight to your inbox.
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/80">
                Real micro-SaaS builds, AI workflows, and zero-fluff breakdowns every Sunday.
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-3.5 text-[#0E1B2A] shadow-[0_14px_30px_rgba(14,27,42,0.2)] lg:col-span-6">
              <SubscribeBox buttonLabel="Subscribe Free" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
