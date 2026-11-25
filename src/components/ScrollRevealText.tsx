"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export interface StickerBadge {
  text: string;
  at: number;
  positionClass?: string;
  rotate: number;
  bg?: string;
  fg?: string;
}

interface ScrollRevealTextProps {
  text: string;
  theme: "dark" | "cream";
  stickers?: StickerBadge[];
  sizeClass?: string;
  eyebrow?: string;
  trackHeightClass?: string;
}

/**
 * Pinned Center-Screen Storytelling Text Reveal (Exact 00:53-01:26 & 02:24-02:35 from Video 3.32.21 PM!):
 * 1. Slides smoothly up to the MIDDLE of the screen FIRST while all words remain in their initial muted state.
 * 2. Locks/pins in the middle of the screen (`sticky top-0 h-screen`) while words slowly illuminate one-by-one
 *    from start to finish (and scattered stickers pop in around the text).
 * 3. Only AFTER the final word finishes illuminating does the block release and glide upward to the next section!
 * 4. Eyebrow moves 1:1 with the paragraph container so it NEVER overlaps the first line of text.
 */
export function ScrollRevealText({
  text,
  theme,
  stickers = [],
  sizeClass = "text-[clamp(2rem,4.6vw,4.25rem)]",
  eyebrow,
  trackHeightClass = "h-[380vh]",
}: ScrollRevealTextProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.35", "end 0.65"],
  });

  // Extra-slow, silky spring damping so every word melts smoothly from muted -> orange -> ink
  const smooth = useSpring(scrollYProgress, { stiffness: 26, damping: 16, mass: 1.0 });

  // Slides into center during [0 -> 0.12], STAYS locked at y=0 during [0.12 -> 0.90] while words slowly color in, then glides up [0.90 -> 1]
  const containerY = useTransform(smooth, [0, 0.12, 0.9, 1], [65, 0, 0, -65]);
  const containerOpacity = useTransform(smooth, [0, 0.1, 0.92, 1], [0.35, 1, 1, 0.4]);

  const words = text.split(" ");

  return (
    <div ref={trackRef} className={`relative w-full ${trackHeightClass}`}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-6">
        <motion.div
          style={{ y: containerY, opacity: containerOpacity }}
          className="relative mx-auto max-w-6xl px-4 text-center will-change-transform"
        >
          {eyebrow && (
            <p
              className={`mb-6 font-mono-tech text-[12px] font-bold uppercase tracking-[0.24em] ${
                theme === "dark" ? "text-[#F4A938]" : "text-[#0E1B2A]/80"
              }`}
            >
              {eyebrow}
            </p>
          )}

          <p className={`font-display font-bold leading-[1.08] tracking-[-0.035em] ${sizeClass}`}>
            {words.map((word, idx) => {
              // Color sweep ONLY starts at 0.13 (AFTER the text is locked in the middle of the screen!)
              // and unfolds slowly across 340vh of scroll until 0.89
              const start = 0.13 + (idx / words.length) * 0.64;
              const mid = start + 0.06;
              const end = Math.min(0.9, start + 0.13);
              return (
                <WaveWord
                  key={idx}
                  word={word}
                  progress={smooth}
                  range={[start, mid, end]}
                  theme={theme}
                />
              );
            })}
          </p>

          {/* Scattered dynamic pop-up stickers floating around the text */}
          {stickers.map((s, i) => (
            <PopSticker key={i} sticker={s} progress={smooth} index={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function WaveWord({
  word,
  progress,
  range,
  theme,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number, number];
  theme: "dark" | "cream";
}) {
  const fadedColor =
    theme === "dark" ? "rgba(248, 234, 224, 0.34)" : "rgba(14, 27, 42, 0.26)";
  const peakColor = "#F04E18";
  const finalColor = theme === "dark" ? "#FFFFFF" : "#0E1B2A";

  const color = useTransform(progress, range, [fadedColor, peakColor, finalColor]);

  return (
    <motion.span style={{ color }} className="mr-[0.22em] inline-block">
      {word}
    </motion.span>
  );
}

const DEFAULT_SCATTER = [
  "-top-6 right-[10%]",
  "top-[46%] left-[4%]",
  "-bottom-6 right-[16%]",
];

function PopSticker({
  sticker,
  progress,
  index,
}: {
  sticker: StickerBadge;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const scale = useTransform(progress, [sticker.at - 0.06, sticker.at + 0.05], [0, 1]);
  const opacity = useTransform(progress, [sticker.at - 0.06, sticker.at + 0.03], [0, 1]);
  const y = useTransform(progress, [sticker.at - 0.08, 1], [48, -55]);
  const pos = sticker.positionClass || DEFAULT_SCATTER[index % DEFAULT_SCATTER.length];

  return (
    <motion.span
      style={{
        scale,
        opacity,
        y,
        rotate: sticker.rotate,
        backgroundColor: sticker.bg || "#F04E18",
        color: sticker.fg || "#FFFFFF",
      }}
      className={`pointer-events-none absolute z-20 hidden rounded-full border-2 border-[#0E1B2A] px-4 py-1.5 font-sans text-[13px] font-bold tracking-normal shadow-[0_10px_22px_rgba(14,27,42,0.28)] will-change-transform sm:inline-block ${pos}`}
    >
      {sticker.text}
    </motion.span>
  );
}
