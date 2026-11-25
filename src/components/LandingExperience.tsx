"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);
import {
  ArrowUpRight,
  Github,
  LayoutDashboard,
  Mail,
  Menu,
  Sparkles,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import { SubscribeBox } from "@/components/SubscribeBox";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import { WindingRoadmapSection } from "@/components/WindingRoadmapSection";
import { Section1Hero } from "@/components/Section1Hero";
import { VibeFuelsHomeSection } from "@/components/VibeFuelsHomeSection";
import { PaperRipTransition } from "@/components/PaperRipTransition";
import { VibeLabsSection } from "@/components/VibeLabsSection";
import { NewsletterBentoSection } from "@/components/NewsletterBentoSection";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import { CustomCursor } from "@/components/CustomCursor";
import { PreloaderOverlay } from "@/components/PreloaderOverlay";
import type { NewsletterPostRow, PortfolioProjectRow, SiteSettings } from "@/lib/beehiiv-db";

interface LandingExperienceProps {
  settings: SiteSettings;
  projects: PortfolioProjectRow[];
  posts: NewsletterPostRow[];
  subscriberCount: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "NEW";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Interactive 3D-Shaded Props Inside the Open Torn Head (Exact match to Trevor Noah & Figma!)
 * Includes: 3D Brain, 3D Studio Mic, 3D Green Hardcover Book, 3D YouTube/Media Tablet, 3D Red Heart.
 * Hovering any prop floats a clean white pill tooltip ("Vibe Labs", "Playbooks", "Newsletter", "About").
 */
function OpenBrainPropsStage() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  return (
    <div className="relative mx-auto h-40 w-[340px] select-none sm:h-48 sm:w-[460px]">
      {/* Floating White Pill Tooltip (just like Trevor Noah's "Shows" / "Books" pill!) */}
      <AnimatePresence>
        {hoveredLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            className="pointer-events-none absolute -top-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2 font-display text-[15px] font-bold text-[#0E1B2A] shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          >
            {hoveredLabel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Left Pink 3D Brain Sculpture -> #about */}
      <motion.a
        href="#about"
        onMouseEnter={() => setHoveredLabel("About Me")}
        onMouseLeave={() => setHoveredLabel(null)}
        whileHover={{ y: -14, scale: 1.08 }}
        className="absolute bottom-1 left-4 z-10 block w-24 cursor-pointer sm:left-6 sm:w-28"
      >
        <svg viewBox="0 0 140 110" className="w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]">
          <defs>
            <radialGradient id="brainGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFB8D0" />
              <stop offset="60%" stopColor="#E86F9A" />
              <stop offset="100%" stopColor="#9E355C" />
            </radialGradient>
          </defs>
          <path
            d="M35,88 C14,86 8,64 20,48 C16,30 34,14 54,20 C66,10 92,12 102,26 C122,28 132,50 120,68 C126,84 108,96 90,90 C76,96 52,96 35,88 Z"
            fill="url(#brainGrad)"
          />
          <path
            d="M42,38 Q62,28 74,48 M54,22 Q68,46 52,68 M86,26 Q76,52 98,66 M30,58 Q56,56 66,78"
            stroke="#7A2143"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </motion.a>

      {/* 2. 3D Chrome & Dark Studio Microphone -> #vibe-labs */}
      <motion.a
        href="#vibe-labs"
        onMouseEnter={() => setHoveredLabel("Vibe Labs")}
        onMouseLeave={() => setHoveredLabel(null)}
        whileHover={{ y: -16, rotate: -6, scale: 1.08 }}
        className="absolute bottom-2 left-16 z-30 block w-24 -rotate-12 cursor-pointer sm:left-24 sm:w-28"
      >
        <svg viewBox="0 0 120 170" className="w-full drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)]">
          <defs>
            <linearGradient id="micBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <radialGradient id="micMesh" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="55%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#374151" />
            </radialGradient>
          </defs>
          {/* Handle */}
          <rect x="44" y="72" width="32" height="88" rx="12" fill="url(#micBody)" />
          {/* Chrome collar */}
          <rect x="41" y="64" width="38" height="10" rx="4" fill="#E5E7EB" />
          {/* Mesh Capsule */}
          <circle cx="60" cy="42" r="32" fill="url(#micMesh)" />
          <path
            d="M32,42 H88 M36,30 H84 M36,54 H84 M48,14 V70 M60,10 V74 M72,14 V70"
            stroke="#1F2937"
            strokeWidth="2"
            opacity="0.45"
          />
        </svg>
      </motion.a>

      {/* 3. 3D Sage-Green Hardcover Playbook Book -> /newsletter */}
      <motion.div
        onMouseEnter={() => setHoveredLabel("Playbooks")}
        onMouseLeave={() => setHoveredLabel(null)}
        whileHover={{ y: -18, rotate: -2, scale: 1.07 }}
        className="absolute bottom-3 left-32 z-20 w-28 -rotate-6 cursor-pointer sm:left-40 sm:w-36"
      >
        <Link href="/newsletter" className="block">
          <svg viewBox="0 0 150 185" className="w-full drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]">
            {/* Book 3D Spine & Pages */}
            <path d="M16,18 L32,8 L142,24 L142,168 L126,178 L16,162 Z" fill="#DCE7DC" />
            <path d="M16,18 L32,8 L32,152 L16,162 Z" fill="#4D7C5B" />
            {/* Front Cover */}
            <path d="M32,8 L142,24 L142,168 L32,152 Z" fill="#C4DEC6" stroke="#365E42" strokeWidth="2" />
            <text x="50" y="54" fill="#1E3A2F" fontSize="14" fontWeight="800" fontFamily="sans-serif">
              SaaS
            </text>
            <text x="50" y="72" fill="#1E3A2F" fontSize="14" fontWeight="800" fontFamily="sans-serif">
              Vibes
            </text>
            <circle cx="88" cy="112" r="20" fill="#4D7C5B" opacity="0.25" />
          </svg>
        </Link>
      </motion.div>

      {/* 4. 3D Glossy Video / YouTube Media Player Tablet -> #newsletter-sec */}
      <motion.a
        href="#newsletter-sec"
        onMouseEnter={() => setHoveredLabel("Newsletter & Media")}
        onMouseLeave={() => setHoveredLabel(null)}
        whileHover={{ y: -16, rotate: 6, scale: 1.07 }}
        className="absolute bottom-2 right-6 z-30 block w-36 rotate-12 cursor-pointer sm:right-10 sm:w-48"
      >
        <svg viewBox="0 0 210 150" className="w-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.55)]">
          {/* 3D Silver Tablet Frame */}
          <rect
            x="8"
            y="8"
            width="194"
            height="134"
            rx="22"
            fill="#E5E7EB"
            stroke="#9CA3AF"
            strokeWidth="4"
          />
          {/* Inner Dark Screen */}
          <rect x="20" y="20" width="170" height="86" rx="12" fill="#18181B" />
          {/* Red Play Button */}
          <rect x="78" y="44" width="54" height="38" rx="10" fill="#EF4444" />
          <polygon points="99,54 99,72 115,63" fill="#FFFFFF" />
          {/* Progress Scrubber Bar */}
          <rect x="24" y="118" width="162" height="7" rx="3.5" fill="#9CA3AF" />
          <rect x="24" y="118" width="76" height="7" rx="3.5" fill="#EF4444" />
          <circle cx="100" cy="121.5" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </motion.a>

      {/* 5. 3D Glossy Red Heart -> #newsletter-sec */}
      <motion.a
        href="#newsletter-sec"
        onMouseEnter={() => setHoveredLabel("Join Readers")}
        onMouseLeave={() => setHoveredLabel(null)}
        whileHover={{ scale: 1.2, y: -10 }}
        className="absolute -bottom-1 right-3 z-40 block w-16 cursor-pointer sm:right-6 sm:w-20"
      >
        <svg viewBox="0 0 100 90" className="w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)]">
          <defs>
            <radialGradient id="heartGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FF758F" />
              <stop offset="55%" stopColor="#EF233C" />
              <stop offset="100%" stopColor="#9B0A1E" />
            </radialGradient>
          </defs>
          <path
            d="M50,82 C50,82 10,56 10,30 C10,14 24,6 38,12 C45,15 50,22 50,22 C50,22 55,15 62,12 C76,6 90,14 90,30 C90,56 50,82 50,82 Z"
            fill="url(#heartGrad)"
          />
        </svg>
      </motion.a>
    </div>
  );
}

/**
 * Photorealistic Portrait Face SVG (used automatically until /public/portraits/hero-head.png is dropped in,
 * so there is ZERO ugly dark placeholder box!)
 */
function EditorialPortraitCutout({ surprised = false }: { surprised?: boolean }) {
  return (
    <svg viewBox="0 0 360 350" className="h-full w-full drop-shadow-[0_22px_35px_rgba(0,0,0,0.55)]">
      <defs>
        <linearGradient id="skinTone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D99B72" />
          <stop offset="60%" stopColor="#C6835B" />
          <stop offset="100%" stopColor="#9E623E" />
        </linearGradient>
      </defs>

      {/* Thick White Die-Cut Sticker Outline (just like Trevor Noah's scroll sticker!) */}
      <path
        d="M36,36 C20,85 25,155 42,205 C56,265 96,320 180,336 C264,320 304,265 318,205 C335,155 340,85 324,36 Z"
        fill="#1B222C"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />

      {/* Curly / Textured Hair Sides */}
      <path
        d="M42,36 C24,80 30,145 52,185 C65,115 65,65 82,36 Z M318,36 C336,80 330,145 308,185 C295,115 295,65 278,36 Z"
        fill="#18191C"
      />

      {/* Ears */}
      <ellipse cx="58" cy="178" rx="16" ry="30" fill="#B5734C" />
      <ellipse cx="302" cy="178" rx="16" ry="30" fill="#B5734C" />

      {/* Face Shape */}
      <path
        d="M66,36 C64,135 72,225 110,282 C138,318 162,328 180,328 C198,328 222,318 250,282 C288,225 296,135 294,36 Z"
        fill="url(#skinTone)"
      />

      {/* Eyebrows */}
      <path
        d={surprised ? "M96,118 Q130,102 158,116" : "M96,128 Q130,116 158,126"}
        stroke="#1C1917"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={surprised ? "M202,116 Q230,102 264,118" : "M202,126 Q230,116 264,128"}
        stroke="#1C1917"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes (widen as you scroll!) */}
      <ellipse cx="128" cy="152" rx="22" ry={surprised ? 19 : 13} fill="#FFFFFF" />
      <circle cx="128" cy="152" r="10" fill="#291D16" />
      <circle cx="128" cy="152" r="5" fill="#09090B" />
      <circle cx="132" cy="148" r="2.8" fill="#FFFFFF" />

      <ellipse cx="232" cy="152" rx="22" ry={surprised ? 19 : 13} fill="#FFFFFF" />
      <circle cx="232" cy="152" r="10" fill="#291D16" />
      <circle cx="232" cy="152" r="5" fill="#09090B" />
      <circle cx="236" cy="148" r="2.8" fill="#FFFFFF" />

      {/* Nose */}
      <path
        d="M174,148 L164,206 Q180,218 196,206 L186,148"
        fill="#B3714B"
        opacity="0.65"
      />
      <path
        d="M160,206 Q180,220 200,206"
        stroke="#7C4728"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mustache & Goatee / Beard */}
      <path
        d="M132,248 Q155,232 180,240 Q205,232 228,248 Q214,256 180,248 Q146,256 132,248 Z"
        fill="#1C1917"
      />
      {surprised ? (
        <ellipse cx="180" cy="268" rx="24" ry="18" fill="#451A1C" stroke="#1C1917" strokeWidth="4" />
      ) : (
        <path
          d="M142,258 Q180,272 218,258"
          stroke="#7F392D"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      )}
      <path
        d="M112,272 Q140,322 180,326 Q220,322 248,272 Q228,308 180,312 Q132,308 112,272 Z"
        fill="#1C1917"
        opacity="0.85"
      />

      {/* Jagged White Torn-Paper Top Rim across Forehead */}
      <path
        d="M18,38 L46,26 L74,40 L106,24 L138,38 L172,22 L206,38 L238,24 L272,38 L304,26 L342,38 L342,48 L18,48 Z"
        fill="#FFFFFF"
      />
      <path
        d="M18,44 L46,32 L74,46 L106,30 L138,44 L172,28 L206,44 L238,30 L272,44 L304,32 L342,44"
        stroke="#D4D4D8"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}

/**
 * Real Filled Torn-Paper Strip Transition (Deep Navy -> Signal Orange) — ZERO GAP!
 */
function AnimatedTornPaperWipe({
  fromColor,
  toColor,
}: {
  fromColor: string;
  toColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.25"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 95, damping: 24 });
  const translateY = useTransform(smooth, [0, 1], ["45%", "0%"]);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: fromColor }}
      className="relative -my-1 w-full overflow-hidden"
    >
      <motion.div style={{ y: translateY }} className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/section1/torn-paper-to-orange.png"
          alt=""
          className="-mb-1 w-full select-none object-cover"
        />
        <div style={{ backgroundColor: toColor }} className="h-12 w-full" />
      </motion.div>
    </div>
  );
}

/**
 * ONE SINGLE UNIFIED RISING SEMICIRCLE + ABOUT SECTION:
 * - Peach accent arch, Prussian slate arch, Deep Navy curved top, and the full #about body
 *   all live inside ONE single scroll-scrubbed container (zero horizontal seam, 1:1 parallax sync!).
 * - Overlaps the warm cream section above via negative top margin (-mt-24 / -mt-32) and rises smoothly upward on scroll.
 */
function UnifiedRisingAboutSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.25"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  const riseY = useTransform(smooth, [0, 1], [90, 0]);
  const archScaleY = useTransform(smooth, [0, 1], [0.65, 1]);
  const titleOpacity = useTransform(smooth, [0.25, 0.85], [0, 1]);
  const titleY = useTransform(smooth, [0.25, 0.85], [28, 0]);

  return (
    <section
      id="about"
      ref={ref}
      className="relative z-30 -mt-24 w-full bg-[#F8EAE0] sm:-mt-32"
    >
      {/* Solid navy bottom backing so the bottom edge into Transition 3 is always 100% #0E1B2A */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[#0E1B2A]"
      />

      {/* ONE unified rising dark shape: peach rim + slate arch + dark navy arch + dark ABOUT body */}
      <motion.div style={{ y: riseY }} className="relative z-10 w-full will-change-transform">
        <div className="relative h-[26vh] w-full overflow-hidden sm:h-[36vh]">
          <motion.svg
            style={{ scaleY: archScaleY }}
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="block h-full w-full origin-bottom will-change-transform"
            aria-hidden="true"
          >
            {/* Outer soft peach accent arch */}
            <path d="M0,320 Q720,-170 1440,320 L1440,324 L0,324 Z" fill="#F5B5A8" />
            {/* Middle Prussian slate arch */}
            <path d="M0,320 Q720,-70 1440,320 L1440,324 L0,324 Z" fill="#26465C" />
            {/* Inner Deep Navy arch flush into the #0E1B2A body below */}
            <path d="M0,320 Q720,30 1440,320 L1440,324 L0,324 Z" fill="#0E1B2A" />
          </motion.svg>

          <motion.h2
            style={{ opacity: titleOpacity, y: titleY }}
            className="pointer-events-none absolute bottom-1 left-1/2 z-10 -translate-x-1/2 font-display text-[clamp(3.2rem,8vw,6.8rem)] font-extrabold uppercase leading-none tracking-[-0.04em] text-[#F04E18]"
          >
            ABOUT
          </motion.h2>
        </div>

        {/* Unified #0E1B2A body overlapping the SVG base by -mt-2 so a 1px seam can NEVER appear */}
        <div className="relative -mt-2 bg-[#0E1B2A] pb-28 pt-10">{children}</div>
      </motion.div>
    </section>
  );
}

export function LandingExperience({
  settings,
  projects,
  posts,
  subscriberCount,
}: LandingExperienceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Unified World Background Wrappers:
  // Because adjacent sections share ONE parent div whose backgroundColor is scrubbed by GSAP ScrollTrigger,
  // it is mathematically IMPOSSIBLE for a horizontal break line or section seam to ever appear!
  const heroToCreamWorldRef = useRef<HTMLDivElement>(null);
  const creamMorphTriggerRef = useRef<HTMLDivElement>(null);
  const navyToOrangeWorldRef = useRef<HTMLDivElement>(null);
  const orangeMorphTriggerRef = useRef<HTMLDivElement>(null);

  // Butter-smooth momentum scroll synced 1:1 with GSAP ScrollTrigger!
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // 1. Imperceptible World Color Morph: Hero (#0E1B2A) -> Vibe Labs (#F8EAE0)
      // Triggers right as the Hero manifesto is leaving the top of the frame and "A BIT ABOUT MY LAB" is rising from below!
      gsap.fromTo(
        heroToCreamWorldRef.current,
        { backgroundColor: "#0E1B2A" },
        {
          backgroundColor: "#F8EAE0",
          ease: "none",
          scrollTrigger: {
            trigger: creamMorphTriggerRef.current,
            start: "top 88%",
            end: "bottom 28%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );

      // 2. Imperceptible World Color Morph: About (#0E1B2A) -> Newsletter (#F04E18)
      // Triggers right after BUILD IN PUBLIC finishes at the left-middle and starts gliding upward out of the frame!
      gsap.fromTo(
        navyToOrangeWorldRef.current,
        { backgroundColor: "#0E1B2A" },
        {
          backgroundColor: "#F04E18",
          ease: "none",
          scrollTrigger: {
            trigger: orangeMorphTriggerRef.current,
            start: "top 82%",
            end: "bottom 25%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    // Always start cleanly at the top on reload (prevents browser scroll restoration landing mid-GSAP pin!)
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    }

    const onScroll = () => {
      setScrolledPastHero(window.scrollY > 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onRefresh = () => {
      ScrollTrigger.refresh();
      if (!window.location.hash && window.scrollY < 40) {
        window.scrollTo(0, 0);
      }
      // Notify Framer Motion useScroll hooks to recalculate element offsets after GSAP pin-spacers settle!
      window.dispatchEvent(new Event("resize"));
    };
    window.addEventListener("load", onRefresh);
    const refreshTimer = setTimeout(onRefresh, 350);
    return () => {
      ctx.revert();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onRefresh);
      clearTimeout(refreshTimer);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const socials = [
    { label: "X", href: settings.twitter_url || "https://x.com/AnkurBuilds", icon: Twitter },
    { label: "GitHub", href: "https://github.com/AnkurFulzele21", icon: Github },
    { label: "YouTube", href: "https://www.youtube.com/@ankurfulzele", icon: Youtube },
    { label: "Email", href: `mailto:${settings.sender_email || "hello@ankurfulzele.in"}`, icon: Mail },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0E1B2A] text-white">
      <PreloaderOverlay />
      <CustomCursor />

      {/* Exact Trevor Noah Floating Action Pair: Large Orange Circular "=" Menu Button + Large White "Get More" Pill!
          Sits cleanly below ANKUR FULZELE (zero overlap) on the hero screen, then docks smoothly to top-right as you scroll. */}
      <div
        className={`fixed right-3.5 z-50 flex items-center gap-2 transition-all duration-300 sm:right-6 sm:gap-3 lg:right-10 lg:gap-3.5 ${
          scrolledPastHero || menuOpen
            ? "top-3.5 sm:top-5 lg:top-6"
            : "top-3.5 sm:top-5 lg:top-[33%]"
        }`}
      >
        <button
          type="button"
          data-magnetic="true"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close Menu" : "Open Menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F04E18] text-[#0E1B2A] shadow-[0_10px_24px_rgba(0,0,0,0.38)] transition-colors duration-200 hover:bg-[#ff5d28] sm:h-12 sm:w-12 lg:h-16 lg:w-16"
        >
          {menuOpen ? (
            <X className="h-4 w-4 stroke-[2.6] sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          ) : (
            <span className="flex flex-col items-center justify-center gap-[4.5px] lg:gap-[6px]">
              <span className="block h-[2.5px] w-4 rounded-full bg-[#0E1B2A] sm:w-5 lg:h-[3px] lg:w-6" />
              <span className="block h-[2.5px] w-4 rounded-full bg-[#0E1B2A] sm:w-5 lg:h-[3px] lg:w-6" />
            </span>
          )}
        </button>

        <a
          href="https://substack.com/@ankurfulzele"
          target="_blank"
          rel="noopener noreferrer"
          data-magnetic="true"
          onClick={() => setMenuOpen(false)}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 font-display text-[13px] font-bold tracking-tight text-[#0E1B2A] shadow-[0_10px_24px_rgba(0,0,0,0.34)] transition-colors duration-200 hover:bg-[#F8EAE0] sm:px-6 sm:py-2.5 sm:text-[14px] lg:px-10 lg:py-4 lg:text-[17px]"
        >
          Get More
        </a>
      </div>

      {/* Full-Screen Editorial Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-[#0E1B2A]/98 px-6 text-center backdrop-blur-md"
          >
            {[
              { label: "About Me", href: "/about" },
              { label: "Vibe Fuel", href: "/vibe-fuel" },
              { label: "Vibe Labs", href: "/vibe-labs" },
              { label: "SaaS Vibes Newsletter", href: "/newsletter" },
              { label: "Daily Grind", href: "/daily-grind" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl font-extrabold tracking-tight text-[#F8EAE0] transition hover:text-[#F04E18] sm:text-6xl"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* WORLD 1: UNIFIED HERO (#0E1B2A) -> VIBE LABS (#F8EAE0) CONTINUOUS DIV */}
      {/*          (Shared background morphs on scroll — ZERO section break!)   */}
      {/* ===================================================================== */}
      <div ref={heroToCreamWorldRef} className="relative w-full bg-[#0E1B2A]">
        <Section1Hero />
        <VibeFuelsHomeSection />
        {/* Invisible scroll-trigger zone right where Vibe Fuels hands off to "A BIT ABOUT MY LAB" */}
        <div
          ref={creamMorphTriggerRef}
          aria-hidden="true"
          className="pointer-events-none relative h-[10vh] w-full sm:h-[18vh]"
        />
        <VibeLabsSection projects={projects} subscriberCount={subscriberCount} />
      </div>

      {/* ===================================================================== */}
      {/* WORLD 2: UNIFIED ABOUT (#0E1B2A) -> NEWSLETTER (#F04E18) -> FOOTER    */}
      {/*          (Shared background morphs on scroll — ZERO section break!)   */}
      {/* ===================================================================== */}
      <div ref={navyToOrangeWorldRef} className="relative -mt-1 w-full bg-[#0E1B2A]">
        <section
          id="about"
          className="relative z-30 bg-transparent pb-4 pt-6 sm:pb-10 sm:pt-12"
        >
          {/* Winding Orange Roadmap enters smoothly right after the pinned Philosophy quote finishes and glides up! */}
          <WindingRoadmapSection />
        </section>

        {/* Invisible scroll-trigger zone: right as BUILD IN PUBLIC glides upward toward the top edge,
            the ENTIRE shared world background smoothly morphs from #0E1B2A -> #F04E18 with ZERO horizontal line! */}
        <div
          ref={orangeMorphTriggerRef}
          aria-hidden="true"
          className="pointer-events-none relative h-[12vh] w-full sm:h-[22vh]"
        />

        <NewsletterBentoSection posts={posts} subscriberCount={subscriberCount} />
        <MicaelaFooter settings={settings} />
      </div>
    </div>
  );
}

function PamphletDrop({
  children,
  progress,
  range,
  from,
  to,
  zIndex,
}: {
  children: React.ReactNode;
  progress: ReturnType<typeof useSpring>;
  range: [number, number];
  from: { x: number; y: number; rotate: number };
  to: { x: number; y: number; rotate: number };
  zIndex: number;
}) {
  const x = useTransform(progress, range, [from.x, to.x]);
  const y = useTransform(progress, range, [from.y, to.y]);
  const rotate = useTransform(progress, range, [from.rotate, to.rotate]);
  const scale = useTransform(progress, range, [1.18, 1]);
  const opacity = useTransform(progress, [range[0], range[0] + 0.05], [0, 1]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity, zIndex }}
      whileHover={{ scale: 1.07, rotate: 0, zIndex: 60 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
