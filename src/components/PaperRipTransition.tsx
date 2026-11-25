"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface PaperRipTransitionProps {
  fromColor: string;
  toColor: string;
  stripImage: string;
}

/**
 * Multi-Layered Scroll-Scrubbed Diagonal Torn-Paper Wipe (02:41-02:51 in Video 3.32.21 PM!):
 * - Replaces static scrolling with a dynamic 2-layer parallax paper-peel & diagonal lift:
 *   1. Back paper fiber shadow layer rises and shifts horizontally (`x: -36 -> 0`, `y: 150 -> 14`).
 *   2. Front photographic torn-paper layer peels upward with 3D tilt & scale (`y: 120 -> 0`, `rotate: 2.2 -> 0`, `scale: 1.06 -> 1`).
 *   3. Zero horizontal seam line: pure `fromColor` outer background + solid `toColor` lower skirt overlap.
 */
export function PaperRipTransition({
  fromColor,
  toColor,
  stripImage,
}: PaperRipTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.25"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  // Foreground torn sheet peel motion
  const frontY = useTransform(smooth, [0, 1], [115, 0]);
  const frontRotate = useTransform(smooth, [0, 1], [2.4, 0]);
  const frontScale = useTransform(smooth, [0, 1], [1.06, 1]);

  // Secondary trailing paper-fiber layer for real parallax depth
  const backY = useTransform(smooth, [0, 1], [165, 18]);
  const backX = useTransform(smooth, [0, 1], [-42, 0]);
  const backRotate = useTransform(smooth, [0, 1], [-1.8, 0]);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: fromColor }}
      className="relative -mt-1 -mb-2 w-full overflow-hidden border-0 pt-10"
    >
      {/* LAYER 1 (BACK): Trailing paper-fiber parallax sheet */}
      <motion.div
        style={{ y: backY, x: backX, rotate: backRotate, scale: 1.08 }}
        className="pointer-events-none absolute inset-x-0 top-6 z-10 w-full opacity-45 will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stripImage}
          alt=""
          className="block w-full select-none object-cover brightness-95"
        />
      </motion.div>

      {/* LAYER 2 (FRONT): Main photographic torn-paper edge rising & flattening with deep cast shadow */}
      <motion.div
        style={{ y: frontY, rotate: frontRotate, scale: frontScale }}
        className="relative z-20 w-full origin-bottom-left will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stripImage}
          alt=""
          className="-mb-2 block w-full select-none object-cover drop-shadow-[0_-18px_28px_rgba(0,0,0,0.42)]"
        />
        <div style={{ backgroundColor: toColor }} className="h-32 w-full" />
      </motion.div>
    </div>
  );
}
