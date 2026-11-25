"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, Eye, Layers, Newspaper, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  {
    id: "m1",
    left: "VIBE",
    right: "CODING",
    note: "We find the idea, the angle, and ship production Next.js + Supabase apps in days.",
    posClass: "left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[10%] top-[115px]",
    icon: Sparkles,
    at: 0.12,
    pillTilt: -3,
  },
  {
    id: "m2",
    left: "FULL-STACK",
    right: "SAAS",
    note: "We give your product rock-solid Postgres RLS, R2 streaming, and global payments.",
    posClass: "left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[10%] top-[490px]",
    icon: Layers,
    at: 0.34,
    pillTilt: -2,
  },
  {
    id: "m3",
    left: "AI",
    right: "AGENTS",
    note: "We turn autonomous coding workflows and LLMs into tools that feel effortless.",
    posClass: "left-1/2 -translate-x-1/2 top-[865px]",
    icon: Cpu,
    at: 0.54,
    pillTilt: -1.5,
  },
  {
    id: "m4",
    left: "NEWSLETTER",
    right: "ENGINE",
    note: "We craft visual pastel-card dispatches that land directly in thousands of inboxes.",
    posClass: "left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[10%] top-[1245px]",
    icon: Newspaper,
    at: 0.72,
    pillTilt: -2.5,
  },
  {
    id: "m5",
    left: "BUILD IN",
    right: "PUBLIC",
    note: "We keep all the moving parts shipping in the open, from the first commit to launch.",
    posClass: "left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[12%] top-[1615px]",
    icon: Eye,
    at: 0.86,
    pillTilt: -2,
  },
];

// Desktop 1440x1880 SVG path
const ROADMAP_PATH_DESKTOP =
  "M 1440 65 C 1190 95, 1020 175, 920 250 C 830 315, 815 430, 885 450 C 960 470, 980 330, 880 300 C 720 255, 410 380, 285 545 C 175 685, 320 805, 565 865 C 825 930, 1085 980, 1040 1185 C 995 1385, 680 1280, 390 1310 C 210 1335, 195 1515, 315 1550 C 420 1580, 430 1425, 330 1410 C 210 1395, 185 1715, 0 1805";

// Mobile & Tablet portrait 420x1880 smooth S-curve ribbon (zero pinched loops or horizontal distortion!)
const ROADMAP_PATH_MOBILE =
  "M 420 60 C 310 90, 210 140, 210 230 C 210 340, 340 410, 340 530 C 340 650, 85 730, 85 880 C 85 1030, 335 1110, 335 1265 C 335 1420, 95 1500, 95 1635 C 95 1735, 55 1785, 0 1815";

export function WindingRoadmapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const livePathRef = useRef<SVGPathElement>(null);
  const mobileLivePathRef = useRef<SVGPathElement>(null);
  const endCapRef = useRef<SVGCircleElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pathEl = livePathRef.current;
      const mobPathEl = mobileLivePathRef.current;

      const setStrokeProgress = (progress: number) => {
        const clamped = Math.max(0, Math.min(1, progress));
        [pathEl, mobPathEl].forEach((el) => {
          if (!el) return;
          const len = el.getTotalLength();
          if (len > 0) {
            el.style.strokeDasharray = `${len}`;
            el.style.strokeDashoffset = `${len * (1 - clamped)}`;
          }
        });
      };

      setStrokeProgress(0);
      gsap.set(endCapRef.current, { scale: 0, transformOrigin: "center center" });

      const strokeProxy = { p: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          end: "bottom 85%",
          scrub: 0.65,
          invalidateOnRefresh: true,
          onRefresh: () => setStrokeProgress(strokeProxy.p),
        },
      });

      tl.to(
        strokeProxy,
        {
          p: 1,
          duration: 0.94,
          ease: "none",
          onUpdate: () => setStrokeProgress(strokeProxy.p),
        },
        0
      );

      // Pop in the left-edge exit cap right as the orange line finishes at t = 0.92
      tl.to(
        endCapRef.current,
        {
          scale: 1,
          duration: 0.06,
          ease: "back.out(2)",
        },
        0.92
      );

      // Animate each milestone node, icon badge & tilted white speech card in sync with the line
      MILESTONES.forEach((m, idx) => {
        const nodeEl = nodeRefs.current[idx];
        const iconEl = iconRefs.current[idx];
        const cardEl = cardRefs.current[idx];
        if (!nodeEl || !iconEl || !cardEl) return;

        const startT = Math.max(0, m.at - 0.14);
        tl.fromTo(
          nodeEl,
          { y: 48, opacity: 0.35 },
          { y: 0, opacity: 1, duration: 0.16, ease: "power2.out" },
          startT
        );
        tl.fromTo(
          iconEl,
          { scale: 0.72, rotation: -20 },
          { scale: 1, rotation: 6, duration: 0.16, ease: "back.out(1.8)" },
          startT + 0.02
        );
        tl.fromTo(
          cardEl,
          { y: 24, scale: 0.86, opacity: 0.25 },
          { y: 0, scale: 1, opacity: 1, duration: 0.16, ease: "power2.out" },
          startT + 0.03
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 right-1/2 -mx-[50vw] h-[1880px] w-screen overflow-hidden"
    >
      {/* Mobile & Tablet Portrait Smooth S-Curve SVG (Zero horizontal squashing!) */}
      <svg
        viewBox="0 0 420 1880"
        fill="none"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
        aria-hidden="true"
      >
        <path
          d={ROADMAP_PATH_MOBILE}
          stroke="rgba(240, 78, 24, 0.14)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          ref={mobileLivePathRef}
          d={ROADMAP_PATH_MOBILE}
          stroke="#F04E18"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 12px rgba(240, 78, 24, 0.45))" }}
        />
      </svg>

      {/* Desktop Full-Viewport Edge-to-Edge SVG Winding Line */}
      <svg
        viewBox="0 0 1440 1880"
        fill="none"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        aria-hidden="true"
      >
        {/* Subtle dark-orange pipeline under-track */}
        <path
          d={ROADMAP_PATH_DESKTOP}
          stroke="rgba(240, 78, 24, 0.16)"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        {/* Live GSAP ScrollTrigger-scrubbed vibrant orange line */}
        <path
          ref={livePathRef}
          d={ROADMAP_PATH_DESKTOP}
          stroke="#F04E18"
          strokeWidth="7.5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 12px rgba(240, 78, 24, 0.4))" }}
        />
        {/* Entry cap on far right edge */}
        <circle cx="1430" cy="65" r="12" fill="#F04E18" stroke="#0E1B2A" strokeWidth="4" />
        {/* Exit cap on far left-middle edge */}
        <circle
          ref={endCapRef}
          cx="12"
          cy="1805"
          r="12"
          fill="#F04E18"
          stroke="#0E1B2A"
          strokeWidth="4"
        />
      </svg>

      {/* 5 Milestone Nodes positioned along the full-width winding curve */}
      <div className="relative z-10 mx-auto h-full w-full max-w-[1440px]">
        {MILESTONES.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              ref={(el) => {
                nodeRefs.current[idx] = el;
              }}
              className={`absolute flex w-[92vw] max-w-[350px] flex-col items-center will-change-transform md:w-auto md:max-w-none ${m.posClass}`}
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-center font-display text-2xl font-extrabold tracking-[-0.04em] text-[#FF6633] sm:gap-3 sm:text-5xl lg:text-[58px]">
                <span>{m.left}</span>
                <span
                  ref={(el) => {
                    iconRefs.current[idx] = el;
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[3px_3px_0px_#FFFFFF] transition-transform duration-200 hover:scale-110 sm:h-14 sm:w-14 sm:shadow-[4px_4px_0px_#FFFFFF]"
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span>{m.right}</span>
              </div>

              {/* High-contrast tilted white callout speech card */}
              <div
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                style={{ transform: `rotate(${m.pillTilt}deg)` }}
                className="mt-3.5 max-w-[340px] rounded-2xl border-2 border-[#F04E18] bg-[#FFFFFF] px-5 py-3 text-left text-[14px] font-semibold leading-snug text-[#0E1B2A] shadow-[0_12px_28px_rgba(0,0,0,0.4)] will-change-transform"
              >
                {m.note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
