"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Github, LayoutDashboard, Mail, Newspaper, Twitter, Youtube } from "lucide-react";
import type { SiteSettings } from "@/lib/beehiiv-db";

interface TrailSticker {
  id: number;
  x: number;
  y: number;
  rotate: number;
  kind: number;
}

const STICKER_STYLES = [
  { emoji: "✌️", bg: "#F4A938", border: "#0E1B2A" },
  { emoji: "💻", bg: "#F8EAE0", border: "#0E1B2A" },
  { emoji: "☕", bg: "#FFFFFF", border: "#0E1B2A" },
  { emoji: "⚡", bg: "#F4A938", border: "#0E1B2A" },
  { emoji: "📰", bg: "#F8EAE0", border: "#0E1B2A" },
  { emoji: "🔥", bg: "#FFFFFF", border: "#0E1B2A" },
];

/**
 * Exact micaeladl.xyz Hero-as-Footer (from Video 3.53.30 AM):
 * - Vibrant Signal Orange (#F04E18) full-screen canvas.
 * - Giant tall condensed cream "ANKUR FULZELE" sliding smoothly RIGHT -> LEFT behind the portrait.
 * - Ankur's real peace-sign orange-glasses cutout grounded in front (z-20).
 * - "Leaving so soon?" speech bubble floating above.
 * - Interactive cursor sticker trail (popping bold die-cut stickers as you move the mouse!).
 * - Bottom-right circular social icons + bottom-left Admin Studio link.
 */
export function MicaelaFooter({
  settings,
  compact = false,
}: {
  settings: SiteSettings;
  compact?: boolean;
}) {
  const footerRef = useRef<HTMLElement>(null);
  const lastSpawnRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const idRef = useRef(0);
  const [stickers, setStickers] = useState<TrailSticker[]>([]);

  // Scroll-scrubbed upward emergence from the bottom edge (exact match to trevornoah.com @ 00:32-00:50!)
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start 0.92", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 24 });

  // Marquee, Portrait Cutout, Speech Bubble & Bottom Pills each rise smoothly from below at distinct parallax depths!
  const marqueeY = useTransform(smooth, [0, 1], [120, 0]);
  const marqueeOpacity = useTransform(smooth, [0.05, 0.55], [0, 1]);

  const cutoutY = useTransform(smooth, [0.08, 1], [200, 0]);
  const cutoutRotate = useTransform(smooth, [0.08, 1], [-4, 0]);
  const cutoutScale = useTransform(smooth, [0.08, 1], [0.94, 1]);

  const bubbleY = useTransform(smooth, [0.35, 1], [95, 0]);
  const bubbleScale = useTransform(smooth, [0.35, 0.92], [0.45, 1]);
  const bubbleRotate = useTransform(smooth, [0.35, 0.95], [-12, 0]);
  const bubbleOpacity = useTransform(smooth, [0.35, 0.72], [0, 1]);

  const bottomBarY = useTransform(smooth, [0.45, 1], [55, 0]);
  const bottomBarOpacity = useTransform(smooth, [0.45, 0.88], [0, 1]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const el = footerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = Date.now();
    const dist = Math.hypot(x - lastSpawnRef.current.x, y - lastSpawnRef.current.y);
    if (dist < 85 || now - lastSpawnRef.current.time < 110) return;

    lastSpawnRef.current = { x, y, time: now };
    const nextId = ++idRef.current;
    const newSticker: TrailSticker = {
      id: nextId,
      x,
      y,
      rotate: (Math.random() - 0.5) * 32,
      kind: nextId % STICKER_STYLES.length,
    };

    setStickers((prev) => [...prev.slice(-9), newSticker]);
    setTimeout(() => {
      setStickers((prev) => prev.filter((s) => s.id !== nextId));
    }, 850);
  }

  const socials = [
    {
      label: "X / Twitter",
      href: settings.twitter_url || "https://x.com/AnkurBuilds",
      icon: Twitter,
      external: true,
    },
    { label: "GitHub", href: "https://github.com/AnkurFulzele21", icon: Github, external: true },
    { label: "YouTube", href: "https://www.youtube.com/@ankurfulzele", icon: Youtube, external: true },
    { label: "Newsletter", href: "/newsletter", icon: Newspaper, external: false },
    {
      label: "Email",
      href: `mailto:${settings.sender_email || "hello@ankurfulzele.in"}`,
      icon: Mail,
      external: true,
    },
  ];

  return (
    <footer
      ref={footerRef}
      onMouseMove={handleMouseMove}
      className={`relative z-10 flex w-full flex-col justify-end overflow-x-clip bg-transparent text-[#F8EAE0] ${
        compact ? "min-h-[54vh] sm:min-h-[60vh]" : "min-h-[76svh] sm:min-h-[88vh]"
      }`}
    >
      {/* Top Minimal Corner Tags */}
      <div className="pointer-events-none absolute left-6 right-6 top-7 z-40 flex items-center justify-between font-display text-[12px] font-bold tracking-[0.06em] text-[#F8EAE0]/90 sm:left-10 sm:right-10">
        <Link
          href="/"
          onClick={() => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="pointer-events-auto uppercase transition hover:text-white hover:underline"
        >
          ANKURFULZELE.IN
        </Link>
        <span className="hidden uppercase sm:inline">VIBE-CODING STUDIO · INDIA</span>
      </div>

      {/* Interactive Cursor Sticker Trail (overflow-visible so stickers NEVER crop at top border!) */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <AnimatePresence>
          {stickers.map((s) => {
            const st = STICKER_STYLES[s.kind];
            return (
              <motion.div
                key={s.id}
                initial={{ scale: 0, opacity: 0, rotate: s.rotate - 15 }}
                animate={{ scale: 1, opacity: 1, rotate: s.rotate }}
                exit={{ scale: 0.4, opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                style={{
                  left: s.x,
                  top: s.y,
                  backgroundColor: st.bg,
                  borderColor: st.border,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl shadow-[4px_4px_0px_#0E1B2A]"
              >
                {st.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* BACKGROUND LAYER (z-10): Giant Tall Condensed "ANKUR FULZELE" rising behind shoulders & head */}
      <motion.div
        style={{ y: marqueeY, opacity: marqueeOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-[26%] z-10 select-none overflow-hidden will-change-transform sm:bottom-[14%]"
      >
        <div
          className={`animate-marquee-rtl font-condensed uppercase leading-[0.82] text-[#F8EAE0] ${
            compact
              ? "text-[34vw] sm:text-[18vw] lg:text-[15vw]"
              : "text-[42vw] sm:text-[26vw] lg:text-[23vw]"
          }`}
        >
          <span className="pr-[6vw]">ANKUR FULZELE</span>
          <span className="pr-[6vw]">ANKUR FULZELE</span>
          <span className="pr-[6vw]">ANKUR FULZELE</span>
          <span className="pr-[6vw]">ANKUR FULZELE</span>
        </div>
      </motion.div>

      {/* FOREGROUND LAYER (z-20): "Leaving so soon?" Bubble + Bigger Center-Aligned Cutout grounded flush to bottom edge! */}
      <div className="pointer-events-none relative z-20 mx-auto flex w-full flex-col items-center justify-end overflow-hidden pt-10">
        <motion.div
          style={{
            y: bubbleY,
            scale: bubbleScale,
            rotate: bubbleRotate,
            opacity: bubbleOpacity,
          }}
          className="mx-auto flex justify-center will-change-transform"
        >
          <motion.img
            src="/assets/section1/leaving-so-soon.png"
            alt="Leaving so soon?"
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className={`mb-2 w-auto drop-shadow-[0_10px_20px_rgba(14,27,42,0.28)] ${
              compact ? "h-12 sm:h-16" : "h-16 sm:h-24"
            }`}
          />
        </motion.div>

        {/* Real Cutout — big, grounded flush at the bottom edge (zero floating gap!) */}
        <motion.img
          src="/assets/section1/footer-cutout.png?v=2"
          alt="Ankur Fulzele"
          style={{
            y: cutoutY,
            rotate: cutoutRotate,
            scale: cutoutScale,
          }}
          className={`mx-auto block w-auto max-w-none origin-bottom object-contain object-bottom drop-shadow-[0_24px_42px_rgba(14,27,42,0.4)] will-change-transform ${
            compact
              ? "h-[54svh] max-h-[460px] sm:h-[52vh]"
              : "h-[68svh] max-h-[860px] sm:h-[78vh] lg:h-[86vh]"
          }`}
        />
      </div>

      {/* BOTTOM-LEFT: Legal & Newsletter Links (single sleek row above socials on mobile!) */}
      <motion.div
        style={{ y: bottomBarY, opacity: bottomBarOpacity }}
        className="absolute bottom-[62px] left-1/2 z-40 flex -translate-x-1/2 flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap will-change-transform sm:bottom-7 sm:left-8 sm:translate-x-0 sm:gap-2"
      >
        {[
          { label: "Share Your Story", href: "/newsletter/share-your-story" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Unsubscribe", href: "/unsubscribe" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center rounded-full border-2 border-[#0E1B2A] bg-[#F8EAE0]/95 px-2.5 py-0.5 font-display text-[10.5px] font-bold text-[#0E1B2A] shadow-[2px_2px_0px_#0E1B2A] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white sm:px-3.5 sm:py-1.5 sm:text-[11.5px] sm:shadow-[3px_3px_0px_#0E1B2A]"
          >
            {item.label}
          </Link>
        ))}
      </motion.div>

      {/* BOTTOM-RIGHT: Crisp Social Icon Buttons (centered bottom on mobile, right-aligned on desktop!) */}
      <motion.div
        style={{ y: bottomBarY, opacity: bottomBarOpacity }}
        className="absolute bottom-3.5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 will-change-transform sm:bottom-7 sm:left-auto sm:right-8 sm:translate-x-0 sm:gap-2.5"
      >
        {socials.map((s) => {
          const Icon = s.icon;
          const cls =
            "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0E1B2A] bg-[#F8EAE0] text-[#0E1B2A] shadow-[3px_3px_0px_#0E1B2A] transition hover:-translate-y-1 hover:bg-white";
          if (s.external) {
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                title={s.label}
                aria-label={s.label}
                className={cls}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          }
          return (
            <Link key={s.label} href={s.href} title={s.label} aria-label={s.label} className={cls}>
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </motion.div>
    </footer>
  );
}
