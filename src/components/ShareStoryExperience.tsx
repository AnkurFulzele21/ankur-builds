"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Rocket,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";
import { MicaelaFooter } from "@/components/MicaelaFooter";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/beehiiv-db";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_SETTINGS = {
  twitter_url: "https://x.com/AnkurBuilds",
  sender_email: "hello@ankurfulzele.in",
} as SiteSettings;

async function compressImageFallback(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

async function uploadStoryImage(file: File): Promise<string> {
  try {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `pitches/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("newsletter-media")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (!error) {
      const { data } = supabase.storage.from("newsletter-media").getPublicUrl(filePath);
      if (data?.publicUrl) return data.publicUrl;
    }
  } catch {
    // Fallback to compressed data URL below
  }
  return compressImageFallback(file);
}

export function ShareStoryExperience() {
  const worldRef = useRef<HTMLDivElement>(null);
  const creamTriggerRef = useRef<HTMLDivElement>(null);
  const footerMorphRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  const [founderName, setFounderName] = useState("");
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [saasName, setSaasName] = useState("");
  const [saasUrl, setSaasUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [mrr, setMrr] = useState("");
  const [payingUsers, setPayingUsers] = useState("");
  const [shipTime, setShipTime] = useState("");
  const [techStack, setTechStack] = useState("");
  const [story, setStory] = useState("");
  const [biggestMistake, setBiggestMistake] = useState("");
  const [distributionPlay, setDistributionPlay] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const [founderPhotoUrl, setFounderPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [proofScreenshots, setProofScreenshots] = useState<string[]>([]);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Continuous Awwwards color world morph: Deep Navy (#0E1B2A) -> Warm Cream (#F8EAE0) -> Signal Orange (#F04E18)
      gsap.fromTo(
        worldRef.current,
        { backgroundColor: "#0E1B2A", color: "#F8EAE0" },
        {
          backgroundColor: "#F8EAE0",
          color: "#0E1B2A",
          ease: "none",
          scrollTrigger: {
            trigger: creamTriggerRef.current,
            start: "top 85%",
            end: "bottom 35%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.fromTo(
        worldRef.current,
        { backgroundColor: "#F8EAE0" },
        {
          backgroundColor: "#F04E18",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: footerMorphRef.current,
            start: "top 85%",
            end: "bottom 30%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  async function handleFounderPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const url = await uploadStoryImage(file);
      setFounderPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleProofFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingProof(true);
    setError("");
    try {
      const remaining = Math.max(0, 6 - proofScreenshots.length);
      const uploaded = await Promise.all(
        files.slice(0, remaining).map((file) => uploadStoryImage(file))
      );
      setProofScreenshots((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload screenshots");
    } finally {
      setUploadingProof(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/founder-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderName,
          email,
          xHandle,
          saasName,
          saasUrl,
          tagline,
          mrr,
          payingUsers,
          shipTime,
          techStack,
          story,
          biggestMistake,
          distributionPlay,
          founderPhotoUrl,
          proofScreenshots,
          extraNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your story.");
      setSubmitted(true);
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={worldRef} className="relative min-h-screen overflow-x-clip bg-[#0E1B2A] text-[#F8EAE0]">
      <CustomCursor />

      {/* Minimal Floating Header */}
      <header className="sticky top-0 z-40 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/newsletter"
            data-magnetic="true"
            className="inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/10 px-4 py-2 font-display text-[13.5px] font-bold backdrop-blur-md transition hover:border-[#F04E18] hover:text-[#F04E18]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to SaaS Vibes
          </Link>

          <button
            type="button"
            onClick={() =>
              formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            data-magnetic="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F04E18] px-5 py-2 font-display text-[13.5px] font-bold text-white shadow-[0_10px_24px_rgba(240,78,24,0.32)] transition hover:bg-[#ff5d28]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Drop Your Story
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* ACT 1: DEEP NAVY CINEMATIC OPENING (Sarcastic @AnkurBuilds Tone)      */}
      {/* ===================================================================== */}
      <section className="relative flex min-h-[82svh] flex-col items-center justify-center px-5 pb-12 pt-8 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F8EAE0]/20 bg-[#F8EAE0]/10 px-4 py-1.5 font-display text-[13px] font-bold text-[#F4A938]">
            <Rocket className="h-3.5 w-3.5" />
            Secret Wednesday Feature Desk · SaaS Vibes
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.4rem,6.5vw,5.2rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-[#F8EAE0]">
            Built a SaaS people{" "}
            <span className="text-[#F04E18]">actually pay for?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-display text-[17px] font-medium leading-relaxed text-[#F8EAE0]/80 sm:text-[20px]">
            Everyone on X is busy posting &ldquo;27 ChatGPT prompts to quit your job.&rdquo;
            If you actually shipped real software, wired Stripe, and convinced strangers to enter
            their card digits — drop the receipts below. Best builds get featured in{" "}
            <span className="font-bold text-white">Wednesday&apos;s SaaS Vibes</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              data-magnetic="true"
              className="inline-flex items-center gap-2 rounded-full bg-[#F04E18] px-8 py-4 font-display text-[15.5px] font-extrabold text-white shadow-[0_14px_34px_rgba(240,78,24,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ff5d28]"
            >
              Pitch Your SaaS Story
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Smooth Scroll Morph Trigger: Deep Navy -> Warm Cream */}
      <div ref={creamTriggerRef} aria-hidden="true" className="h-[14vh] w-full" />

      {/* ===================================================================== */}
      {/* ACT 2: THE FOUNDER DOSSIER FORM (Warm Cream Editorial Paper)          */}
      {/* ===================================================================== */}
      <section
        ref={formSectionRef}
        className="mx-auto max-w-4xl px-5 pb-20 pt-4 text-[#0E1B2A] sm:px-8"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-[32px] border-2 border-[#0E1B2A] bg-white p-8 text-center shadow-[10px_10px_0px_#0E1B2A] sm:p-14"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0E1B2A] bg-emerald-400 text-[#0E1B2A] shadow-[4px_4px_0px_#0E1B2A]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-4xl">
                Dossier landed safely on Ankur&apos;s desk.
              </h2>
              <p className="mx-auto mt-3 max-w-xl font-display text-[16px] leading-relaxed text-[#0E1B2A]/75">
                No PR fluff, no spam list — your pitch is stored privately in our editorial studio.
                If your build makes the cut for Wednesday&apos;s SaaS Story or Sunday&apos;s Weekend
                Brief, Ankur will email or DM you directly before we publish.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/newsletter"
                  className="rounded-full border-2 border-[#0E1B2A] bg-[#0E1B2A] px-7 py-3 font-display text-[14px] font-bold text-white transition hover:bg-[#F04E18]"
                >
                  Read SaaS Vibes Issues →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSaasName("");
                    setSaasUrl("");
                    setStory("");
                    setProofScreenshots([]);
                  }}
                  className="rounded-full border-2 border-[#0E1B2A] bg-white px-6 py-3 font-display text-[14px] font-bold text-[#0E1B2A] transition hover:bg-[#F8EAE0]"
                >
                  Submit Another Build
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Chapter 1: Founder & SaaS */}
              <div className="rounded-[28px] border-2 border-[#0E1B2A] bg-white p-6 shadow-[8px_8px_0px_#0E1B2A] sm:p-9">
                <p className="font-display text-[13.5px] font-bold text-[#F04E18]">
                  01 · Who are you &amp; what did you ship?
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-3xl">
                  The Basics (No LinkedIn bios please)
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Private Email (for follow-up) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourdomain.com"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      X / Twitter Handle
                    </label>
                    <input
                      type="text"
                      value={xHandle}
                      onChange={(e) => setXHandle(e.target.value)}
                      placeholder="@yourhandle"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      SaaS / App Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={saasName}
                      onChange={(e) => setSaasName(e.target.value)}
                      placeholder="e.g. InvoicePing"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Live SaaS Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={saasUrl}
                      onChange={(e) => setSaasUrl(e.target.value)}
                      placeholder="https://yourproduct.com"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      One-liner (Explain it like I&apos;m 3 coffees deep)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="What painful thing does it fix and who pays for it?"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Founder Photo Upload */}
                <div className="mt-6 rounded-2xl border-2 border-dashed border-[#0E1B2A]/20 bg-[#F8EAE0]/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {founderPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={founderPhotoUrl}
                          alt="Founder portrait"
                          className="h-14 w-14 rounded-2xl border-2 border-[#0E1B2A] object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#0E1B2A]/25 bg-white text-[#0E1B2A]/50">
                          <Camera className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-display text-[14px] font-bold text-[#0E1B2A]">
                          Your Photo / Avatar
                        </p>
                        <p className="font-display text-[12.5px] text-[#0E1B2A]/65">
                          So readers see the actual human behind the Stripe link.
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#0E1B2A] bg-white px-4 py-2 font-display text-[13px] font-bold text-[#0E1B2A] shadow-[3px_3px_0px_#0E1B2A] transition hover:-translate-y-0.5">
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-[#F04E18]" />
                      )}
                      {founderPhotoUrl ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFounderPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Chapter 2: Receipts & Screenshots */}
              <div className="rounded-[28px] border-2 border-[#0E1B2A] bg-white p-6 shadow-[8px_8px_0px_#0E1B2A] sm:p-9">
                <p className="font-display text-[13.5px] font-bold text-[#F04E18]">
                  02 · Show me the receipts
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-3xl">
                  Real Numbers &amp; Screenshots
                </h2>
                <p className="mt-1 font-display text-[14px] text-[#0E1B2A]/65">
                  Even $180 MRR from real strangers beats &ldquo;$50k waitlist signups.&rdquo; Honest
                  numbers always win.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Current Revenue / MRR
                    </label>
                    <input
                      type="text"
                      value={mrr}
                      onChange={(e) => setMrr(e.target.value)}
                      placeholder="e.g. $1,450 MRR or $620 total"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Paying Users / Downloads
                    </label>
                    <input
                      type="text"
                      value={payingUsers}
                      onChange={(e) => setPayingUsers(e.target.value)}
                      placeholder="e.g. 42 paying customers"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Time to Ship v1
                    </label>
                    <input
                      type="text"
                      value={shipTime}
                      onChange={(e) => setShipTime(e.target.value)}
                      placeholder="e.g. 1 weekend, 10 days, 3 weeks"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Tech &amp; AI Stack
                    </label>
                    <input
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="e.g. Cursor, Next.js, Supabase, Stripe"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dashboard / Stripe / Payment Screenshots Multi-Upload */}
                <div className="mt-6 rounded-2xl border-2 border-dashed border-[#0E1B2A]/25 bg-[#F8EAE0]/35 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-[14.5px] font-bold text-[#0E1B2A]">
                        Dashboard, Stripe &amp; Payment Screenshots (up to 6)
                      </p>
                      <p className="font-display text-[12.5px] text-[#0E1B2A]/65">
                        Product UI, Stripe payouts, Razorpay, or analytics — blur anything sensitive.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#0E1B2A] bg-[#F4A938] px-4 py-2 font-display text-[13px] font-extrabold text-[#0E1B2A] shadow-[3px_3px_0px_#0E1B2A] transition hover:-translate-y-0.5">
                      {uploadingProof ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      Add Screenshots
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProofFiles}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {proofScreenshots.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {proofScreenshots.map((src, idx) => (
                        <div
                          key={idx}
                          className="group relative overflow-hidden rounded-xl border-2 border-[#0E1B2A] bg-white"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Proof screenshot ${idx + 1}`}
                            className="aspect-[16/10] w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProofScreenshots((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute right-1.5 top-1.5 rounded-full bg-[#0E1B2A]/85 p-1.5 text-white transition hover:bg-[#F04E18]"
                            aria-label="Remove screenshot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter 3: The Unfiltered Story */}
              <div className="rounded-[28px] border-2 border-[#0E1B2A] bg-white p-6 shadow-[8px_8px_0px_#0E1B2A] sm:p-9">
                <p className="font-display text-[13.5px] font-bold text-[#F04E18]">
                  03 · The unfiltered teardown
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#0E1B2A] sm:text-3xl">
                  How you built it &amp; got people to pay
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      How did the idea happen &amp; how did you build it? *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Skip the corporate origin story. What annoyed you enough to open Cursor at midnight, and how did v1 come together?"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Biggest dumb mistake or scar along the way
                    </label>
                    <textarea
                      rows={3}
                      value={biggestMistake}
                      onChange={(e) => setBiggestMistake(e.target.value)}
                      placeholder="Over-engineered auth for 2 weeks? Priced too low? Burned $200 on ads that got 0 clicks? Tell us."
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      How did you get your first paying customers?
                    </label>
                    <textarea
                      rows={3}
                      value={distributionPlay}
                      onChange={(e) => setDistributionPlay(e.target.value)}
                      placeholder="Cold DMs, Reddit comments, TikTok/Reels, SEO, X replies — what actually moved the Stripe needle?"
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-bold text-[#0E1B2A]">
                      Anything else Ankur should know? (Optional)
                    </label>
                    <input
                      type="text"
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      placeholder="Special offer for SaaS Vibes readers, GitHub repo link, launch date..."
                      className="w-full rounded-xl border-2 border-[#0E1B2A]/15 bg-[#F8EAE0]/35 px-4 py-3 font-display text-[14.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-display text-[13px] font-bold text-red-700">
                    {error}
                  </p>
                )}

                <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-[#0E1B2A]/10 pt-6 sm:flex-row sm:items-center">
                  <p className="font-display text-[13px] font-medium text-[#0E1B2A]/65">
                    Sent privately to Ankur&apos;s Admin Studio — never published without your nod.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || uploadingPhoto || uploadingProof}
                    data-magnetic="true"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#0E1B2A] bg-[#F04E18] px-8 py-3.5 font-display text-[15px] font-extrabold text-white shadow-[5px_5px_0px_#0E1B2A] transition hover:-translate-y-0.5 hover:bg-[#d84110] disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send Pitch to Ankur
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      {/* Smooth Scroll Morph Trigger: Warm Cream -> Signal Orange Footer */}
      <div ref={footerMorphRef} aria-hidden="true" className="h-[10vh] w-full" />

      <MicaelaFooter settings={FOOTER_SETTINGS} compact />
    </div>
  );
}
