"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Loader2,
  Mail,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriberRow } from "@/lib/beehiiv-db";

const AVATAR_TONES = [
  "bg-[#0E1B2A] text-[#F8EAE0]",
  "bg-[#F04E18] text-white",
  "bg-[#26465C] text-white",
  "bg-[#1E293B] text-[#F5B5A8]",
];

function getInitials(name: string | null, email: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || email[0].toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function AdminSubscribersPage() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [search, setSearch] = useState("");

  // Add subscriber drawer
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  // Bulk CSV import drawer
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from("subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    setSubscribers((data as SubscriberRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = newEmail.trim().toLowerCase();
    if (!cleaned || !cleaned.includes("@")) return;
    setSaving(true);
    setFeedback(null);

    const tags = newTag
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from("subscribers").insert({
      email: cleaned,
      name: newName.trim() || null,
      status: "active",
      source: "admin-manual",
      tags,
    });

    setSaving(false);
    if (error) {
      setFeedback(error.code === "23505" ? "That email is already subscribed." : error.message);
      return;
    }

    setNewEmail("");
    setNewName("");
    setNewTag("");
    setShowAdd(false);
    setFeedback(`Added ${cleaned} to your SaaS Vibes audience.`);
    await loadSubscribers();
  }

  async function handleBulkImport() {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setImporting(true);
    setFeedback(null);

    const rows = lines
      .map((line) => {
        const [emailPart, namePart] = line.split(",").map((s) => s.trim());
        if (!emailPart || !emailPart.includes("@")) return null;
        return {
          email: emailPart.toLowerCase(),
          name: namePart || null,
          status: "active" as const,
          source: "csv-import",
          tags: ["imported"],
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length === 0) {
      setImporting(false);
      setFeedback("No valid email addresses found in the pasted CSV.");
      return;
    }

    const { error } = await supabase
      .from("subscribers")
      .upsert(rows, { onConflict: "email", ignoreDuplicates: true });

    setImporting(false);
    if (error) {
      setFeedback(`Import failed: ${error.message}`);
      return;
    }

    setCsvText("");
    setShowImport(false);
    setFeedback(`Imported ${rows.length} subscriber(s) into Supabase.`);
    await loadSubscribers();
  }

  async function toggleStatus(sub: SubscriberRow) {
    const nextStatus = sub.status === "active" ? "unsubscribed" : "active";
    await supabase.from("subscribers").update({ status: nextStatus }).eq("id", sub.id);
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: nextStatus } : s))
    );
  }

  async function handleDelete(sub: SubscriberRow) {
    if (!confirm(`Remove ${sub.email} permanently?`)) return;
    await supabase.from("subscribers").delete().eq("id", sub.id);
    setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
  }

  function exportCsv() {
    const header = "email,name,status,source,tags,subscribed_at";
    const body = subscribers
      .map((s) =>
        [
          s.email,
          `"${(s.name || "").replace(/"/g, '""')}"`,
          s.status,
          s.source,
          `"${(s.tags || []).join(";")}"`,
          s.subscribed_at,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saas-vibes-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubCount = subscribers.filter((s) => s.status !== "active").length;
  const activePct = subscribers.length > 0 ? Math.round((activeCount / subscribers.length) * 100) : 100;

  const topSource = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of subscribers) {
      const key = s.source || "direct";
      counts[key] = (counts[key] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "newsletter-hero";
  }, [subscribers]);

  const filtered = subscribers.filter((s) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? s.status === "active" : s.status !== "active");
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.email.toLowerCase().includes(q) ||
      (s.name || "").toLowerCase().includes(q) ||
      (s.source || "").toLowerCase().includes(q) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const csvLineCount = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("@")).length;

  return (
    <div className="space-y-6">
      {/* Deep Navy Command Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0E1B2A] px-6 py-7 text-[#F8EAE0] shadow-lg sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#F04E18]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#F5B5A8]">
              <Sparkles className="h-3 w-3 text-[#F04E18]" />
              Supabase Audience CRM
            </div>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Audience &amp; Subscribers
            </h1>
            <p className="mt-1 max-w-xl text-[13.5px] text-[#F8EAE0]/70">
              Own 100% of your subscriber list. Segment readers with tags, bulk-import CSVs, and
              manage delivery health in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport((v) => !v);
                setShowAdd(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd((v) => !v);
                setShowImport(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add Subscriber
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Visual KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6D6A]">
              Total Audience
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0E1B2A]/8 text-[#0E1B2A]">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#0E1B2A]">
            {subscribers.length}
          </p>
          <p className="mt-1 text-[12px] text-[#6E6D6A]">Stored in Supabase Postgres</p>
        </div>

        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6D6A]">
              Active Readers
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tracking-tight text-[#0E1B2A]">{activeCount}</p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              {activePct}% active
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F0EC]">
            <div
              style={{ width: `${activePct}%` }}
              className="h-full rounded-full bg-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6D6A]">
              Unsubscribed
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#6E6D6A]">
              <UserMinus className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#0E1B2A]">{unsubCount}</p>
          <p className="mt-1 text-[12px] text-[#6E6D6A]">Excluded from email dispatches</p>
        </div>

        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6D6A]">
              Top Source
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 truncate text-xl font-extrabold tracking-tight text-[#0E1B2A]">
            {topSource}
          </p>
          <p className="mt-1 text-[12px] text-[#6E6D6A]">Highest-converting channel</p>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] font-medium text-emerald-900">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Subscriber Drawer */}
      {showAdd && (
        <form
          onSubmit={handleAddSubscriber}
          className="rounded-2xl border-2 border-[#0E1B2A] bg-white p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0E1B2A]">Add a New Subscriber</h2>
              <p className="text-[12.5px] text-[#6E6D6A]">
                Instantly adds an active reader to your Supabase subscribers table.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="reader@example.com"
              className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name (optional)"
              className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
            />
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Tags (e.g. vip, founder)"
              className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl border border-[#EAE8E3] px-4 py-2 text-[12.5px] font-semibold text-[#6E6D6A] hover:bg-[#F5F4F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-5 py-2 text-[12.5px] font-bold text-white hover:brightness-95 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Subscriber
            </button>
          </div>
        </form>
      )}

      {/* Bulk CSV Import Drawer */}
      {showImport && (
        <div className="rounded-2xl border-2 border-[#0E1B2A] bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0E1B2A]">Bulk Import Subscribers (CSV)</h2>
              <p className="text-[12.5px] text-[#6E6D6A]">
                Paste one subscriber per line as{" "}
                <code className="rounded bg-[#F5F4F0] px-1.5 py-0.5 font-mono text-[11.5px]">
                  email@domain.com, Optional Name
                </code>
                . Duplicates are skipped automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"founder@startup.com, Jane Doe\nbuilder@indie.dev, Alex"}
            className="mt-3 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3.5 font-mono text-[12.5px] outline-none focus:border-[#0E1B2A] focus:bg-white"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-[#6E6D6A]">
              {csvLineCount > 0
                ? `Detected ${csvLineCount} valid email${csvLineCount === 1 ? "" : "s"} ready to import`
                : "Paste emails above to preview count"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="rounded-xl border border-[#EAE8E3] px-4 py-2 text-[12.5px] font-semibold text-[#6E6D6A] hover:bg-[#F5F4F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || csvLineCount === 0}
                onClick={handleBulkImport}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-5 py-2 text-[12.5px] font-bold text-white hover:bg-[#1E2F45] disabled:opacity-50"
              >
                {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Import {csvLineCount > 0 ? `${csvLineCount} Readers` : "CSV"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & Subscriber Table Card */}
      <div className="overflow-hidden rounded-3xl border border-[#EAE8E3] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE8E3] bg-[#FAF9F6] px-5 py-4">
          <div className="inline-flex rounded-full border border-[#EAE8E3] bg-white p-1">
            {(
              [
                { id: "all", label: `All (${subscribers.length})` },
                { id: "active", label: `Active (${activeCount})` },
                { id: "unsubscribed", label: `Paused (${unsubCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
                  statusFilter === tab.id
                    ? "bg-[#0E1B2A] text-white"
                    : "text-[#6E6D6A] hover:text-[#0E1B2A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8B87]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, name, tag, source..."
              className="w-full rounded-full border border-[#EAE8E3] bg-white py-2 pl-9 pr-4 text-[12.5px] outline-none transition focus:border-[#0E1B2A]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[#6E6D6A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4EF] text-[#F04E18]">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[15px] font-bold text-[#0E1B2A]">No subscribers found</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#6E6D6A]">
              {search
                ? "Try clearing your search filter."
                : "Share your /newsletter landing page or click Add Subscriber to add your first reader."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#EAE8E3] text-[11px] font-bold uppercase tracking-wider text-[#8C8B87]">
                  <th className="px-5 py-3.5">Subscriber</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5">Tags</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F0EC]">
                {filtered.map((sub, idx) => {
                  const isActive = sub.status === "active";
                  return (
                    <tr
                      key={sub.id}
                      className="group transition hover:bg-[#FAF9F6]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-extrabold ${
                              AVATAR_TONES[idx % AVATAR_TONES.length]
                            }`}
                          >
                            {getInitials(sub.name, sub.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#0E1B2A]">
                              {sub.name || sub.email.split("@")[0]}
                            </p>
                            <p className="truncate text-[12px] text-[#6E6D6A]">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-[#F3F2EE] text-[#6E6D6A]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-[#9E9D99]"
                            }`}
                          />
                          {isActive ? "Active" : "Paused"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-lg bg-[#F5F4F0] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#52525B]">
                          {sub.source || "direct"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(sub.tags || []).length > 0 ? (
                            (sub.tags || []).map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1 rounded-full bg-[#FFF4EF] px-2.5 py-0.5 text-[11px] font-semibold text-[#F04E18]"
                              >
                                <Tag className="h-2.5 w-2.5" />
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[12px] text-[#A1A1AA]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-[#6E6D6A]">
                        {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleStatus(sub)}
                            className="rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#0E1B2A] transition hover:border-[#0E1B2A]"
                          >
                            {isActive ? "Pause" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            className="rounded-lg p-1.5 text-[#8C8B87] transition hover:bg-red-50 hover:text-red-600"
                            title="Delete subscriber"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
