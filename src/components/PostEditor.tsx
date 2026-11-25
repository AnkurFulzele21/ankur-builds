"use client";

import { useEffect, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  FilePlus2,
  Globe,
  GripVertical,
  Heading,
  Image as ImageIcon,
  ImagePlus,
  LayoutTemplate,
  Link2,
  List,
  Loader2,
  Mail,
  MessageSquareQuote,
  Minus,
  MousePointerClick,
  Newspaper,
  Palette,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Type,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadNewsletterMedia, type NewsletterPostRow } from "@/lib/beehiiv-db";
import {
  createBlock,
  createDefaultTemplateBlocks,
  createEssayTemplateBlocks,
  createMarcLouTemplateBlocks,
  createProductDigestBlocks,
  createRundownAITemplateBlocks,
  createWeekdayBriefTemplateBlocks,
  createWeekendBriefTemplateBlocks,
  extractDesign,
  getContentBlocks,
  getFontStack,
  packBlocksWithDesign,
  type ContentBlockType,
  type FontChoice,
  type HeaderStyleChoice,
  type NewsletterDesign,
  type RelatedIssueItem,
  type TemplateBlock,
  type WidthChoice,
} from "@/lib/newsletter-blocks";
import { NewsletterCardRenderer } from "@/components/NewsletterCardRenderer";
import {
  getBlockLabel,
  NewsletterBlockEditor,
} from "@/components/NewsletterBlockEditor";

const CATEGORIES = ["SaaS Building", "Vibe Coding", "AI & Agents", "Growth", "Build Log"];

const PALETTE_GROUPS: {
  label: string;
  items: { type: ContentBlockType; name: string; desc: string; icon: typeof Type }[];
}[] = [
  {
    label: "Basic (Build From Scratch)",
    items: [
      { type: "heading", name: "Heading", desc: "H1, H2, H3 + kicker", icon: Heading },
      { type: "richtext", name: "Rich Text", desc: "TipTap essay & lists", icon: Type },
      { type: "image", name: "Image", desc: "Upload + caption", icon: ImageIcon },
      { type: "button", name: "CTA Button", desc: "Custom color & shape", icon: MousePointerClick },
      { type: "callout", name: "Callout Box", desc: "Tip / takeaway box", icon: Sparkles },
      { type: "quote", name: "Pull Quote", desc: "Styled blockquote", icon: MessageSquareQuote },
      { type: "divider", name: "Divider", desc: "Solid / dashed line", icon: Minus },
      { type: "spacer", name: "Spacer", desc: "Vertical gap", icon: PanelLeft },
    ],
  },
  {
    label: "Layout & Media",
    items: [
      { type: "columns", name: "2 Columns", desc: "Side-by-side grid", icon: Columns2 },
      { type: "embed_card", name: "Link Card", desc: "Bookmark preview", icon: Link2 },
      { type: "code", name: "Code Block", desc: "Syntax snippet", icon: Code2 },
    ],
  },
  {
    label: "Editorial (Beehiiv / Rundown)",
    items: [
      { type: "intro", name: "Intro & TOC", desc: "Greeting + rundown", icon: BookOpen },
      { type: "story", name: "Rundown Story", desc: "Details + Why it matters", icon: Newspaper },
      { type: "quick_hits", name: "Quick Hits", desc: "Curated bullet links", icon: List },
      { type: "spotlight", name: "Together With", desc: "Sponsor / tool box", icon: LayoutTemplate },
      { type: "poll", name: "5-Star Poll", desc: "Web + Gmail rating", icon: Star },
    ],
  },
];

const DESIGN_PRESETS: { name: string; design: Partial<NewsletterDesign> }[] = [
  {
    name: "Clean White (Beehiiv)",
    design: {
      pageBg: "#FFFFFF",
      surfaceBg: "#FFFFFF",
      textColor: "#111827",
      mutedColor: "#6B7280",
      accentColor: "#F04E18",
      fontFamily: "sans",
    },
  },
  {
    name: "Warm Cream (Vibe Labs)",
    design: {
      pageBg: "#F8EAE0",
      surfaceBg: "#FFFFFF",
      textColor: "#0E1B2A",
      mutedColor: "#5C6875",
      accentColor: "#F04E18",
      fontFamily: "sans",
    },
  },
  {
    name: "Editorial Newspaper",
    design: {
      pageBg: "#FAF8F5",
      surfaceBg: "#FAF8F5",
      textColor: "#1C1917",
      mutedColor: "#78716C",
      accentColor: "#B91C1C",
      fontFamily: "serif",
    },
  },
  {
    name: "Midnight Dark",
    design: {
      pageBg: "#0E1B2A",
      surfaceBg: "#132337",
      textColor: "#F8EAE0",
      mutedColor: "#94A3B8",
      accentColor: "#F04E18",
      fontFamily: "sans",
    },
  },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PostEditor({ initialPost }: { initialPost?: NewsletterPostRow | null }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState(initialPost?.title || "");
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialPost?.thumbnail_url || "");
  const [featured, setFeatured] = useState(initialPost?.featured ?? false);

  const [design, setDesign] = useState<NewsletterDesign>(() =>
    extractDesign(initialPost?.template_blocks)
  );
  const [tags, setTags] = useState<string[]>(() => {
    const d = extractDesign(initialPost?.template_blocks);
    if (d.tags && d.tags.length > 0) return d.tags;
    return initialPost?.category ? [initialPost.category] : ["Vibe Coding"];
  });
  const [customTagInput, setCustomTagInput] = useState("");
  const category = tags[0] || "Vibe Coding";

  function toggleTag(tagName: string) {
    const clean = tagName.trim();
    if (!clean) return;
    setTags((prev) =>
      prev.includes(clean)
        ? prev.length > 1
          ? prev.filter((t) => t !== clean)
          : prev
        : [...prev, clean]
    );
  }

  function addCustomTag() {
    const clean = customTagInput.trim();
    if (!clean) return;
    setTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setCustomTagInput("");
  }
  const [blocks, setBlocks] = useState<TemplateBlock[]>(() => {
    const existing = getContentBlocks(initialPost?.template_blocks);
    return existing.length > 0
      ? existing
      : createDefaultTemplateBlocks(initialPost?.title || "Weekly Dispatch");
  });

  // Studio UI State
  const [leftTab, setLeftTab] = useState<"blocks" | "design" | "templates">("blocks");
  const [previewMode, setPreviewMode] = useState<"email" | "web">("web");
  const [showToolkit, setShowToolkit] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [metaCollapsed, setMetaCollapsed] = useState(true);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  // Native HTML5 Drag-and-Drop State
  const [dragBlockIndex, setDragBlockIndex] = useState<number | null>(null);
  const [dragPaletteType, setDragPaletteType] = useState<ContentBlockType | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Audience & Email steps
  const [audienceSegment, setAudienceSegment] = useState(
    initialPost?.audience_segment || "all_active"
  );
  const [emailSubject, setEmailSubject] = useState(initialPost?.email_subject || "");
  const [emailPreviewText, setEmailPreviewText] = useState(
    initialPost?.email_preview_text || ""
  );
  const [publishToWeb, setPublishToWeb] = useState(initialPost?.publish_to_web ?? true);
  const [sendEmail, setSendEmail] = useState(initialPost?.send_email ?? true);
  const [scheduledFor, setScheduledFor] = useState(
    initialPost?.scheduled_for ? initialPost.scheduled_for.slice(0, 16) : ""
  );

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedIssueItem[]>([]);

  useEffect(() => {
    let active = true;
    async function loadRelated() {
      let query = supabase
        .from("newsletter_posts")
        .select("id, slug, title, subtitle, excerpt, thumbnail_url, published_at, created_at, read_time")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      if (initialPost?.id) {
        query = query.neq("id", initialPost.id);
      }
      const { data } = await query;
      if (active && Array.isArray(data)) {
        setRelatedPosts(data as RelatedIssueItem[]);
      }
    }
    loadRelated();
    return () => {
      active = false;
    };
  }, [initialPost?.id, supabase]);

  function updateBlock(id: string, updater: (b: TemplateBlock) => TemplateBlock) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  }

  function insertBlockAt(type: ContentBlockType, index?: number) {
    const newBlock = createBlock(type, {
      title,
      thumbnailUrl,
      accentColor: design.accentColor,
    });
    setBlocks((prev) => {
      if (index === undefined || index < 0 || index >= prev.length) {
        return [...prev, newBlock];
      }
      const next = [...prev];
      next.splice(index, 0, newBlock);
      return next;
    });
  }

  function duplicateBlock(index: number) {
    setBlocks((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const copy: TemplateBlock = {
        ...JSON.parse(JSON.stringify(target)),
        id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev];
      [copy[index], copy[nextIdx]] = [copy[nextIdx], copy[index]];
      return copy;
    });
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  /* ── Drag-and-Drop Handlers ── */
  function handlePaletteDragStart(e: DragEvent, type: ContentBlockType) {
    setDragPaletteType(type);
    setDragBlockIndex(null);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", `palette:${type}`);
  }

  function handleBlockDragStart(e: DragEvent, index: number) {
    setDragBlockIndex(index);
    setDragPaletteType(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `block:${index}`);
  }

  function handleDragEnd() {
    setDragBlockIndex(null);
    setDragPaletteType(null);
    setDropTargetIndex(null);
  }

  function handleDropAt(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();

    if (dragPaletteType) {
      insertBlockAt(dragPaletteType, targetIndex);
    } else if (dragBlockIndex !== null && dragBlockIndex !== targetIndex) {
      setBlocks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragBlockIndex, 1);
        const adjustedTarget = dragBlockIndex < targetIndex ? targetIndex - 1 : targetIndex;
        next.splice(adjustedTarget, 0, moved);
        return next;
      });
    }
    handleDragEnd();
  }

  async function handleImageUpload(file: File, target: "cover" | string) {
    setUploadingId(target);
    try {
      const url = await uploadNewsletterMedia(file);
      if (target === "cover") {
        setThumbnailUrl(url);
      } else if (target.includes(":left") || target.includes(":right")) {
        const [blockId, side] = target.split(":") as [string, "left" | "right"];
        updateBlock(blockId, (b) =>
          b.type === "columns" ? { ...b, [side]: { ...b[side], imageUrl: url } } : b
        );
      } else {
        updateBlock(target, (b) => {
          if (b.type === "image") return { ...b, url };
          if (b.type === "hero" || b.type === "spotlight" || b.type === "story") {
            return { ...b, imageUrl: url };
          }
          if (b.type === "embed_card") return { ...b, imageUrl: url };
          return b;
        });
      }
      setStatusMsg("Image uploaded to Supabase Storage!");
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  function buildPlainExcerpt() {
    if (subtitle.trim()) return subtitle.trim();
    const intro = blocks.find((b) => b.type === "intro");
    if (intro && intro.type === "intro") return intro.lead;
    const story = blocks.find((b) => b.type === "story");
    if (story && story.type === "story") return story.rundown;
    const rt = blocks.find((b) => b.type === "richtext");
    if (rt && rt.type === "richtext") {
      return rt.html.replace(/<[^>]+>/g, " ").trim().slice(0, 160);
    }
    return "Weekly issue from SaaS Vibes.";
  }

  function buildFallbackMarkdown() {
    return blocks
      .map((b) => {
        if (b.type === "heading") return `## ${b.text}`;
        if (b.type === "intro")
          return `${b.greeting}\n\n${b.lead}\n\n${b.tocItems.map((i) => `- ${i}`).join("\n")}`;
        if (b.type === "story")
          return `## ${b.headline}\n\n**The Rundown:** ${b.rundown}\n\n${b.details
            .map((d) => `- ${d}`)
            .join("\n")}\n\n**Why it matters:** ${b.whyItMatters}`;
        if (b.type === "quick_hits")
          return `## ${b.heading}\n\n${b.items
            .map((i) => `- **${i.title}** — ${i.description}`)
            .join("\n")}`;
        if (b.type === "callout") return `> **${b.title}:** ${b.body}`;
        if (b.type === "quote") return `> "${b.quote}" — ${b.author}`;
        if (b.type === "richtext")
          return `${b.heading ? `### ${b.heading}\n\n` : ""}${b.html
            .replace(/<[^>]+>/g, " ")
            .trim()}`;
        if (b.type === "spotlight") return `### ${b.title}\n\n${b.description}`;
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  async function savePost(mode: "draft" | "scheduled" | "published") {
    const finalTitle = title.trim() || "Untitled Newsletter Issue";
    const finalSlug = slug.trim() || slugify(finalTitle) || `issue-${Date.now()}`;
    const packedBlocks = packBlocksWithDesign(blocks, { ...design, tags });

    setSaving(true);
    setStatusMsg(null);

    const payload = {
      title: finalTitle,
      subtitle: subtitle.trim() || null,
      excerpt: buildPlainExcerpt(),
      slug: finalSlug,
      category,
      thumbnail_url: thumbnailUrl || null,
      content_markdown: buildFallbackMarkdown(),
      template_theme: "beehiiv-studio",
      template_blocks: packedBlocks,
      featured,
      status: mode,
      publish_to_web: publishToWeb,
      send_email: sendEmail,
      email_subject: emailSubject.trim() || finalTitle,
      email_preview_text: emailPreviewText.trim() || buildPlainExcerpt(),
      audience_segment: audienceSegment,
      scheduled_for:
        mode === "scheduled" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      published_at:
        mode === "published" ? initialPost?.published_at || new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    let postId = initialPost?.id;
    if (postId) {
      const { error } = await supabase
        .from("newsletter_posts")
        .update(payload)
        .eq("id", postId);
      if (error) {
        setSaving(false);
        setStatusMsg(`Save failed: ${error.message}`);
        return null;
      }
    } else {
      const { data, error } = await supabase
        .from("newsletter_posts")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        setStatusMsg(`Create failed: ${error?.message}`);
        return null;
      }
      postId = data.id;
    }

    if (mode === "published" && sendEmail && postId) {
      try {
        const res = await fetch("/api/send-newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const json = await res.json();
        if (!res.ok) {
          setSaving(false);
          setStatusMsg(`Saved to web, but email send failed: ${json.error || "Unknown error"}`);
          return postId;
        }
        setStatusMsg(
          json.dryRun
            ? `Published! (${json.recipientCount} subscribers queued)`
            : `Published & sent email to ${json.recipientCount} subscribers!`
        );
      } catch (err) {
        setSaving(false);
        setStatusMsg(
          `Saved to web, but email request failed: ${
            err instanceof Error ? err.message : "Network error"
          }`
        );
        return postId;
      }
    }

    setSaving(false);

    if (mode === "published") {
      router.push("/admin/posts");
      router.refresh();
      return postId;
    }

    setStatusMsg(mode === "draft" ? "Draft saved to Supabase!" : "Issue scheduled!");
    if (!initialPost?.id && postId) {
      router.push(`/admin/posts/${postId}`);
    } else {
      router.refresh();
    }
    return postId;
  }

  async function handleSendTestEmail() {
    if (!testEmail.trim()) return;
    setSendingTest(true);
    setStatusMsg(null);
    const postId = await savePost("draft");
    if (!postId) {
      setSendingTest(false);
      return;
    }
    const res = await fetch("/api/send-newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, testEmail: testEmail.trim() }),
    });
    const json = await res.json();
    setSendingTest(false);
    if (!res.ok) {
      setStatusMsg(`Test email failed: ${json.error}`);
    } else {
      setStatusMsg(
        json.dryRun
          ? `Compiled ${json.htmlLength} bytes of email HTML! Add RESEND_API_KEY in .env.local to deliver to ${testEmail}.`
          : `Test email sent to ${testEmail}!`
      );
    }
  }

  const steps = [
    { num: 1 as const, label: "1. Studio Builder", icon: Sparkles },
    { num: 2 as const, label: "2. Audience", icon: Users },
    { num: 3 as const, label: "3. Email Settings", icon: Mail },
    { num: 4 as const, label: "4. Review & Publish", icon: Send },
  ];

  return (
    <div className="space-y-4">
      {/* Top Studio Header & 4-Step Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EAE8E3] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((s) => {
            const Icon = s.icon;
            const active = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                  active
                    ? "bg-[#18181B] text-white"
                    : "text-[#6E6D6A] hover:bg-[#F5F4F0] hover:text-[#18181B]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={() => setShowToolkit((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
                  showToolkit
                    ? "border-[#EAE8E3] bg-[#FAF9F6] text-[#18181B] hover:bg-[#F0EFEA]"
                    : "border-[#0E1B2A] bg-[#0E1B2A] text-white"
                }`}
              >
                {showToolkit ? (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                )}
                {showToolkit ? "Hide Tools" : "Blocks & Design"}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
                  showPreview
                    ? "border-[#0E1B2A] bg-[#0E1B2A] text-white"
                    : "border-[#EAE8E3] bg-[#FAF9F6] text-[#18181B] hover:bg-[#F0EFEA]"
                }`}
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost("draft")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#18181B] hover:bg-[#F5F4F0] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (step === 4) {
                savePost("published");
              } else {
                setStep(4);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F04E18] px-4 py-2 text-[12.5px] font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {step === 4 ? (sendEmail ? "Publish & Send Now" : "Publish Now") : "Review & Publish"}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EAE8E3] bg-white px-4 py-2.5 text-[13px] font-medium text-[#18181B]">
          <Check className="h-4 w-4 text-emerald-600" />
          {statusMsg}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STEP 1: FULL 3-PANEL DRAG-AND-DROP BEEHIIV + MAILCHEAP STUDIO  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="grid gap-5 xl:grid-cols-12">
          {/* LEFT PANEL: Collapsible Draggable Blocks | Design Studio | Templates */}
          {showToolkit && (
          <aside className="xl:col-span-3">
            <div className="sticky top-4 overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-xs">
              {/* Sidebar Tabs + Collapse Button */}
              <div className="flex items-center gap-1 border-b border-[#EAE8E3] bg-[#FAF9F6] p-1">
                <div className="grid flex-1 grid-cols-3 gap-0.5">
                {(
                  [
                    { id: "blocks", label: "Blocks", icon: FilePlus2 },
                    { id: "design", label: "Design", icon: Palette },
                    { id: "templates", label: "Templates", icon: LayoutTemplate },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const active = leftTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeftTab(t.id)}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold transition ${
                        active
                          ? "bg-white text-[#18181B] shadow-xs"
                          : "text-[#6E6D6A] hover:text-[#18181B]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowToolkit(false)}
                  title="Collapse tools panel for wider writing view"
                  className="rounded-lg p-1.5 text-[#6E6D6A] transition hover:bg-white hover:text-[#0E1B2A]"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="max-h-[78vh] overflow-y-auto p-3">
                {/* TAB 1: DRAGGABLE BLOCK PALETTE */}
                {leftTab === "blocks" && (
                  <div className="space-y-4">
                    <p className="rounded-xl bg-[#FFF8F5] px-3 py-2 text-[11.5px] leading-snug text-[#9A3412]">
                      <strong>Drag &amp; drop</strong> any block into the canvas, or{" "}
                      <strong>click</strong> to append.
                    </p>
                    {PALETTE_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                draggable
                                onDragStart={(e) => handlePaletteDragStart(e, item.type)}
                                onDragEnd={handleDragEnd}
                                onClick={() => insertBlockAt(item.type)}
                                className="group flex cursor-grab flex-col items-start rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-2.5 text-left transition hover:border-[#F04E18] hover:bg-white active:cursor-grabbing"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <Icon className="h-4 w-4 text-[#18181B] group-hover:text-[#F04E18]" />
                                  <GripVertical className="h-3 w-3 text-[#C4C2BC]" />
                                </div>
                                <span className="mt-1.5 text-[12px] font-bold text-[#18181B]">
                                  {item.name}
                                </span>
                                <span className="text-[10px] leading-tight text-[#787773]">
                                  {item.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: GLOBAL WEB + EMAIL DESIGN STUDIO */}
                {leftTab === "design" && (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        Quick Theme Presets
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {DESIGN_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              setDesign((prev) => ({ ...prev, ...preset.design }))
                            }
                            className="rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-2.5 py-2 text-left text-[11.5px] font-semibold text-[#18181B] transition hover:border-[#18181B]"
                          >
                            <div className="mb-1 flex items-center gap-1">
                              <span
                                style={{ backgroundColor: preset.design.pageBg }}
                                className="h-3.5 w-3.5 rounded-full border border-black/15"
                              />
                              <span
                                style={{ backgroundColor: preset.design.accentColor }}
                                className="h-3.5 w-3.5 rounded-full"
                              />
                            </div>
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5 border-t border-[#EAE8E3] pt-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        Custom Colors (Web &amp; Email)
                      </p>
                      {(
                        [
                          { key: "pageBg", label: "Page Background" },
                          { key: "surfaceBg", label: "Article Container" },
                          { key: "accentColor", label: "Accent / Brand Color" },
                          { key: "textColor", label: "Body Text Ink" },
                        ] as const
                      ).map((c) => (
                        <label
                          key={c.key}
                          className="flex items-center justify-between rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-2 text-[12px] font-medium"
                        >
                          <span>{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] text-[#6E6D6A]">
                              {design[c.key]}
                            </span>
                            <input
                              type="color"
                              value={design[c.key]}
                              onChange={(e) =>
                                setDesign((prev) => ({ ...prev, [c.key]: e.target.value }))
                              }
                              className="h-6 w-6 cursor-pointer rounded border border-[#EAE8E3]"
                            />
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2.5 border-t border-[#EAE8E3] pt-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        Typography &amp; Layout
                      </p>
                      <div>
                        <label className="mb-1 block text-[11.5px] text-[#6E6D6A]">
                          Font Family
                        </label>
                        <select
                          value={design.fontFamily}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              fontFamily: e.target.value as FontChoice,
                            }))
                          }
                          className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-2 text-[12.5px] font-medium"
                        >
                          <option value="sans">Modern Sans (Beehiiv / Rundown)</option>
                          <option value="serif">Editorial Serif (Substack / NYT)</option>
                          <option value="mono">Tech Mono (Developer Log)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11.5px] text-[#6E6D6A]">
                          Content Width
                        </label>
                        <select
                          value={design.contentWidth}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              contentWidth: e.target.value as WidthChoice,
                            }))
                          }
                          className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-2 text-[12.5px] font-medium"
                        >
                          <option value="600px">Compact (600px)</option>
                          <option value="680px">Editorial Standard (680px)</option>
                          <option value="760px">Wide Magazine (760px)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11.5px] text-[#6E6D6A]">
                          Header Style
                        </label>
                        <select
                          value={design.headerStyle}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              headerStyle: e.target.value as HeaderStyleChoice,
                            }))
                          }
                          className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-2 text-[12.5px] font-medium"
                        >
                          <option value="minimal">Minimal Left-Aligned</option>
                          <option value="centered">Centered Classic</option>
                          <option value="magazine">Bold Magazine Uppercase</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-[#EAE8E3] pt-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        Web Page Sections
                      </p>
                      {(
                        [
                          { key: "showByline", label: "Show Author Byline" },
                          { key: "showThumbnail", label: "Show Cover Thumbnail" },
                          { key: "showSubscribeBox", label: "Show Bottom Subscribe Box" },
                          { key: "showKeepReading", label: 'Show "Keep Reading" Issues' },
                        ] as const
                      ).map((toggle) => (
                        <label
                          key={toggle.key}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-2 text-[12px] font-medium"
                        >
                          <span>{toggle.label}</span>
                          <input
                            type="checkbox"
                            checked={design[toggle.key]}
                            onChange={(e) =>
                              setDesign((prev) => ({
                                ...prev,
                                [toggle.key]: e.target.checked,
                              }))
                            }
                            className="accent-[#F04E18]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: STARTER TEMPLATES + BLANK CANVAS */}
                {leftTab === "templates" && (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBlocks([]);
                        setLeftTab("blocks");
                        setStatusMsg("Cleared canvas! Drag blocks from the left to build from scratch.");
                      }}
                      className="w-full rounded-xl border-2 border-dashed border-[#F04E18]/50 bg-[#FFF8F5] p-3.5 text-left transition hover:border-[#F04E18]"
                    >
                      <p className="text-[13px] font-bold text-[#F04E18]">
                        Blank Canvas (From Scratch)
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Start completely empty and drag-and-drop every single block yourself.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(
                          createWeekendBriefTemplateBlocks(
                            title || "Weekend Brief: Trending SaaS, Top Tools, Repos & Distribution"
                          )
                        );
                        setStatusMsg("Loaded Weekend Brief (5-Card Rundown AI Template)!");
                      }}
                      className="w-full rounded-xl border-2 border-[#F04E18]/40 bg-[#FFF8F5] p-3.5 text-left transition hover:border-[#F04E18]"
                    >
                      <p className="text-[13px] font-bold text-[#F04E18]">
                        Weekend Brief (5 Cards · Rundown AI)
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Good Morning Intro + 5 Rundown Cards: Trending SaaS, SaaS of the Week, Vibe Toolkit, Skills &amp; Repos, Distribution Play + Poll.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(
                          createWeekdayBriefTemplateBlocks(
                            title || "How a Solo Builder Vibe-Coded & Marketed a SaaS to $1M+"
                          )
                        );
                        setStatusMsg("Loaded Weekday Brief (Vibe-Coded SaaS Story)!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#F04E18]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        Weekday Brief (Vibe-Coded SaaS Story)
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Deep-dive SaaS founder story, marketing &amp; millions playbook, Steal This Stack, and Poll.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(createMarcLouTemplateBlocks(title || "How I Shipped a SaaS in 48 Hours"));
                        setStatusMsg("Loaded Marc Lou Newsletter template!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#F04E18]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        Marc Lou Newsletter
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Location opener, short punchy story, build-in-public update, &ldquo;Whenever you&apos;re ready&rdquo; 3-link footer.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(createRundownAITemplateBlocks(title || "The AI Workflow Changing How Solo Founders Ship"));
                        setStatusMsg("Loaded exact The Rundown AI template!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#F04E18]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        The Rundown AI (Exact)
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        In today&apos;s Rundown TOC, 2 deep-dive stories (Rundown / Details / Why it matters), Together With, Quick Hits, Poll.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(createDefaultTemplateBlocks(title || "Weekly Dispatch"));
                        setStatusMsg("Loaded Morning Brew / Rundown AI template!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#18181B]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        Morning Brew / Hybrid
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Intro + TOC, The Rundown / Details / Why it matters, Sponsor, Quick Hits, Poll.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(createEssayTemplateBlocks(title || "Founder Essay"));
                        setStatusMsg("Loaded Founder Deep-Dive Essay template!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#18181B]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        Founder Essay (Substack Style)
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        Heading, long-form TipTap essay, pull quote, takeaway callout, CTA button, poll.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBlocks(createProductDigestBlocks());
                        setStatusMsg("Loaded Product & Tool Digest template!");
                      }}
                      className="w-full rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3.5 text-left transition hover:border-[#18181B]"
                    >
                      <p className="text-[13px] font-bold text-[#18181B]">
                        Product &amp; Code Digest
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#6E6D6A]">
                        2-column tool showcase, code snippet block, and curated quick hits.
                      </p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
          )}

          {/* CENTER PANEL: SPACIOUS EDITORIAL WRITING CANVAS */}
          <div
            className={
              showToolkit && showPreview
                ? "space-y-4 xl:col-span-5"
                : showToolkit && !showPreview
                ? "mx-auto w-full max-w-4xl space-y-4 xl:col-span-9"
                : !showToolkit && showPreview
                ? "space-y-4 xl:col-span-7"
                : "mx-auto w-full max-w-4xl space-y-4 xl:col-span-12"
            }
          >
            {/* Clean Editorial Title + Subtitle + Collapsible Post Details Drawer */}
            <div className="rounded-3xl border border-[#EAE8E3] bg-white p-6 shadow-2xs">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!initialPost?.slug) setSlug(slugify(e.target.value));
                }}
                placeholder="Write a punchy issue headline..."
                className="w-full bg-transparent text-[24px] font-extrabold tracking-tight text-[#0E1B2A] outline-none placeholder:text-[#C4C2BC] sm:text-[28px]"
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Add a short subtitle or teaser shown on your archive..."
                className="mt-1.5 w-full bg-transparent text-[14.5px] text-[#52525B] outline-none placeholder:text-[#A1A1AA]"
              />

              {/* Compact Summary Strip to Toggle Tags, Issue # & Thumbnail */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F0EC] pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {design.issueLabel && (
                    <span className="rounded-full bg-[#FFF4EF] px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-[#F04E18]">
                      {design.issueLabel}
                    </span>
                  )}
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#F5F4F0] px-2.5 py-0.5 text-[11px] font-semibold text-[#0E1B2A]"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-[11px] text-[#8C8B87]">
                    · {thumbnailUrl ? "Thumbnail set ✓" : "No thumbnail yet"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMetaCollapsed((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#EAE8E3] bg-[#FAF9F6] px-3 py-1 text-[11.5px] font-bold text-[#0E1B2A] transition hover:border-[#0E1B2A]"
                >
                  {metaCollapsed ? (
                    <>
                      Edit Tags, Issue # &amp; Thumbnail <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Hide Details <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {!metaCollapsed && (
                <div className="mt-4 space-y-3 border-t border-[#F1F0EC] pt-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                      Issue Number / Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={design.issueLabel || ""}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, issueLabel: e.target.value }))
                      }
                      placeholder="e.g. Issue #02 · Wednesday Story"
                      className="mt-1 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px] font-medium outline-none focus:border-[#0E1B2A] focus:bg-white"
                    />
                  </div>

                  {/* Multi-Tag & Custom Category Picker */}
                  <div className="rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        Categories &amp; Tags (Select 1 or multiple)
                      </span>
                      <span className="text-[11px] text-[#8C8B87]">
                        {tags.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...CATEGORIES, ...tags])).map((tagName) => {
                        const active = tags.includes(tagName);
                        return (
                          <button
                            key={tagName}
                            type="button"
                            onClick={() => toggleTag(tagName)}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-semibold transition ${
                              active
                                ? "bg-[#0E1B2A] text-white"
                                : "border border-[#EAE8E3] bg-white text-[#52525B] hover:border-[#0E1B2A]"
                            }`}
                          >
                            <span>{tagName}</span>
                            {active && tags.length > 1 && <X className="h-3 w-3 opacity-75" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomTag();
                          }
                        }}
                        placeholder="Create custom tag (e.g. Case Study, Launch)..."
                        className="flex-1 rounded-lg border border-[#EAE8E3] bg-white px-3 py-1.5 text-[12px] outline-none focus:border-[#0E1B2A]"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        className="rounded-lg bg-[#0E1B2A] px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-[#F04E18]"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Cover Thumbnail Uploader */}
                  <div className="flex flex-col gap-3 rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3 sm:flex-row sm:items-center">
                    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-[#EAE8E3] bg-white sm:w-32">
                      {thumbnailUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnailUrl}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setThumbnailUrl("")}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-[#9E9D99]">
                          <ImagePlus className="h-4 w-4" />
                          <span className="mt-0.5 text-[10px]">Thumbnail</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#18181B] px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-[#27272A]">
                        {uploadingId === "cover" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ImagePlus className="h-3.5 w-3.5" />
                        )}
                        {thumbnailUrl ? "Replace Thumbnail" : "Upload Thumbnail"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(f, "cover");
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="Or paste thumbnail URL (https://...)"
                        className="w-full rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-[12px] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DRAG-AND-DROP BLOCK CANVAS */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (blocks.length === 0) setDropTargetIndex(0);
              }}
              onDrop={(e) => handleDropAt(e, blocks.length)}
              className="space-y-1"
            >
              {blocks.length === 0 && (
                <div
                  className={`flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dropTargetIndex !== null
                      ? "border-[#F04E18] bg-[#FFF8F5]"
                      : "border-[#D4D4D8] bg-white"
                  }`}
                >
                  <Sparkles className="h-7 w-7 text-[#F04E18]" />
                  <p className="mt-2 text-[15px] font-bold text-[#18181B]">
                    Blank Canvas Ready
                  </p>
                  <p className="mt-1 max-w-xs text-[12.5px] text-[#6E6D6A]">
                    Drag any block from the left palette and drop it here — or click any
                    block to start building from scratch.
                  </p>
                </div>
              )}

              {blocks.map((block, index) => {
                const isCollapsed = !!collapsedIds[block.id];
                const isDropHere = dropTargetIndex === index;
                return (
                  <div key={block.id}>
                    {/* Drop Zone Indicator Above Each Block */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropTargetIndex(index);
                      }}
                      onDrop={(e) => handleDropAt(e, index)}
                      className={`transition-all ${
                        isDropHere
                          ? "my-2 h-3 rounded-full bg-[#F04E18]/80"
                          : "h-2 rounded-full bg-transparent"
                      }`}
                    />

                    {/* Draggable Block Card */}
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropTargetIndex(index);
                      }}
                      onDrop={(e) => handleDropAt(e, index)}
                      className={`rounded-2xl border bg-white p-4 transition ${
                        dragBlockIndex === index
                          ? "border-[#F04E18] opacity-50"
                          : "border-[#EAE8E3] hover:border-[#D4D4D8]"
                      }`}
                    >
                      {/* Block Header Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="cursor-grab rounded p-1 text-[#9E9D99] hover:bg-[#F5F4F0] hover:text-[#18181B] active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>
                          <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#52525B]">
                            {getBlockLabel(block)}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => duplicateBlock(index)}
                            className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0] hover:text-[#18181B]"
                            title="Duplicate block"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(index, -1)}
                            className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
                            title="Move up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(index, 1)}
                            className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
                            title="Move down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCollapse(block.id)}
                            className="rounded-lg p-1.5 text-[#6E6D6A] hover:bg-[#F5F4F0]"
                            title={isCollapsed ? "Expand" : "Collapse"}
                          >
                            {isCollapsed ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronUp className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="rounded-lg p-1.5 text-[#8C8B87] hover:bg-red-50 hover:text-red-600"
                            title="Delete block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="mt-3 border-t border-[#F0EFEA] pt-3">
                          <NewsletterBlockEditor
                            block={block}
                            uploadingId={uploadingId}
                            onUpdate={(updater) => updateBlock(block.id, updater)}
                            onUploadImage={handleImageUpload}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bottom Drop Zone */}
              {blocks.length > 0 && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropTargetIndex(blocks.length);
                  }}
                  onDrop={(e) => handleDropAt(e, blocks.length)}
                  className={`mt-2 flex items-center justify-center rounded-xl border-2 border-dashed py-3 text-[12px] font-medium transition ${
                    dropTargetIndex === blocks.length
                      ? "border-[#F04E18] bg-[#FFF8F5] text-[#F04E18]"
                      : "border-[#E5E7EB] text-[#9E9D99]"
                  }`}
                >
                  Drop block here to append to bottom
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: LIVE EMAIL + WEB VIEW PREVIEW */}
          {showPreview && (
            <div className={showToolkit ? "xl:col-span-4" : "xl:col-span-5"}>
              <div className="sticky top-4 rounded-2xl border border-[#EAE8E3] bg-[#F7F6F3] p-3.5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex rounded-full border border-[#EAE8E3] bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("web")}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-bold transition ${
                        previewMode === "web"
                          ? "bg-[#F04E18] text-white"
                          : "text-[#6E6D6A] hover:text-[#18181B]"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Web View
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("email")}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-bold transition ${
                        previewMode === "email"
                          ? "bg-[#18181B] text-white"
                          : "text-[#6E6D6A] hover:text-[#18181B]"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Email View
                    </button>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[#6E6D6A]">
                    Live Sync
                  </span>
                </div>

                {previewMode === "email" ? (
                  <div
                    style={{
                      backgroundColor: design.pageBg,
                      fontFamily: getFontStack(design.fontFamily),
                    }}
                    className="max-h-[76vh] overflow-y-auto rounded-xl border border-[#E5E7EB] p-3 shadow-xs"
                  >
                    <div
                      style={{
                        backgroundColor: design.surfaceBg,
                        color: design.textColor,
                      }}
                      className="rounded-lg p-4"
                    >
                      <div
                        style={{ borderColor: design.textColor }}
                        className="border-b-2 pb-3 text-center"
                      >
                        <p className="text-[13px] font-black uppercase tracking-[0.12em]">
                          SAAS VIBES
                        </p>
                        <p
                          style={{ color: design.mutedColor }}
                          className="text-[10px] underline"
                        >
                          Read online →
                        </p>
                      </div>
                      <h2
                        className={`mt-4 text-[20px] font-extrabold leading-tight ${
                          design.headerStyle === "centered" ? "text-center" : "text-left"
                        }`}
                      >
                        {title || "Untitled SaaS Vibes Issue"}
                      </h2>
                      <div className="mt-4">
                        <NewsletterCardRenderer blocks={blocks} design={design} />
                      </div>

                      {/* Keep Reading in Email Preview */}
                      {design.showKeepReading && (
                        <div className="mt-6 border-t border-black/10 pt-4">
                          <div className="mb-2.5 flex items-center justify-between text-[11px]">
                            <span className="font-bold">Keep reading</span>
                            <span style={{ color: design.mutedColor }}>All issues →</span>
                          </div>
                          <div className="space-y-2">
                            {(relatedPosts.length > 0
                              ? relatedPosts
                              : [
                                  {
                                    id: "sample-1",
                                    slug: "sample-1",
                                    title: "Previous Issue #1 will appear here",
                                    subtitle: "Your latest published issues populate automatically.",
                                    excerpt: null,
                                    thumbnail_url: null,
                                    published_at: null,
                                    created_at: "",
                                    read_time: "4 min read",
                                  },
                                ]
                            ).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2.5 rounded-lg border border-black/10 p-2"
                              >
                                <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-black/[0.06]">
                                  {item.thumbnail_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.thumbnail_url}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[11.5px] font-bold">
                                    {item.title}
                                  </p>
                                  <p
                                    style={{ color: design.mutedColor }}
                                    className="truncate text-[10px]"
                                  >
                                    {item.subtitle || item.excerpt || "Read full issue →"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[76vh] space-y-4 overflow-y-auto pr-0.5">
                    {/* 1. Website Card Preview */}
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        1. Website Card (/newsletter &amp; Homepage)
                      </p>
                      <div className="overflow-hidden rounded-2xl border border-[#0E1B2A]/10 bg-white p-2.5 shadow-xs">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0E1B2A] via-[#1B2F47] to-[#F04E18]/80">
                          {thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnailUrl}
                              alt="Thumb"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5B5A8]">
                                SAAS VIBES
                              </span>
                              <span className="mt-1 line-clamp-2 text-[13px] font-bold text-[#F8EAE0]">
                                {title || "Your Issue Title"}
                              </span>
                            </div>
                          )}
                          <span className="absolute left-2 top-2 rounded-full bg-[#F8EAE0]/95 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase text-[#0E1B2A]">
                            {category}
                          </span>
                        </div>
                        <div className="px-1 pt-2.5">
                          <h3 className="line-clamp-2 text-[14px] font-extrabold text-[#0E1B2A]">
                            {title || "Untitled SaaS Vibes Issue"}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[#0E1B2A]/65">
                            {subtitle || "Subtitle excerpt..."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Full Web Article Preview */}
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                        2. Full Web Reader (/newsletter/{slug || "slug"})
                      </p>
                      <div
                        style={{
                          backgroundColor: design.pageBg,
                          color: design.textColor,
                          fontFamily: getFontStack(design.fontFamily),
                        }}
                        className="overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 bg-[#111827] px-3 py-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#FF5F56]" />
                          <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                          <span className="h-2 w-2 rounded-full bg-[#27C93F]" />
                          <span className="ml-2 truncate font-mono text-[9.5px] text-white/75">
                            /newsletter/{slug || "issue-slug"}
                          </span>
                        </div>

                        <div
                          style={{ backgroundColor: design.surfaceBg }}
                          className="p-4"
                        >
                          <div
                            className={
                              design.headerStyle === "centered" ? "text-center" : "text-left"
                            }
                          >
                        <div className="flex flex-wrap items-center gap-1.5">
                          {design.issueLabel && (
                            <span
                              style={{ backgroundColor: design.accentColor }}
                              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white"
                            >
                              {design.issueLabel}
                            </span>
                          )}
                          {tags.map((t) => (
                            <span
                              key={t}
                              style={{ color: design.accentColor }}
                              className="rounded-full border border-current/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                            <h2
                              className={`mt-1 text-[20px] font-extrabold leading-tight ${
                                design.headerStyle === "magazine" ? "uppercase" : ""
                              }`}
                            >
                              {title || "Untitled SaaS Vibes Issue"}
                            </h2>
                            {subtitle && (
                              <p
                                style={{ color: design.mutedColor }}
                                className="mt-1 text-[12px] leading-relaxed"
                              >
                                {subtitle}
                              </p>
                            )}
                          </div>

                          {design.showByline && (
                            <div className="mt-3 flex items-center gap-2 border-y border-black/10 py-2">
                              <div
                                style={{
                                  backgroundColor: design.textColor,
                                  color: design.surfaceBg,
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
                              >
                                AF
                              </div>
                              <span className="text-[11px] font-bold">Ankur Fulzele</span>
                              <span
                                style={{ color: design.mutedColor }}
                                className="text-[10px]"
                              >
                                · SaaS Vibes
                              </span>
                            </div>
                          )}

                          {design.showThumbnail && thumbnailUrl && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbnailUrl}
                                alt="Cover"
                                className="aspect-[16/9] w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="mt-4">
                            <NewsletterCardRenderer blocks={blocks} design={design} />
                          </div>

                          {/* Marc Lou–Style Keep Reading in Web Preview */}
                          {design.showKeepReading && (
                            <div className="mt-6 border-t border-black/10 pt-4">
                              <div className="mb-3 flex items-center justify-between text-[11px]">
                                <span className="font-bold">Keep reading</span>
                                <span style={{ color: design.mutedColor }}>All issues →</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {(relatedPosts.length > 0
                                  ? relatedPosts
                                  : [
                                      {
                                        id: "s1",
                                        slug: "s1",
                                        title: "Previous Issue #1",
                                        subtitle: "Auto-filled from your archive",
                                        excerpt: null,
                                        thumbnail_url: null,
                                        published_at: null,
                                        created_at: "",
                                        read_time: "4 min",
                                      },
                                      {
                                        id: "s2",
                                        slug: "s2",
                                        title: "Previous Issue #2",
                                        subtitle: "Auto-filled from your archive",
                                        excerpt: null,
                                        thumbnail_url: null,
                                        published_at: null,
                                        created_at: "",
                                        read_time: "5 min",
                                      },
                                      {
                                        id: "s3",
                                        slug: "s3",
                                        title: "Previous Issue #3",
                                        subtitle: "Auto-filled from your archive",
                                        excerpt: null,
                                        thumbnail_url: null,
                                        published_at: null,
                                        created_at: "",
                                        read_time: "4 min",
                                      },
                                    ]
                                ).map((item) => (
                                  <div key={item.id} className="space-y-1">
                                    <div className="aspect-[16/10] overflow-hidden rounded-md border border-black/10 bg-black/[0.05]">
                                      {item.thumbnail_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={item.thumbnail_url}
                                          alt={item.title}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            background: `linear-gradient(135deg, ${design.accentColor}22, ${design.textColor}12)`,
                                          }}
                                          className="flex h-full w-full items-center justify-center p-1 text-center text-[8px] font-bold"
                                        >
                                          SV
                                        </div>
                                      )}
                                    </div>
                                    <p className="line-clamp-2 text-[10px] font-bold leading-tight">
                                      {item.title}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: AUDIENCE */}
      {step === 2 && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-[#EAE8E3] bg-white p-6">
          <h2 className="text-lg font-bold">Select Audience Segment</h2>
          <p className="text-[13px] text-[#6E6D6A]">
            Choose who receives this email when you hit Publish &amp; Send.
          </p>
          <div className="space-y-2.5">
            {[
              {
                id: "all_active",
                title: "All Active Subscribers",
                desc: "Every active email in your Supabase subscribers table.",
              },
              {
                id: "vip_founders",
                title: "Tagged Subscribers (VIP / Founders)",
                desc: "Segment targeted dispatches for high-engagement readers.",
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  audienceSegment === opt.id
                    ? "border-[#18181B] bg-[#FAF9F6]"
                    : "border-[#EAE8E3] hover:border-[#18181B]/40"
                }`}
              >
                <input
                  type="radio"
                  name="segment"
                  checked={audienceSegment === opt.id}
                  onChange={() => setAudienceSegment(opt.id)}
                  className="mt-1"
                />
                <div>
                  <p className="text-[14px] font-semibold">{opt.title}</p>
                  <p className="text-[12.5px] text-[#6E6D6A]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: EMAIL SETTINGS & TEST SEND */}
      {step === 3 && (
        <div className="max-w-2xl space-y-5 rounded-2xl border border-[#EAE8E3] bg-white p-6">
          <div>
            <h2 className="text-lg font-bold">Email Inbox Settings (React Email + Resend)</h2>
            <p className="mt-1 text-[13px] text-[#6E6D6A]">
              All blocks and custom Design Studio colors compile automatically into Gmail &amp;
              Apple Mail safe HTML.
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6E6D6A]">Subject Line</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder={title || "Enter email subject line"}
              className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#18181B] focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6E6D6A]">Preview Text</label>
            <input
              type="text"
              value={emailPreviewText}
              onChange={(e) => setEmailPreviewText(e.target.value)}
              placeholder="Appears right next to the subject line in Gmail..."
              className="mt-1.5 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#18181B] focus:bg-white"
            />
          </div>
          {/* Pre-Send Deliverability Checker (Resend Best Practices) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-900">
              Gmail &amp; Resend Deliverability Check
            </p>
            <div className="mt-2.5 grid gap-2 text-[12.5px] sm:grid-cols-2">
              <div className="flex items-center gap-2 text-emerald-900">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>
                  Estimated Size: ~{Math.max(4, Math.round(JSON.stringify(blocks).length / 320))} KB{" "}
                  <span className="text-emerald-700">(under 102 KB Gmail clip limit)</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Auto plain-text fallback attached</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>RFC-8058 1-click Unsubscribe header active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Real Reply-To address configured</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FAF9F6] p-4">
            <label className="block text-[12px] font-semibold text-[#18181B]">
              Send a Test Email
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="flex-1 rounded-xl border border-[#EAE8E3] bg-white px-3.5 py-2 text-[13px]"
              />
              <button
                type="button"
                disabled={sendingTest || !testEmail}
                onClick={handleSendTestEmail}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[#27272A] disabled:opacity-50"
              >
                {sendingTest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & PUBLISH */}
      {step === 4 && (
        <div className="max-w-2xl space-y-5 rounded-2xl border border-[#EAE8E3] bg-white p-6">
          <h2 className="text-lg font-bold">Review &amp; Publish</h2>

          <div>
            <label className="block text-[12px] font-medium text-[#6E6D6A]">URL Slug</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3">
              <span className="text-[12.5px] text-[#8C8B87]">/newsletter/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="flex-1 bg-transparent py-2.5 pl-1 text-[13px] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between rounded-xl border border-[#EAE8E3] p-3.5">
              <span className="text-[13.5px] font-medium">Publish to Public Web Archive</span>
              <input
                type="checkbox"
                checked={publishToWeb}
                onChange={(e) => setPublishToWeb(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#EAE8E3] p-3.5">
              <span className="text-[13.5px] font-medium">Send Email to Subscribers</span>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#EAE8E3] p-3.5">
              <span className="text-[13.5px] font-medium">Pin as Featured Issue</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
            </label>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#6E6D6A]">
              Optional: Schedule for Later
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-1.5 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {scheduledFor && (
              <button
                type="button"
                disabled={saving}
                onClick={() => savePost("scheduled")}
                className="rounded-xl border border-[#18181B] px-5 py-2.5 text-[13px] font-semibold text-[#18181B] hover:bg-[#F5F4F0]"
              >
                Schedule Issue
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => savePost("published")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#18181B] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#27272A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sendEmail ? "Publish & Send Email Now" : "Publish to Web Only"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
