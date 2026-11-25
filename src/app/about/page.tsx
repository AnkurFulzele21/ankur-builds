import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Github, Mail, Twitter, Youtube } from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteSubpageHeader } from "@/components/SiteSubpageHeader";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import type { SiteSettings } from "@/lib/beehiiv-db";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About — Ankur Fulzele (@AnkurBuilds)",
  description:
    "Half engineer, half endurance athlete — meet Ankur Fulzele, solo SaaS builder, creator of LifeOS (3,000+ downloads), and founder of SaaS Vibes.",
};

const FOOTER_SETTINGS = {
  twitter_url: "https://x.com/AnkurBuilds",
  sender_email: "hello@ankurfulzele.in",
} as SiteSettings;

const STATS = [
  { value: "3,000+", label: "LifeOS Play Store Downloads" },
  { value: "04", label: "Shipped Apps & Web Products" },
  { value: "2× / WK", label: "SaaS Vibes Drops (Wed & Sun)" },
  { value: "HYROX", label: "Double Circuit & Marathon Finisher" },
];

const CHAPTERS = [
  {
    num: "01",
    tag: "PLAY STORE APP",
    title: "LifeOS — Health, Habit & Focus Tracker",
    desc: "Built to solve my own daily discipline problem. Crossed 3,000+ organic downloads on the Google Play Store and still growing.",
    href: "/vibe-labs",
  },
  {
    num: "02",
    tag: "AI WORKFLOWS & MEDIA",
    title: "Learn To Use AI & SaaS Vibes",
    desc: "Sharing real vibe-coded SaaS teardowns, practical AI workflows, tested GitHub repos, and scrappy product-market distribution plays.",
    href: "/newsletter",
  },
  {
    num: "03",
    tag: "HABIT & CHALLENGE APPS",
    title: "Habits App & 75 Hard Companion",
    desc: "Two focused mobile products built around atomic daily habits (inspired by Atoms) and completing the 75 Hard mental toughness challenge.",
    href: "/vibe-labs",
  },
  {
    num: "04",
    tag: "THE DAILY GRIND",
    title: "HYROX, Double Circuit & Marathons",
    desc: "When the laptop closes, the real suffering starts — competing in HYROX, Double Circuit races, and stacking marathon finisher medals.",
    href: "/daily-grind",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0E1B2A] text-[#F8EAE0] selection:bg-[#F04E18] selection:text-white">
      <CustomCursor />
      <SiteSubpageHeader theme="navy" />

      {/* ================================================================= */}
      {/* TREVOR NOAH–INSPIRED EDITORIAL HERO (DEEP NAVY BLUE CANVAS)       */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
        {/* Giant Background Watermark Headline */}
        <div className="mx-auto max-w-6xl">
          <p className="font-mono-tech text-[11.5px] font-bold uppercase tracking-[0.26em] text-[#F04E18]">
            ANKUR FULZELE · INDIA · @ANKURBUILDS
          </p>

          <h1 className="mt-4 font-display text-[clamp(3.2rem,10.5vw,9.2rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em] text-[#F8EAE0]">
            ABOUT <span className="text-[#F04E18]">ME.</span>
          </h1>

          <div className="mt-10 grid items-end gap-10 lg:grid-cols-12">
            {/* Editorial Portrait Frame */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-b from-[#162940] to-[#0B1522] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[20px] bg-[#13253A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/section1/footer-cutout.png?v=2"
                    alt="Ankur Fulzele"
                    className="h-[94%] w-auto object-contain object-bottom drop-shadow-[0_18px_36px_rgba(0,0,0,0.5)]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#F04E18] px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-white">
                    HALF ENGINEER · HALF ATHLETE
                  </span>
                </div>
              </div>
            </div>

            {/* Lead Editorial Manifesto Quote */}
            <div className="lg:col-span-7 lg:pb-4">
              <blockquote className="font-display text-[clamp(1.65rem,3.4vw,2.85rem)] font-bold leading-[1.16] tracking-[-0.03em] text-white">
                &ldquo;Half engineer, half endurance athlete — basically I pay money to suffer in
                gyms and write code for free until someone{" "}
                <span className="text-[#F04E18]">clicks buy.</span>&rdquo;
              </blockquote>
              <p className="mt-4 font-mono-tech text-[12px] font-bold uppercase tracking-[0.24em] text-[#F4A938]">
                — Ankur Fulzele
              </p>

              <p className="mt-7 max-w-2xl text-[16.5px] leading-[1.78] text-[#F8EAE0]/80 sm:text-[18px]">
                I&apos;m a solo builder, vibe-coder, and endurance athlete from India. I spend my
                mornings training for HYROX, Double Circuit, and marathons — and my days shipping
                AI-powered apps, micro-SaaS experiments, and the twice-weekly{" "}
                <Link href="/newsletter" className="font-bold text-[#F04E18] underline">
                  SaaS Vibes
                </Link>{" "}
                newsletter.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { label: "X / @AnkurBuilds", href: "https://x.com/AnkurBuilds", icon: Twitter },
                  { label: "GitHub", href: "https://github.com/AnkurFulzele21", icon: Github },
                  { label: "YouTube", href: "https://www.youtube.com/@ankurfulzele", icon: Youtube },
                  { label: "Substack", href: "https://substack.com/@ankurfulzele", icon: Mail },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-magnetic="true"
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 font-mono-tech text-[11.5px] font-bold uppercase tracking-wider text-white transition hover:border-[#F04E18] hover:bg-[#F04E18]"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* OVERSIZED STATS STRIP (BOLD BLUE EDITORIAL BAND)                  */}
      {/* ================================================================= */}
      <section className="border-y border-white/12 bg-[#0A1522] px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l-2 border-[#F04E18] pl-5">
              <p className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#F8EAE0]/65">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* MAGAZINE-STYLE 2-COLUMN BIO STORY                                 */}
      {/* ================================================================= */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-mono-tech text-[11.5px] font-bold uppercase tracking-[0.24em] text-[#F04E18]">
              01 / THE STORY
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Builder first. Athlete always.
            </h2>
          </div>

          <div className="space-y-6 text-[17px] leading-[1.82] text-[#F8EAE0]/82 sm:text-[19px] lg:col-span-8">
            <p>
              Most people wait six months to polish a pitch deck or over-engineer a codebase nobody
              asked for. I took the opposite route: pick a real problem I personally feel, vibe-code
              a working product fast, ship it publicly, and let real users decide what survives.
            </p>
            <p>
              That mindset led to <strong className="text-white">LifeOS</strong> crossing{" "}
              <strong className="text-[#F4A938]">3,000+ downloads on the Google Play Store</strong>,
              building <strong className="text-white">Learn To Use AI</strong> to share practical AI
              workflows and product-market plays, and shipping focused discipline apps like{" "}
              <strong className="text-white">Habits App</strong> and{" "}
              <strong className="text-white">75 Hard App</strong>.
            </p>
            <p>
              Outside the screen, I chase hard physical goals — competing in{" "}
              <strong className="text-white">HYROX</strong>, grinding through{" "}
              <strong className="text-white">Double Circuit</strong> competitions, and crossing{" "}
              <strong className="text-white">marathon</strong> finish lines. Training for endurance
              races and shipping solo software run on the exact same engine: show up every day,
              embrace the discomfort, and finish what you start.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* EDITORIAL CHAPTER LIST (TREVOR NOAH ROW-HOVER STYLE)              */}
      {/* ================================================================= */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <p className="font-mono-tech text-[11.5px] font-bold uppercase tracking-[0.24em] text-[#F04E18]">
          02 / WHAT I&apos;M BUILDING &amp; DOING
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-5xl">
          Explore the full world.
        </h2>

        <div className="mt-10 divide-y divide-white/15 border-y border-white/15">
          {CHAPTERS.map((ch) => (
            <Link
              key={ch.num}
              href={ch.href}
              className="group grid items-center gap-4 py-8 transition hover:bg-white/[0.03] sm:px-4 md:grid-cols-12"
            >
              <div className="flex items-center gap-4 md:col-span-3">
                <span className="font-mono-tech text-sm font-bold text-[#F04E18]">{ch.num}</span>
                <span className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#F8EAE0]/55">
                  {ch.tag}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="font-display text-2xl font-extrabold text-white transition group-hover:text-[#F04E18]">
                  {ch.title}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-4 md:col-span-5">
                <p className="text-[14.5px] leading-relaxed text-[#F8EAE0]/70">{ch.desc}</p>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition group-hover:border-[#F04E18] group-hover:bg-[#F04E18]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Signal Orange Footer */}
      <div className="bg-[#F04E18]">
        <MicaelaFooter settings={FOOTER_SETTINGS} compact />
      </div>
    </div>
  );
}
