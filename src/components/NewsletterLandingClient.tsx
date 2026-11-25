"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Loader2,
  Mail,
  PenSquare,
  Rocket,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import type { NewsletterPostRow, SiteSettings } from "@/lib/beehiiv-db";
import { extractDesign } from "@/lib/newsletter-blocks";

const FOOTER_SETTINGS = {
  twitter_url: "https://x.com/AnkurBuilds",
  sender_email: "hello@ankurfulzele.in",
} as SiteSettings;

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable Dual-Field Subscribe Form (First Name + Email) matching the Creator Science
 * Hero (stacked card) and Bottom Banner (inline horizontal pills), wired straight to
 * POST /api/subscribe -> Supabase `subscribers` table + MailCheap sync.
 */
function DualFieldSubscribeForm({
  variant,
  source,
  onSuccessCount,
}: {
  variant: "stacked" | "inline";
  source: string;
  onSuccessCount?: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const refParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref") || undefined
          : undefined;
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName.trim() || undefined,
          email: email.trim(),
          source,
          referredBy: refParam,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");

      setStatus("success");
      setMessage(
        data.added === false
          ? "You're already on the list — see you Wednesday & Sunday!"
          : "You're in! Check your inbox for your Welcome Email + Builder Vault."
      );
      setFirstName("");
      setEmail("");
      if (data.added !== false && onSuccessCount) onSuccessCount();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (variant === "inline") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="w-full rounded-full bg-white px-5 py-3.5 text-[14.5px] font-medium text-[#0E1B2A] placeholder:text-[#0E1B2A]/45 focus:outline-none focus:ring-2 focus:ring-[#F4A938] sm:w-44"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Where should we send the good stuff?"
            className="w-full flex-1 rounded-full bg-white px-5 py-3.5 text-[14.5px] font-medium text-[#0E1B2A] placeholder:text-[#0E1B2A]/45 focus:outline-none focus:ring-2 focus:ring-[#F4A938]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            data-magnetic="true"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#F04E18] px-7 py-3.5 font-display text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:bg-[#ff5d28] disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get In Free →"
            )}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-center text-[13px] font-semibold ${status === "error" ? "text-[#F4A938]" : "text-[#F8EAE0]"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border-2 border-[#0E1B2A] bg-white p-4 shadow-[6px_6px_0px_#0E1B2A] sm:p-5">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Your first name"
          className="w-full rounded-xl border border-[#0E1B2A]/15 bg-[#F8EAE0]/30 px-3.5 py-2.5 text-[14px] font-medium text-[#0E1B2A] placeholder:text-[#0E1B2A]/45 focus:border-[#F04E18] focus:bg-white focus:outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Where should we send the good stuff?"
          className="w-full rounded-xl border border-[#0E1B2A]/15 bg-[#F8EAE0]/30 px-3.5 py-2.5 text-[14px] font-medium text-[#0E1B2A] placeholder:text-[#0E1B2A]/45 focus:border-[#F04E18] focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          data-magnetic="true"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E1B2A] py-3 font-display text-[14.5px] font-bold text-white shadow-[0_8px_20px_rgba(14,27,42,0.22)] transition hover:bg-[#F04E18] disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Send Me Wednesday's Story →"
          )}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-2.5 text-center text-[12.5px] font-bold ${status === "error" ? "text-[#F04E18]" : "text-emerald-700"
            }`}
        >
          {message}
        </p>
      ) : (
        <p className="mt-2.5 text-center text-[11px] font-medium leading-snug text-[#0E1B2A]/60">
          Free forever. Unsubscribe in 1 click if we ever bore you.
        </p>
      )}

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-[#0E1B2A]">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span>Instant access to our AI Builder Vault + prompts</span>
      </div>
    </div>
  );
}

const CATEGORIES = [
  "All",
  "Wednesday Stories",
  "Sunday Briefs",
  "Vibe Toolkit",
  "Skills & Repos",
  "Distribution",
] as const;

function formatDate(iso: string | null) {
  if (!iso) return "Recent";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsletterLandingClient({
  initialSection,
}: {
  initialSection?: "inside-issues" | "why-subscribe" | "archive";
} = {}) {
  const [posts, setPosts] = useState<NewsletterPostRow[]>([]);
  const [subCount, setSubCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // GSAP Pinned 3D-Perspective Flying Issue & Sticker Showcase (matching VibeLabsSection!)
  const showcaseRef = useRef<HTMLDivElement>(null);
  const flyRefs = useRef<(HTMLDivElement | null)[]>([]);

  function scrollToSection(id: string) {
    if (typeof window === "undefined") return;
    if (id === "subscribe-hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/subscribe").then((r) => r.json()),
    ])
      .then(([pData, sData]) => {
        setPosts(pData.posts || []);
        setSubCount(sData.count || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const isReload =
      typeof window !== "undefined" &&
      (performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined)
        ?.type === "reload";

    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      if (!initialSection || isReload) {
        window.scrollTo(0, 0);
      }
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top top",
          end: "+=210%",
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scrub: 1.15,
        },
      });

      const specs = [
        // 0: Left Issue Poster
        {
          from: { x: -580, y: -240, rotation: -34, rotateX: 46, rotateY: 30, scale: 1.3, opacity: 0 },
          to: { x: -245, y: 12, rotation: -5, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.0,
        },
        // 1: Center Framed Issue Poster
        {
          from: { x: 460, y: -300, rotation: 26, rotateX: 42, rotateY: -32, scale: 1.3, opacity: 0 },
          to: { x: -8, y: 26, rotation: 3, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.14,
        },
        // 2: Right Dispatch Card
        {
          from: { x: 600, y: 210, rotation: 36, rotateX: -40, rotateY: -32, scale: 1.25, opacity: 0 },
          to: { x: 235, y: 8, rotation: 7, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.28,
        },
        // 3: Draggable Polaroid
        {
          from: { x: -520, y: 280, rotation: -36, rotateX: -38, rotateY: 26, scale: 1.22, opacity: 0 },
          to: { x: -305, y: 145, rotation: -9, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.42,
        },
        // 4: Draggable Postage Stamp
        {
          from: { x: 140, y: 340, rotation: 24, rotateX: -40, rotateY: -20, scale: 1.22, opacity: 0 },
          to: { x: 120, y: 145, rotation: 5, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.54,
        },
        // 5: Top-Left Sticker
        {
          from: { x: -360, y: -300, rotation: -38, rotateX: 38, rotateY: 22, scale: 1.3, opacity: 0 },
          to: { x: -140, y: -125, rotation: -9, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.66,
        },
        // 6: Top-Right Sticker
        {
          from: { x: 460, y: -260, rotation: 32, rotateX: 40, rotateY: -26, scale: 1.3, opacity: 0 },
          to: { x: 285, y: -115, rotation: 8, rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
          at: 0.76,
        },
      ];

      specs.forEach((s, idx) => {
        const el = flyRefs.current[idx];
        if (!el) return;
        tl.fromTo(el, s.from, { ...s.to, duration: 0.28, ease: "power3.out" }, s.at);
      });
    }, showcaseRef);

    if (typeof window !== "undefined") {
      if (initialSection && !isReload) {
        window.setTimeout(() => {
          const el = document.getElementById(initialSection);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else {
        window.scrollTo(0, 0);
        window.requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    }

    return () => ctx.revert();
  }, [initialSection]);

  const featured = posts.find((p) => p.featured) || posts[0];
  const allFilterTags = Array.from(
    new Set([
      ...CATEGORIES,
      ...posts.flatMap((p) => {
        const d = extractDesign(p.template_blocks);
        return d.tags && d.tags.length > 0 ? d.tags : [p.category];
      }),
    ])
  );
  const filtered = posts.filter((p) => {
    const d = extractDesign(p.template_blocks);
    const postTags = d.tags && d.tags.length > 0 ? d.tags : [p.category];
    const matchesCat = selectedCat === "All" || postTags.includes(selectedCat);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || "").toLowerCase().includes(q) ||
      postTags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F8EAE0] text-[#0E1B2A] selection:bg-[#F04E18] selection:text-white">
      <CustomCursor />

      {/* Top Warm-Cream Independent SaaS Vibes Header */}
      <header className="sticky top-0 z-40 border-b border-[#0E1B2A]/10 bg-[#F8EAE0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/newsletter"
            data-magnetic="true"
            className="inline-flex items-center gap-2.5"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[2px_2px_0px_#0E1B2A]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-[#0E1B2A]">
              SaaS <span className="text-[#F04E18]">Vibes</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 font-display text-[14px] font-bold tracking-[-0.02em] text-[#0E1B2A]/80 md:flex">
            <Link
              href="/newsletter/inside"
              onClick={() => scrollToSection("inside-issues")}
              className="transition hover:text-[#F04E18]"
            >
              Inside
            </Link>
            <Link
              href="/newsletter/what-you-get"
              onClick={() => scrollToSection("why-subscribe")}
              className="transition hover:text-[#F04E18]"
            >
              What You Get
            </Link>
            <Link
              href="/newsletter/issues"
              onClick={() => scrollToSection("archive")}
              className="transition hover:text-[#F04E18]"
            >
              All Issues
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/newsletter"
              onClick={() => scrollToSection("subscribe-hero")}
              data-magnetic="true"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F04E18] px-5 py-2 font-display text-[13px] font-bold text-white shadow-[0_8px_22px_rgba(240,78,24,0.28)] transition hover:bg-[#d84110]"
            >
              <Mail className="h-3.5 w-3.5" />
              Join the Vibes
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* BEAT 1: ONE-FRAME 2-COLUMN HERO (Fits 100% above the fold — zero scroll!) */}
      {/* ===================================================================== */}
      <section
        id="subscribe-hero"
        style={{
          backgroundImage:
            "radial-gradient(rgba(14, 27, 42, 0.12) 1.25px, transparent 1.25px)",
          backgroundSize: "24px 24px",
        }}
        className="relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden px-5 py-6 sm:px-8 sm:py-8"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* LEFT COLUMN: Compact Brand Mark + Bold Headline + Avatars + Stacked Form (All in 1 frame!) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            {/* Brand Badge + Wednesday & Sunday Eyebrow */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[2px_2px_0px_#0E1B2A]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-[13.5px] font-bold tracking-[-0.02em] text-[#F04E18]">
                Every Wednesday &amp; Sunday · Vibe. Ship. Repeat.
              </span>
            </div>

            <h1 className="mt-3 font-display text-[clamp(1.85rem,3.6vw,2.95rem)] font-extrabold leading-[1.06] tracking-[-0.04em] text-[#0E1B2A]">
              Your localhost folder is full of half-built apps.{" "}
              <span className="text-[#F04E18]">Let&apos;s actually ship one.</span>
            </h1>

            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#0E1B2A]/80 sm:text-[15.5px]">
              Most AI newsletters give you 47 links and zero revenue. Every Wednesday and Sunday,
              SaaS Vibes drops real vibe-coded SaaS teardowns, tested dev tools, GitHub repos, and
              distribution plays you can actually steal.
            </p>

            {/* Overlapping Builder Avatars + Reader Line (number hidden) */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  { initials: "AK", bg: "#0E1B2A" },
                  { initials: "RS", bg: "#F04E18" },
                  { initials: "MJ", bg: "#26465C" },
                  { initials: "PD", bg: "#F4A938" },
                  { initials: "NV", bg: "#4D7C5B" },
                ].map((av) => (
                  <span
                    key={av.initials}
                    style={{ backgroundColor: av.bg }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F8EAE0] font-display text-[10.5px] font-bold text-white shadow-xs"
                  >
                    {av.initials}
                  </span>
                ))}
              </div>
              <p className="font-display text-[13.5px] font-bold tracking-[-0.02em] text-[#0E1B2A]">
                + solo founders, indie hackers &amp; recovering overthinkers.
              </p>
            </div>

            {/* Compact Stacked White Subscribe Card — 100% visible above the fold */}
            <div className="mt-4 max-w-[420px]">
              <DualFieldSubscribeForm
                variant="stacked"
                source="newsletter-hero"
                onSuccessCount={() => setSubCount((c) => c + 1)}
              />
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Crisp Tall iPhone 16 Pro Mockup tilted left (-3.5deg) matching Creator Science! */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: -3.5 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center lg:col-span-5 lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
              className="relative"
            >
              {/* Physical 3D Side Buttons (Left Volume + Action, Right Power) */}
              <span
                aria-hidden="true"
                className="absolute -left-[4px] top-[96px] h-7 w-[4px] rounded-l-sm bg-[#26465C]"
              />
              <span
                aria-hidden="true"
                className="absolute -left-[4px] top-[134px] h-11 w-[4px] rounded-l-sm bg-[#26465C]"
              />
              <span
                aria-hidden="true"
                className="absolute -left-[4px] top-[186px] h-11 w-[4px] rounded-l-sm bg-[#26465C]"
              />
              <span
                aria-hidden="true"
                className="absolute -right-[4px] top-[148px] h-16 w-[4px] rounded-r-sm bg-[#26465C]"
              />

              {/* Outer 3D Titanium Chassis (Exact 1:2.02 Tall iPhone Proportions: 268x540!) */}
              <div className="relative flex h-[515px] w-[256px] flex-col overflow-hidden rounded-[44px] border-[3px] border-[#334E68] bg-[#0B121C] p-[9px] shadow-[22px_28px_55px_rgba(14,27,42,0.34),-2px_-2px_0px_rgba(255,255,255,0.45)] sm:h-[540px] sm:w-[268px]">
                {/* Inner Glass Screen */}
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[36px] bg-white">
                  {/* Subtle Diagonal Glass Reflection */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/10 to-white/25"
                  />

                  {/* iOS Status Bar + Dynamic Island */}
                  <div className="flex items-center justify-between px-4 pb-2 pt-2.5 font-display text-[10px] font-bold text-[#0E1B2A]">
                    <span>9:14</span>
                    <span className="flex h-[18px] w-[74px] items-center justify-end rounded-full bg-[#0B121C] px-2">
                      <span className="h-2 w-2 rounded-full bg-[#1E3A5F]" />
                    </span>
                    <span>5G 100%</span>
                  </div>

                  {/* Mail Header */}
                  <div className="border-b border-[#0E1B2A]/10 px-3.5 pb-2.5 pt-1">
                    <p className="font-display text-[9.5px] font-bold text-[#F04E18]">
                      Wednesday Build · SaaS Vibes
                    </p>
                    <p className="mt-0.5 font-display text-[13.5px] font-extrabold leading-tight text-[#0E1B2A]">
                      How I Vibe-Coded a Micro-SaaS in 72 Hours
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-[#0E1B2A]/60">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0E1B2A] font-display text-[8.5px] font-bold text-[#F8EAE0]">
                          AF
                        </span>
                        <div>
                          <p className="font-bold leading-none text-[#0E1B2A]">Ankur Fulzele</p>
                          <p className="mt-0.5 text-[8.5px]">Founder at SaaS Vibes</p>
                        </div>
                      </div>
                      <span>Wed 9:00 AM</span>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="flex-1 px-3.5 pt-2.5 text-left">
                    <div className="flex items-center justify-center gap-1 font-display text-[11.5px] font-extrabold tracking-tight text-[#0E1B2A]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#F04E18]" />
                      SaaS Vibes
                    </div>

                    <h3 className="mt-2 font-display text-[13.5px] font-extrabold leading-tight text-[#0E1B2A]">
                      How I Vibe-Coded a Micro-SaaS in 72 Hours
                    </h3>
                    <p className="mt-1 text-[10px] leading-snug text-[#0E1B2A]/70">
                      Zero venture funding. Zero 6-month roadmap. Just Cursor, 3 coffees, and a
                      slightly reckless weekend sprint.
                    </p>

                    {/* Signal Orange Visual Banner */}
                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#F04E18] p-3 text-white">
                      <div>
                        <p className="font-display text-[13px] font-extrabold leading-tight">
                          72-Hour Vibe
                          <br />
                          Sprint Teardown
                        </p>
                        <span className="mt-1.5 inline-block rounded-full bg-[#0E1B2A] px-2 py-0.5 font-display text-[8px] font-bold text-[#F8EAE0]">
                          Wednesday Build
                        </span>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/35 bg-white/15">
                        <Rocket className="h-5 w-5 text-[#F8EAE0]" />
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1.5 text-[10px] leading-relaxed text-[#0E1B2A]/80">
                      <p>
                        Zero venture funding. Zero 6-month roadmap. Just Cursor, 3 coffees, and a
                        slightly reckless weekend sprint.
                      </p>
                      <p className="text-[#0E1B2A]/45">
                        Here&apos;s the exact stack, dumb mistakes &amp; Stripe link playbook...
                      </p>
                    </div>
                  </div>

                  {/* iOS Home Indicator */}
                  <div className="flex justify-center pb-2 pt-1">
                    <span className="h-1 w-24 rounded-full bg-[#0E1B2A]/25" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BEAT 2: VIBE LABS-STYLE GSAP PINNED 3D FLYING ISSUE & STICKER COLLAGE */}
      {/* ===================================================================== */}
      <section
        id="inside-issues"
        ref={showcaseRef}
        className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#F8EAE0] px-4"
      >
        <h2 className="relative z-10 mb-4 text-center font-display text-[clamp(2.6rem,6.5vw,5.2rem)] font-extrabold leading-none tracking-[-0.04em] text-[#0E1B2A]">
          Inside SaaS Vibes
        </h2>

        <div
          style={{ perspective: "1200px" }}
          className="relative flex h-[64svh] w-full max-w-[92vw] items-center justify-center"
        >
          {/* 0: Left Issue Poster */}
          <div
            ref={(el) => {
              flyRefs.current[0] = el;
            }}
            className="absolute z-10 transition-all hover:z-[70]"
          >
            <Link
              href="/newsletter/issues"
              onClick={() => scrollToSection("archive")}
              className="flex h-[44svh] min-h-[320px] w-[72vw] max-w-[320px] flex-col justify-between border border-[#D5C7B8] bg-[#F5EFE6] p-6 text-[#0E1B2A] shadow-[0_24px_44px_rgba(14,27,42,0.2)] transition-transform duration-200 hover:scale-105 sm:w-[26vw]"
            >
              <div className="flex items-center justify-between border-b border-[#0E1B2A]/15 pb-2 font-display text-[12px] font-bold tracking-[-0.01em]">
                <span>Every Wednesday · SaaS Story</span>
                <span className="text-[#F04E18]">Free</span>
              </div>
              <div className="my-auto py-3">
                <span className="inline-block rounded-full bg-[#0E1B2A] px-3 py-1 font-display text-[11.5px] font-bold text-[#F8EAE0]">
                  The SaaS Story
                </span>
                <p className="mt-4 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  One Real Vibe-Coded SaaS, Dissected
                </p>
              </div>
              <p className="text-[13px] leading-snug text-[#0E1B2A]/80">
                How a solo builder went from a random shower thought to a live Stripe link in days
                — exact stack, dumb mistakes, and paying users.
              </p>
            </Link>
          </div>

          {/* 1: Center Framed Poster */}
          <div
            ref={(el) => {
              flyRefs.current[1] = el;
            }}
            className="absolute z-20 transition-all hover:z-[70]"
          >
            <Link
              href="/newsletter/issues"
              onClick={() => scrollToSection("archive")}
              className="flex h-[46svh] min-h-[340px] w-[74vw] max-w-[335px] flex-col justify-between border-[12px] border-[#0E1B2A] bg-white p-6 text-[#0E1B2A] shadow-[0_26px_48px_rgba(14,27,42,0.28)] transition-transform duration-200 hover:scale-105 sm:w-[27vw]"
            >
              <div className="text-center">
                <span className="inline-block rounded-full bg-[#F04E18] px-3 py-1 font-display text-[12px] font-bold text-white">
                  Every Sunday · Weekend Brief
                </span>
                <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  Your 5-Minute SaaS &amp; AI Cheat Sheet
                </h3>
              </div>
              <div className="my-2 border-y border-[#0E1B2A]/15 py-3.5 text-center text-[13.5px] leading-relaxed text-[#0E1B2A]/80">
                Trending SaaS news, SaaS of the Week, the Vibe Toolkit, plug-and-play Skills &amp;
                GitHub Repos, and one Distribution Play before Monday hits.
              </div>
              <div className="flex items-center justify-between font-display text-[13px] font-bold text-[#0E1B2A]">
                <span>SaaS Vibes</span>
                <span className="text-[#F04E18]">Read Now →</span>
              </div>
            </Link>
          </div>

          {/* 2: Right Dispatch Card */}
          <div
            ref={(el) => {
              flyRefs.current[2] = el;
            }}
            className="absolute z-25 transition-all hover:z-[70]"
          >
            <Link
              href="/newsletter/issues"
              onClick={() => scrollToSection("archive")}
              className="flex h-[44svh] min-h-[325px] w-[72vw] max-w-[325px] flex-col justify-between border border-[#0E1B2A]/20 bg-[#FAF7F2] p-6 text-[#0E1B2A] shadow-[0_24px_44px_rgba(14,27,42,0.24)] transition-transform duration-200 hover:scale-105 sm:w-[26vw]"
            >
              <div className="bg-[#1D2D24] p-4 text-white">
                <p className="font-display text-[12px] font-bold text-[#F4A938]">
                  No Fluff · Zero Hype
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold leading-tight">
                  Built for cash-flowing machines
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-display text-[13px] font-bold text-[#F04E18]">
                  Real revenue &gt; prompt threads
                </span>
                <p className="text-[13.5px] leading-snug text-[#0E1B2A]/85">
                  Becoming a &ldquo;prompt engineer&rdquo; on X doesn&apos;t pay the bills.
                  Shipping small, useful software that solves real pain does.
                </p>
              </div>
              <div className="border-t-2 border-[#0E1B2A] pt-2.5 font-display text-base font-extrabold">
                Browse Archive →
              </div>
            </Link>
          </div>

          {/* 3: Draggable Polaroid */}
          <div
            ref={(el) => {
              flyRefs.current[3] = el;
            }}
            className="absolute z-30 hover:z-[75]"
          >
            <motion.div
              drag
              dragElastic={0.2}
              dragMomentum
              whileDrag={{ scale: 1.08 }}
              data-cursor="drag"
              className="w-44 cursor-grab select-none bg-white p-2.5 pb-6 shadow-[0_16px_30px_rgba(14,27,42,0.25)] active:cursor-grabbing sm:w-52"
            >
              <div className="flex h-24 flex-col justify-between bg-gradient-to-br from-[#F04E18] to-[#0E1B2A] p-3 text-white">
                <span className="font-display text-[11px] font-bold text-[#F4A938]">
                  Sunday Ritual
                </span>
                <span className="font-display text-sm font-bold">Coffee + SaaS Vibes</span>
              </div>
            </motion.div>
          </div>

          {/* 4: Draggable Postage Stamp */}
          <div
            ref={(el) => {
              flyRefs.current[4] = el;
            }}
            className="absolute z-35 hover:z-[75]"
          >
            <motion.div
              drag
              dragElastic={0.2}
              dragMomentum
              whileDrag={{ scale: 1.1 }}
              data-cursor="drag"
              className="w-36 cursor-grab select-none border-4 border-dashed border-[#0E1B2A] bg-white p-2 shadow-[0_14px_26px_rgba(14,27,42,0.24)] active:cursor-grabbing sm:w-40"
            >
              <div className="bg-[#F04E18] p-3 text-white">
                <p className="font-display text-[10.5px] font-bold">India Post · AI</p>
                <p className="mt-1.5 font-display text-base font-extrabold leading-tight">
                  SaaS
                  <br />
                  Vibes
                </p>
                <p className="mt-1.5 font-display text-[10.5px] font-bold text-[#F8EAE0]">
                  5 min read
                </p>
              </div>
            </motion.div>
          </div>

          {/* 5: Top-Left Amber Sticker */}
          <div
            ref={(el) => {
              flyRefs.current[5] = el;
            }}
            className="absolute z-40 hover:z-[75]"
          >
            <motion.div
              drag
              dragElastic={0.2}
              dragMomentum
              whileDrag={{ scale: 1.1 }}
              data-cursor="drag"
              className="cursor-grab select-none border-2 border-[#0E1B2A] bg-[#F4A938] px-4 py-1.5 font-display text-base font-extrabold tracking-tight text-[#0E1B2A] shadow-[4px_4px_0px_#0E1B2A] active:cursor-grabbing"
            >
              Zero AI Fluff
            </motion.div>
          </div>

          {/* 6: Top-Right Forest Green Sticker */}
          <div
            ref={(el) => {
              flyRefs.current[6] = el;
            }}
            className="absolute z-40 hover:z-[75]"
          >
            <motion.div
              drag
              dragElastic={0.2}
              dragMomentum
              whileDrag={{ scale: 1.1 }}
              data-cursor="drag"
              className="cursor-grab select-none border-2 border-[#0E1B2A] bg-[#4D7C5B] px-4 py-2 font-display text-[13.5px] font-bold text-white shadow-[4px_4px_0px_#0E1B2A] active:cursor-grabbing"
            >
              100% Real Builds
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BEAT 3: VIBE LABS-STYLE SCROLL COLOR-WAVE MANIFESTO                   */}
      {/* ===================================================================== */}
      <ScrollRevealText
        theme="cream"
        eyebrow="Why SaaS Vibes exists"
        trackHeightClass="h-[300vh]"
        sizeClass="text-[30px] sm:text-[50px] lg:text-[62px]"
        text="Another '10x your life with ChatGPT' thread isn't going to ship your SaaS. SaaS Vibes hands you the real 7-day builds, tested repos, and scrappy growth plays that turn weekend code into Monday revenue."
        stickers={[
          {
            text: "Battle-tested stacks",
            at: 0.34,
            positionClass: "top-[24%] right-[10%]",
            rotate: -4,
          },
          {
            text: "Honest revenue logs",
            at: 0.56,
            positionClass: "top-[58%] left-[8%]",
            rotate: -6,
            bg: "#F4A938",
            fg: "#0E1B2A",
          },
          {
            text: "Wed & Sun drops",
            at: 0.76,
            positionClass: "bottom-[10%] right-[18%]",
            rotate: 4,
          },
        ]}
      />

      {/* ===================================================================== */}
      {/* BEAT 4: WHAT LANDS IN YOUR INBOX (WED + SUN + WHY SUBSCRIBE)          */}
      {/* ===================================================================== */}
      <section id="why-subscribe" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="text-center">
          <p className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#F04E18]">
            Every Wednesday &amp; Sunday
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-[#0E1B2A] sm:text-5xl">
            What lands in your inbox
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Rocket,
              tag: "01 · Every Wednesday",
              title: "The Wednesday SaaS Story",
              desc: "One deep, zero-BS case study on how a solo founder vibe-coded a product fast and got people to pull out their credit cards. Stack, prompts, pricing, and scars included.",
              accent: "#F04E18",
            },
            {
              icon: Cpu,
              tag: "02 · Every Sunday",
              title: "The Sunday Weekend Brief",
              desc: "Five tight blocks in 5 minutes: Trending SaaS News, SaaS of the Week, Vibe Toolkit, Skills & Repos, and The Distribution Play—filtered strictly for builders.",
              accent: "#F4A938",
            },
            {
              icon: Flame,
              tag: "03 · Why Subscribe",
              title: "Skip the 4-Hour Rabbit Hole",
              desc: "Stop doomscrolling X pretending it's 'market research.' We test the tools, dig up the repos, and hand you what works—plus you unlock our AI Builder Vault the second you join.",
              accent: "#26465C",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.tag}
                className="flex flex-col justify-between rounded-[26px] border-2 border-[#0E1B2A] bg-white p-7 shadow-[6px_6px_0px_#0E1B2A] transition-transform duration-200 hover:-translate-y-1.5"
              >
                <div>
                  <div
                    style={{ backgroundColor: item.accent }}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#0E1B2A] text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 font-display text-[13px] font-bold tracking-[-0.01em] text-[#0E1B2A]/60">
                    {item.tag}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[#0E1B2A]/75">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BEAT 4.5: WHO THIS IS FOR (High-Trust 2-Column Filter Block)          */}
      {/* ===================================================================== */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mb-8 text-center">
          <p className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#F04E18]">
            Honest Filter
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-4xl">
            Is SaaS Vibes actually for you?
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscribe If */}
          <div className="rounded-[26px] border-2 border-[#0E1B2A] bg-white p-7 shadow-[6px_6px_0px_#0E1B2A]">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 font-display text-[13px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Subscribe if:
            </p>
            <ul className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#0E1B2A]/85">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  You&apos;d rather ship an ugly MVP on Sunday night than polish a Figma file for
                  three months.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  You want real revenue teardowns, working GitHub repos, and scrappy distribution
                  tactics.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  You build with AI (Cursor, Claude Code, Replit) and want to actually make money
                  from it.
                </span>
              </li>
            </ul>
          </div>

          {/* Skip This If */}
          <div className="rounded-[26px] border-2 border-[#0E1B2A]/20 bg-[#FAF7F2] p-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#F04E18]/10 px-3.5 py-1 font-display text-[13px] font-bold text-[#F04E18]">
              <XCircle className="h-3.5 w-3.5" />
              Skip this if:
            </p>
            <ul className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#0E1B2A]/75">
              <li className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#F04E18]" />
                <span>You want 40 corporate press releases about $500M VC rounds.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#F04E18]" />
                <span>
                  You think &ldquo;liking&rdquo; AI tool threads counts as building a business.
                </span>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#0E1B2A]/10 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] font-semibold text-[#0E1B2A]/80">
                Still here? Good. Jump in and raid the{" "}
                <span className="text-[#F04E18]">AI Builder Vault</span> immediately.
              </p>
              <Link
                href="/newsletter"
                onClick={() => scrollToSection("subscribe-hero")}
                data-magnetic="true"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-[#0E1B2A] bg-[#F04E18] px-5 py-2.5 font-display text-[13px] font-extrabold text-white shadow-[3px_3px_0px_#0E1B2A] transition hover:-translate-y-0.5 hover:bg-[#d84110]"
              >
                Raid the Builder Vault
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BEAT 5: FEATURED ISSUE + FULL SUPABASE BLOG / NEWSLETTER ARCHIVE      */}
      {/* ===================================================================== */}
      <main id="archive" className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2.5 py-24 font-display text-[14px] font-bold text-[#0E1B2A]/70">
            <Loader2 className="h-4 w-4 animate-spin text-[#F04E18]" />
            Loading SaaS Vibes issues...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[30px] border-2 border-[#0E1B2A] bg-white p-12 text-center shadow-[8px_8px_0px_#0E1B2A]">
            <h2 className="font-display text-2xl font-extrabold text-[#0E1B2A]">
              Your SaaS Vibes archive is ready for Issue #1
            </h2>
            <p className="mt-2 text-[15px] text-[#0E1B2A]/75">
              Open the Admin Studio to compose, upload images, and publish to web + email.
            </p>
            <Link
              href="/admin/posts/new"
              data-magnetic="true"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F04E18] px-7 py-3.5 font-display text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(240,78,24,0.28)] transition hover:bg-[#d84110]"
            >
              <PenSquare className="h-4 w-4" />
              Create First Issue
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Issue Spotlight */}
            {featured && selectedCat === "All" && (
              <section className="mb-14">
                <p className="mb-3.5 font-display text-[14px] font-bold tracking-[-0.02em] text-[#F04E18]">
                  Featured · Wednesday Story
                </p>
                <motion.div
                  data-cursor="read"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <Link
                    href={`/newsletter/${featured.slug}`}
                    className="group grid overflow-hidden rounded-[28px] border-2 border-[#0E1B2A] bg-white text-[#0E1B2A] shadow-[8px_8px_0px_#0E1B2A] transition hover:shadow-[12px_12px_0px_#F04E18] lg:grid-cols-12"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0E1B2A] lg:col-span-5 lg:aspect-auto lg:min-h-[290px]">
                      {featured.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.thumbnail_url}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#26465C] via-[#0E1B2A] to-[#1D1726] p-6 text-left">
                          <span className="self-start rounded-full bg-[#F04E18] px-3 py-1 font-display text-[12px] font-bold text-white">
                            Featured · {featured.category}
                          </span>
                          <p className="font-display text-2xl font-extrabold leading-tight text-[#F8EAE0]">
                            {featured.title}
                          </p>
                        </div>
                      )}
                      <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2.5 py-1 font-display text-[11.5px] font-bold text-white backdrop-blur-sm">
                        {featured.read_time}
                      </span>
                    </div>

                    <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 font-display text-[12.5px] font-bold text-[#0E1B2A]/65">
                          <span className="rounded-full bg-[#F8EAE0] px-3 py-1 text-[#0E1B2A]">
                            {featured.category}
                          </span>
                          <span>{formatDate(featured.published_at || featured.created_at)}</span>
                        </div>

                        <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-[-0.03em] group-hover:text-[#F04E18] sm:text-4xl">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#0E1B2A]/75">
                            {featured.excerpt}
                          </p>
                        )}
                      </div>

                      <span className="mt-7 inline-flex items-center gap-2 font-display text-[15px] font-bold text-[#0E1B2A] group-hover:text-[#F04E18]">
                        Read full issue
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </section>
            )}

            {/* Category Filter Pills + Live Search + Count */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {allFilterTags.map((cat) => {
                  const active = selectedCat === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCat(cat)}
                      className={`rounded-full px-4 py-1.5 font-display text-[13px] font-bold transition-all ${active
                        ? "border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[3px_3px_0px_#0E1B2A]"
                        : "border-2 border-[#0E1B2A]/20 bg-white text-[#0E1B2A] hover:border-[#0E1B2A]"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0E1B2A]/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search issues..."
                    className="w-44 rounded-full border-2 border-[#0E1B2A]/20 bg-white py-1.5 pl-8 pr-3.5 text-[12.5px] font-medium text-[#0E1B2A] outline-none transition focus:border-[#0E1B2A] sm:w-56"
                  />
                </div>
                <span className="font-display text-[13px] font-bold text-[#0E1B2A]/70">
                  {filtered.length} {filtered.length === 1 ? "issue" : "issues"}
                </span>
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="mt-8 rounded-2xl border-2 border-dashed border-[#0E1B2A]/20 bg-white/70 p-10 text-center">
                <p className="font-display text-lg font-bold text-[#0E1B2A]">
                  No issues match &ldquo;{searchQuery || selectedCat}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat("All");
                    setSearchQuery("");
                  }}
                  className="mt-3 rounded-full bg-[#0E1B2A] px-5 py-2 text-[12.5px] font-bold text-[#F8EAE0] hover:bg-[#F04E18]"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Cream Editorial Polaroid Archive Grid */}
            <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, idx) => {
                const isHovered = hoveredId === post.id;
                const tiltAngle = idx % 2 === 0 ? -3 : 3;

                return (
                  <motion.div
                    key={post.id}
                    data-cursor="read"
                    onMouseEnter={() => setHoveredId(post.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    animate={{
                      scale: isHovered ? 1.06 : 1,
                      rotate: isHovered ? tiltAngle : 0,
                      y: isHovered ? -8 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ zIndex: isHovered ? 50 : 10 }}
                    className={`relative cursor-pointer rounded-[24px] border-2 bg-white p-4 pb-6 text-[#0E1B2A] transition-shadow duration-200 ${isHovered
                      ? "border-[#F04E18] shadow-[10px_10px_0px_#F04E18]"
                      : "border-[#0E1B2A] shadow-[5px_5px_0px_#0E1B2A]"
                      }`}
                  >
                    <Link
                      href={`/newsletter/${post.slug}`}
                      className="flex h-full flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[#0E1B2A]">
                          {post.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.thumbnail_url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#1B3344] via-[#0E1B2A] to-[#1D1726] p-4 text-left">
                              <span className="self-start rounded-full bg-white/15 px-2.5 py-0.5 font-display text-[11.5px] font-bold text-[#F8EAE0] backdrop-blur-md">
                                {post.category}
                              </span>
                              <p className="line-clamp-2 font-display text-lg font-bold leading-tight text-white">
                                {post.title}
                              </p>
                            </div>
                          )}

                          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-2 py-0.5 font-display text-[11px] font-bold text-white backdrop-blur-sm">
                            {post.read_time}
                          </span>
                        </div>

                        <div className="mt-4 px-1 text-left">
                          {(() => {
                            const d = extractDesign(post.template_blocks);
                            const postTags = d.tags && d.tags.length > 0 ? d.tags : [post.category];
                            return (
                              <p className="font-display text-[12.5px] font-bold text-[#F04E18]">
                                {d.issueLabel ? `${d.issueLabel} · ` : ""}
                                {postTags.join(" · ")} · {formatDate(post.published_at || post.created_at)}
                              </p>
                            );
                          })()}
                          <h3 className="mt-1.5 line-clamp-2 font-display text-[19px] font-extrabold leading-snug tracking-[-0.02em] text-[#0E1B2A]">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[#0E1B2A]/70">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 px-1">
                        <span className="inline-flex items-center gap-1.5 font-display text-[13.5px] font-bold text-[#0E1B2A]">
                          Read issue →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

      </main>

      {/* ===================================================================== */}
      {/* BEAT 6: READER TESTIMONIALS / SOCIAL PROOF (Creator Science Style)    */}
      {/* ===================================================================== */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="mb-8 text-center">
          <p className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#F04E18]">
            Loved by indie builders
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-4xl">
            Why founders open SaaS Vibes first
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              quote:
                "Zero fluff, actual repos, and distribution plays I can run on Monday morning. Easily the highest signal-to-noise AI SaaS email in my inbox.",
              name: "Rohan Sharma",
              handle: "@rohanbuilds",
              initials: "RS",
              bg: "#0E1B2A",
            },
            {
              quote:
                "The Weekend Brief 5-card format takes 4 minutes to scan and always gives me at least one tool or growth angle I immediately apply to my micro-SaaS.",
              name: "Maya Joshi",
              handle: "@mayaships",
              initials: "MJ",
              bg: "#F04E18",
            },
            {
              quote:
                "Most newsletters just recycle AI press releases. SaaS Vibes actually opens the hood on how solo builders vibe-code and market products to revenue.",
              name: "Arjun Kulkarni",
              handle: "@arjunindie",
              initials: "AK",
              bg: "#26465C",
            },
          ].map((t) => (
            <div
              key={t.handle}
              className="flex flex-col justify-between rounded-[24px] border-2 border-[#0E1B2A]/12 bg-white p-6 shadow-[0_12px_30px_rgba(14,27,42,0.06)]"
            >
              <p className="text-[14.5px] leading-relaxed text-[#0E1B2A]/85">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  style={{ backgroundColor: t.bg }}
                  className="flex h-10 w-10 items-center justify-center rounded-full font-display text-[12px] font-extrabold text-white"
                >
                  {t.initials}
                </span>
                <div>
                  <p className="font-display text-[14px] font-extrabold text-[#0E1B2A]">
                    {t.name}
                  </p>
                  <p className="font-display text-[12.5px] font-medium text-[#0E1B2A]/55">{t.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FULL-BLEED SUBSCRIBE BANNER ABOVE FOOTER (Exact Screenshot 1 Layout!) */}
      {/* Deep Navy (#0E1B2A) + Dot Grid + Inline Pill Form + Circular Stamp    */}
      {/* ===================================================================== */}
      <section
        style={{
          backgroundImage:
            "radial-gradient(rgba(248, 234, 224, 0.14) 1.25px, transparent 1.25px)",
          backgroundSize: "24px 24px",
        }}
        className="relative overflow-hidden bg-[#0E1B2A] px-5 py-20 text-center text-[#F8EAE0] sm:px-8 sm:py-24"
      >
        {/* Oversized Decorative Circular Watermark Emblem (bottom-right, matching Screenshot 1!) */}
        <svg
          viewBox="0 0 260 260"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-12 h-72 w-72 opacity-15 sm:h-80 sm:w-80"
        >
          <defs>
            <path
              id="saasVibesCircle"
              d="M 130, 130 m -92, 0 a 92,92 0 1,1 184,0 a 92,92 0 1,1 -184,0"
            />
          </defs>
          <circle cx="130" cy="130" r="120" stroke="#F8EAE0" strokeWidth="3" fill="none" />
          <circle cx="130" cy="130" r="64" stroke="#F04E18" strokeWidth="3" fill="none" />
          <text
            fill="#F8EAE0"
            fontSize="20"
            fontWeight="700"
            letterSpacing="2"
            fontFamily="Space Grotesk, sans-serif"
          >
            <textPath href="#saasVibesCircle">
              • Vibe. Ship. Repeat. • Two emails a week •
            </textPath>
          </text>
        </svg>

        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Your next SaaS doesn&apos;t need 6 months. It needs Wednesday &amp; Sunday.
          </h2>
          <p className="mt-3 text-[16px] font-medium text-[#F8EAE0]/80 sm:text-[18px]">
            Join for the Wednesday SaaS Story + Sunday Weekend Brief—and raid our free AI Builder
            Vault immediately.
          </p>

          <div className="mt-8">
            <DualFieldSubscribeForm
              variant="inline"
              source="newsletter-bottom"
              onSuccessCount={() => setSubCount((c) => c + 1)}
            />
          </div>

          <p className="mt-4 font-display text-[13.5px] font-bold tracking-[-0.01em] text-[#F8EAE0]/65">
            Vibe. Ship. Repeat. · Two emails a week, zero fluff.
          </p>
        </div>
      </section>

      {/* Same Homepage MicaelaFooter — scaled down with `compact` so it fits comfortably below the header! */}
      <div className="bg-[#F04E18]">
        <MicaelaFooter settings={FOOTER_SETTINGS} compact />
      </div>
    </div>
  );
}
