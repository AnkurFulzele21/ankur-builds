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
 * Pure Minimal Stop-Motion Cutout Face Preloader:
 * - Zero text, zero counters, zero rings, zero bars — ONLY the stop-motion die-cut face GIF centered on Deep Navy.
 */
export function PreloaderOverlay() {
  const [done, setDone] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);

  const mainCurtainRef = useRef<HTMLDivElement>(null);
  const accentCurtainRef = useRef<HTMLDivElement>(null);
  const faceWrapRef = useRef<HTMLDivElement>(null);

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

    const finishPreloader = () => {
      if (cancelled) return;
      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = prevOverflow;
          window.scrollTo(0, 0);
          setDone(true);
        },
      });

      exitTl.to(faceWrapRef.current, {
        scale: 0.88,
        opacity: 0,
        duration: 0.28,
        ease: "power3.in",
      });

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

    FACE_FRAMES.forEach((f) => {
      const img = new window.Image();
      img.src = f.src;
    });

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1350));
    const maxCap = new Promise<void>((resolve) => setTimeout(resolve, 3000));

    const assetsPromise = Promise.all(
      HERO_ASSETS.map((url) => fetch(url, { cache: "force-cache" }).catch(() => null))
    ).then(() => undefined);

    Promise.race([Promise.all([minDelay, assetsPromise]), maxCap]).then(() => {
      finishPreloader();
    });

    return () => {
      cancelled = true;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (done) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[9999] overflow-hidden">
      <div
        ref={accentCurtainRef}
        className="absolute inset-0 bg-[#F04E18] will-change-transform"
      />
      <div
        ref={mainCurtainRef}
        className="absolute inset-0 flex items-center justify-center bg-[#0E1B2A] will-change-transform"
      >
        <div
          ref={faceWrapRef}
          className="relative h-40 w-40 will-change-transform sm:h-48 sm:w-48"
        >
          {FACE_FRAMES.map((frame, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={frame.src}
              src={frame.src}
              alt=""
              style={{
                opacity: idx === frameIdx ? 1 : 0,
                transform: `rotate(${frame.rotate}deg) scale(${idx === frameIdx ? 1 : 0.96})`,
              }}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)] transition-transform duration-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
