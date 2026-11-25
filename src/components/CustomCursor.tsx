"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type CursorMode = "default" | "read" | "drag";

/**
 * Interactive 3D Tactile Computer Mouse Follower + Context-Aware Editorial Cursor:
 * - Default: 3D-shaded computer mouse icon with a glowing Signal Orange (#F04E18) scroll wheel
 *   that reacts live to left-clicks (button press), scrolling (wheel pulse + tilt), and horizontal motion!
 * - [data-cursor="read"]: morphs into bold circular badge ("READ →") on Newsletter cards.
 * - [data-cursor="drag"]: morphs into amber pill ("DRAG ✋") on draggable Vibe Labs desk items.
 * - [data-magnetic="true"]: magnetic pull + elastic snap-back on primary buttons & social icons.
 * - Strictly `pointer-events: none` so 3D brain objects & buttons are 100% clickable!
 */
export function CustomCursor() {
  const followerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [scrollDir, setScrollDir] = useState<-1 | 0 | 1>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const el = followerRef.current;
    if (!el) return;

    // Hide the native OS pointer so ONLY our 3D mouse icon is visible
    document.documentElement.classList.add("custom-cursor-active");

    const xTo = gsap.quickTo(el, "x", { duration: 0.08, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.08, ease: "power3.out" });
    const rotTo = gsap.quickTo(el, "rotation", { duration: 0.3, ease: "power3.out" });

    let lastX = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let activeMagneticEl: HTMLElement | null = null;

    const handleMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);

      // Pin directly at the exact click coordinate (no second native cursor!)
      xTo(e.clientX);
      yTo(e.clientY);

      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const tilt = Math.max(-16, Math.min(16, dx * 0.45));
      rotTo(tilt);

      const target = e.target as HTMLElement | null;
      const cursorZone = target?.closest<HTMLElement>("[data-cursor]");
      const rawMode = cursorZone?.dataset.cursor;
      const nextMode: CursorMode =
        rawMode === "read" || rawMode === "drag" ? rawMode : "default";
      setMode(nextMode);

      // Magnetic button pull
      const magEl = target?.closest<HTMLElement>('[data-magnetic="true"]') || null;
      if (activeMagneticEl && activeMagneticEl !== magEl) {
        gsap.to(activeMagneticEl, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: "elastic.out(1, 0.4)",
        });
        activeMagneticEl = null;
      }
      if (magEl) {
        activeMagneticEl = magEl;
        const rect = magEl.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        gsap.to(magEl, {
          x: relX * 0.26,
          y: relY * 0.26,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    const handleWheel = (e: WheelEvent) => {
      setScrollDir(e.deltaY > 0 ? 1 : -1);
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setScrollDir(0), 220);
    };

    const handleLeave = () => {
      setVisible(false);
      setPressed(false);
      if (activeMagneticEl) {
        gsap.to(activeMagneticEl, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        activeMagneticEl = null;
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [visible]);

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[9998] hidden -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 md:flex ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {mode === "read" ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F8EAE0]/30 bg-[#0E1B2A] font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#F8EAE0] shadow-[0_14px_32px_rgba(0,0,0,0.45)]">
          READ →
        </div>
      ) : mode === "drag" ? (
        <div className="flex h-9 w-24 items-center justify-center rounded-full border-2 border-[#0E1B2A] bg-[#F4A938] font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#0E1B2A] shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
          DRAG ✋
        </div>
      ) : (
        /* 3D-Shaded Ergonomic Computer Mouse Icon reacting to click & scroll! */
        <div
          className={`transition-transform duration-150 ${
            pressed ? "scale-90" : scrollDir !== 0 ? "scale-105" : "scale-100"
          }`}
        >
          <svg
            width="30"
            height="40"
            viewBox="0 0 36 48"
            fill="none"
            className="drop-shadow-[0_8px_14px_rgba(14,27,42,0.45)]"
          >
            <defs>
              {/* 3D Ceramic-Cream Shell Lighting Gradient */}
              <linearGradient id="mouseShell" x1="6" y1="2" x2="32" y2="46" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="52%" stopColor="#F4E7DA" />
                <stop offset="100%" stopColor="#C9B9AA" />
              </linearGradient>
              {/* Specular Top Highlight */}
              <linearGradient id="mouseGloss" x1="18" y1="4" x2="18" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              {/* 3D Wheel Gradient */}
              <linearGradient id="wheelGrad" x1="18" y1="10" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF7A4D" />
                <stop offset="55%" stopColor="#F04E18" />
                <stop offset="100%" stopColor="#A92F08" />
              </linearGradient>
            </defs>

            {/* 3D Bottom Shadow Rim */}
            <rect
              x="4"
              y="4"
              width="28"
              height="42"
              rx="14"
              fill="#0E1B2A"
            />

            {/* Main Sculpted 3D Mouse Body */}
            <rect
              x="4"
              y="2"
              width="28"
              height="41"
              rx="14"
              fill="url(#mouseShell)"
              stroke="#0E1B2A"
              strokeWidth="2.2"
            />

            {/* Left Click Highlight when mouse is pressed */}
            {pressed && (
              <path
                d="M5.2,16 C5.2,8.5 10.6,3.2 18,3.2 L18,20 L5.2,20 Z"
                fill="#F04E18"
                opacity="0.35"
              />
            )}

            {/* Top Glossy Specular Reflection */}
            <rect
              x="7"
              y="4"
              width="22"
              height="16"
              rx="10"
              fill="url(#mouseGloss)"
            />

            {/* Left/Right Button Divider Seams */}
            <path d="M18 3 V20.5" stroke="#0E1B2A" strokeWidth="1.6" strokeOpacity="0.45" />
            <path d="M5.5 20.5 H30.5" stroke="#0E1B2A" strokeWidth="1.4" strokeOpacity="0.32" />

            {/* Tactile Glowing Signal Orange 3D Scroll Wheel (animates up/down when scrolling!) */}
            <rect
              x="15.2"
              y={scrollDir === 1 ? "12.5" : scrollDir === -1 ? "9.5" : "11"}
              width="5.6"
              height="9"
              rx="2.8"
              fill="url(#wheelGrad)"
              stroke="#0E1B2A"
              strokeWidth="1.5"
            />
            {/* Wheel grip notches */}
            <line
              x1="16.8"
              y1={scrollDir === 1 ? "15.5" : scrollDir === -1 ? "12.5" : "14"}
              x2="19.2"
              y2={scrollDir === 1 ? "15.5" : scrollDir === -1 ? "12.5" : "14"}
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.85"
            />
            <line
              x1="16.8"
              y1={scrollDir === 1 ? "18" : scrollDir === -1 ? "15" : "16.5"}
              x2="19.2"
              y2={scrollDir === 1 ? "18" : scrollDir === -1 ? "15" : "16.5"}
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
