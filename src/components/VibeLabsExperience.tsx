"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteSubpageHeader } from "@/components/SiteSubpageHeader";
import { Floating3DProp } from "@/components/Floating3DProp";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import { VibeLabsCardDeck, type LabDeckProject } from "@/components/VibeLabsCardDeck";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import type { SiteSettings } from "@/lib/beehiiv-db";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_SETTINGS = {
  twitter_url: "https://x.com/AnkurBuilds",
  sender_email: "hello@ankurfulzele.in",
} as SiteSettings;

export function VibeLabsExperience({ projects }: { projects: LabDeckProject[] }) {
  const worldRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const hero3DRef = useRef<HTMLDivElement>(null);
  const deckTriggerRef = useRef<HTMLDivElement>(null);
  const archiveTriggerRef = useRef<HTMLDivElement>(null);
  const footerMorphRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.6 });

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroTitleRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "expo.out", delay: 0.05 }
      );
      gsap.fromTo(
        hero3DRef.current,
        { scale: 0.84, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.12 }
      );

      gsap.to(hero3DRef.current, {
        y: -140,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: hero3DRef.current,
          start: "top 15%",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Continuous World Color Choreography (ZERO hard horizontal cuts!):
      // 1. Deep Navy (#0E1B2A) -> Signal Orange (#F04E18) as the Interactive Card Deck enters
      gsap.to(worldRef.current, {
        backgroundColor: "#F04E18",
        ease: "none",
        scrollTrigger: {
          trigger: deckTriggerRef.current,
          start: "top 82%",
          end: "top 24%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // 2. Signal Orange (#F04E18) -> Deep Navy (#0E1B2A) as the Archive Index enters
      gsap.fromTo(
        worldRef.current,
        { backgroundColor: "#F04E18" },
        {
          backgroundColor: "#0E1B2A",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: archiveTriggerRef.current,
            start: "top 82%",
            end: "top 28%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );

      // 3. Deep Navy (#0E1B2A) -> Signal Orange (#F04E18) into MicaelaFooter
      gsap.fromTo(
        worldRef.current,
        { backgroundColor: "#0E1B2A" },
        {
          backgroundColor: "#F04E18",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: footerMorphRef.current,
            start: "top 85%",
            end: "bottom 25%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 280);
    return () => {
      clearTimeout(t);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  function handleIndexMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const activeHoverProj = hoveredIdx !== null ? projects[hoveredIdx] : null;

  return (
    <div
      ref={worldRef}
      className="relative min-h-screen overflow-x-clip bg-[#0E1B2A] text-[#F8EAE0] selection:bg-[#F04E18] selection:text-white"
    >
      <CustomCursor />
      <SiteSubpageHeader theme="navy" />

      {/* ================================================================= */}
      {/* SCENE 1: CINEMATIC 3D MACBOOK + GIANT KINETIC COVER (ZERO LINES!) */}
      {/* ================================================================= */}
      <div className="relative flex min-h-[calc(100svh-68px)] flex-col items-center justify-center overflow-hidden px-5 pb-12 pt-6 sm:px-8">
        <div
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(240, 78, 24, 0.16) 0%, rgba(14, 27, 42, 0) 58%)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        <h1
          ref={heroTitleRef}
          className="pointer-events-none relative z-10 select-none text-center font-condensed text-[clamp(5.2rem,20vw,18rem)] uppercase leading-[0.82] tracking-[-0.02em] text-[#F8EAE0] will-change-transform"
        >
          VIBE <span className="text-[#F04E18]">LABS</span>
        </h1>

        {/* Live Interactive 3D MacBook Floating Center-Stage */}
        <div
          ref={hero3DRef}
          className="relative z-20 -mt-[14svh] h-[44svh] w-[340px] will-change-transform sm:-mt-[18svh] sm:h-[52svh] sm:w-[500px]"
        >
          <Floating3DProp
            url="/models/macbook_laptop.glb"
            targetSize={2.85}
            baseRotation={[0.24, -0.35, 0.04]}
          />
        </div>

        {/* Floating Quick-Jump Pills (No boxed bar) */}
        <div className="relative z-20 -mt-2 flex flex-wrap items-center justify-center gap-2">
          {projects.map((p) => (
            <a
              key={p.id}
              href="#lab-deck"
              data-magnetic="true"
              className="rounded-full bg-white/8 px-4 py-1.5 font-mono-tech text-[10.5px] font-bold uppercase tracking-wider text-[#F8EAE0]/85 backdrop-blur-md transition hover:bg-[#F04E18] hover:text-white"
            >
              {p.number} · {p.name.split(":")[0]}
            </a>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* SCENE 2: SEAMLESS SCROLL-SCRUBBED EDITORIAL MANIFESTO             */}
      {/* ================================================================= */}
      <ScrollRevealText
        theme="dark"
        eyebrow="VIBE LABS // PHILOSOPHY"
        trackHeightClass="h-[165vh]"
        sizeClass="text-[30px] sm:text-[50px] lg:text-[62px]"
        text="A growing collection of apps built on zero VC funding and questionable amounts of caffeine."
        stickers={[
          {
            text: "3,000+ Play Store DL",
            at: 0.34,
            positionClass: "top-[24%] right-[10%]",
            rotate: -4,
          },
          {
            text: "Built solo in India",
            at: 0.58,
            positionClass: "top-[60%] left-[8%]",
            rotate: -6,
            bg: "#F4A938",
            fg: "#0E1B2A",
          },
          {
            text: "Zero pitch decks",
            at: 0.78,
            positionClass: "bottom-[10%] right-[16%]",
            rotate: 4,
          },
        ]}
      />

      {/* ================================================================= */}
      {/* SCENE 3: INTERACTIVE STACKED CARD DECK (CONTINUOUS ORANGE MORPH!) */}
      {/* ================================================================= */}
      <div id="lab-deck" ref={deckTriggerRef}>
        <VibeLabsCardDeck projects={projects} />
      </div>

      {/* ================================================================= */}
      {/* SCENE 4: BORDERLESS MOUSE-TRACKING EDITORIAL ARCHIVE              */}
      {/* ================================================================= */}
      <div ref={archiveTriggerRef} className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-condensed text-[clamp(3rem,8vw,6.8rem)] uppercase leading-[0.88] text-[#F8EAE0]">
            THE <span className="text-[#F04E18]">ARCHIVE</span>
          </h2>
          <p className="max-w-xs font-mono-tech text-[11px] uppercase leading-relaxed tracking-wider text-[#F8EAE0]/50">
            Hover any build to preview. Click to launch.
          </p>
        </div>

        <div
          onMouseMove={handleIndexMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
          className="relative space-y-2"
        >
          <AnimatePresence>
            {activeHoverProj && (
              <motion.div
                key={activeHoverProj.id}
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{
                  x: smoothX,
                  y: smoothY,
                  backgroundColor: activeHoverProj.badgeColor,
                }}
                className="pointer-events-none absolute left-6 top-0 z-30 hidden w-72 -translate-y-1/2 rounded-2xl p-5 text-white shadow-[0_28px_64px_rgba(0,0,0,0.55)] lg:block"
              >
                <p className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#F4A938]">
                  {activeHoverProj.number} · {activeHoverProj.metric}
                </p>
                <p className="mt-2 font-display text-lg font-extrabold leading-tight">
                  {activeHoverProj.headline}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/80">
                  {activeHoverProj.tagline}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map((proj, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={proj.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="group relative z-10 grid items-center gap-4 rounded-2xl px-4 py-7 transition-all duration-300 hover:bg-white/[0.06] sm:px-6 md:grid-cols-12"
              >
                <div className="flex items-center gap-4 md:col-span-3">
                  <span
                    className={`font-mono-tech text-sm font-bold transition-colors ${
                      isHovered ? "text-[#F04E18]" : "text-[#F8EAE0]/40"
                    }`}
                  >
                    {proj.number}
                  </span>
                  <span className="rounded-full bg-white/8 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase text-[#F4A938]">
                    {proj.metric}
                  </span>
                </div>

                <div className="md:col-span-5">
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="read"
                    className="inline-block font-condensed text-[clamp(2.2rem,4.6vw,3.9rem)] uppercase leading-none tracking-tight text-[#F8EAE0] transition-transform duration-300 group-hover:translate-x-3 group-hover:text-[#F04E18]"
                  >
                    {proj.name.split(":")[0]}
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4">
                  <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#F8EAE0]/60">
                    {proj.category}
                  </span>
                  <div className="flex items-center gap-3">
                    {proj.secondaryUrl && (
                      <a
                        href={proj.secondaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#F8EAE0]/75 underline underline-offset-4 hover:text-[#F4A938]"
                      >
                        {proj.secondaryLabel}
                      </a>
                    )}
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-magnetic="true"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-[#F04E18]"
                      aria-label={`Open ${proj.name}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6">
          <Link
            href="/vibe-fuel"
            data-magnetic="true"
            className="group inline-flex items-center gap-3 font-display text-xl font-extrabold text-[#F8EAE0] transition hover:text-[#F4A938] sm:text-2xl"
          >
            <span>Next: See the stack behind these builds (Vibe Fuel)</span>
            <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
          <a
            href="https://github.com/AnkurFulzele21"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#F8EAE0] px-6 py-3 font-display text-[13.5px] font-extrabold text-[#0E1B2A] transition hover:bg-white"
          >
            GitHub / @AnkurFulzele21 ↗
          </a>
        </div>
      </div>

      {/* Invisible Continuous Color Morph Zone: Deep Navy -> Signal Orange into Footer! */}
      <div ref={footerMorphRef} aria-hidden="true" className="pointer-events-none h-[26vh] w-full" />

      <MicaelaFooter settings={FOOTER_SETTINGS} compact />
    </div>
  );
}
