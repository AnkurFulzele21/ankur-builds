"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Eye,
  Loader2,
  Mail,
  PenLine,
  Play,
  Plus,
  Rocket,
  Save,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createNewCampaign,
  DEFAULT_7DAY_SEQUENCE,
  interpolateSubscriberName,
  parseCampaignsRow,
  serializeCampaignsRow,
  type EmailSequenceConfig,
  type SequenceAudience,
  type SequenceStep,
  type SequenceTrigger,
} from "@/lib/email-sequences";

const TRIGGER_LABELS: Record<SequenceTrigger, string> = {
  on_subscribe: "On New Subscribe",
  on_tag: "When Tag Added",
  manual: "Manual / Broadcast Drip",
};

const AUDIENCE_LABELS: Record<SequenceAudience, string> = {
  all: "All Subscribers",
  "newsletter-hero": "Hero Form",
  "newsletter-bottom": "Bottom Banner",
  "embed-form": "Embed Form",
  tag: "Tagged Segment",
};

export default function AdminSequencesPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<EmailSequenceConfig[]>([DEFAULT_7DAY_SEQUENCE]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // Create New Campaign Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTrigger, setNewTrigger] = useState<SequenceTrigger>("on_subscribe");
  const [newAudience, setNewAudience] = useState<SequenceAudience>("all");
  const [newTag, setNewTag] = useState("");
  const [newPreset, setNewPreset] = useState<"blank" | "launch-3day" | "soap-opera-7day">("blank");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", "email_sequence")
      .maybeSingle()
      .then(({ data }) => {
        const loaded = parseCampaignsRow(data as Record<string, unknown> | null);
        setCampaigns(loaded);
        setLoading(false);
      });
  }, [supabase]);

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || null;
  const sortedSteps = activeCampaign
    ? [...activeCampaign.steps].sort((a, b) => a.day - b.day)
    : [];
  const selectedStep =
    activeCampaign?.steps.find((s) => s.id === selectedStepId) || sortedSteps[0] || null;

  async function persistCampaigns(nextList: EmailSequenceConfig[], msg?: string) {
    setSaving(true);
    setToast(null);
    const { error } = await supabase
      .from("site_settings")
      .upsert(serializeCampaignsRow(nextList), { onConflict: "id" });
    setSaving(false);
    setToast(error ? `Save failed: ${error.message}` : msg || "All campaigns saved to Supabase!");
  }

  function openCampaign(c: EmailSequenceConfig) {
    setActiveCampaignId(c.id);
    const first = [...c.steps].sort((a, b) => a.day - b.day)[0];
    setSelectedStepId(first?.id || null);
    setEditorTab("write");
  }

  function updateCampaign(id: string, patch: Partial<EmailSequenceConfig>) {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function toggleCampaignEnabled(id: string) {
    const next = campaigns.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setCampaigns(next);
    persistCampaigns(next, "Updated campaign status!");
  }

  function duplicateCampaign(c: EmailSequenceConfig) {
    const copy: EmailSequenceConfig = {
      ...JSON.parse(JSON.stringify(c)),
      id: `camp-${Date.now().toString(36)}`,
      name: `${c.name} (Copy)`,
      enabled: false,
      createdAt: new Date().toISOString(),
    };
    const next = [...campaigns, copy];
    setCampaigns(next);
    persistCampaigns(next, `Duplicated "${c.name}"`);
  }

  function deleteCampaign(c: EmailSequenceConfig) {
    if (!confirm(`Delete campaign "${c.name}" permanently?`)) return;
    const next = campaigns.filter((item) => item.id !== c.id);
    setCampaigns(next);
    if (activeCampaignId === c.id) setActiveCampaignId(null);
    persistCampaigns(next, `Deleted "${c.name}"`);
  }

  function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    const created = createNewCampaign({
      name: newName.trim() || "New Email Campaign",
      description: newDesc.trim(),
      trigger: newTrigger,
      audience: newAudience,
      targetTag: newTag.trim(),
      preset: newPreset,
    });
    const next = [...campaigns, created];
    setCampaigns(next);
    setShowCreateModal(false);
    setNewName("");
    setNewDesc("");
    setNewTag("");
    persistCampaigns(next, `Created "${created.name}"!`);
    openCampaign(created);
  }

  function updateStep(stepId: string, patch: Partial<SequenceStep>) {
    if (!activeCampaign) return;
    updateCampaign(activeCampaign.id, {
      steps: activeCampaign.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    });
  }

  function addStep() {
    if (!activeCampaign) return;
    const maxDay = activeCampaign.steps.reduce((m, s) => Math.max(m, s.day), -1);
    const nextDay = maxDay + 1;
    const step: SequenceStep = {
      id: `${activeCampaign.id}-d${nextDay}-${Date.now().toString(36)}`,
      day: nextDay,
      enabled: true,
      subject: `Day ${nextDay}: Next step in ${activeCampaign.name}`,
      previewText: "",
      greeting: "Hey {{first_name | builder}},",
      body: "Write your automated email content here...",
      ctaLabel: "",
      ctaUrl: "/newsletter",
    };
    updateCampaign(activeCampaign.id, { steps: [...activeCampaign.steps, step] });
    setSelectedStepId(step.id);
    setEditorTab("write");
  }

  function removeStep(stepId: string) {
    if (!activeCampaign || activeCampaign.steps.length <= 1) return;
    const remaining = activeCampaign.steps.filter((s) => s.id !== stepId);
    updateCampaign(activeCampaign.id, { steps: remaining });
    if (selectedStepId === stepId && remaining[0]) {
      setSelectedStepId(remaining[0].id);
    }
  }

  async function handleRunDue(campaignId?: string) {
    setProcessing(true);
    setToast(null);
    try {
      const res = await fetch("/api/sequences/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignId ? { campaignId } : {}),
      });
      const json = await res.json();
      setToast(
        res.ok
          ? `Processed ${json.campaignsProcessed ?? 0} active campaign(s) across ${
              json.checked ?? 0
            } subscribers — sent ${json.sent ?? 0} due email(s).`
          : `Run failed: ${json.error}`
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleSendTest() {
    if (!testEmail.trim() || !selectedStep || !activeCampaign) return;
    setSendingTest(true);
    setToast(null);
    try {
      const res = await fetch("/api/sequences/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          step: selectedStep,
          campaignName: activeCampaign.name,
        }),
      });
      const json = await res.json();
      setToast(
        res.ok
          ? `Sent Day ${selectedStep.day} test email to ${testEmail}!`
          : `Test failed: ${json.error}`
      );
    } finally {
      setSendingTest(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#6E6D6A]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading campaigns &amp; automations...
      </div>
    );
  }

  const activeCampaignCount = campaigns.filter((c) => c.enabled).length;
  const totalStepsCount = campaigns.reduce((sum, c) => sum + c.steps.length, 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] font-semibold text-emerald-900">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            {toast}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: MULTI-CAMPAIGN AUTOMATIONS HUB                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!activeCampaign && (
        <>
          {/* Deep Navy Command Header */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0E1B2A] px-6 py-7 text-[#F8EAE0] shadow-lg sm:px-8">
            <div className="pointer-events-none absolute -right-14 -top-14 h-60 w-60 rounded-full bg-[#F04E18]/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#F5B5A8]">
                  <Zap className="h-3 w-3 text-[#F04E18]" />
                  Multi-Campaign Automations
                </div>
                <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Email Sequences &amp; Campaigns
                </h1>
                <p className="mt-1 max-w-xl text-[13.5px] text-[#F8EAE0]/70">
                  Run multiple onboarding, launch, and tag-triggered email sequences at the same
                  time — personalized automatically with each subscriber&apos;s name.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleRunDue()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run All Due Emails
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                  New Campaign
                </button>
              </div>
            </div>
          </div>

          {/* 3-Column KPI Strip */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                  Total Campaigns
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0E1B2A]/8 text-[#0E1B2A]">
                  <Rocket className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2.5 text-3xl font-extrabold text-[#0E1B2A]">{campaigns.length}</p>
              <p className="mt-0.5 text-[12px] text-[#6E6D6A]">Run unlimited sequences in parallel</p>
            </div>

            <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                  Active Automations
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2.5 text-3xl font-extrabold text-[#0E1B2A]">
                {activeCampaignCount}
              </p>
              <p className="mt-0.5 text-[12px] text-[#6E6D6A]">Automatically sending to matching readers</p>
            </div>

            <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                  Total Automated Emails
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                  <Mail className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2.5 text-3xl font-extrabold text-[#0E1B2A]">{totalStepsCount}</p>
              <p className="mt-0.5 text-[12px] text-[#6E6D6A]">With auto first-name personalization</p>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid gap-5 md:grid-cols-2">
            {campaigns.map((camp) => {
              const campSteps = [...camp.steps].sort((a, b) => a.day - b.day);
              const enabledSteps = campSteps.filter((s) => s.enabled).length;
              return (
                <div
                  key={camp.id}
                  className="group flex flex-col justify-between rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-xs transition hover:border-[#0E1B2A]/40 hover:shadow-md"
                >
                  <div>
                    {/* Card Top Row: Status + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCampaignEnabled(camp.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold transition ${
                          camp.enabled
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-[#F3F2EE] text-[#6E6D6A] hover:bg-[#E7E5E0]"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            camp.enabled ? "bg-emerald-500" : "bg-[#9E9D99]"
                          }`}
                        />
                        {camp.enabled ? "Active" : "Paused"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateCampaign(camp)}
                          className="rounded-lg p-1.5 text-[#8C8B87] hover:bg-[#F5F4F0] hover:text-[#0E1B2A]"
                          title="Duplicate campaign"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {campaigns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteCampaign(camp)}
                            className="rounded-lg p-1.5 text-[#8C8B87] hover:bg-red-50 hover:text-red-600"
                            title="Delete campaign"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="mt-3.5 text-[18px] font-extrabold tracking-tight text-[#0E1B2A]">
                      {camp.name}
                    </h2>
                    {camp.description && (
                      <p className="mt-1 text-[13px] leading-relaxed text-[#6E6D6A]">
                        {camp.description}
                      </p>
                    )}

                    {/* Trigger & Audience Badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#FFF4EF] px-2.5 py-1 font-mono text-[11px] font-bold text-[#F04E18]">
                        <Zap className="h-3 w-3" />
                        {TRIGGER_LABELS[camp.trigger]}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F5F4F0] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#52525B]">
                        <Users className="h-3 w-3" />
                        {camp.audience === "tag" && camp.targetTag
                          ? `Tag: ${camp.targetTag}`
                          : AUDIENCE_LABELS[camp.audience]}
                      </span>
                    </div>

                    {/* Visual Mini Step Chain */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#FAF9F6] p-3">
                      {campSteps.slice(0, 8).map((st, idx) => (
                        <div key={st.id} className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold ${
                              st.enabled
                                ? st.day === 0
                                  ? "bg-[#F04E18] text-white"
                                  : "bg-[#0E1B2A] text-[#F8EAE0]"
                                : "bg-[#E7E5E0] text-[#8C8B87]"
                            }`}
                          >
                            D{st.day}
                          </span>
                          {idx < Math.min(campSteps.length, 8) - 1 && (
                            <span className="text-[10px] text-[#C4C2BC]">→</span>
                          )}
                        </div>
                      ))}
                      {campSteps.length > 8 && (
                        <span className="font-mono text-[10.5px] font-bold text-[#6E6D6A]">
                          +{campSteps.length - 8}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#F1F0EC] pt-4">
                    <span className="text-[12px] font-semibold text-[#6E6D6A]">
                      {enabledSteps} of {campSteps.length} emails active
                    </span>
                    <button
                      type="button"
                      onClick={() => openCampaign(camp)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-[#F04E18]"
                    >
                      Edit Sequence
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add New Campaign Dashed Card */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4D4D8] bg-white/60 p-8 text-center transition hover:border-[#F04E18] hover:bg-[#FFF8F5]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4EF] text-[#F04E18]">
                <Plus className="h-6 w-6" />
              </span>
              <p className="mt-3 text-[16px] font-extrabold text-[#0E1B2A]">
                Create a New Campaign
              </p>
              <p className="mt-1 max-w-xs text-[13px] text-[#6E6D6A]">
                Build a product launch drip, tag-based course, or custom multi-day sequence.
              </p>
            </button>
          </div>

          {/* CREATE NEW CAMPAIGN MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <form
                onSubmit={handleCreateCampaign}
                className="w-full max-w-lg space-y-4 rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-[#0E1B2A]">
                      New Email Campaign
                    </h2>
                    <p className="text-[12.5px] text-[#6E6D6A]">
                      Runs alongside your existing sequences with independent tracking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#52525B]">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Product Launch Drip or VIP Founder Course"
                      className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13.5px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#52525B]">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What is the goal of this sequence?"
                      className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#52525B]">
                        Trigger
                      </label>
                      <select
                        value={newTrigger}
                        onChange={(e) => setNewTrigger(e.target.value as SequenceTrigger)}
                        className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2.5 text-[13px] font-medium"
                      >
                        <option value="on_subscribe">On New Subscribe</option>
                        <option value="on_tag">When Subscriber Has Tag</option>
                        <option value="manual">Manual / Scheduled Drip</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#52525B]">
                        Target Audience
                      </label>
                      <select
                        value={newAudience}
                        onChange={(e) => setNewAudience(e.target.value as SequenceAudience)}
                        className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2.5 text-[13px] font-medium"
                      >
                        <option value="all">All Subscribers</option>
                        <option value="newsletter-hero">Hero Form Signups</option>
                        <option value="newsletter-bottom">Bottom Banner Signups</option>
                        <option value="embed-form">Embed Form Signups</option>
                        <option value="tag">Specific Tag</option>
                      </select>
                    </div>
                  </div>

                  {newAudience === "tag" && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#52525B]">
                        Target Tag Name
                      </label>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="e.g. vip, buyer, waitlist"
                        className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#52525B]">
                      Starting Template
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(
                        [
                          { id: "blank", title: "Blank (1 Step)", sub: "Build from scratch" },
                          { id: "launch-3day", title: "3-Day Launch", sub: "Teaser → Launch" },
                          { id: "soap-opera-7day", title: "7-Day Welcome", sub: "Soap Opera PDF" },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setNewPreset(p.id)}
                          className={`rounded-xl border p-3 text-left transition ${
                            newPreset === p.id
                              ? "border-[#F04E18] bg-[#FFF8F5]"
                              : "border-[#EAE8E3] bg-[#FAF9F6] hover:border-[#0E1B2A]"
                          }`}
                        >
                          <p className="text-[12.5px] font-bold text-[#0E1B2A]">{p.title}</p>
                          <p className="text-[11px] text-[#6E6D6A]">{p.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-[#EAE8E3] px-4 py-2 text-[12.5px] font-semibold text-[#6E6D6A] hover:bg-[#F5F4F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-5 py-2 text-[12.5px] font-bold text-white hover:brightness-95"
                  >
                    <Plus className="h-4 w-4" />
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: VISUAL SEQUENCE FLOW BUILDER (INSIDE A CAMPAIGN)            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeCampaign && (
        <>
          {/* Sticky Top Campaign Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EAE8E3] bg-white px-5 py-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveCampaignId(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-1.5 text-[12.5px] font-bold text-[#0E1B2A] hover:border-[#0E1B2A]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Campaigns
              </button>
              <input
                type="text"
                value={activeCampaign.name}
                onChange={(e) =>
                  updateCampaign(activeCampaign.id, { name: e.target.value })
                }
                className="min-w-[240px] rounded-xl border border-transparent bg-transparent px-2 py-1 text-[16px] font-extrabold text-[#0E1B2A] outline-none hover:border-[#EAE8E3] focus:border-[#0E1B2A] focus:bg-[#FAF9F6]"
              />
              <button
                type="button"
                onClick={() =>
                  updateCampaign(activeCampaign.id, { enabled: !activeCampaign.enabled })
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${
                  activeCampaign.enabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[#F3F2EE] text-[#6E6D6A]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeCampaign.enabled ? "bg-emerald-500" : "bg-[#9E9D99]"
                  }`}
                />
                {activeCampaign.enabled ? "Active" : "Paused"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleRunDue(activeCampaign.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3.5 py-2 text-[12px] font-bold text-[#0E1B2A] hover:bg-[#F5F4F0] disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Run Due Now
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  persistCampaigns(campaigns, `Saved "${activeCampaign.name}"!`)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-4 py-2 text-[12.5px] font-bold text-white shadow-xs hover:brightness-95 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Campaign
              </button>
            </div>
          </div>

          {/* 2-Column Visual Flow Canvas (Left) + Spacious Writer/Preview (Right) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* LEFT: VISUAL AUTOMATION WORKFLOW TIMELINE */}
            <div className="rounded-3xl border border-[#EAE8E3] bg-[#F8EAE0]/45 p-5 lg:col-span-4">
              {/* Trigger Node */}
              <div className="rounded-2xl border-2 border-[#0E1B2A] bg-[#0E1B2A] p-4 text-[#F8EAE0] shadow-sm">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F5B5A8]">
                  <Zap className="h-3.5 w-3.5 text-[#F04E18]" />
                  Automation Trigger
                </div>
                <div className="mt-2.5 grid gap-2">
                  <select
                    value={activeCampaign.audience}
                    onChange={(e) =>
                      updateCampaign(activeCampaign.id, {
                        audience: e.target.value as SequenceAudience,
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[12.5px] font-bold text-white outline-none"
                  >
                    <option value="all" className="text-[#0E1B2A]">
                      All New Subscribers
                    </option>
                    <option value="newsletter-hero" className="text-[#0E1B2A]">
                      Hero Form Signups
                    </option>
                    <option value="newsletter-bottom" className="text-[#0E1B2A]">
                      Bottom Banner Signups
                    </option>
                    <option value="embed-form" className="text-[#0E1B2A]">
                      Embed Form Signups
                    </option>
                    <option value="tag" className="text-[#0E1B2A]">
                      Specific Subscriber Tag
                    </option>
                  </select>
                  {activeCampaign.audience === "tag" && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5">
                      <Tag className="h-3.5 w-3.5 text-[#F5B5A8]" />
                      <input
                        type="text"
                        value={activeCampaign.targetTag}
                        onChange={(e) =>
                          updateCampaign(activeCampaign.id, { targetTag: e.target.value })
                        }
                        placeholder="Tag name (e.g. vip)"
                        className="w-full bg-transparent text-[12px] text-white placeholder:text-white/50 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical Connector & Step Nodes */}
              <div className="relative space-y-0">
                {sortedSteps.map((step, idx) => {
                  const isSelected = selectedStep?.id === step.id;
                  const prevDay = idx > 0 ? sortedSteps[idx - 1].day : 0;
                  const waitLabel =
                    step.day === 0
                      ? "Immediately on signup"
                      : idx === 0
                      ? `Wait ${step.day} day${step.day === 1 ? "" : "s"}`
                      : `Day ${step.day} (+${Math.max(0, step.day - prevDay)}d)`;

                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      {/* Vertical Line + Delay Pill */}
                      <div className="h-4 w-0.5 bg-[#0E1B2A]/20" />
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#0E1B2A]/15 bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#0E1B2A]/75 shadow-2xs">
                        <Clock className="h-2.5 w-2.5 text-[#F04E18]" />
                        {waitLabel}
                      </span>
                      <div className="h-4 w-0.5 bg-[#0E1B2A]/20" />

                      {/* Step Card Node */}
                      <button
                        type="button"
                        onClick={() => setSelectedStepId(step.id)}
                        className={`w-full rounded-2xl border-2 p-3.5 text-left transition ${
                          isSelected
                            ? "border-[#F04E18] bg-white shadow-[4px_4px_0px_#F04E18]"
                            : "border-[#0E1B2A]/12 bg-white hover:border-[#0E1B2A]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-lg px-2 py-0.5 font-mono text-[10.5px] font-extrabold ${
                              !step.enabled
                                ? "bg-[#F1F0EC] text-[#9E9D99]"
                                : step.day === 0
                                ? "bg-[#F04E18] text-white"
                                : "bg-[#0E1B2A] text-[#F8EAE0]"
                            }`}
                          >
                            EMAIL {step.day}
                          </span>
                          <span
                            className={`text-[10.5px] font-bold ${
                              step.enabled ? "text-emerald-600" : "text-[#9E9D99]"
                            }`}
                          >
                            {step.enabled ? "● Active" : "○ Paused"}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-snug text-[#0E1B2A]">
                          {step.subject || "Untitled email step"}
                        </p>
                      </button>
                    </div>
                  );
                })}

                {/* Add Step Button at Bottom of Flow */}
                <div className="flex flex-col items-center">
                  <div className="h-5 w-0.5 bg-[#0E1B2A]/20" />
                  <button
                    type="button"
                    onClick={addStep}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-[#0E1B2A]/30 bg-white px-4 py-2 text-[12px] font-bold text-[#0E1B2A] transition hover:border-[#F04E18] hover:text-[#F04E18]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Email Step
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: SPACIOUS EMAIL WRITER & LIVE GMAIL PREVIEW */}
            {selectedStep && (
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-3xl border border-[#EAE8E3] bg-white shadow-xs">
                  {/* Editor / Preview Mode Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE8E3] bg-[#FAF9F6] px-6 py-3.5">
                    <div className="inline-flex rounded-full border border-[#EAE8E3] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setEditorTab("write")}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition ${
                          editorTab === "write"
                            ? "bg-[#0E1B2A] text-white"
                            : "text-[#6E6D6A] hover:text-[#0E1B2A]"
                        }`}
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        Write Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab("preview")}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition ${
                          editorTab === "preview"
                            ? "bg-[#F04E18] text-white"
                            : "text-[#6E6D6A] hover:text-[#0E1B2A]"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Live Gmail Preview
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-bold text-[#0E1B2A]">
                        <input
                          type="checkbox"
                          checked={selectedStep.enabled}
                          onChange={(e) =>
                            updateStep(selectedStep.id, { enabled: e.target.checked })
                          }
                          className="accent-[#F04E18]"
                        />
                        Step Enabled
                      </label>
                      {activeCampaign.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(selectedStep.id)}
                          className="rounded-lg p-1.5 text-[#8C8B87] hover:bg-red-50 hover:text-red-600"
                          title="Delete this email step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editorTab === "write" ? (
                    <div className="space-y-4 p-6">
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            Send Day
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={90}
                            value={selectedStep.day}
                            onChange={(e) =>
                              updateStep(selectedStep.id, {
                                day: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[14px] font-extrabold outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            Subject Line
                          </label>
                          <input
                            type="text"
                            value={selectedStep.subject}
                            onChange={(e) =>
                              updateStep(selectedStep.id, { subject: e.target.value })
                            }
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[14px] font-bold outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            Inbox Preview Text
                          </label>
                          <input
                            type="text"
                            value={selectedStep.previewText || ""}
                            onChange={(e) =>
                              updateStep(selectedStep.id, { previewText: e.target.value })
                            }
                            placeholder="Short preheader shown in Gmail..."
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                              Greeting Line
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateStep(selectedStep.id, {
                                  greeting: `${selectedStep.greeting} {{first_name | builder}}`.trim(),
                                })
                              }
                              className="rounded-md bg-[#FFF4EF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#F04E18] hover:bg-[#F04E18] hover:text-white"
                            >
                              + Insert Name
                            </button>
                          </div>
                          <input
                            type="text"
                            value={selectedStep.greeting}
                            onChange={(e) =>
                              updateStep(selectedStep.id, { greeting: e.target.value })
                            }
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            Email Body Copy
                          </label>
                          <span className="text-[11px] text-[#8C8B87]">
                            Variables like{" "}
                            <code className="rounded bg-[#F5F4F0] px-1">
                              {"{{first_name | builder}}"}
                            </code>{" "}
                            auto-fill per subscriber
                          </span>
                        </div>
                        <textarea
                          rows={12}
                          value={selectedStep.body}
                          onChange={(e) =>
                            updateStep(selectedStep.id, { body: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-2xl border border-[#EAE8E3] bg-[#F7F6F3] p-4 text-[13.5px] leading-[1.7] outline-none focus:border-[#0E1B2A] focus:bg-white"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            Optional CTA Button Label
                          </label>
                          <input
                            type="text"
                            value={selectedStep.ctaLabel}
                            onChange={(e) =>
                              updateStep(selectedStep.id, { ctaLabel: e.target.value })
                            }
                            placeholder="Leave blank for plain-letter style"
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                            CTA Destination URL
                          </label>
                          <input
                            type="text"
                            value={selectedStep.ctaUrl}
                            onChange={(e) =>
                              updateStep(selectedStep.id, { ctaUrl: e.target.value })
                            }
                            placeholder="/newsletter or https://..."
                            className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0E1B2A] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LIVE GMAIL PREVIEW TAB */
                    <div className="bg-[#F5F4F0] p-6 sm:p-8">
                      <div className="mx-auto max-w-[580px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-md">
                        {/* Gmail Header Chrome */}
                        <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3.5">
                          <p className="text-[15px] font-extrabold text-[#111827]">
                            {interpolateSubscriberName(selectedStep.subject, "Rohan")}
                          </p>
                          {selectedStep.previewText && (
                            <p className="mt-0.5 text-[12px] text-[#6B7280]">
                              {interpolateSubscriberName(selectedStep.previewText, "Rohan")}
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-[#6B7280]">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F04E18] text-[9px] font-black text-white">
                              SV
                            </span>
                            <strong className="text-[#111827]">SaaS Vibes</strong>
                            <span>&lt;hello@ankurfulzele.in&gt;</span>
                            <span>to Rohan</span>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="p-6">
                          <div className="border-b-2 border-[#111827] pb-3 text-center">
                            <p className="text-[15px] font-black tracking-[0.1em] text-[#111827]">
                              SAAS VIBES
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F04E18]">
                              {selectedStep.day === 0
                                ? "WELCOME ONBOARD"
                                : `DAY ${selectedStep.day} · ${activeCampaign.name.toUpperCase()}`}
                            </p>
                          </div>

                          <h3 className="mt-5 text-[16px] font-bold text-[#111827]">
                            {interpolateSubscriberName(selectedStep.greeting, "Rohan")}
                          </h3>
                          <div className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.72] text-[#1F2937]">
                            {interpolateSubscriberName(selectedStep.body, "Rohan")}
                          </div>

                          {selectedStep.ctaLabel && (
                            <div className="mt-6">
                              <span className="inline-block rounded-xl bg-[#F04E18] px-5 py-2.5 text-[13.5px] font-bold text-white">
                                {selectedStep.ctaLabel}
                              </span>
                            </div>
                          )}

                          <div className="mt-7 border-t border-[#E5E7EB] pt-4 text-center text-[11.5px] text-[#6B7280]">
                            Written by <strong>Ankur Fulzele</strong> · <strong>SaaS Vibes</strong>{" "}
                            · <span className="underline">Unsubscribe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Test Send Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE8E3] bg-[#FAF9F6] px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6D6A]">
                      <Sparkles className="h-3.5 w-3.5 text-[#F04E18]" />
                      Send a live test of Email {selectedStep.day} to your inbox
                    </span>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full rounded-xl border border-[#EAE8E3] bg-white px-3.5 py-2 text-[12.5px] outline-none focus:border-[#0E1B2A] sm:w-56"
                      />
                      <button
                        type="button"
                        disabled={sendingTest || !testEmail}
                        onClick={handleSendTest}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#F04E18] disabled:opacity-50"
                      >
                        {sendingTest ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
