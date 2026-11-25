"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Mail, Newspaper, Twitter, Youtube } from "lucide-react";
import { BrainModelsCanvas } from "@/components/BrainModelsCanvas";

gsap.registerPlugin(ScrollTrigger);

type GazeKey =
  | "normal"
  | "up"
  | "down"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "cross-eyed";

const FACE_URLS: Record<GazeKey, string> = {
  normal: "/assets/section1/faces/normal.png?v=7",
  up: "/assets/section1/faces/up.png?v=5",
  down: "/assets/section1/faces/down.png?v=5",
  left: "/assets/section1/faces/top-left.png?v=5",
  right: "/assets/section1/faces/right.png?v=5",
  "top-left": "/assets/section1/faces/left.png?v=5",
  "top-right": "/assets/section1/faces/top-right.png?v=5",
  "bottom-left": "/assets/section1/faces/bottom-left.png?v=5",
  "bottom-right": "/assets/section1/faces/bottom-right.png?v=5",
  "cross-eyed": "/assets/section1/faces/cross-eyed.png?v=5",
};

const MANIFESTO_WORDS =
  "Half engineer, half endurance athlete — basically I pay money to suffer in gyms and write code for free until someone clicks buy.".split(
    " "
  );

export function Section1Hero() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const heroRigRef = useRef<HTMLDivElement>(null);
  const headContainerRef = useRef<HTMLDivElement>(null);
  const heroSocialsRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [gaze, setGaze] = useState<GazeKey>("normal");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Object.values(FACE_URLS).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  function updateGazeAtPoint(clientX: number, clientY: number) {
    const headEl = headContainerRef.current;
    if (!headEl) return;

    const nx = clientX / window.innerWidth - 0.5;
    const ny = clientY / window.innerHeight - 0.5;
    setParallax({ x: nx * 20, y: ny * 14 });

    const rect = headEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.52;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < 48) {
      setGaze("cross-eyed");
      return;
    }
    if (dist < 110) {
      setGaze("normal");
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -22 && angle < 22) setGaze("right");
    else if (angle >= 22 && angle < 66) setGaze("bottom-right");
    else if (angle >= 66 && angle < 114) setGaze("down");
    else if (angle >= 114 && angle < 158) setGaze("bottom-left");
    else if (angle >= 158 || angle < -158) setGaze("left");
    else if (angle >= -158 && angle < -118) setGaze("top-left");
    else if (angle >= -118 && angle < -62) setGaze("up");
    else setGaze("top-right");
  }

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 639px)",
        isTablet: "(min-width: 640px) and (max-width: 1023px)",
        isDesktop: "(min-width: 1024px)",
      },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top top",
            end: isMobile ? "+=360%" : "+=580%",
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: isMobile ? 0.95 : 1.5,
          },
        });

        // Beat 1: Title & socials glide UP while locked Head + 3D Rig rises smoothly to reveal the full face & chin
        tl.fromTo(
          titleRef.current,
          { y: 0, opacity: 1 },
          { y: -220, opacity: 0, duration: 0.18, ease: "power1.inOut" },
          0
        );
        tl.fromTo(
          heroSocialsRef.current,
          { y: 0, opacity: 1 },
          { y: -28, opacity: 0, duration: 0.14, ease: "power1.out" },
          0
        );
        tl.fromTo(
          heroRigRef.current,
          { y: "0vh" },
          { y: isMobile ? "-10vh" : "-18vh", duration: 0.18, ease: "power1.inOut" },
          0
        );

        // Beat 2: Locked Head + 3D Rig glides cleanly UPWARD and out of frame together
        tl.to(
          heroRigRef.current,
          {
            y: "-130vh",
            duration: 0.2,
            ease: "power2.inOut",
          },
          0.2
        );

        // Beat 3A: Manifesto glides into the DEAD MIDDLE of the screen and LOCKS in place
        tl.fromTo(
          statementRef.current,
          { y: 75, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.1, ease: "power2.out" },
          0.38
        );

        // Beat 3B: Word-by-word reveal
        wordRefs.current.forEach((el, idx) => {
          if (!el) return;
          const t = 0.5 + (idx / MANIFESTO_WORDS.length) * 0.78;
          const w = MANIFESTO_WORDS[idx].toLowerCase();
          const isHighlight = w.includes("endurance") || w.includes("buy");
          tl.to(el, { color: "#F04E18", duration: 0.08, ease: "none" }, t);
          if (!isHighlight) {
            tl.to(el, { color: "#FFFFFF", duration: 0.1, ease: "none" }, t + 0.08);
          }
        });

        // Beat 3C: Glide upward after reveal finishes
        tl.to(
          statementRef.current,
          { y: -160, opacity: 0.15, duration: 0.2, ease: "power1.in" },
          1.42
        );
      },
      triggerRef
    );

    return () => mm.revert();
  }, []);

  const activeFaceSrc = FACE_URLS[gaze];

  return (
    <section
      ref={triggerRef}
      onMouseMove={(e) => updateGazeAtPoint(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) updateGazeAtPoint(touch.clientX, touch.clientY);
      }}
      onMouseLeave={() => {
        setGaze("normal");
        setParallax({ x: 0, y: 0 });
      }}
      className="relative h-[100svh] w-full overflow-hidden bg-transparent"
    >
      {/* LAYER 1 (BACK, z-10): Giant Bold Uppercase "ANKUR FULZELE" directly BEHIND the 3D physical objects! */}
      <h1
        ref={titleRef}
        className="pointer-events-none absolute left-0 right-0 top-[18%] z-10 select-none whitespace-nowrap px-2 text-center font-display text-[11.5vw] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] text-[#F04E18] will-change-transform sm:top-[16%] sm:text-[12.6vw] lg:top-[8%] lg:text-[13.5vw]"
      >
        ANKUR FULZELE
      </h1>

      {/* LOCKED HERO RIG (z-20): Aspect-Locked Shared Unit centered cleanly above social icons on mobile! */}
      <div ref={heroRigRef} className="absolute inset-0 z-20 will-change-transform">
        <div
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: "transform 180ms ease-out",
          }}
          className="relative flex h-full w-full items-end justify-center will-change-transform"
        >
          <div
            ref={headContainerRef}
            className="relative bottom-[14svh] aspect-[1/1.05] w-[90vw] max-w-[410px] sm:-bottom-[6vh] sm:w-[82vw] sm:max-w-[610px] lg:-bottom-[20vh] lg:w-[740px] lg:max-w-[740px]"
          >
            {/* 3D Canvas — locked to the top 68% of the head box so the 5 props sit directly inside the torn forehead! */}
            <div className="absolute inset-x-0 -top-[6%] z-10 h-[72%] w-full">
              <BrainModelsCanvas />
            </div>

            {/* Torn-Head Cutout — locked to the bottom 82% of the exact same box! */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[82%] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeFaceSrc}
                alt="Ankur Fulzele"
                className="h-full w-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SOCIAL ICON BAR */}
      <div
        ref={heroSocialsRef}
        className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 will-change-transform sm:bottom-8 sm:left-auto sm:right-10 sm:translate-x-0 sm:gap-3.5"
      >
        <a
          href="https://x.com/AnkurBuilds"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          data-magnetic="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-white/35 bg-[#0E1B2A]/60 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0E1B2A] sm:h-13 sm:w-13 lg:h-14 lg:w-14 lg:bg-transparent"
        >
          <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
        <a
          href="https://github.com/AnkurFulzele21"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          data-magnetic="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-white/35 bg-[#0E1B2A]/60 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0E1B2A] sm:h-13 sm:w-13 lg:h-14 lg:w-14 lg:bg-transparent"
        >
          <Github className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
        <a
          href="https://www.youtube.com/@ankurfulzele"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          data-magnetic="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-white/35 bg-[#0E1B2A]/60 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0E1B2A] sm:h-13 sm:w-13 lg:h-14 lg:w-14 lg:bg-transparent"
        >
          <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
        <Link
          href="/newsletter"
          aria-label="Newsletter"
          data-magnetic="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-white/35 bg-[#0E1B2A]/60 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0E1B2A] sm:h-13 sm:w-13 lg:h-14 lg:w-14 lg:bg-transparent"
        >
          <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <a
          href="mailto:hello@ankurfulzele.in"
          aria-label="Email"
          data-magnetic="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-white/35 bg-[#0E1B2A]/60 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0E1B2A] sm:h-13 sm:w-13 lg:h-14 lg:w-14 lg:bg-transparent"
        >
          <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
      </div>

      {/* LAYER 4: High-Contrast Scroll-Scrubbed Color-Wave Manifesto */}
      <div
        ref={statementRef}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 opacity-0 sm:px-8"
      >
        <h2 className="max-w-5xl text-center font-display text-[clamp(1.55rem,4vw,3.85rem)] font-bold leading-[1.14] tracking-[-0.03em]">
          {MANIFESTO_WORDS.map((word, idx) => (
            <span
              key={idx}
              ref={(el) => {
                wordRefs.current[idx] = el;
              }}
              style={{ color: "rgba(248, 234, 224, 0.38)" }}
              className="mr-[0.24em] inline-block"
            >
              {word}
            </span>
          ))}
        </h2>
        <p className="mt-5 font-mono-tech text-[12px] font-bold uppercase tracking-[0.26em] text-[#F04E18] sm:mt-8 sm:text-[15px]">
          — Ankur Fulzele
        </p>
      </div>
    </section>
  );
}
