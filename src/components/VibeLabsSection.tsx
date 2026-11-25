"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import type { PortfolioProjectRow } from "@/lib/beehiiv-db";

gsap.registerPlugin(ScrollTrigger);

interface VibeLabsSectionProps {
  projects: PortfolioProjectRow[];
  subscriberCount: number;
}

interface ArcCardItem {
  id: string;
  num: string;
  badge: string;
  title: string;
  subtitle: string;
  metric: string;
  href: string;
  bg: string;
  text: string;
  muted: string;
  accent: string;
  iconUrl?: string;
  previewUrl?: string;
}

const PHILOSOPHY_WORDS =
  "Finding the extraordinary in the ordinary — turning raw technical ideas into full-stack AI products and weekly playbooks.".split(
    " "
  );

export function VibeLabsSection({ subscriberCount }: VibeLabsSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const collageWrapRef = useRef<HTMLDivElement>(null);
  const vibeTitleRef = useRef<HTMLDivElement>(null);
  const portalSvgRef = useRef<SVGSVGElement>(null);
  const aboutHeaderRef = useRef<HTMLDivElement>(null);
  const philosophyWrapRef = useRef<HTMLDivElement>(null);
  const philWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sticker1Ref = useRef<HTMLSpanElement>(null);
  const sticker2Ref = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const arcCards: ArcCardItem[] = [
    {
      id: "lifeos",
      num: "01",
      badge: "PLAY STORE APP",
      title: "LifeOS",
      subtitle:
        "The ultimate ADHD-friendly focus & habit tracker on Google Play — block distractions and win every day.",
      metric: "3,000+ Downloads",
      href: "/vibe-labs",
      bg: "#0E1B2A",
      text: "#F8EAE0",
      muted: "rgba(248, 234, 224, 0.72)",
      accent: "#F04E18",
    },
    {
      id: "learn-to-use-ai",
      num: "02",
      badge: "AI WORKFLOWS",
      title: "Learn To Use AI",
      subtitle:
        "Practical AI workflows, agent systems, and product-market playbooks you can actually deploy.",
      metric: "learntouseai.in",
      href: "/vibe-labs",
      bg: "#F6E24B",
      text: "#0E1B2A",
      muted: "rgba(14, 27, 42, 0.75)",
      accent: "#0E1B2A",
    },
    {
      id: "habits-app",
      num: "03",
      badge: "PRODUCTIVITY",
      title: "Habits App",
      subtitle:
        "Atomic daily habit builder inspired by James Clear's Atoms — tiny compounding wins with zero clutter.",
      metric: "Atoms-Inspired",
      href: "/vibe-labs",
      bg: "#FAF7F2",
      text: "#0E1B2A",
      muted: "rgba(14, 27, 42, 0.72)",
      accent: "#F04E18",
    },
    {
      id: "75-hard",
      num: "04",
      badge: "MENTAL TOUGHNESS",
      title: "75 Hard App",
      subtitle:
        "No-excuses 75 Hard companion — 2× daily workouts, water, reading, progress photos & streak accountability.",
      metric: "75-Day Protocol",
      href: "/vibe-labs",
      bg: "#F04E18",
      text: "#FFFFFF",
      muted: "rgba(255, 255, 255, 0.84)",
      accent: "#0E1B2A",
    },
    {
      id: "saas-vibes",
      num: "05",
      badge: "NEWSLETTER ENGINE",
      title: "SaaS Vibes",
      subtitle:
        "Self-hosted Beehiiv-style publishing studio with block editor, 7-day sequences & Wed/Sun drops.",
      metric: "Wed & Sun Drops",
      href: "/vibe-labs",
      bg: "#1D2D24",
      text: "#F8EAE0",
      muted: "rgba(248, 234, 224, 0.75)",
      accent: "#F4A938",
    },
  ];

  useEffect(() => {
    const totalCards = arcCards.length;
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 639px)",
        isTablet: "(min-width: 640px) and (max-width: 1023px)",
        isDesktop: "(min-width: 1024px)",
      },
      (context) => {
        const { isMobile, isTablet } = context.conditions as {
          isMobile: boolean;
          isTablet: boolean;
        };

        const stepDeg = isMobile ? 22 : isTablet ? 15.5 : 12.2;
        const startAngle = isMobile ? 32 : 46;
        const endAngle = -((totalCards - 1) * stepDeg + startAngle);

        function layoutArc(progress: number) {
          const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
          const radius = isMobile
            ? Math.max(520, vw * 1.45)
            : isTablet
              ? Math.max(680, vw * 1.05)
              : Math.max(820, Math.min(1320, vw * 0.92));
          const baseAngle = startAngle + (endAngle - startAngle) * progress;

          cardRefs.current.forEach((el, idx) => {
            if (!el) return;
            const angleDeg = baseAngle + idx * stepDeg;
            const rad = (angleDeg * Math.PI) / 180;
            const x = radius * Math.sin(rad);
            const y = radius * (1 - Math.cos(rad)) * 0.85 + (isMobile ? 8 : 24);
            const rot = angleDeg * (isMobile ? 0.65 : 0.85);
            const distFromCenter = Math.abs(angleDeg);
            const opacity = distFromCenter > 54 ? Math.max(0, 1 - (distFromCenter - 54) / 14) : 1;

            gsap.set(el, {
              x,
              y,
              xPercent: -50,
              yPercent: -50,
              rotation: rot,
              opacity,
              force3D: true,
            });
          });
        }

        layoutArc(0);

        const arcProxy = { p: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: isMobile ? "+=380%" : "+=760%",
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: isMobile ? 0.6 : 0.95,
          },
        });

      // ACT 1 (0.00 -> 0.50): Scroll-Driven Right -> Left Semicircle Arc Carousel
      // Cards sweep in from right, crest across the semicircle fan, and the last card exits cleanly to the left!
      tl.to(
        arcProxy,
        {
          p: 1,
          duration: 0.5,
          ease: "none",
          onUpdate: () => layoutArc(arcProxy.p),
        },
        0
      );

      // ACT 2 (0.50 -> 0.88): Concentric Semicircle Portal Wipe -> ABOUT
      tl.to(
        [vibeTitleRef.current, collageWrapRef.current],
        {
          y: -140,
          scale: 0.93,
          opacity: 0,
          duration: 0.22,
          ease: "power2.inOut",
        },
        0.5
      );

      tl.fromTo(
        portalSvgRef.current,
        { scale: 0, yPercent: 10 },
        {
          scale: 1.18,
          yPercent: 0,
          duration: 0.22,
          ease: "power1.inOut",
        },
        0.5
      );

      // ABOUT rises smoothly from below into the middle of the expanding navy dome
      tl.fromTo(
        aboutHeaderRef.current,
        { y: "32vh", opacity: 0, scale: 0.94 },
        {
          y: "0vh",
          opacity: 1,
          scale: 1,
          duration: 0.18,
          ease: "power2.out",
        },
        0.6
      );

      // Inner Deep Navy circle expands to fill 100% of the screen
      tl.to(
        portalSvgRef.current,
        {
          scale: 2.45,
          duration: 0.2,
          ease: "power1.inOut",
        },
        0.72
      );
      tl.to(
        stageRef.current,
        {
          backgroundColor: "#0E1B2A",
          duration: 0.06,
          ease: "none",
        },
        0.8
      );

      // ACT 3 (0.82 -> 1.06): Parallel Parallax Handoff ABOUT -> PHILOSOPHY
      tl.to(
        aboutHeaderRef.current,
        {
          y: "-58vh",
          opacity: 0,
          duration: 0.24,
          ease: "power1.inOut",
        },
        0.82
      );
      tl.fromTo(
        philosophyWrapRef.current,
        { y: "48vh", opacity: 0 },
        {
          y: "0vh",
          opacity: 1,
          duration: 0.24,
          ease: "power1.inOut",
        },
        0.84
      );

      // ACT 4 (1.08 -> 1.66): Word-by-word Philosophy reveal
      philWordRefs.current.forEach((el, idx) => {
        if (!el) return;
        const t = 1.08 + (idx / PHILOSOPHY_WORDS.length) * 0.54;
        tl.to(el, { color: "#F04E18", duration: 0.05, ease: "none" }, t);
        tl.to(el, { color: "#FFFFFF", duration: 0.06, ease: "none" }, t + 0.05);
      });

      tl.fromTo(
        sticker1Ref.current,
        { scale: 0, opacity: 0, rotation: -12 },
        { scale: 1, opacity: 1, rotation: -4, duration: 0.08, ease: "back.out(2)" },
        1.28
      );
      tl.fromTo(
        sticker2Ref.current,
        { scale: 0, opacity: 0, rotation: 12 },
        { scale: 1, opacity: 1, rotation: 3, duration: 0.08, ease: "back.out(2)" },
        1.48
      );

      // ACT 5 (1.70 -> 1.82): Lift cleanly to hand off to Winding Orange Roadmap
        tl.to(
          philosophyWrapRef.current,
          { y: "-14vh", duration: 0.12, ease: "power1.in" },
          1.7
        );
      },
      stageRef
    );

    return () => {
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="vibe-labs" className="relative -mt-[26vh] bg-transparent text-[#0E1B2A]">
      {/* FRAME 1: Pinned Center-Screen Storytelling Reveal for "A BIT ABOUT MY LAB" */}
      <ScrollRevealText
        theme="cream"
        eyebrow="A BIT ABOUT MY LAB"
        trackHeightClass="h-[185vh]"
        sizeClass="text-[30px] sm:text-[50px] lg:text-[62px]"
        text="A growing collection of apps built on zero VC funding and questionable amounts of caffeine."
        stickers={[
          {
            text: "Professional overthinker",
            at: 0.34,
            positionClass: "top-[28%] right-[12%]",
            rotate: -4,
          },
          {
            text: "Nerding out on systems",
            at: 0.56,
            positionClass: "top-[58%] left-[10%]",
            rotate: -6,
          },
          {
            text: "Allergic to generic",
            at: 0.76,
            positionClass: "bottom-[10%] right-[22%]",
            rotate: 4,
          },
        ]}
      />

      {/* Tight handoff so VIBE LABS enters immediately without dead space */}
      <div aria-hidden="true" className="-mt-[10vh] h-[4vh] w-full bg-transparent" />

      {/* FRAME 2: GSAP PINNED 100SVH STAGE — SEMICIRCLE ARC CAROUSEL -> PORTAL -> ABOUT */}
      <div
        ref={stageRef}
        className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-transparent px-4 pt-14 lg:pt-4"
      >
        {/* VIBE LABS Heading */}
        <div
          ref={vibeTitleRef}
          className="relative z-10 mb-2 text-center will-change-transform sm:mb-3"
        >
          <p className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.22em] text-[#F04E18] sm:text-[11px]">
            SCROLL TO EXPLORE · CLICK ANY CARD
          </p>
          <h2 className="mt-1 font-display text-[clamp(2.5rem,6.6vw,5.6rem)] font-extrabold uppercase leading-none tracking-[-0.04em] text-[#0E1B2A]">
            VIBE LABS
          </h2>
        </div>

        {/* Semicircle Rainbow Arc Stage (studioloop.com.br Awwwards motion!) */}
        <div
          ref={collageWrapRef}
          className="relative flex h-[62svh] w-full items-center justify-center will-change-transform sm:h-[66svh]"
        >
          {arcCards.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const neighborPush =
              hoveredIdx === null
                ? 0
                : idx < hoveredIdx
                  ? -38
                  : idx > hoveredIdx
                    ? 38
                    : 0;

            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                style={{ zIndex: isHovered ? 45 : 20 + idx }}
                className="absolute left-1/2 top-[54%] will-change-transform sm:top-[56%]"
              >
                <motion.div
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  animate={{
                    y: isHovered ? -30 : 0,
                    x: neighborPush,
                    scale: isHovered ? 1.07 : hoveredIdx !== null ? 0.97 : 1,
                    rotate: isHovered ? -1.5 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 22,
                    mass: 0.75,
                  }}
                >
                  <Link
                    href={card.href}
                    data-cursor="read"
                    style={{ backgroundColor: card.bg, color: card.text }}
                    className={`group flex h-[41svh] min-h-[285px] max-h-[430px] w-[64vw] max-w-[248px] flex-col justify-between overflow-hidden rounded-[22px] border border-black/10 p-5 transition-shadow duration-300 sm:h-[48svh] sm:min-h-[340px] sm:w-[320px] sm:max-w-none sm:rounded-[24px] sm:p-7 lg:w-[365px] ${
                      isHovered
                        ? "shadow-[0_36px_74px_rgba(14,27,42,0.42)]"
                        : "shadow-[0_20px_44px_rgba(14,27,42,0.26)]"
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between gap-2 font-mono-tech text-[10.5px] font-bold uppercase tracking-[0.16em]">
                      <span style={{ color: card.muted }}>
                        {card.num} · {card.badge}
                      </span>
                      <span
                        style={{
                          backgroundColor: card.accent,
                          color: card.accent === "#0E1B2A" ? "#F8EAE0" : "#FFFFFF",
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    {/* Center Visual / Editorial Showcase */}
                    <div className="my-auto py-3">
                      {card.iconUrl ? (
                        <div className="mb-4 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={card.iconUrl}
                            alt={`${card.title} icon`}
                            className="h-14 w-14 rounded-2xl border-2 border-white/20 object-cover shadow-md"
                          />
                          {card.previewUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={card.previewUrl}
                              alt={`${card.title} preview`}
                              className="h-14 flex-1 rounded-xl border border-white/15 object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            borderColor: card.muted,
                          }}
                          className="mb-4 inline-flex rounded-full border px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-wider"
                        >
                          VIBE LABS // {card.num}
                        </div>
                      )}

                      <h3 className="font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[34px]">
                        {card.title}
                      </h3>
                      <p
                        style={{ color: card.muted }}
                        className="mt-3 text-[13.5px] leading-relaxed sm:text-[14px]"
                      >
                        {card.subtitle}
                      </p>
                    </div>

                    {/* Card Bottom Metric Bar */}
                    <div
                      style={{ borderColor: card.muted }}
                      className="flex items-center justify-between border-t border-opacity-25 pt-3.5 font-mono-tech text-[11px] font-bold uppercase tracking-wider"
                    >
                      <span>{card.metric}</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        Open Lab →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* CONCENTRIC SEMICIRCLE PORTAL WIPE */}
        <svg
          ref={portalSvgRef}
          viewBox="-1000 -1000 2000 2000"
          className="pointer-events-none absolute bottom-0 left-1/2 z-50 h-[260vmax] w-[260vmax] -translate-x-1/2 translate-y-1/2 will-change-transform"
          aria-hidden="true"
        >
          <circle cx="0" cy="0" r="1000" fill="#F5B5A8" />
          <circle cx="0" cy="0" r="855" fill="#F04E18" />
          <circle cx="0" cy="0" r="710" fill="#26465C" />
          <circle cx="0" cy="0" r="565" fill="#0E1B2A" />
        </svg>

        {/* ABOUT PORTAL HEADER */}
        <div
          ref={aboutHeaderRef}
          className="pointer-events-none absolute inset-0 z-[60] flex flex-col items-center justify-center px-6 pb-[10vh] text-center opacity-0 will-change-transform"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#F8EAE0]">
              THE STORY
            </span>
            <span className="rounded-full bg-[#F04E18] px-4 py-1.5 font-mono-tech text-[11px] font-bold uppercase tracking-widest text-white">
              SOLO STUDIO
            </span>
          </div>
          <h2 className="font-display text-[clamp(3.6rem,9.5vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-[#F04E18]">
            ABOUT
          </h2>
          <p className="mt-4 max-w-xl font-mono-tech text-xs font-bold uppercase tracking-[0.22em] text-[#F8EAE0]/80 sm:text-sm">
            RAW TECHNICAL IDEAS → FULL-STACK AI PRODUCTS
          </p>
        </div>

        {/* PHILOSOPHY QUOTE */}
        <div
          ref={philosophyWrapRef}
          className="pointer-events-none absolute inset-0 z-[65] flex items-center justify-center px-6 opacity-0 will-change-transform"
        >
          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <p className="mb-6 font-mono-tech text-[12px] font-bold uppercase tracking-[0.24em] text-[#F4A938]">
              PHILOSOPHY // HOW I BUILD
            </p>
            <p className="font-display text-[clamp(1.6rem,4.6vw,4.2rem)] font-bold leading-[1.12] tracking-[-0.03em]">
              {PHILOSOPHY_WORDS.map((word, idx) => (
                <span
                  key={idx}
                  ref={(el) => {
                    philWordRefs.current[idx] = el;
                  }}
                  style={{ color: "rgba(248, 234, 224, 0.34)" }}
                  className="mr-[0.22em] inline-block"
                >
                  {word}
                </span>
              ))}
            </p>

            <span
              ref={sticker1Ref}
              className="pointer-events-none absolute -top-10 right-[12%] z-20 hidden rounded-full border-2 border-[#0E1B2A] bg-[#F04E18] px-4 py-1.5 font-sans text-[13px] font-bold text-white opacity-0 shadow-[0_10px_22px_rgba(14,27,42,0.28)] sm:inline-block"
            >
              Solo founder energy
            </span>
            <span
              ref={sticker2Ref}
              className="pointer-events-none absolute -bottom-12 left-[14%] z-20 hidden rounded-full border-2 border-[#0E1B2A] bg-[#F4A938] px-4 py-1.5 font-sans text-[13px] font-bold text-[#0E1B2A] opacity-0 shadow-[0_10px_22px_rgba(14,27,42,0.28)] sm:inline-block"
            >
              Shipping from India
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
