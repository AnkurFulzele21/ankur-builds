"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface TornCollageTransitionProps {
  fromColor: string;
  toColor: string;
  tapeBg?: string;
  tapeText?: string;
  label: string;
  flip?: boolean;
}

/**
 * Trevor-Noah-style Torn Paper Collage Transition with Scroll-Scrubbed Diagonal Tape
 */
export function TornCollageTransition({
  fromColor,
  toColor,
  tapeBg = "#E85A2A",
  tapeText = "#EFE9DC",
  label,
  flip = false,
}: TornCollageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const tapeX = useTransform(smooth, [0, 1], flip ? ["-14%", "10%"] : ["10%", "-14%"]);
  const tearY = useTransform(smooth, [0, 1], [18, -18]);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: fromColor }}
      className="relative -my-1 h-28 w-full overflow-hidden sm:h-36"
    >
      {/* White paper fiber underside (gives realistic hand-torn collage depth) */}
      <motion.svg
        style={{ y: tearY }}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-1 left-0 h-24 w-full sm:h-28"
        aria-hidden="true"
      >
        <path
          d="M0,48 L48,32 L92,54 L145,28 L210,50 L268,24 L330,52 L392,30 L455,46 L520,22 L590,54 L650,26 L718,48 L785,20 L852,52 L920,28 L985,46 L1050,22 L1118,50 L1185,26 L1255,48 L1320,24 L1388,44 L1440,30 L1440,120 L0,120 Z"
          fill="#FAF6EE"
        />
      </motion.svg>

      {/* Main incoming section color tear */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 h-20 w-full sm:h-24"
        aria-hidden="true"
      >
        <path
          d="M0,56 L52,38 L96,60 L150,36 L216,58 L272,32 L336,60 L398,38 L460,54 L526,30 L596,62 L656,34 L724,56 L790,28 L858,60 L926,36 L992,54 L1056,30 L1124,58 L1190,34 L1260,56 L1326,32 L1392,52 L1440,38 L1440,120 L0,120 Z"
          fill={toColor}
        />
      </svg>

      {/* Scroll-scrubbed Risograph Collage Tape Strip */}
      <motion.div
        style={{
          x: tapeX,
          rotate: flip ? 1.8 : -1.8,
          backgroundColor: tapeBg,
          color: tapeText,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-y-2 border-[#151E28] px-10 py-2 font-mono-tech text-[11px] font-bold uppercase tracking-[0.22em] shadow-[0_6px_18px_rgba(21,30,40,0.22)]"
      >
        {label} · {label} · {label}
      </motion.div>
    </div>
  );
}

interface CablePlugTransitionProps {
  fromColor: string;
  toColor: string;
  cableColor?: string;
  plugAccent?: string;
  direction?: "rtl" | "ltr";
  label: string;
}

/**
 * Scroll-Scrubbed Technical Plug & Mouse Wire Transition:
 * As you scroll, a physical industrial plug + springy curved cable travels across the viewport
 * (right -> left or left -> right), literally dragging the next section's background color
 * across the screen and plugging into the socket!
 */
export function CablePlugTransition({
  fromColor,
  toColor,
  cableColor = "#E85A2A",
  plugAccent = "#F4A938",
  direction = "rtl",
  label,
}: CablePlugTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.2"],
  });

  // Spring physics gives the wire & plug realistic weight and momentum
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 0.9 });

  const isRtl = direction === "rtl";

  // Curtain wipe width follows the plug seamlessly from 0% -> 100%
  const wipeWidth = useTransform(smooth, [0.05, 0.92], ["0%", "100%"]);
  // Plug horizontal travel
  const plugLeft = useTransform(
    smooth,
    [0.05, 0.92],
    isRtl ? ["94%", "4%"] : ["4%", "92%"]
  );
  // Subtle physical cable sag / sway as the plug moves
  const plugTilt = useTransform(smooth, [0, 0.5, 1], isRtl ? [-7, 4, 0] : [7, -4, 0]);
  const ledOpacity = useTransform(smooth, [0.85, 0.95], [0.25, 1]);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: fromColor }}
      className="relative -my-1 h-40 w-full overflow-hidden border-y-2 border-[#151E28] sm:h-48"
    >
      {/* Incoming Section Color Curtain Dragged By The Plug */}
      <motion.div
        style={{
          width: wipeWidth,
          backgroundColor: toColor,
          right: isRtl ? 0 : "auto",
          left: isRtl ? "auto" : 0,
        }}
        className="absolute inset-y-0 z-10"
      />

      {/* Technical Blueprint Dashed Track */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 border-t-2 border-dashed border-[#151E28]/25" />

      {/* Center Scroll Label */}
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-[#151E28] bg-[#EFE9DC] px-4 py-1 font-mono-tech text-[10.5px] font-bold uppercase tracking-widest text-[#151E28] shadow-[3px_3px_0px_#151E28]">
        {label}
      </div>

      {/* Destination Wall Socket */}
      <div
        className={`absolute top-1/2 z-20 flex h-16 w-12 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 border-[#151E28] bg-[#EFE9DC] shadow-[4px_4px_0px_#151E28] ${
          isRtl ? "left-3 sm:left-6" : "right-3 sm:right-6"
        }`}
      >
        <motion.span
          style={{ opacity: ledOpacity, backgroundColor: plugAccent }}
          className="mb-1.5 h-2.5 w-2.5 rounded-full border border-[#151E28]"
        />
        <div className="flex gap-1.5">
          <span className="h-3 w-1 rounded-full bg-[#151E28]" />
          <span className="h-3 w-1 rounded-full bg-[#151E28]" />
        </div>
      </div>

      {/* Trailing Dynamic Curved Cable (follows the dragged curtain edge) */}
      <motion.div
        style={{
          width: wipeWidth,
          right: isRtl ? 0 : "auto",
          left: isRtl ? "auto" : 0,
        }}
        className="pointer-events-none absolute top-1/2 z-20 h-16 -translate-y-1/2 overflow-visible"
      >
        <svg viewBox="0 0 1000 80" preserveAspectRatio="none" className="h-full w-full">
          {/* Dark ink outline */}
          <path
            d="M0,40 Q250,74 500,40 T1000,40"
            fill="none"
            stroke="#151E28"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored braided cable */}
          <path
            d="M0,40 Q250,74 500,40 T1000,40"
            fill="none"
            stroke={cableColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Moving Physical Industrial Plug / Mouse Connector */}
      <motion.div
        style={{
          left: plugLeft,
          rotate: plugTilt,
        }}
        className="pointer-events-none absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`flex items-center ${isRtl ? "flex-row" : "flex-row-reverse"}`}
        >
          {/* Metal Prongs */}
          <div className="flex flex-col gap-2">
            <span className="h-2 w-5 rounded-sm border-2 border-[#151E28] bg-[#EFE9DC]" />
            <span className="h-2 w-5 rounded-sm border-2 border-[#151E28] bg-[#EFE9DC]" />
          </div>
          {/* Molded Plug Housing */}
          <div
            style={{ backgroundColor: plugAccent }}
            className="flex h-14 w-20 items-center justify-center rounded-2xl border-2 border-[#151E28] shadow-[5px_5px_0px_#151E28]"
          >
            <div className="flex flex-col gap-1">
              <span className="h-1 w-8 rounded-full bg-[#151E28]" />
              <span className="h-1 w-8 rounded-full bg-[#151E28]" />
              <span className="h-1 w-8 rounded-full bg-[#151E28]" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
