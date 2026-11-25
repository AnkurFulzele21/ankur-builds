"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ExternalLink,
  FolderKanban,
  Globe,
  Loader2,
  Mail,
  Plus,
  Rocket,
  Save,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioProjectRow, SiteSettings } from "@/lib/beehiiv-db";
import {
  DEFAULT_WELCOME_EMAIL,
  parseWelcomeRow,
  serializeWelcomeRow,
  type WelcomeEmailConfig,
} from "@/lib/welcome-email";

const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  owner_name: "Ankur Fulzele",
  owner_handle: "@AnkurBuilds",
  location: "India · Solo SaaS Builder",
  bio: "I vibe-code micro-SaaS products with AI and ship fast in public. Sharing real code, prompts, tech stacks, and indie startup lessons every week.",
  publication_name: "SaaS Vibes",
  publication_tagline: "Ship SaaS on vibes.",
  sender_name: "Ankur Fulzele",
  sender_email: "hello@ankurfulzele.in",
  twitter_url: "https://x.com/AnkurBuilds",
};

const STATUS_BADGE: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Building: "bg-amber-50 text-amber-700 border-amber-200",
  "Open Source": "bg-sky-50 text-sky-700 border-sky-200",
  Sold: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<
    "profile" | "newsletter" | "welcome" | "projects"
  >("profile");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [welcomeConfig, setWelcomeConfig] =
    useState<WelcomeEmailConfig>(DEFAULT_WELCOME_EMAIL);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [welcomeTestEmail, setWelcomeTestEmail] = useState("");
  const [sendingWelcomeTest, setSendingWelcomeTest] = useState(false);
  const [projects, setProjects] = useState<PortfolioProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // New portfolio project form
  const [projName, setProjName] = useState("");
  const [projTagline, setProjTagline] = useState("");
  const [projStatus, setProjStatus] = useState<PortfolioProjectRow["status"]>("Live");
  const [projMetric, setProjMetric] = useState("");
  const [projUrl, setProjUrl] = useState("");
  const [addingProj, setAddingProj] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [setRes, welcomeRes, projRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
      supabase.from("site_settings").select("*").eq("id", "welcome_email").maybeSingle(),
      supabase.from("portfolio_projects").select("*").order("position", { ascending: true }),
    ]);
    if (welcomeRes.data) {
      setWelcomeConfig(parseWelcomeRow(welcomeRes.data as Record<string, unknown>));
    }
    if (setRes.data) {
      const loaded = setRes.data as SiteSettings;
      if (/just\s+vibe\s*&?\s*ship/i.test(loaded.publication_name || "")) {
        loaded.publication_name = "SaaS Vibes";
        await supabase
          .from("site_settings")
          .update({ publication_name: "SaaS Vibes", updated_at: new Date().toISOString() })
          .eq("id", "default");
      }
      setSettings(loaded);
    }
    setProjects((projRes.data as PortfolioProjectRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSavedToast(null);
    const { error } = await supabase.from("site_settings").upsert(
      {
        ...settings,
        id: "default",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    setSavingSettings(false);
    setSavedToast(error ? `Error: ${error.message}` : "Site & publication settings saved!");
  }

  async function handleSaveWelcome(e: React.FormEvent) {
    e.preventDefault();
    setSavingWelcome(true);
    setSavedToast(null);
    const { error } = await supabase
      .from("site_settings")
      .upsert(serializeWelcomeRow(welcomeConfig), { onConflict: "id" });
    setSavingWelcome(false);
    setSavedToast(
      error ? `Error: ${error.message}` : "Welcome Email sequence saved! New subscribers will receive this automatically."
    );
  }

  async function handleSendWelcomeTest() {
    if (!welcomeTestEmail.trim()) return;
    setSendingWelcomeTest(true);
    setSavedToast(null);
    try {
      const res = await fetch("/api/welcome-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: welcomeTestEmail.trim(), config: welcomeConfig }),
      });
      const json = await res.json();
      setSavedToast(
        res.ok
          ? `Test welcome email sent to ${welcomeTestEmail}!`
          : `Test failed: ${json.error || "Check Resend config"}`
      );
    } finally {
      setSendingWelcomeTest(false);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projName.trim()) return;
    setAddingProj(true);

    const { error } = await supabase.from("portfolio_projects").insert({
      name: projName.trim(),
      tagline: projTagline.trim() || "Shipped fast with AI.",
      status: projStatus,
      metric_label: projMetric.trim() || "In Public",
      url: projUrl.trim() || "/newsletter",
      sparkline: [12, 18, 25, 31, 44, 58, 72],
      position: projects.length,
    });

    setAddingProj(false);
    if (!error) {
      setProjName("");
      setProjTagline("");
      setProjMetric("");
      setProjUrl("");
      setSavedToast("Added project to your public portfolio!");
      await loadAll();
    } else {
      setSavedToast(`Error: ${error.message}`);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Remove this project from your homepage?")) return;
    await supabase.from("portfolio_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#6E6D6A]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deep Navy Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0E1B2A] px-6 py-7 text-[#F8EAE0] shadow-lg sm:px-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#F04E18]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#F5B5A8]">
              <Sparkles className="h-3 w-3 text-[#F04E18]" />
              Workspace &amp; Publication
            </div>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Site &amp; Publication Settings
            </h1>
            <p className="mt-1 max-w-xl text-[13.5px] text-[#F8EAE0]/70">
              Control your creator profile, newsletter sender identity, and shipped startup cards.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            View Live Site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#EAE8E3] bg-white p-1.5 shadow-xs">
        {(
          [
            { id: "profile", label: "Brand & Profile", icon: User },
            { id: "newsletter", label: "Newsletter & Email", icon: Mail },
            { id: "welcome", label: "Welcome Email", icon: Send },
            { id: "projects", label: `Startups & Projects (${projects.length})`, icon: FolderKanban },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition ${
                active
                  ? "bg-[#0E1B2A] text-white shadow-xs"
                  : "text-[#6E6D6A] hover:bg-[#FAF9F6] hover:text-[#0E1B2A]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] font-semibold text-emerald-900">
          <Check className="h-4 w-4 text-emerald-600" />
          {savedToast}
        </div>
      )}

      {/* TAB 1: BRAND & PROFILE */}
      {activeTab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveSettings}
            className="space-y-5 rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs lg:col-span-7"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-[#0E1B2A]">Creator Identity</h2>
                <p className="text-[12px] text-[#6E6D6A]">
                  Displayed on your portfolio, footer, and article author bylines.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Owner / Brand Name
                </label>
                <input
                  type="text"
                  value={settings.owner_name}
                  onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  X / Twitter Handle
                </label>
                <input
                  type="text"
                  value={settings.owner_handle}
                  onChange={(e) => setSettings({ ...settings, owner_handle: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Location / Role Subtitle
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  X / Twitter Profile URL
                </label>
                <input
                  type="url"
                  value={settings.twitter_url}
                  onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#52525B]">Creator Bio</label>
              <textarea
                rows={4}
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3.5 text-[13px] leading-relaxed outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
              >
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile
              </button>
            </div>
          </form>

          {/* Live Creator Card Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-3xl border border-[#EAE8E3] bg-[#F8EAE0] p-6">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#0E1B2A]/60">
                Live Author Card Preview
              </p>
              <div className="mt-4 rounded-2xl border border-[#0E1B2A]/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E1B2A] text-[15px] font-extrabold text-[#F8EAE0]">
                    {(settings.owner_name || "AF").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#0E1B2A]">
                      {settings.owner_name || "Ankur Fulzele"}
                    </h3>
                    <p className="text-[12.5px] font-semibold text-[#F04E18]">
                      {settings.owner_handle || "@AnkurBuilds"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] font-medium text-[#6E6D6A]">{settings.location}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#27272A]">
                  {settings.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEWSLETTER & EMAIL */}
      {activeTab === "newsletter" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveSettings}
            className="space-y-5 rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs lg:col-span-7"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-[#0E1B2A]">
                  Publication &amp; Sender Settings
                </h2>
                <p className="text-[12px] text-[#6E6D6A]">
                  Controls your newsletter branding and how emails appear in Gmail.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Publication Name
                </label>
                <input
                  type="text"
                  value={settings.publication_name}
                  onChange={(e) => setSettings({ ...settings, publication_name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Email Sender Name
                </label>
                <input
                  type="text"
                  value={settings.sender_name}
                  onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  value={settings.sender_email}
                  onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Publication Tagline
                </label>
                <textarea
                  rows={3}
                  value={settings.publication_tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, publication_tagline: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
              >
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Newsletter Settings
              </button>
            </div>
          </form>

          {/* Live Gmail Inbox Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-3xl border border-[#EAE8E3] bg-[#F7F6F3] p-6">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                Live Gmail Inbox Preview
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-sm">
                <div className="border-b border-[#F1F0EC] bg-[#FAF9F6] px-4 py-2.5 text-[11px] font-semibold text-[#6E6D6A]">
                  Inbox · Primary
                </div>
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F04E18] text-[11px] font-black text-white">
                    SV
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-extrabold text-[#111827]">
                        {settings.sender_name || settings.publication_name}
                      </p>
                      <span className="text-[10.5px] text-[#6B7280]">9:00 AM</span>
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] font-bold text-[#111827]">
                      ☕ {settings.publication_name} — Weekly Issue #12
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[#6B7280]">
                      {settings.publication_tagline}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11.5px] text-[#6E6D6A]">
                Sent from <span className="font-mono font-semibold">{settings.sender_email}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WELCOME EMAIL SEQUENCE */}
      {activeTab === "welcome" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveWelcome}
            className="space-y-5 rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs lg:col-span-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                  <Send className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold text-[#0E1B2A]">
                    Automated Welcome Email
                  </h2>
                  <p className="text-[12px] text-[#6E6D6A]">
                    Sent instantly via Resend whenever a reader subscribes on /newsletter.
                  </p>
                </div>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#EAE8E3] bg-[#FAF9F6] px-3.5 py-1.5 text-[12px] font-bold text-[#0E1B2A]">
                <input
                  type="checkbox"
                  checked={welcomeConfig.enabled}
                  onChange={(e) =>
                    setWelcomeConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="accent-[#F04E18]"
                />
                {welcomeConfig.enabled ? "Active" : "Paused"}
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Welcome Subject Line
                </label>
                <input
                  type="text"
                  value={welcomeConfig.subject}
                  onChange={(e) =>
                    setWelcomeConfig((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13.5px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Greeting Headline{" "}
                  <span className="font-normal text-[#8C8B87]">
                    (use <code className="rounded bg-[#F5F4F0] px-1">{"{{name}}"}</code> for first name)
                  </span>
                </label>
                <input
                  type="text"
                  value={welcomeConfig.greeting}
                  onChange={(e) =>
                    setWelcomeConfig((prev) => ({ ...prev, greeting: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#52525B]">
                  Welcome Message Body
                </label>
                <textarea
                  rows={7}
                  value={welcomeConfig.body}
                  onChange={(e) =>
                    setWelcomeConfig((prev) => ({ ...prev, body: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3.5 text-[13px] leading-relaxed outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-semibold text-[#52525B]">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={welcomeConfig.ctaLabel}
                    onChange={(e) =>
                      setWelcomeConfig((prev) => ({ ...prev, ctaLabel: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#52525B]">
                    CTA Button URL
                  </label>
                  <input
                    type="text"
                    value={welcomeConfig.ctaUrl}
                    onChange={(e) =>
                      setWelcomeConfig((prev) => ({ ...prev, ctaUrl: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE8E3] pt-4">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="email"
                  value={welcomeTestEmail}
                  onChange={(e) => setWelcomeTestEmail(e.target.value)}
                  placeholder="Test email (you@gmail.com)"
                  className="w-full max-w-[220px] rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                />
                <button
                  type="button"
                  disabled={sendingWelcomeTest || !welcomeTestEmail}
                  onClick={handleSendWelcomeTest}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0E1B2A] px-3.5 py-2 text-[12px] font-bold text-[#0E1B2A] hover:bg-[#0E1B2A] hover:text-white disabled:opacity-50"
                >
                  {sendingWelcomeTest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Send Test
                </button>
              </div>
              <button
                type="submit"
                disabled={savingWelcome}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
              >
                {savingWelcome ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Welcome Email
              </button>
            </div>
          </form>

          {/* Live Welcome Email Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-3xl border border-[#EAE8E3] bg-[#F7F6F3] p-5">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                Live Welcome Email Preview
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                <div className="border-b-2 border-[#111827] pb-3 text-center">
                  <p className="text-[14px] font-black tracking-[0.1em] text-[#111827]">
                    SAAS VIBES
                  </p>
                  <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#F04E18]">
                    Ship SaaS on vibes. Turn readers into tribes.
                  </p>
                </div>
                <p className="mt-3 text-[11px] font-semibold text-[#6E6D6A]">
                  Subject: <span className="text-[#111827]">{welcomeConfig.subject}</span>
                </p>
                <h3 className="mt-3 text-[17px] font-extrabold text-[#111827]">
                  {welcomeConfig.greeting.replace(/\{\{name\}\}/gi, "Ankur")}
                </h3>
                <div className="mt-3 space-y-2.5 whitespace-pre-line text-[13px] leading-relaxed text-[#374151]">
                  {welcomeConfig.body}
                </div>
                {welcomeConfig.ctaLabel && (
                  <div className="mt-5">
                    <span className="inline-block rounded-lg bg-[#F04E18] px-4 py-2 text-[12.5px] font-bold text-white">
                      {welcomeConfig.ctaLabel}
                    </span>
                  </div>
                )}
                <p className="mt-5 border-t border-[#E5E7EB] pt-3 text-center text-[11px] text-[#6B7280]">
                  Includes plain-text version, reply-to, and 1-click Unsubscribe header ✓
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STARTUPS & PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddProject}
            className="rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                <Rocket className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-[#0E1B2A]">Add Shipped Startup / Project</h2>
                <p className="text-[12px] text-[#6E6D6A]">
                  Displayed in your public portfolio showcase.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="Project Name (e.g. CourseForge LMS)"
                className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
              <select
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value as PortfolioProjectRow["status"])}
                className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
              >
                <option value="Live">Live</option>
                <option value="Building">Building</option>
                <option value="Open Source">Open Source</option>
                <option value="Sold">Sold</option>
              </select>
              <input
                type="text"
                value={projTagline}
                onChange={(e) => setProjTagline(e.target.value)}
                placeholder="Short 1-line description"
                className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white sm:col-span-2"
              />
              <input
                type="text"
                value={projMetric}
                onChange={(e) => setProjMetric(e.target.value)}
                placeholder="Metric badge (e.g. $1.2k MRR or 100+ users)"
                className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
              <input
                type="text"
                value={projUrl}
                onChange={(e) => setProjUrl(e.target.value)}
                placeholder="Link URL (e.g. https://...)"
                className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={addingProj}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-[#F04E18] disabled:opacity-50"
              >
                {addingProj ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Project Card
              </button>
            </div>
          </form>

          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D4D4D8] bg-white py-14 text-center">
              <p className="text-[14px] font-bold text-[#0E1B2A]">No projects added yet</p>
              <p className="mt-1 text-[12.5px] text-[#6E6D6A]">
                Add your first shipped SaaS or open-source tool above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs transition hover:border-[#0E1B2A]/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          STATUS_BADGE[p.status] || "bg-[#F5F4F0] text-[#52525B]"
                        }`}
                      >
                        {p.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id)}
                        className="rounded-lg p-1.5 text-[#8C8B87] transition hover:bg-red-50 hover:text-red-600"
                        title="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="mt-3 text-[16px] font-extrabold text-[#0E1B2A]">{p.name}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6E6D6A]">{p.tagline}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#F1F0EC] pt-3">
                    <span className="rounded-lg bg-[#FFF4EF] px-2.5 py-1 font-mono text-[11px] font-bold text-[#F04E18]">
                      {p.metric_label}
                    </span>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0E1B2A] hover:text-[#F04E18]"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
