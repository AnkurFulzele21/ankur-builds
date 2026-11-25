"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, LayoutDashboard, Mail, Newspaper, Twitter, Youtube } from "lucide-react";
import type { SiteSettings } from "@/lib/beehiiv-db";

interface MicaelaInspiredFooterProps {
  settings: SiteSettings;
  istTime: string;
}

export function MicaelaInspiredFooter({ settings, istTime }: MicaelaInspiredFooterProps) {
  const [cutoutError, setCutoutError] = useState(false);

  const socials = [
    {
      label: "X / Twitter",
      href: settings.twitter_url || "https://x.com/AnkurBuilds",
      icon: Twitter,
      external: true,
    },
    {
      label: "GitHub",
      href: "https://github.com/AnkurFulzele21",
      icon: Github,
      external: true,
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@ankurfulzele",
      icon: Youtube,
      external: true,
    },
    {
      label: "Newsletter",
      href: "/newsletter",
      icon: Newspaper,
      external: false,
    },
    {
      label: "Email",
      href: `mailto:${settings.sender_email || "hello@ankurfulzele.in"}`,
      icon: Mail,
      external: true,
    },
  ];

  return (
    <footer className="riso-grain relative flex min-h-[78vh] flex-col justify-between overflow-hidden bg-[#E85A2A] text-[#EFE9DC]">
      {/* Top Editorial Bar */}
      <div className="relative z-30 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pt-10 font-mono-tech text-[11.5px] font-bold uppercase tracking-widest sm:px-10">
        <span className="rounded-full border-2 border-[#151E28] bg-[#EFE9DC] px-3.5 py-1 text-[#151E28]">
          ANKURFULZELE.IN
        </span>
        <span className="text-[#EFE9DC]/90">
          INDIA STUDIO · {istTime || "IST LIVE"}
        </span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#EFE9DC]/40 bg-[#151E28]/25 px-3.5 py-1 text-[#EFE9DC] backdrop-blur-sm transition hover:bg-[#151E28]"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Admin Studio
        </Link>
      </div>

      {/* CENTER STAGE: Giant Animated Background Name + Foreground Cutout (micaeladl.xyz inspired) */}
      <div className="relative flex flex-1 items-end justify-center overflow-hidden pt-12">
        {/* Background Animated Marquee Rows (Cream #EFE9DC on Signal Orange #E85A2A) */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 select-none space-y-2 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 22 }}
            className="flex whitespace-nowrap font-display text-[17vw] font-extrabold leading-[0.86] tracking-tighter text-[#EFE9DC] sm:text-[13vw]"
          >
            <span className="pr-12">ANKUR FULZELE · </span>
            <span className="pr-12">ANKUR FULZELE · </span>
            <span className="pr-12">ANKUR FULZELE · </span>
            <span className="pr-12">ANKUR FULZELE · </span>
          </motion.div>

          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 26 }}
            className="flex whitespace-nowrap font-display text-[14vw] font-extrabold leading-[0.86] tracking-tighter text-[#151E28]/18 sm:text-[10.5vw]"
          >
            <span className="pr-12">VIBE CODER · INDIE MAKER · </span>
            <span className="pr-12">VIBE CODER · INDIE MAKER · </span>
            <span className="pr-12">VIBE CODER · INDIE MAKER · </span>
            <span className="pr-12">VIBE CODER · INDIE MAKER · </span>
          </motion.div>
        </div>

        {/* Foreground Center Cutout Portrait (Drops cleanly in front of the animated name!) */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative z-20 flex flex-col items-center"
        >
          {!cutoutError ? (
            // Automatically displays your transparent PNG cutout once saved to /public/portraits/cutout.png
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/portraits/cutout.png"
              alt="Ankur Fulzele"
              onError={() => setCutoutError(true)}
              className="max-h-[430px] w-auto object-contain drop-shadow-[0_18px_28px_rgba(21,30,40,0.4)]"
            />
          ) : (
            /* Editorial Risograph Cutout Placeholder (Matches Image #8 speaker aesthetic until you drop cutout.png!) */
            <div className="relative flex h-[340px] w-[270px] flex-col items-center justify-end overflow-hidden rounded-t-[140px] border-x-4 border-t-4 border-[#151E28] bg-[#26465C] px-6 pt-8 shadow-[0_-10px_40px_rgba(21,30,40,0.3)] sm:h-[390px] sm:w-[310px]">
              {/* Stylized Halftone Portrait Silhouette */}
              <svg viewBox="0 0 220 260" className="h-full w-full" aria-hidden="true">
                {/* Warm amber halo behind head */}
                <circle cx="110" cy="84" r="56" fill="#F4A938" />
                {/* Head */}
                <circle cx="110" cy="84" r="38" fill="#EFE9DC" stroke="#151E28" strokeWidth="4" />
                {/* Glasses / Tech Builder Vibe */}
                <rect x="85" y="74" width="20" height="13" rx="4" fill="#151E28" />
                <rect x="115" y="74" width="20" height="13" rx="4" fill="#151E28" />
                <line x1="105" y1="80" x2="115" y2="80" stroke="#151E28" strokeWidth="3" />
                {/* Confident Smile */}
                <path
                  d="M98 100 Q110 110 122 100"
                  fill="none"
                  stroke="#151E28"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Shoulders / Jacket */}
                <path
                  d="M36 260 C38 182 65 152 110 152 C155 152 182 182 184 260 Z"
                  fill="#151E28"
                />
                {/* Shirt collar */}
                <polygon points="94,152 110,184 126,152" fill="#EFE9DC" />
                {/* Laptop / Builder Badge */}
                <rect
                  x="68"
                  y="206"
                  width="84"
                  height="34"
                  rx="8"
                  fill="#E85A2A"
                  stroke="#EFE9DC"
                  strokeWidth="3"
                />
                <text
                  x="110"
                  y="228"
                  textAnchor="middle"
                  fill="#EFE9DC"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  ANKUR.IN
                </text>
              </svg>
              <span className="absolute bottom-3 rounded-full bg-[#EFE9DC] px-3 py-1 font-mono-tech text-[9.5px] font-bold uppercase tracking-wider text-[#151E28]">
                Drop cutout.png in /public/portraits/
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* BOTTOM BAR: Left Credits + Right Tactile Social Icons (micaeladl.xyz bottom-right corner) */}
      <div className="relative z-30 border-t-2 border-[#151E28]/20 bg-[#E85A2A]/90 px-6 py-5 backdrop-blur-sm sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-mono-tech text-[11.5px] font-bold uppercase tracking-wider text-[#EFE9DC]">
            © {new Date().getFullYear()} ANKUR FULZELE · BUILT WITH NEXT.JS, THREE.JS &amp; MATTER.JS
          </p>

          {/* Bottom-Right Social Icons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {socials.map((s) => {
              const Icon = s.icon;
              const cls =
                "group inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#151E28] bg-[#EFE9DC] text-[#151E28] shadow-[3px_3px_0px_#151E28] transition hover:-translate-y-1 hover:bg-[#F4A938]";
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
                <Link
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  aria-label={s.label}
                  className={cls}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
