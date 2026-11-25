"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteSubpageHeader } from "@/components/SiteSubpageHeader";
import { Floating3DProp } from "@/components/Floating3DProp";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import type { SiteSettings } from "@/lib/beehiiv-db";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_SETTINGS = {
  twitter_url: "https://x.com/AnkurBuilds",
  sender_email: "hello@ankurfulzele.in",
} as SiteSettings;

const GRIND_PLATES = [
  {
    num: "01",
    kicker: "HYBRID RACING",
    title: "HYROX Competitions",
    desc: "Running and functional workout stations back-to-back — sled pushes, sled pulls, burpee broad jumps, rowing, farmers carry, lunges, and wall balls.",
    tags: ["HYROX", "Functional Endurance", "Sleds & Runs", "Grit"],
    bg: "#F04E18",
    fg: "#FFFFFF",
    muted: "rgba(255, 255, 255, 0.85)",
    accent: "#0E1B2A",
  },
  {
    num: "02",
    kicker: "FUNCTIONAL CIRCUIT",
    title: "Double Circuit Challenges",
    desc: "High-intensity strength and conditioning competitions testing anaerobic capacity, mental toughness, and pacing under heavy fatigue.",
    tags: ["Double Circuit", "Strength & Conditioning", "Competition", "Mental Toughness"],
    bg: "#F6E24B",
    fg: "#0E1B2A",
    muted: "rgba(14, 27, 42, 0.75)",
    accent: "#0E1B2A",
  },
  {
    num: "03",
    kicker: "ROAD ENDURANCE",
    title: "Marathons & Finisher Medals",
    desc: "Early-morning long runs, disciplined weekly mileage, and crossing marathon finish lines with medals earned on the road.",
    tags: ["Marathons", "Finisher Medals", "Road Running", "Endurance"],
    bg: "#FAF7F2",
    fg: "#0E1B2A",
    muted: "rgba(14, 27, 42, 0.72)",
    accent: "#F04E18",
  },
  {
    num: "04",
    kicker: "THE PARALLEL",
    title: "Athlete × Solo Builder",
    desc: "Endurance racing and solo SaaS run on the exact same engine: show up daily when nobody is clapping, embrace discomfort, and finish.",
    tags: ["Discipline", "LifeOS", "75 Hard", "Daily Execution"],
    bg: "#13253A",
    fg: "#F8EAE0",
    muted: "rgba(248, 234, 224, 0.72)",
    accent: "#F04E18",
  },
];

const WEEKLY_RHYTHM = [
  {
    day: "MON",
    training: "Strength + Threshold Run",
    building: "Architecture & new feature sprint",
  },
  {
    day: "TUE",
    training: "HYROX Station Conditioning",
    building: "Deep-work coding & LifeOS updates",
  },
  {
    day: "WED",
    training: "Easy Aerobic Mileage",
    building: "Ship Wednesday SaaS Vibes Story",
  },
  {
    day: "THU",
    training: "Double Circuit & Intervals",
    building: "AI workflows & distribution plays",
  },
  {
    day: "FRI",
    training: "Heavy Compound Lifts",
    building: "Production deploys before weekend",
  },
  {
    day: "SAT",
    training: "Long Run / Race Prep",
    building: "Weekend micro-SaaS experiments",
  },
  {
    day: "SUN",
    training: "Active Recovery & Mobility",
    building: "Ship Sunday SaaS Vibes Brief",
  },
];

export function DailyGrindExperience() {
  const worldRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const hero3DRef = useRef<HTMLDivElement>(null);
  const horizontalStageRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const orangeMorphRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

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
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: hero3DRef.current,
          start: "top 15%",
          end: "bottom top",
          scrub: 1,
        },
      });

      if (horizontalStageRef.current && horizontalTrackRef.current) {
        const getDist = () => {
          const trackW = horizontalTrackRef.current?.scrollWidth || 0;
          return Math.max(0, trackW - window.innerWidth + 120);
        };

        gsap.to(horizontalTrackRef.current, {
          x: () => -getDist(),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalStageRef.current,
            start: "top top",
            end: () => `+=${Math.max(1200, getDist() * 1.25)}`,
            pin: true,
            scrub: 1.15,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }

      gsap.fromTo(
        worldRef.current,
        { backgroundColor: "#0E1B2A" },
        {
          backgroundColor: "#F04E18",
          ease: "none",
          scrollTrigger: {
            trigger: orangeMorphRef.current,
            start: "top 85%",
            end: "bottom 25%",
            scrub: 0.9,
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

  return (
    <div
      ref={worldRef}
      className="relative min-h-screen overflow-x-clip bg-[#0E1B2A] text-[#F8EAE0] selection:bg-[#F04E18] selection:text-white"
    >
      <CustomCursor />
      <SiteSubpageHeader theme="navy" />

      {/* SCENE 1: CINEMATIC 3D DUMBBELL + GIANT KINETIC COVER */}
      <div className="relative flex min-h-[calc(100svh-68px)] flex-col items-center justify-center overflow-hidden px-5 pb-12 pt-6 sm:px-8">
        <div
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(240, 78, 24, 0.18) 0%, rgba(14, 27, 42, 0) 58%)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        <h1
          ref={heroTitleRef}
          className="pointer-events-none relative z-10 select-none text-center font-condensed text-[clamp(4.6rem,19vw,17.5rem)] uppercase leading-[0.82] tracking-[-0.02em] text-[#F8EAE0] will-change-transform"
        >
          DAILY <span className="text-[#F04E18]">GRIND</span>
        </h1>

        <div
          ref={hero3DRef}
          className="relative z-20 -mt-[12svh] h-[42svh] w-[320px] will-change-transform sm:-mt-[16svh] sm:h-[50svh] sm:w-[460px]"
        >
          <Floating3DProp
            url="/models/dumbell_low-poly.glb"
            targetSize={2.8}
            baseRotation={[0.25, -0.38, 1.32]}
          />
        </div>

        <motion.div
          drag
          dragElastic={0.25}
          dragMomentum
          whileDrag={{ scale: 1.12 }}
          data-cursor="drag"
          className="absolute left-[8%] top-[24%] z-30 hidden -rotate-6 cursor-grab select-none border-2 border-[#0E1B2A] bg-[#F4A938] px-4 py-1.5 font-display text-sm font-extrabold uppercase text-[#0E1B2A] shadow-[4px_4px_0px_#000] active:cursor-grabbing lg:block"
        >
          HYROX COMPETITOR
        </motion.div>

        <motion.div
          drag
          dragElastic={0.25}
          dragMomentum
          whileDrag={{ scale: 1.12 }}
          data-cursor="drag"
          className="absolute right-[9%] top-[28%] z-30 hidden rotate-6 cursor-grab select-none rounded-full bg-[#F04E18] px-4 py-1.5 font-mono-tech text-xs font-bold uppercase text-white shadow-[0_14px_30px_rgba(0,0,0,0.45)] active:cursor-grabbing lg:block"
        >
          MARATHON FINISHER
        </motion.div>

        <p className="relative z-20 -mt-2 max-w-xl text-center font-mono-tech text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#F8EAE0]/65">
          HYROX · DOUBLE CIRCUIT · MARATHONS · HYBRID ATHLETE × SOLO BUILDER
        </p>
      </div>

      {/* SCENE 2: SCROLL-SCRUBBED ATHLETE MANIFESTO */}
      <ScrollRevealText
        theme="dark"
        eyebrow="THE GRIND // BEYOND THE KEYBOARD"
        trackHeightClass="h-[165vh]"
        sizeClass="text-[30px] sm:text-[50px] lg:text-[62px]"
        text="Half engineer, half endurance athlete — shipping code by day and chasing finish lines on the course."
        stickers={[
          {
            text: "HYROX & Double Circuit",
            at: 0.36,
            positionClass: "top-[24%] right-[12%]",
            rotate: -4,
          },
          {
            text: "Marathon Medals",
            at: 0.64,
            positionClass: "bottom-[14%] left-[12%]",
            rotate: -5,
            bg: "#F4A938",
            fg: "#0E1B2A",
          },
        ]}
      />

      {/* SCENE 3: PINNED HORIZONTAL EDITORIAL PLATES */}
      <div
        ref={horizontalStageRef}
        className="relative flex h-[100svh] w-full flex-col justify-center overflow-hidden bg-transparent py-10"
      >
        <div className="mx-auto mb-8 flex w-full max-w-6xl items-end justify-between px-5 sm:px-8">
          <h2 className="font-condensed text-[clamp(2.6rem,6.4vw,5.4rem)] uppercase leading-[0.88] text-[#F8EAE0]">
            THE <span className="text-[#F04E18]">ARENA</span>
          </h2>
          <span className="hidden font-mono-tech text-[11px] font-bold uppercase tracking-[0.22em] text-[#F8EAE0]/45 sm:inline">
            SCROLL ↓ TO GLIDE →
          </span>
        </div>

        <div
          ref={horizontalTrackRef}
          className="flex w-max items-stretch gap-7 pl-5 pr-20 will-change-transform sm:gap-9 sm:pl-14"
        >
          {GRIND_PLATES.map((plate) => (
            <motion.div
              key={plate.num}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{ backgroundColor: plate.bg, color: plate.fg }}
              className="flex h-[56svh] min-h-[380px] max-h-[480px] w-[82vw] max-w-[460px] shrink-0 flex-col justify-between rounded-[28px] p-7 shadow-[0_28px_64px_rgba(0,0,0,0.42)] sm:w-[440px] sm:p-9"
            >
              <div className="flex items-center justify-between font-mono-tech text-[11px] font-bold uppercase tracking-[0.18em]">
                <span style={{ color: plate.muted }}>ARENA {plate.num}</span>
                <span
                  style={{
                    backgroundColor: plate.accent,
                    color: plate.accent === "#0E1B2A" ? "#F8EAE0" : "#FFFFFF",
                  }}
                  className="rounded-full px-3 py-1 text-[10px]"
                >
                  {plate.kicker}
                </span>
              </div>

              <div className="my-auto py-4">
                <h3 className="font-condensed text-[clamp(2.3rem,4.4vw,3.6rem)] uppercase leading-[0.94] tracking-tight">
                  {plate.title}
                </h3>
                <p
                  style={{ color: plate.muted }}
                  className="mt-4 text-[15px] leading-relaxed sm:text-[16px]"
                >
                  {plate.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                {plate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-current/10 px-3 py-1 font-mono-tech text-[10.5px] font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SCENE 4: BORDERLESS 7-DAY HYBRID RHYTHM */}
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <h2 className="font-condensed text-[clamp(3rem,8vw,6.8rem)] uppercase leading-[0.88] text-[#F8EAE0]">
          THE HYBRID <span className="text-[#F04E18]">WEEK</span>
        </h2>

        <div className="mt-12 space-y-2">
          {WEEKLY_RHYTHM.map((item, idx) => {
            const active = hoveredDay === idx;
            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
                className="group relative grid items-center gap-4 overflow-hidden rounded-2xl px-4 py-6 transition-all duration-300 hover:bg-white/[0.06] sm:px-6 md:grid-cols-12"
              >
                <div className="flex items-center gap-4 md:col-span-3">
                  <span
                    className={`font-mono-tech text-sm font-bold transition-colors ${
                      active ? "text-[#F04E18]" : "text-[#F4A938]"
                    }`}
                  >
                    {item.day}
                  </span>
                  <span className="font-mono-tech text-[10.5px] font-bold uppercase tracking-widest text-[#F8EAE0]/45">
                    TRAINING × CODE
                  </span>
                </div>

                <div className="md:col-span-5">
                  <h3 className="font-display text-2xl font-extrabold text-white transition-transform duration-300 group-hover:translate-x-2.5 group-hover:text-[#F04E18]">
                    {item.training}
                  </h3>
                </div>

                <div className="md:col-span-4">
                  <p className="text-[14.5px] leading-relaxed text-[#F8EAE0]/75">{item.building}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6">
          <Link
            href="/vibe-labs"
            data-magnetic="true"
            className="group inline-flex items-center gap-3 font-display text-xl font-extrabold text-[#F8EAE0] transition hover:text-[#F4A938] sm:text-2xl"
          >
            <span>Explore the apps I built between races (Vibe Labs)</span>
            <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
          <a
            href="https://x.com/AnkurBuilds"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#F8EAE0] px-6 py-3 font-display text-[13.5px] font-extrabold text-[#0E1B2A] transition hover:bg-white"
          >
            Follow @AnkurBuilds ↗
          </a>
        </div>
      </div>

      <div ref={orangeMorphRef} aria-hidden="true" className="pointer-events-none h-[26vh] w-full" />

      <MicaelaFooter settings={FOOTER_SETTINGS} compact />
    </div>
  );
}
