"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MotionFacePortraitProps {
  /** Optional URLs once you drop your 1-4 photos into /public/portraits/ */
  photos?: {
    center?: string;
    left?: string;
    right?: string;
    react?: string;
  };
  ownerName: string;
}

/**
 * Trevor-style Cursor-Tracking Motion Portrait:
 * - When you provide 1-4 face photos, moving the cursor left/center/right switches expressions
 *   with smooth 3D tilt + Risograph halftone framing.
 * - Until photos are added, renders an interactive Image-#8 Signal Studio Portrait card
 *   with live eye/signal tracking so the site looks finished immediately.
 */
export function MotionFacePortrait({ photos, ownerName }: MotionFacePortraitProps) {
  const [look, setLook] = useState<"left" | "center" | "right" | "react">("center");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const activePhoto =
    !imgError &&
    (look === "left"
      ? photos?.left || photos?.center
      : look === "right"
      ? photos?.right || photos?.center
      : look === "react"
      ? photos?.react || photos?.center
      : photos?.center);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1
    setTilt({ x: (0.5 - ny) * 14, y: (nx - 0.5) * 16 });
    if (nx < 0.35) setLook("left");
    else if (nx > 0.65) setLook("right");
    else setLook("center");
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setLook("center");
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setLook((prev) => (prev === "react" ? "center" : "react"))}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      style={{ transformPerspective: 900 }}
      className="group relative cursor-pointer overflow-hidden rounded-[28px] border-2 border-[#151E28] bg-[#26465C] p-6 shadow-[8px_8px_0px_#151E28]"
    >
      {/* Image #8 Signal Ribbons Behind Portrait */}
      <svg
        viewBox="0 0 360 360"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
        aria-hidden="true"
      >
        <path
          d="M-20,250 C90,220 170,120 380,60 L380,105 C180,160 110,255 -20,290 Z"
          fill="#E85A2A"
        />
        <path
          d="M-20,290 C110,255 180,160 380,105 L380,155 C195,205 130,290 -20,330 Z"
          fill="#F4A938"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-between gap-4">
        <div className="flex w-full items-center justify-between font-mono-tech text-[11px] uppercase tracking-widest text-[#EFE9DC]/85">
          <span>MOTION PORTRAIT</span>
          <span className="rounded-full bg-[#151E28] px-2.5 py-0.5 text-[#F4A938]">
            {look.toUpperCase()}
          </span>
        </div>

        {activePhoto ? (
          <div className="relative h-64 w-64 overflow-hidden rounded-2xl border-2 border-[#EFE9DC] bg-[#151E28]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto}
              alt={ownerName}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover contrast-110 transition-transform duration-200"
            />
          </div>
        ) : (
          /* Interactive Editorial Risograph Avatar (tracks cursor until real photos are added) */
          <div className="relative flex h-60 w-60 items-center justify-center rounded-full border-2 border-[#151E28] bg-[#EFE9DC] shadow-inner">
            <motion.div
              animate={{
                x: look === "left" ? -12 : look === "right" ? 12 : 0,
                y: look === "react" ? -6 : 0,
                scale: look === "react" ? 1.06 : 1,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="flex flex-col items-center"
            >
              {/* Stylized Eyes */}
              <div className="flex gap-7">
                <span className="h-5 w-5 rounded-full bg-[#151E28]" />
                <span className="h-5 w-5 rounded-full bg-[#151E28]" />
              </div>
              {/* Stylized Editorial Smile / Expression */}
              <div
                className={`mt-5 transition-all duration-200 ${
                  look === "react"
                    ? "h-6 w-8 rounded-full bg-[#E85A2A]"
                    : "h-2.5 w-12 rounded-b-full border-b-4 border-[#151E28]"
                }`}
              />
              <span className="mt-5 font-mono-tech text-[10px] font-semibold uppercase tracking-widest text-[#26465C]">
                {ownerName}
              </span>
            </motion.div>
          </div>
        )}

        <p className="text-center font-mono-tech text-[11px] text-[#EFE9DC]/85">
          Move cursor or click · Drop photos in <code className="text-[#F4A938]">/public/portraits/</code>
        </p>
      </div>
    </motion.div>
  );
}
