"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const FACE_FRAMES = [
  { src: "/assets/preloader/face-1.png", rotate: 0 },
  { src: "/assets/preloader/face-2.png", rotate: -4 },
  { src: "/assets/preloader/face-3.png", rotate: 3.5 },
  { src: "/assets/preloader/face-4.png", rotate: -3 },
  { src: "/assets/preloader/face-5.png", rotate: 4 },
];

const HERO_ASSETS = [
  "/models/human_brain.glb",
  "/models/coffee_shop_cup.glb",
  "/models/macbook_laptop.glb",
  "/models/newspaper.glb",
  "/models/dumbell_low-poly.glb",
  "/assets/section1/faces/normal.png?v=7",
];

/**
 * Stop-Motion Die-Cut Face GIF Preloader (trevornoah.com/about style):
 * - Top: Crisp 00% -> 100% tabular counter + Signal Orange progress bar.
 * - Center: Small snappy stop-motion cutout GIF cycling all 5 transparent face stickers (starting on face-1.png).
 * - Preloads the 3D .glb hero assets in the background, locks scroll at y=0, and exits with a silky Navy/Orange curtain wipe.
 */
export function PreloaderOverlay() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);

  const mainCurtainRef = useRef<HTMLDivElement>(null);
  const accentCurtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Snappy stop-motion GIF face cycle (starts on face-1.png!)
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % FACE_FRAMES.length);
    }, 220);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let cancelled = false;
    let loadedCount = 0;
    const totalAssets = HERO_ASSETS.length;
    const progressState = { val: 0 };

    const updateProgressUI = () => {
      const rounded = Math.min(100, Math.round(progressState.val));
      setPct(rounded);
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progressState.val / 100})`;
      }
    };

    const finishPreloader = () => {
      if (cancelled) return;
      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = prevOverflow;
          window.scrollTo(0, 0);
          setDone(true);
        },
      });

      exitTl.to(progressState, {
        val: 100,
        duration: 0.28,
        ease: "power2.out",
        onUpdate: updateProgressUI,
      });

      exitTl.to(
        contentRef.current,
        {
          y: -28,
          opacity: 0,
          scale: 0.94,
          duration: 0.3,
          ease: "power3.in",
        },
        "+=0.06"
      );

      exitTl.to(
        mainCurtainRef.current,
        {
          yPercent: -100,
          duration: 0.68,
          ease: "expo.inOut",
        },
        "-=0.1"
      );

      exitTl.to(
        accentCurtainRef.current,
        {
          yPercent: -100,
          duration: 0.74,
          ease: "expo.inOut",
        },
        "-=0.58"
      );
    };

    // Smooth baseline ramp so counter moves fluidly from 0 -> ~88% while assets load
    const baseTween = gsap.to(progressState, {
      val: 88,
      duration: 1.45,
      ease: "power2.inOut",
      onUpdate: updateProgressUI,
    });

    // Preload all 5 cutout face frames + 3D hero assets in parallel
    FACE_FRAMES.forEach((f) => {
      const img = new window.Image();
      img.src = f.src;
    });

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1450));
    const maxCap = new Promise<void>((resolve) => setTimeout(resolve, 3200));

    const assetsPromise = Promise.all(
      HERO_ASSETS.map((url) =>
        fetch(url, { cache: "force-cache" })
          .catch(() => null)
          .finally(() => {
            loadedCount += 1;
            const target = Math.min(96, Math.round((loadedCount / totalAssets) * 96));
            if (target > progressState.val) {
              gsap.to(progressState, {
                val: target,
                duration: 0.25,
                ease: "power1.out",
                onUpdate: updateProgressUI,
              });
            }
          })
      )
    ).then(() => undefined);

    Promise.race([Promise.all([minDelay, assetsPromise]), maxCap]).then(() => {
      baseTween.kill();
      finishPreloader();
    });

    return () => {
      cancelled = true;
      baseTween.kill();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (done) return null;

  const activeFrame = FACE_FRAMES[frameIdx];

  return (
    <div
      aria-label="Loading Ankur Fulzele"
      className="pointer-events-auto fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Trailing Signal Orange Accent Ribbon */}
      <div
        ref={accentCurtainRef}
        className="absolute inset-0 bg-[#F04E18] will-change-transform"
      />

      {/* Primary Deep Navy Curtain */}
      <div
        ref={mainCurtainRef}
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#0E1B2A] px-6 text-[#F8EAE0] will-change-transform"
      >
        <div ref={contentRef} className="flex flex-col items-center text-center will-change-transform">
          {/* TOP: 00 -> 100% Loading Counter + Razor Progress Bar */}
          <p className="font-mono-tech text-[10.5px] font-bold uppercase tracking-[0.28em] text-[#F8EAE0]/55">
            ANKUR FULZELE · LOADING
          </p>
          <div className="mt-2 font-condensed text-[clamp(2.8rem,6vw,4.5rem)] leading-none tabular-nums tracking-tight text-[#F8EAE0]">
            {String(pct).padStart(2, "0")}
            <span className="text-[#F04E18]">%</span>
          </div>

          <div className="mt-3 h-[3px] w-44 overflow-hidden rounded-full bg-white/12 sm:w-52">
            <div
              ref={barRef}
              style={{ transform: "scaleX(0)" }}
              className="h-full w-full origin-left bg-[#F04E18] will-change-transform"
            />
          </div>

          {/* CENTER: Stop-Motion Die-Cut Face Sticker GIF */}
          <div className="relative mt-7 flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
            {/* Render all 5 frames stacked & toggle visibility for zero flicker */}
            {FACE_FRAMES.map((frame, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={frame.src}
                src={frame.src}
                alt="Ankur Fulzele expression"
                style={{
                  opacity: idx === frameIdx ? 1 : 0,
                  transform: `rotate(${frame.rotate}deg) scale(${idx === frameIdx ? 1 : 0.96})`,
                }}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)] transition-transform duration-100"
              />
            ))}
          </div>

          <p className="mt-4 font-mono-tech text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#F4A938]/90">
            {activeFrame.rotate === 0 ? "WARMING UP VIBE LABS" : "SHIP SAAS ON VIBES."}
          </p>
        </div>
      </div>
    </div>
  );
}
