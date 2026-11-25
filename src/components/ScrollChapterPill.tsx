"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { threshold: 0, label: "01 // HERO" },
  { threshold: 0.24, label: "02 // VIBE LABS" },
  { threshold: 0.56, label: "03 // ABOUT" },
  { threshold: 0.82, label: "04 // NEWSLETTER" },
];

/**
 * Floating Editorial Chapter & Scroll Progress Pill (bottom-left):
 * - Automatically fades out at the very bottom footer so it never overlaps the Studio button.
 */
export function ScrollChapterPill() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min(1, Math.max(0, window.scrollY / docHeight)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  let activeLabel = CHAPTERS[0].label;
  for (const ch of CHAPTERS) {
    if (progress >= ch.threshold) activeLabel = ch.label;
  }

  // Hide cleanly near the bottom footer where the "Studio" pill sits
  const hideNearFooter = progress > 0.94;

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-6 z-40 hidden items-center gap-3 rounded-full border border-white/20 bg-[#0E1B2A]/82 px-4 py-2 font-mono-tech text-[11px] font-bold uppercase tracking-[0.16em] text-[#F8EAE0] shadow-[0_10px_28px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-300 sm:flex ${
        hideNearFooter ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span>{activeLabel}</span>
      <div className="h-1 w-14 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-[#F04E18] transition-[width] duration-75"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
