"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Gift,
  Globe,
  Link2,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/beehiiv-db";

type FormStyle = "card" | "inline" | "dark";

const ACCENT_SWATCHES = ["#F04E18", "#0E1B2A", "#2563EB", "#059669", "#7C3AED"];

export default function AdminGrowPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [subCount, setSubCount] = useState(0);

  // Interactive Form Customizer State
  const [formStyle, setFormStyle] = useState<FormStyle>("card");
  const [formHeading, setFormHeading] = useState("Join SaaS Vibes");
  const [formSubtext, setFormSubtext] = useState(
    "One 4-minute breakdown every week on vibe coding & profitable micro-SaaS."
  );
  const [placeholder, setPlaceholder] = useState("Your best email address");
  const [buttonLabel, setButtonLabel] = useState("Subscribe for free");
  const [accentColor, setAccentColor] = useState("#F04E18");
  const [includeName, setIncludeName] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
      supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]).then(([setRes, subRes]) => {
      if (setRes.data) setSettings(setRes.data as SiteSettings);
      setSubCount(subRes.count ?? 0);
    });
  }, [supabase]);

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const isDark = formStyle === "dark";
  const isInline = formStyle === "inline";

  const embedSnippet = `<div style="max-width:${isInline ? "560px" : "440px"};padding:${
    isInline ? "16px" : "24px"
  };border-radius:18px;background:${isDark ? "#0E1B2A" : "#FFFFFF"};color:${
    isDark ? "#F8EAE0" : "#0E1B2A"
  };border:1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"};font-family:system-ui,-apple-system,sans-serif;">
  <div style="font-size:18px;font-weight:800;margin-bottom:4px;">${formHeading}</div>
  <div style="font-size:13px;opacity:0.75;margin-bottom:14px;">${formSubtext}</div>
  <form id="saas-vibes-form" style="display:flex;flex-direction:${
    isInline ? "row" : "column"
  };gap:8px;flex-wrap:wrap;">
    ${
      includeName
        ? `<input name="name" type="text" placeholder="First name" style="flex:1;min-width:120px;padding:11px 14px;border:1px solid ${
            isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB"
          };border-radius:10px;background:${isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF"};color:${
            isDark ? "#FFFFFF" : "#111827"
          };font-size:14px;" />`
        : ""
    }
    <input name="email" type="email" required placeholder="${placeholder}" style="flex:2;min-width:180px;padding:11px 14px;border:1px solid ${
    isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB"
  };border-radius:10px;background:${isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF"};color:${
    isDark ? "#FFFFFF" : "#111827"
  };font-size:14px;" />
    <button type="submit" style="padding:11px 20px;background:${accentColor};color:#FFFFFF;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">${buttonLabel}</button>
  </form>
</div>
<script>
document.getElementById("saas-vibes-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const name = e.target.name ? e.target.name.value : "";
  const res = await fetch("${siteUrl}/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, source: "embed-form" })
  });
  alert(res.ok ? "Subscribed! Welcome to SaaS Vibes." : "Could not subscribe right now.");
  if (res.ok) e.target.reset();
});
</script>`;

  const landingUrl = `${siteUrl}/newsletter`;
  const referralUrl = `${siteUrl}/newsletter?ref=founder`;

  return (
    <div className="space-y-6">
      {/* Deep Navy Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0E1B2A] px-6 py-7 text-[#F8EAE0] shadow-lg sm:px-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#F04E18]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#F5B5A8]">
              <Sparkles className="h-3 w-3 text-[#F04E18]" />
              Growth &amp; Lead Capture
            </div>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Grow &amp; Subscribe Forms
            </h1>
            <p className="mt-1 max-w-xl text-[13.5px] text-[#F8EAE0]/70">
              Design custom embeddable signup widgets for your blog, X bio, or external sites.
              Every signup syncs straight to Supabase &amp; MailCheap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#F5B5A8]">
                Active Subscribers
              </p>
              <p className="text-xl font-extrabold text-white">{subCount}</p>
            </div>
            <a
              href="/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-4 py-3 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-110"
            >
              Open Landing Page
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Form Builder + Live Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Style & Copy Controls */}
        <div className="space-y-5 rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
              <Palette className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-[#0E1B2A]">Customize Signup Widget</h2>
              <p className="text-[12px] text-[#6E6D6A]">Updates both preview &amp; HTML code live</p>
            </div>
          </div>

          {/* Layout Style Pills */}
          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
              Widget Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "card", label: "Stacked Card" },
                  { id: "inline", label: "Inline Bar" },
                  { id: "dark", label: "Dark Navy" },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormStyle(s.id)}
                  className={`rounded-xl border px-3 py-2 text-[12px] font-bold transition ${
                    formStyle === s.id
                      ? "border-[#0E1B2A] bg-[#0E1B2A] text-white"
                      : "border-[#EAE8E3] bg-[#FAF9F6] text-[#52525B] hover:border-[#0E1B2A]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#52525B]">Heading</label>
              <input
                type="text"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#52525B]">Subtext</label>
              <input
                type="text"
                value={formSubtext}
                onChange={(e) => setFormSubtext(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[12.5px] outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Email Placeholder
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Button Label
                </label>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Accent Color Swatches + First Name Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE8E3] pt-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#52525B]">Button Color:</span>
              {ACCENT_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccentColor(hex)}
                  style={{ backgroundColor: hex }}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    accentColor === hex ? "scale-110 border-[#0E1B2A]" : "border-white shadow-xs"
                  }`}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-[#EAE8E3]"
                title="Custom color"
              />
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-[#0E1B2A]">
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="accent-[#F04E18]"
              />
              First name field
            </label>
          </div>
        </div>

        {/* Right: Gorgeous Live Preview + Embed Code */}
        <div className="space-y-5 lg:col-span-7">
          {/* Interactive Live Preview Stage */}
          <div className="overflow-hidden rounded-3xl border border-[#EAE8E3] bg-[#F8EAE0] p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#0E1B2A]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Interactive Preview
              </span>
              <span className="text-[11.5px] font-semibold text-[#0E1B2A]/60">
                {settings?.publication_name || "SaaS Vibes"}
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div
                className={`w-full rounded-2xl border p-6 shadow-md transition-all ${
                  isInline ? "max-w-[560px]" : "max-w-[420px]"
                } ${
                  isDark
                    ? "border-white/15 bg-[#0E1B2A] text-[#F8EAE0]"
                    : "border-[#0E1B2A]/10 bg-white text-[#0E1B2A]"
                }`}
              >
                <p className="text-[19px] font-extrabold tracking-tight">{formHeading}</p>
                <p
                  className={`mt-1 text-[13px] leading-relaxed ${
                    isDark ? "text-[#F8EAE0]/75" : "text-[#52525B]"
                  }`}
                >
                  {formSubtext}
                </p>
                <div
                  className={`mt-4 flex gap-2.5 ${
                    isInline ? "flex-col sm:flex-row" : "flex-col"
                  }`}
                >
                  {includeName && (
                    <input
                      type="text"
                      readOnly
                      placeholder="First name"
                      className={`rounded-xl border px-3.5 py-2.5 text-[13px] outline-none ${
                        isInline ? "sm:w-36" : "w-full"
                      } ${
                        isDark
                          ? "border-white/15 bg-white/10 text-white placeholder:text-white/50"
                          : "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]"
                      }`}
                    />
                  )}
                  <input
                    type="email"
                    readOnly
                    placeholder={placeholder}
                    className={`flex-1 rounded-xl border px-3.5 py-2.5 text-[13px] outline-none ${
                      isDark
                        ? "border-white/15 bg-white/10 text-white placeholder:text-white/50"
                        : "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]"
                    }`}
                  />
                  <button
                    type="button"
                    style={{ backgroundColor: accentColor }}
                    className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:opacity-95"
                  >
                    {buttonLabel}
                  </button>
                </div>
                <p
                  className={`mt-2.5 text-center text-[11px] ${
                    isDark ? "text-white/50" : "text-[#8C8B87]"
                  }`}
                >
                  Join {subCount} weekly readers · Unsubscribe anytime
                </p>
              </div>
            </div>
          </div>

          {/* Copyable HTML Embed Code */}
          <div className="rounded-3xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0E1B2A]">
                <Code2 className="h-4 w-4 text-[#F04E18]" />
                Drop-In HTML Embed Code
              </span>
              <button
                type="button"
                onClick={() => copyText("embed", embedSnippet)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#F04E18]"
              >
                {copiedId === "embed" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedId === "embed" ? "Copied!" : "Copy Embed Code"}
              </button>
            </div>
            <p className="mt-1 text-[12px] text-[#6E6D6A]">
              Works on Webflow, Framer, Notion, WordPress, or any HTML page.
            </p>
            <pre className="mt-3 max-h-44 overflow-auto rounded-2xl bg-[#0E1B2A] p-4 font-mono text-[11.5px] leading-relaxed text-[#F8EAE0]">
              <code>{embedSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Shareable Growth Channels */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                <Globe className="h-4 w-4" />
              </span>
              <a
                href="/newsletter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#F04E18] hover:underline"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <h3 className="mt-3 text-[14.5px] font-bold text-[#0E1B2A]">
              Standalone Landing Page
            </h3>
            <p className="mt-1 text-[12.5px] text-[#6E6D6A]">
              Drop this link in your X bio, pinned tweet, and YouTube descriptions.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F7F6F3] p-2">
            <span className="flex-1 truncate px-1 font-mono text-[11.5px] text-[#0E1B2A]">
              {landingUrl}
            </span>
            <button
              type="button"
              onClick={() => copyText("landing", landingUrl)}
              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E1B2A] shadow-xs hover:bg-[#0E1B2A] hover:text-white"
            >
              {copiedId === "landing" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Gift className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-[14.5px] font-bold text-[#0E1B2A]">
              Built-In Referral Tracking
            </h3>
            <p className="mt-1 text-[12.5px] text-[#6E6D6A]">
              Append <code className="rounded bg-[#F5F4F0] px-1">?ref=CODE</code> to track
              word-of-mouth signups directly in Supabase.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F7F6F3] p-2">
            <span className="flex-1 truncate px-1 font-mono text-[11.5px] text-[#0E1B2A]">
              {referralUrl}
            </span>
            <button
              type="button"
              onClick={() => copyText("ref", referralUrl)}
              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E1B2A] shadow-xs hover:bg-[#0E1B2A] hover:text-white"
            >
              {copiedId === "ref" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E1B2A]/8 text-[#0E1B2A]">
              <Share2 className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-[14.5px] font-bold text-[#0E1B2A]">
              Direct Subscribe API
            </h3>
            <p className="mt-1 text-[12.5px] text-[#6E6D6A]">
              Connect Zapier, Gumroad, or Stripe webhooks to auto-add buyers to SaaS Vibes.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F7F6F3] p-2">
            <Link2 className="ml-1 h-3.5 w-3.5 shrink-0 text-[#8C8B87]" />
            <span className="flex-1 truncate font-mono text-[11.5px] text-[#0E1B2A]">
              POST /api/subscribe
            </span>
            <button
              type="button"
              onClick={() => copyText("api", `${siteUrl}/api/subscribe`)}
              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E1B2A] shadow-xs hover:bg-[#0E1B2A] hover:text-white"
            >
              {copiedId === "api" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
