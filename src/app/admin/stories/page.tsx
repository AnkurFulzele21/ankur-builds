"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Inbox,
  Loader2,
  PenSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";
import type { FounderPitchPayload } from "@/app/api/founder-stories/route";

const STATUS_BADGES: Record<FounderPitchPayload["pitchStatus"], string> = {
  new: "bg-[#F04E18]/12 text-[#F04E18] border-[#F04E18]/25",
  shortlisted: "bg-amber-50 text-amber-800 border-amber-200",
  featured: "bg-emerald-50 text-emerald-700 border-emerald-200",
  passed: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function AdminFounderStoriesPage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<FounderPitchPayload[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function loadPitches() {
    setLoading(true);
    try {
      const res = await fetch("/api/founder-stories");
      const data = await res.json();
      const list = (data.pitches || []) as FounderPitchPayload[];
      setPitches(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, pitchStatus: FounderPitchPayload["pitchStatus"]) {
    setPitches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pitchStatus } : p))
    );
    await fetch("/api/founder-stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pitchStatus }),
    });
  }

  async function deletePitch(id: string) {
    if (!confirm("Delete this founder pitch permanently?")) return;
    await fetch(`/api/founder-stories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setPitches((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function convertToDraft(pitch: FounderPitchPayload) {
    setDraftingId(pitch.id);
    try {
      const supabase = createClient();
      const slug = `wednesday-${pitch.saasName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

      const markdown = [
        `## How ${pitch.founderName} Built ${pitch.saasName} (${pitch.mrr || "Revenue"})`,
        "",
        pitch.tagline ? `> ${pitch.tagline}` : "",
        "",
        `- **Product:** [${pitch.saasName}](${pitch.saasUrl})`,
        `- **Founder:** ${pitch.founderName} ${pitch.xHandle ? `(${pitch.xHandle})` : ""}`,
        `- **Revenue / Users:** ${pitch.mrr || "-"} · ${pitch.payingUsers || "-"}`,
        `- **Ship Time & Stack:** ${pitch.shipTime || "-"} · ${pitch.techStack || "-"}`,
        "",
        `## The Build Story`,
        pitch.story,
        "",
        pitch.biggestMistake ? `## Biggest Mistake\n${pitch.biggestMistake}` : "",
        "",
        pitch.distributionPlay ? `## How They Got Paying Users\n${pitch.distributionPlay}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const { data, error } = await supabase
        .from("newsletter_posts")
        .insert({
          slug,
          title: `How ${pitch.founderName} Built ${pitch.saasName} to ${pitch.mrr || "Paying Users"}`,
          subtitle: pitch.tagline || pitch.saasUrl,
          excerpt: pitch.story.slice(0, 165),
          content_markdown: markdown,
          thumbnail_url: pitch.proofScreenshots[0] || pitch.founderPhotoUrl,
          category: "Wednesday Stories",
          read_time: "4 min",
          status: "draft",
          featured: false,
          publish_to_web: true,
          send_email: true,
        })
        .select("id")
        .single();

      if (error) throw error;
      await updateStatus(pitch.id, "featured");
      router.push(`/admin/posts/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create draft");
    } finally {
      setDraftingId(null);
    }
  }

  const filtered = pitches.filter((p) =>
    filter === "all" ? true : p.pitchStatus === filter
  );
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  return (
    <AdminShell title="Founder Pitches">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0E1B2A]">
            Founder Story Pitches
          </h1>
          <p className="text-[13px] text-[#6E6D6A]">
            Secret submissions from{" "}
            <code className="rounded bg-[#EAE8E3] px-1.5 py-0.5 text-[12px]">
              /newsletter/share-your-story
            </code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "new", "shortlisted", "featured", "passed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition ${
                filter === st
                  ? "bg-[#0E1B2A] text-white"
                  : "border border-[#E5E3DC] bg-white text-[#6E6D6A] hover:text-[#0E1B2A]"
              }`}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={loadPitches}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E3DC] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0E1B2A] hover:bg-[#F5F4F0]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-[13.5px] font-medium text-[#6E6D6A]">
          <Loader2 className="h-4 w-4 animate-spin text-[#F04E18]" />
          Loading founder pitches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E3DC] bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[#8C8B87]" />
          <p className="mt-3 text-[15px] font-bold text-[#0E1B2A]">
            No founder pitches in this view yet
          </p>
          <p className="mt-1 text-[13px] text-[#6E6D6A]">
            Share your footer link (/newsletter/share-your-story) with builders to collect stories &amp; receipts.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left List */}
          <div className="space-y-2.5 lg:col-span-4">
            {filtered.map((p) => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-[#0E1B2A] bg-white shadow-sm"
                      : "border-[#E5E3DC] bg-white/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {p.founderPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.founderPhotoUrl}
                          alt={p.founderName}
                          className="h-9 w-9 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E1B2A] text-[11px] font-bold text-[#F8EAE0]">
                          {p.founderName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-[14px] font-bold text-[#0E1B2A]">{p.saasName}</p>
                        <p className="text-[12px] text-[#6E6D6A]">
                          {p.founderName} {p.mrr ? `· ${p.mrr}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold capitalize ${
                        STATUS_BADGES[p.pitchStatus]
                      }`}
                    >
                      {p.pitchStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Dossier Detail */}
          {selected && (
            <div className="rounded-2xl border border-[#E5E3DC] bg-white p-6 lg:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EAE8E3] pb-5">
                <div className="flex items-center gap-3.5">
                  {selected.founderPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.founderPhotoUrl}
                      alt={selected.founderName}
                      className="h-14 w-14 rounded-2xl border border-[#E5E3DC] object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0E1B2A]">
                      {selected.saasName}
                    </h2>
                    <p className="text-[13px] text-[#6E6D6A]">
                      {selected.founderName} · {selected.email}{" "}
                      {selected.xHandle ? `· ${selected.xHandle}` : ""}
                    </p>
                    <a
                      href={selected.saasUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#F04E18] hover:underline"
                    >
                      {selected.saasUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={draftingId === selected.id}
                    onClick={() => convertToDraft(selected)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-[#F04E18] disabled:opacity-60"
                  >
                    {draftingId === selected.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <PenSquare className="h-3.5 w-3.5" />
                    )}
                    Draft Wednesday Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePitch(selected.id)}
                    className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                    title="Delete pitch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status Controls */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#6E6D6A]">Status:</span>
                {(["new", "shortlisted", "featured", "passed"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(selected.id, st)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-bold capitalize ${
                      selected.pitchStatus === st
                        ? STATUS_BADGES[st]
                        : "border-[#E5E3DC] bg-white text-[#6E6D6A]"
                    }`}
                  >
                    {selected.pitchStatus === st && <CheckCircle2 className="h-3 w-3" />}
                    {st}
                  </button>
                ))}
              </div>

              {/* Quick Metrics */}
              <div className="mt-5 grid gap-3 rounded-xl bg-[#F7F6F3] p-4 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#6E6D6A]">Revenue / MRR</p>
                  <p className="text-[13.5px] font-bold text-[#0E1B2A]">{selected.mrr || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#6E6D6A]">Paying Users</p>
                  <p className="text-[13.5px] font-bold text-[#0E1B2A]">
                    {selected.payingUsers || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#6E6D6A]">Ship Time</p>
                  <p className="text-[13.5px] font-bold text-[#0E1B2A]">
                    {selected.shipTime || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#6E6D6A]">Stack</p>
                  <p className="text-[13.5px] font-bold text-[#0E1B2A]">
                    {selected.techStack || "—"}
                  </p>
                </div>
              </div>

              {/* Narrative Fields */}
              <div className="mt-5 space-y-4 text-[14px] leading-relaxed text-[#0E1B2A]">
                {selected.tagline && (
                  <div>
                    <p className="text-[12px] font-bold text-[#6E6D6A]">One-liner</p>
                    <p className="mt-0.5 font-medium">{selected.tagline}</p>
                  </div>
                )}
                <div>
                  <p className="text-[12px] font-bold text-[#6E6D6A]">Build Story</p>
                  <p className="mt-1 whitespace-pre-wrap">{selected.story}</p>
                </div>
                {selected.biggestMistake && (
                  <div>
                    <p className="text-[12px] font-bold text-[#6E6D6A]">Biggest Mistake</p>
                    <p className="mt-1 whitespace-pre-wrap">{selected.biggestMistake}</p>
                  </div>
                )}
                {selected.distributionPlay && (
                  <div>
                    <p className="text-[12px] font-bold text-[#6E6D6A]">Distribution Play</p>
                    <p className="mt-1 whitespace-pre-wrap">{selected.distributionPlay}</p>
                  </div>
                )}
                {selected.extraNotes && (
                  <div>
                    <p className="text-[12px] font-bold text-[#6E6D6A]">Extra Notes</p>
                    <p className="mt-1">{selected.extraNotes}</p>
                  </div>
                )}
              </div>

              {/* Proof Screenshots */}
              {selected.proofScreenshots.length > 0 && (
                <div className="mt-6 border-t border-[#EAE8E3] pt-5">
                  <p className="mb-3 text-[12.5px] font-bold text-[#0E1B2A]">
                    Dashboard &amp; Payment Proof Screenshots ({selected.proofScreenshots.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selected.proofScreenshots.map((src, i) => (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-xl border border-[#E5E3DC] transition hover:border-[#F04E18]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Receipt ${i + 1}`}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
