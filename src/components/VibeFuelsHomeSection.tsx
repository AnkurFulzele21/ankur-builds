"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * VIBE FUELS — Deep Navy Blue (#0E1B2A) GSAP Pinned 3D-Perspective Flying Poster & Sticker Collage
 * Uses gsap.matchMedia() so resizing or toggling phone / tablet / desktop in DevTools
 * automatically rebuilds exact responsive coordinates with zero overflow or collapsing!
 */
export function VibeFuelsHomeSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
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

        const xS = isMobile ? 0.24 : isTablet ? 0.62 : 1;
        const yS = isMobile ? 0.68 : isTablet ? 0.85 : 1;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: isMobile ? "+=145%" : "+=210%",
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: isMobile ? 0.6 : 0.85,
          },
        });

        const specs = [
          // 0: Left Cream Poster (AI Coding Stack)
          {
            from: {
              x: -560 * xS,
              y: -220 * yS,
              rotation: -32,
              rotateX: 42,
              rotateY: 28,
              scale: 1.24,
              opacity: 0,
            },
            to: {
              x: isMobile ? -18 : -250 * xS,
              y: isMobile ? -18 : 12 * yS,
              rotation: isMobile ? -4.5 : -6,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.0,
          },
          // 1: Center Framed Poster (Coffee & 6 AM Sprints)
          {
            from: {
              x: 440 * xS,
              y: -280 * yS,
              rotation: 24,
              rotateX: 38,
              rotateY: -30,
              scale: 1.24,
              opacity: 0,
            },
            to: {
              x: isMobile ? 0 : -10 * xS,
              y: isMobile ? 6 : 24 * yS,
              rotation: 2,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.14,
          },
          // 2: Right Dispatch Poster (Prompts, Books & Skills)
          {
            from: {
              x: 580 * xS,
              y: 200 * yS,
              rotation: 34,
              rotateX: -36,
              rotateY: -28,
              scale: 1.22,
              opacity: 0,
            },
            to: {
              x: isMobile ? 18 : 235 * xS,
              y: isMobile ? 28 : 10 * yS,
              rotation: isMobile ? 5 : 6.5,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.28,
          },
          // 3: Bottom-Left Draggable Polaroid
          {
            from: {
              x: -480 * xS,
              y: 260 * yS,
              rotation: -34,
              rotateX: -34,
              rotateY: 24,
              scale: 1.18,
              opacity: 0,
            },
            to: {
              x: isMobile ? -72 : -310 * xS,
              y: isMobile ? 124 : 145 * yS,
              rotation: -8,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.42,
          },
          // 4: Bottom-Right Draggable Serrated Postage Stamp
          {
            from: {
              x: 140 * xS,
              y: 340 * yS,
              rotation: 24,
              rotateX: -38,
              rotateY: -18,
              scale: 1.18,
              opacity: 0,
            },
            to: {
              x: isMobile ? 74 : 115 * xS,
              y: isMobile ? 124 : 145 * yS,
              rotation: 5,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.54,
          },
          // 5: Top-Left Amber Bumper Sticker
          {
            from: {
              x: -340 * xS,
              y: -280 * yS,
              rotation: -36,
              rotateX: 34,
              rotateY: 20,
              scale: 1.22,
              opacity: 0,
            },
            to: {
              x: isMobile ? -64 : -140 * xS,
              y: isMobile ? -112 : -125 * yS,
              rotation: -8,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.66,
          },
          // 6: Top-Right Forest Green Sticker
          {
            from: {
              x: 440 * xS,
              y: -250 * yS,
              rotation: 30,
              rotateX: 36,
              rotateY: -24,
              scale: 1.22,
              opacity: 0,
            },
            to: {
              x: isMobile ? 64 : 290 * xS,
              y: isMobile ? -108 : -115 * yS,
              rotation: 7,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              opacity: 1,
            },
            at: 0.76,
          },
        ];

        specs.forEach((s, idx) => {
          const el = cardRefs.current[idx];
          if (!el) return;
          tl.fromTo(el, s.from, { ...s.to, duration: 0.26, ease: "power3.out" }, s.at);
        });
      },
      stageRef
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="vibe-fuels"
      ref={stageRef}
      className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-transparent px-4 pt-12 text-[#F8EAE0] lg:pt-0"
    >
      {/* Heading */}
      <div className="relative z-10 mb-3 text-center sm:mb-4">
        <p className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.24em] text-[#F04E18] sm:text-[11px]">
          WHAT POWERS THE BUILDS
        </p>
        <h2 className="mt-1 font-display text-[clamp(2.3rem,7vw,6.2rem)] font-extrabold uppercase leading-none tracking-[-0.04em] text-[#F8EAE0]">
          VIBE FUELS
        </h2>
      </div>

      {/* 3D Perspective Flying Collage Stage */}
      <div
        style={{ perspective: "1200px" }}
        className="relative flex h-[60svh] w-full max-w-[94vw] items-center justify-center sm:h-[64svh]"
      >
        {/* 0: Left Poster (AI Coding Stack) */}
        <div
          ref={(el) => {
            cardRefs.current[0] = el;
          }}
          className="absolute z-10 transition-all hover:z-[70]"
        >
          <Link
            href="/vibe-fuel"
            className="flex h-[34svh] min-h-[235px] w-[62vw] max-w-[235px] flex-col justify-between border border-[#D5C7B8] bg-[#F5EFE6] p-4 text-[#0E1B2A] shadow-[0_24px_48px_rgba(0,0,0,0.42)] transition-transform duration-200 hover:scale-105 sm:h-[42svh] sm:min-h-[300px] sm:w-[34vw] sm:max-w-[290px] sm:p-5 lg:h-[44svh] lg:min-h-[320px] lg:w-[26vw] lg:max-w-[320px] lg:p-6"
          >
            <div className="flex items-center justify-between border-b border-[#0E1B2A]/15 pb-1.5 font-mono-tech text-[9.5px] uppercase sm:pb-2 sm:text-[10.5px]">
              <span>FUEL 01 // STACK</span>
              <span className="font-bold text-[#F04E18]">DAILY</span>
            </div>
            <div className="my-auto py-2 sm:py-3">
              <span className="inline-block rounded-full bg-[#0E1B2A] px-2.5 py-0.5 font-mono-tech text-[9px] font-bold uppercase text-[#F8EAE0] sm:px-3 sm:py-1 sm:text-[10px]">
                AI CODING STACK
              </span>
              <p className="mt-2.5 font-display text-lg font-extrabold leading-tight sm:mt-4 sm:text-2xl lg:text-3xl">
                Cursor, Next.js &amp; Supabase
              </p>
            </div>
            <p className="text-[11.5px] leading-snug text-[#0E1B2A]/80 sm:text-[13px]">
              My tight, zero-bloat stack for going from shower thought to live URL in 72 hours.
            </p>
          </Link>
        </div>

        {/* 1: Center Framed Poster (Coffee & 6 AM Sprints) */}
        <div
          ref={(el) => {
            cardRefs.current[1] = el;
          }}
          className="absolute z-20 transition-all hover:z-[70]"
        >
          <Link
            href="/vibe-fuel"
            className="flex h-[36svh] min-h-[245px] w-[64vw] max-w-[245px] flex-col justify-between border-[8px] border-[#1D2D24] bg-white p-4 text-[#0E1B2A] shadow-[0_28px_56px_rgba(0,0,0,0.48)] transition-transform duration-200 hover:scale-105 sm:h-[44svh] sm:min-h-[315px] sm:w-[36vw] sm:max-w-[305px] sm:border-[10px] sm:p-5 lg:h-[46svh] lg:min-h-[340px] lg:w-[27vw] lg:max-w-[335px] lg:border-[12px] lg:p-6"
          >
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#F04E18] px-2.5 py-0.5 font-mono-tech text-[9px] font-bold uppercase text-white sm:px-3 sm:py-1 sm:text-[10.5px]">
                CAFFEINE &amp; FOCUS
              </span>
              <h3 className="mt-2.5 font-display text-lg font-extrabold leading-tight sm:mt-4 sm:text-2xl lg:text-3xl">
                Black Coffee &amp; 6 AM Sprints
              </h3>
            </div>
            <div className="my-1.5 border-y border-[#0E1B2A]/15 py-2.5 text-center text-[11.5px] leading-relaxed text-[#0E1B2A]/80 sm:my-2 sm:py-3.5 sm:text-[13.5px]">
              Questionable amounts of caffeine, 90-minute no-phone blocks, and shipping features
              before noon.
            </div>
            <div className="flex items-center justify-between font-mono-tech text-[10px] font-bold uppercase text-[#0E1B2A] sm:text-[11.5px]">
              <span>VIBE FUEL</span>
              <span className="text-[#F04E18]">EXPLORE →</span>
            </div>
          </Link>
        </div>

        {/* 2: Right Poster (Books, Prompts & Skills) */}
        <div
          ref={(el) => {
            cardRefs.current[2] = el;
          }}
          className="absolute z-25 transition-all hover:z-[70]"
        >
          <Link
            href="/vibe-fuel"
            className="flex h-[34svh] min-h-[235px] w-[62vw] max-w-[235px] flex-col justify-between border border-[#0E1B2A]/20 bg-[#FAF7F2] p-4 text-[#0E1B2A] shadow-[0_24px_48px_rgba(0,0,0,0.44)] transition-transform duration-200 hover:scale-105 sm:h-[42svh] sm:min-h-[300px] sm:w-[34vw] sm:max-w-[295px] sm:p-5 lg:h-[44svh] lg:min-h-[325px] lg:w-[26vw] lg:max-w-[325px] lg:p-6"
          >
            <div className="bg-[#1D2D24] p-2.5 text-white sm:p-4">
              <p className="font-mono-tech text-[9px] uppercase text-[#F4A938] sm:text-[11px]">
                PROMPTS &amp; SKILLS // VAULT
              </p>
              <p className="mt-1 font-display text-base font-bold leading-tight sm:mt-1.5 sm:text-2xl">
                PLAYBOOKS &amp; MENTAL MODELS
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-mono-tech text-[9.5px] font-bold uppercase text-[#F04E18] sm:text-[11px]">
                STEAL MY WORKFLOWS
              </span>
              <p className="text-[11.5px] leading-snug text-[#0E1B2A]/85 sm:text-[13.5px]">
                Books, coding playlists, Cursor rules, and agent skills that keep shipping velocity
                high.
              </p>
            </div>
            <div className="border-t-2 border-[#0E1B2A] pt-2 font-display text-xs font-extrabold uppercase sm:pt-2.5 sm:text-base">
              OPEN VIBE FUEL →
            </div>
          </Link>
        </div>

        {/* 3: Bottom-Left Draggable Polaroid */}
        <div
          ref={(el) => {
            cardRefs.current[3] = el;
          }}
          className="absolute z-30 hover:z-[75]"
        >
          <motion.div
            drag
            dragElastic={0.2}
            dragMomentum
            whileDrag={{ scale: 1.08 }}
            data-cursor="drag"
            className="w-32 cursor-grab select-none bg-white p-2 pb-4 text-[#0E1B2A] shadow-[0_18px_36px_rgba(0,0,0,0.45)] active:cursor-grabbing sm:w-48 sm:p-2.5 sm:pb-6"
          >
            <div className="flex h-16 flex-col justify-between bg-[#0E1B2A] p-2 text-white sm:h-24 sm:p-3">
              <span className="font-mono-tech text-[8px] uppercase text-[#F4A938] sm:text-[9px]">
                6 AM RITUAL
              </span>
              <span className="font-display text-xs font-bold sm:text-sm">Pour-Over + Terminal</span>
            </div>
          </motion.div>
        </div>

        {/* 4: Bottom-Right Draggable Serrated Postage Stamp */}
        <div
          ref={(el) => {
            cardRefs.current[4] = el;
          }}
          className="absolute z-35 hover:z-[75]"
        >
          <motion.div
            drag
            dragElastic={0.2}
            dragMomentum
            whileDrag={{ scale: 1.1 }}
            data-cursor="drag"
            className="w-28 cursor-grab select-none border-3 border-dashed border-[#0E1B2A] bg-white p-1.5 shadow-[0_16px_32px_rgba(0,0,0,0.44)] active:cursor-grabbing sm:w-40 sm:border-4 sm:p-2"
          >
            <div className="bg-[#F04E18] p-2 text-white sm:p-3">
              <p className="font-mono-tech text-[8px] font-bold uppercase sm:text-[9px]">
                INDIA POST // FUEL
              </p>
              <p className="mt-1 font-display text-xs font-extrabold leading-tight sm:mt-1.5 sm:text-base">
                VIBE
                <br />
                FUELS
              </p>
              <p className="mt-1 font-mono-tech text-[8px] uppercase text-[#F8EAE0] sm:mt-1.5 sm:text-[9px]">
                SOLO STACK
              </p>
            </div>
          </motion.div>
        </div>

        {/* 5: Top-Left Amber Bumper Sticker */}
        <div
          ref={(el) => {
            cardRefs.current[5] = el;
          }}
          className="absolute z-40 hover:z-[75]"
        >
          <motion.div
            drag
            dragElastic={0.2}
            dragMomentum
            whileDrag={{ scale: 1.1 }}
            data-cursor="drag"
            className="cursor-grab select-none border-2 border-[#0E1B2A] bg-[#F4A938] px-3 py-1 font-display text-xs font-extrabold uppercase tracking-tight text-[#0E1B2A] shadow-[3px_3px_0px_#0E1B2A] active:cursor-grabbing sm:px-4 sm:py-1.5 sm:text-base sm:shadow-[4px_4px_0px_#0E1B2A]"
          >
            CAFFEINE DRIVEN
          </motion.div>
        </div>

        {/* 6: Top-Right Forest Green Sticker */}
        <div
          ref={(el) => {
            cardRefs.current[6] = el;
          }}
          className="absolute z-40 hover:z-[75]"
        >
          <motion.div
            drag
            dragElastic={0.2}
            dragMomentum
            whileDrag={{ scale: 1.1 }}
            data-cursor="drag"
            className="cursor-grab select-none border-2 border-[#0E1B2A] bg-[#4D7C5B] px-3 py-1 font-mono-tech text-[10px] font-bold uppercase text-white shadow-[3px_3px_0px_#0E1B2A] active:cursor-grabbing sm:px-4 sm:py-2 sm:text-xs sm:shadow-[4px_4px_0px_#0E1B2A]"
          >
            ZERO VC FUNDING
          </motion.div>
        </div>
      </div>
    </section>
  );
}
