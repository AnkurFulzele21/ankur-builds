"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpRight, Sparkles } from "lucide-react";

export interface LabDeckProject {
  id: string;
  number: string;
  name: string;
  headline: string;
  tagline: string;
  status: string;
  category: string;
  metric: string;
  stack: string[];
  url: string;
  primaryLabel?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  iconUrl?: string;
  screenshots?: string[];
  badgeInitials: string;
  badgeColor: string;
}

const STACK_OFFSETS = [
  { rotate: 0, y: 0, x: 0, scale: 1 },
  { rotate: -3.2, y: -18, x: -8, scale: 0.965 },
  { rotate: 3.6, y: 18, x: 10, scale: 0.935 },
  { rotate: -5.4, y: -28, x: 12, scale: 0.905 },
  { rotate: 4.8, y: 26, x: -12, scale: 0.88 },
];

export function VibeLabsCardDeck({ projects }: { projects: LabDeckProject[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = projects.length;
  if (total === 0) return null;

  function handleNext() {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }

  function handlePrev() {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function jumpTo(index: number) {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }

  // Order cards from back-most to front-most so z-index & peeking edges match two26.studio!
  const orderedIndices = Array.from({ length: total }, (_, i) => (activeIndex + i) % total);
  const backToFront = [...orderedIndices].reverse();

  return (
    <div className="relative w-full overflow-hidden bg-transparent px-5 py-20 sm:px-8 sm:py-28">
      {/* Subtle Top Label */}
      <div className="mx-auto mb-10 max-w-4xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#0E1B2A] px-4 py-1.5 font-mono-tech text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8EAE0]">
          <Sparkles className="h-3.5 w-3.5 text-[#F4A938]" />
          INTERACTIVE DECK · CLICK ARROWS OR SWIPE CARDS
        </p>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
          Flip through the Vibe Labs stack
        </h2>
      </div>

      {/* Centered Stacked Card Deck (Exact two26.studio feel!) */}
      <div className="relative mx-auto flex min-h-[500px] max-w-[780px] items-center justify-center sm:min-h-[430px]">
        {/* Top Floating Black Circle UP Button (Next Card) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next micro-SaaS card"
          data-magnetic="true"
          className="absolute -top-4 right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#0E1B2A] text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] transition hover:scale-110 hover:bg-black sm:-top-3 sm:right-12 sm:h-14 sm:w-14"
        >
          <ArrowUp className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Bottom Floating Black Circle DOWN Button (Previous Card) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous micro-SaaS card"
          data-magnetic="true"
          className="absolute -bottom-4 right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#0E1B2A] text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] transition hover:scale-110 hover:bg-black sm:-bottom-3 sm:right-12 sm:h-14 sm:w-14"
        >
          <ArrowDown className="h-5 w-5 stroke-[2.5]" />
        </button>

        <AnimatePresence initial={false} mode="popLayout">
          {backToFront.map((projIndex) => {
            const depth = (projIndex - activeIndex + total) % total; // 0 = front card
            const isFront = depth === 0;
            const slot = STACK_OFFSETS[Math.min(depth, STACK_OFFSETS.length - 1)];
            const proj = projects[projIndex];
            const isInternal = proj.url.startsWith("/");

            return (
              <motion.div
                key={proj.id}
                layout
                drag={isFront ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.35}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -65 || info.velocity.y < -300) {
                    handleNext();
                  } else if (info.offset.y > 65 || info.velocity.y > 300) {
                    handlePrev();
                  }
                }}
                onClick={() => {
                  if (!isFront) jumpTo(projIndex);
                }}
                initial={{
                  scale: 0.92,
                  y: direction === 1 ? 65 : -65,
                  rotate: direction === 1 ? 5 : -5,
                  opacity: 0.6,
                }}
                animate={{
                  scale: slot.scale,
                  y: slot.y,
                  x: slot.x,
                  rotate: slot.rotate,
                  opacity: depth > 4 ? 0 : 1,
                  zIndex: total - depth,
                }}
                exit={{
                  y: direction === 1 ? -140 : 140,
                  rotate: direction === 1 ? -7 : 7,
                  scale: 0.9,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                  mass: 0.85,
                }}
                style={{
                  zIndex: total - depth,
                }}
                className={`absolute inset-x-0 mx-auto w-full max-w-[720px] rounded-[26px] border border-black/5 bg-white p-7 text-left shadow-[0_24px_60px_rgba(14,27,42,0.26)] sm:p-11 ${
                  isFront ? "cursor-grab active:cursor-grabbing" : "cursor-pointer hover:brightness-[0.98]"
                }`}
              >
                {/* Top Row: Project Number + Status Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-tech text-[11px] font-bold uppercase tracking-[0.18em] text-[#0E1B2A]/45">
                    {proj.number} · {proj.category}
                  </span>
                  <span className="rounded-full bg-[#F8EAE0] px-3 py-1 font-mono-tech text-[10.5px] font-bold uppercase text-[#F04E18]">
                    {proj.metric}
                  </span>
                </div>

                {/* Big Bold Orange Headline (matching two26.studio!) */}
                <h3 className="mt-4 font-display text-[clamp(1.65rem,3.6vw,2.65rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#F04E18]">
                  {proj.headline}
                </h3>

                {/* 2-Column Content Row (Left App Badge + Meta | Right Description + Screenshots + Links) */}
                <div className="mt-6 grid items-start gap-6 sm:grid-cols-12">
                  {/* Left Badge Column */}
                  <div className="flex items-center gap-4 sm:col-span-4 sm:flex-col sm:items-start sm:gap-3">
                    {proj.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proj.iconUrl}
                        alt={`${proj.name} icon`}
                        className="h-16 w-16 shrink-0 rounded-2xl border-2 border-[#0E1B2A] object-cover shadow-[3px_3px_0px_#0E1B2A] sm:h-20 sm:w-20"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: proj.badgeColor }}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#0E1B2A] font-display text-lg font-extrabold text-white shadow-[3px_3px_0px_#0E1B2A] sm:h-20 sm:w-20 sm:text-xl"
                      >
                        {proj.badgeInitials}
                      </div>
                    )}
                    <div>
                      <p className="font-display text-[17px] font-extrabold text-[#F04E18]">
                        {proj.name}
                      </p>
                      <p className="text-[12.5px] font-semibold text-[#0E1B2A]/55">
                        {proj.status} · Vibe Labs
                      </p>
                    </div>
                  </div>

                  {/* Right Description Column */}
                  <div className="sm:col-span-8">
                    <p className="text-[15px] leading-[1.65] text-[#F04E18]/90 sm:text-[16px]">
                      {proj.tagline}
                    </p>

                    {proj.screenshots && proj.screenshots.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {proj.screenshots.slice(0, 3).map((src, sIdx) => (
                          <div
                            key={src}
                            className="overflow-hidden rounded-xl border border-[#0E1B2A]/15 bg-[#0E1B2A]/5"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`${proj.name} screenshot ${sIdx + 1}`}
                              className="aspect-[16/10] w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {proj.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-[#F04E18]/20 bg-[#F8EAE0]/65 px-2.5 py-0.5 font-mono-tech text-[10.5px] font-bold text-[#0E1B2A]/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0E1B2A]/10 pt-4">
                      <div className="flex flex-wrap items-center gap-4">
                        {isInternal ? (
                          <Link
                            href={proj.url}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-display text-[14px] font-extrabold text-[#0E1B2A] transition hover:text-[#F04E18]"
                          >
                            {proj.primaryLabel || `Open ${proj.name}`}
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-display text-[14px] font-extrabold text-[#0E1B2A] transition hover:text-[#F04E18]"
                          >
                            {proj.primaryLabel || `View ${proj.name}`}
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                        {proj.secondaryUrl && (
                          <a
                            href={proj.secondaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-mono-tech text-[11.5px] font-bold uppercase text-[#F04E18] underline underline-offset-4 hover:text-[#0E1B2A]"
                          >
                            {proj.secondaryLabel || "Website"}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                        className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#0E1B2A]/55 transition hover:text-[#F04E18]"
                      >
                        Next card →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Project Selector Pills */}
      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
        {projects.map((p, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => jumpTo(idx)}
              className={`rounded-full px-4 py-2 font-mono-tech text-[11.5px] font-bold uppercase tracking-wider transition ${
                active
                  ? "border-2 border-[#0E1B2A] bg-white text-[#0E1B2A] shadow-[3px_3px_0px_#0E1B2A]"
                  : "border border-white/35 bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {p.number} · {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
