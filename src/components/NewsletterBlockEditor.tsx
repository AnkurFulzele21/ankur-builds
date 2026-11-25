"use client";

import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import type { TemplateBlock } from "@/lib/newsletter-blocks";
import { TipTapEditor } from "@/components/TipTapEditor";

interface NewsletterBlockEditorProps {
  block: TemplateBlock;
  uploadingId: string | null;
  onUpdate: (updater: (b: TemplateBlock) => TemplateBlock) => void;
  onUploadImage: (file: File, target: string) => void;
}

export function getBlockLabel(block: TemplateBlock): string {
  switch (block.type) {
    case "heading":
      return `Heading (${block.level.toUpperCase()})`;
    case "richtext":
      return "Rich Text Paragraph";
    case "image":
      return "Image";
    case "button":
      return "CTA Button";
    case "callout":
      return "Callout Box";
    case "quote":
      return "Pull Quote";
    case "divider":
      return "Divider Line";
    case "spacer":
      return `Spacer (${block.height}px)`;
    case "columns":
      return "2-Column Layout";
    case "embed_card":
      return "Link Bookmark Card";
    case "code":
      return `Code Snippet (${block.language || "code"})`;
    case "intro":
      return "Intro & Today's TOC";
    case "story":
      return "Editorial Story (Rundown)";
    case "quick_hits":
      return "Quick Hits List";
    case "spotlight":
      return "Together With / Sponsor";
    case "poll":
      return "5-Star Reader Poll";
    case "hero":
      return "Legacy Hero";
    case "pastel_card":
      return "Legacy Highlight";
    default:
      return "Block";
  }
}

export function NewsletterBlockEditor({
  block,
  uploadingId,
  onUpdate,
  onUploadImage,
}: NewsletterBlockEditorProps) {
  /* ── HEADING ── */
  if (block.type === "heading") {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={block.level}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "heading"
                  ? { ...b, level: e.target.value as "h1" | "h2" | "h3" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px] font-bold"
          >
            <option value="h1">H1 Large</option>
            <option value="h2">H2 Section</option>
            <option value="h3">H3 Subhead</option>
          </select>
          <select
            value={block.align}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "heading"
                  ? { ...b, align: e.target.value as "left" | "center" | "right" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
          >
            <option value="left">Align Left</option>
            <option value="center">Align Center</option>
            <option value="right">Align Right</option>
          </select>
          <input
            type="text"
            value={block.kicker}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "heading" ? { ...b, kicker: e.target.value } : b
              )
            }
            placeholder="Optional kicker (e.g. PART 1)"
            className="flex-1 rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-1.5 text-[12px] uppercase"
          />
          <label className="inline-flex items-center gap-1.5 text-[11.5px] text-[#6E6D6A]">
            Color
            <input
              type="color"
              value={block.color || "#111827"}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "heading" ? { ...b, color: e.target.value } : b
                )
              }
              className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
            />
          </label>
        </div>
        <input
          type="text"
          value={block.text}
          onChange={(e) =>
            onUpdate((b) => (b.type === "heading" ? { ...b, text: e.target.value } : b))
          }
          placeholder="Heading text..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3.5 py-2.5 text-[15px] font-bold"
        />
      </div>
    );
  }

  /* ── IMAGE ── */
  if (block.type === "image") {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#18181B] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#27272A]">
            {uploadingId === block.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadImage(f, block.id);
                e.target.value = "";
              }}
            />
          </label>
          <select
            value={block.width}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "image"
                  ? { ...b, width: e.target.value as "full" | "medium" | "compact" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-2 text-[12px]"
          >
            <option value="full">Full Width</option>
            <option value="medium">Medium (75%)</option>
            <option value="compact">Compact (50%)</option>
          </select>
          <label className="inline-flex items-center gap-1.5 text-[12px] text-[#52525B]">
            <input
              type="checkbox"
              checked={block.rounded}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "image" ? { ...b, rounded: e.target.checked } : b
                )
              }
            />
            Rounded
          </label>
        </div>
        <input
          type="url"
          value={block.url}
          onChange={(e) =>
            onUpdate((b) => (b.type === "image" ? { ...b, url: e.target.value } : b))
          }
          placeholder="Or paste image URL (https://...)"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={block.caption}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "image" ? { ...b, caption: e.target.value } : b
              )
            }
            placeholder="Caption (e.g. Image source: ...)"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px]"
          />
          <input
            type="url"
            value={block.linkUrl}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "image" ? { ...b, linkUrl: e.target.value } : b
              )
            }
            placeholder="Optional click-through URL"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px]"
          />
        </div>
      </div>
    );
  }

  /* ── BUTTON ── */
  if (block.type === "button") {
    return (
      <div className="space-y-2.5">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={block.label}
            onChange={(e) =>
              onUpdate((b) => (b.type === "button" ? { ...b, label: e.target.value } : b))
            }
            placeholder="Button text (e.g. Try It Free →)"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13px] font-semibold"
          />
          <input
            type="url"
            value={block.url}
            onChange={(e) =>
              onUpdate((b) => (b.type === "button" ? { ...b, url: e.target.value } : b))
            }
            placeholder="https://..."
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={block.align}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "button"
                  ? { ...b, align: e.target.value as "left" | "center" | "right" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <select
            value={block.radius}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "button"
                  ? { ...b, radius: e.target.value as "pill" | "rounded" | "square" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
          >
            <option value="pill">Pill</option>
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
          </select>
          <select
            value={block.size}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "button"
                  ? { ...b, size: e.target.value as "sm" | "md" | "lg" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
          <label className="inline-flex items-center gap-1 text-[11.5px] text-[#6E6D6A]">
            BG
            <input
              type="color"
              value={block.bgColor || "#F04E18"}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "button" ? { ...b, bgColor: e.target.value } : b
                )
              }
              className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
            />
          </label>
          <label className="inline-flex items-center gap-1 text-[11.5px] text-[#6E6D6A]">
            Text
            <input
              type="color"
              value={block.textColor || "#FFFFFF"}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "button" ? { ...b, textColor: e.target.value } : b
                )
              }
              className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
            />
          </label>
        </div>
      </div>
    );
  }

  /* ── CALLOUT BOX ── */
  if (block.type === "callout") {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={block.emoji}
            onChange={(e) =>
              onUpdate((b) => (b.type === "callout" ? { ...b, emoji: e.target.value } : b))
            }
            placeholder="💡"
            className="w-12 rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2 py-1.5 text-center text-[14px]"
          />
          <input
            type="text"
            value={block.title}
            onChange={(e) =>
              onUpdate((b) => (b.type === "callout" ? { ...b, title: e.target.value } : b))
            }
            placeholder="Callout title"
            className="flex-1 rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-1.5 text-[13px] font-bold"
          />
          <select
            value={block.variant}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "callout"
                  ? { ...b, variant: e.target.value as "left-bar" | "boxed" | "subtle" }
                  : b
              )
            }
            className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
          >
            <option value="left-bar">Left Accent Bar</option>
            <option value="boxed">Bordered Box</option>
            <option value="subtle">Subtle Fill</option>
          </select>
          <label className="inline-flex items-center gap-1 text-[11px] text-[#6E6D6A]">
            BG
            <input
              type="color"
              value={block.bgColor || "#FFF8F5"}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "callout" ? { ...b, bgColor: e.target.value } : b
                )
              }
              className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
            />
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] text-[#6E6D6A]">
            Border
            <input
              type="color"
              value={block.borderColor || "#F04E18"}
              onChange={(e) =>
                onUpdate((b) =>
                  b.type === "callout" ? { ...b, borderColor: e.target.value } : b
                )
              }
              className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
            />
          </label>
        </div>
        <textarea
          rows={3}
          value={block.body}
          onChange={(e) =>
            onUpdate((b) => (b.type === "callout" ? { ...b, body: e.target.value } : b))
          }
          placeholder="Write callout content..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[13px]"
        />
      </div>
    );
  }

  /* ── QUOTE ── */
  if (block.type === "quote") {
    return (
      <div className="space-y-2.5">
        <textarea
          rows={2}
          value={block.quote}
          onChange={(e) =>
            onUpdate((b) => (b.type === "quote" ? { ...b, quote: e.target.value } : b))
          }
          placeholder="Quote text..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[13.5px] italic"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={block.author}
            onChange={(e) =>
              onUpdate((b) => (b.type === "quote" ? { ...b, author: e.target.value } : b))
            }
            placeholder="Author name"
            className="flex-1 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px] font-semibold"
          />
          <input
            type="text"
            value={block.role}
            onChange={(e) =>
              onUpdate((b) => (b.type === "quote" ? { ...b, role: e.target.value } : b))
            }
            placeholder="Role / company"
            className="flex-1 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
          <input
            type="color"
            value={block.accentColor || "#F04E18"}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "quote" ? { ...b, accentColor: e.target.value } : b
              )
            }
            className="h-8 w-8 cursor-pointer rounded border border-[#EAE8E3]"
            title="Bar color"
          />
        </div>
      </div>
    );
  }

  /* ── DIVIDER ── */
  if (block.type === "divider") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={block.style}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "divider"
                ? {
                    ...b,
                    style: e.target.value as "solid" | "dashed" | "dotted" | "thick",
                  }
                : b
            )
          }
          className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
        >
          <option value="solid">Solid Line</option>
          <option value="dashed">Dashed Line</option>
          <option value="dotted">Dotted Line</option>
          <option value="thick">Thick Bar</option>
        </select>
        <select
          value={block.spacing}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "divider"
                ? { ...b, spacing: e.target.value as "sm" | "md" | "lg" }
                : b
            )
          }
          className="rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-2.5 py-1.5 text-[12px]"
        >
          <option value="sm">Tight Spacing</option>
          <option value="md">Medium Spacing</option>
          <option value="lg">Wide Spacing</option>
        </select>
        <label className="inline-flex items-center gap-1.5 text-[12px] text-[#6E6D6A]">
          Color
          <input
            type="color"
            value={block.color || "#E5E7EB"}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "divider" ? { ...b, color: e.target.value } : b
              )
            }
            className="h-7 w-7 cursor-pointer rounded border border-[#EAE8E3]"
          />
        </label>
      </div>
    );
  }

  /* ── SPACER ── */
  if (block.type === "spacer") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-medium text-[#6E6D6A]">Height:</span>
        <input
          type="range"
          min={8}
          max={96}
          step={4}
          value={block.height || 24}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "spacer" ? { ...b, height: Number(e.target.value) } : b
            )
          }
          className="flex-1 accent-[#F04E18]"
        />
        <span className="w-12 text-right font-mono text-[12px] font-bold">
          {block.height}px
        </span>
      </div>
    );
  }

  /* ── 2-COLUMN LAYOUT ── */
  if (block.type === "columns") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {(["left", "right"] as const).map((side) => {
          const col = block[side];
          const uploadKey = `${block.id}:${side}`;
          return (
            <div
              key={side}
              className="space-y-2 rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D6A]">
                  {side === "left" ? "Left Column" : "Right Column"}
                </span>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#EAE8E3] bg-white px-2 py-1 text-[11px] font-medium hover:bg-[#F5F4F0]">
                  {uploadingId === uploadKey ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3 w-3" />
                  )}
                  Img
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadImage(f, uploadKey);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={col.heading}
                onChange={(e) =>
                  onUpdate((b) =>
                    b.type === "columns"
                      ? { ...b, [side]: { ...b[side], heading: e.target.value } }
                      : b
                  )
                }
                placeholder="Column heading"
                className="w-full rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-[12.5px] font-bold"
              />
              <textarea
                rows={2}
                value={col.text}
                onChange={(e) =>
                  onUpdate((b) =>
                    b.type === "columns"
                      ? { ...b, [side]: { ...b[side], text: e.target.value } }
                      : b
                  )
                }
                placeholder="Column description..."
                className="w-full rounded-lg border border-[#EAE8E3] bg-white p-2 text-[12px]"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={col.linkLabel}
                  onChange={(e) =>
                    onUpdate((b) =>
                      b.type === "columns"
                        ? { ...b, [side]: { ...b[side], linkLabel: e.target.value } }
                        : b
                    )
                  }
                  placeholder="Link text"
                  className="rounded-lg border border-[#EAE8E3] bg-white px-2 py-1.5 text-[11.5px]"
                />
                <input
                  type="text"
                  value={col.linkUrl}
                  onChange={(e) =>
                    onUpdate((b) =>
                      b.type === "columns"
                        ? { ...b, [side]: { ...b[side], linkUrl: e.target.value } }
                        : b
                    )
                  }
                  placeholder="URL"
                  className="rounded-lg border border-[#EAE8E3] bg-white px-2 py-1.5 text-[11.5px]"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── EMBED / BOOKMARK CARD ── */
  if (block.type === "embed_card") {
    return (
      <div className="space-y-2.5">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="url"
            value={block.url}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "embed_card" ? { ...b, url: e.target.value } : b
              )
            }
            placeholder="Link URL (https://...)"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
          <input
            type="text"
            value={block.domain}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "embed_card" ? { ...b, domain: e.target.value } : b
              )
            }
            placeholder="Source domain (e.g. github.com)"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
        </div>
        <input
          type="text"
          value={block.title}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "embed_card" ? { ...b, title: e.target.value } : b
            )
          }
          placeholder="Card title"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-bold"
        />
        <textarea
          rows={2}
          value={block.description}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "embed_card" ? { ...b, description: e.target.value } : b
            )
          }
          placeholder="Short description..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-2.5 text-[12.5px]"
        />
      </div>
    );
  }

  /* ── CODE SNIPPET ── */
  if (block.type === "code") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={block.language}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "code" ? { ...b, language: e.target.value } : b
            )
          }
          placeholder="Language (e.g. typescript, bash, sql)"
          className="w-44 rounded-lg border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-1.5 font-mono text-[12px]"
        />
        <textarea
          rows={4}
          value={block.code}
          onChange={(e) =>
            onUpdate((b) => (b.type === "code" ? { ...b, code: e.target.value } : b))
          }
          placeholder="// Paste your code here..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#0F172A] p-3 font-mono text-[12.5px] text-[#F8FAFC]"
        />
      </div>
    );
  }

  /* ── INTRO & TOC ── */
  if (block.type === "intro") {
    return (
      <div className="space-y-2.5">
        <input
          type="text"
          value={block.greeting}
          onChange={(e) =>
            onUpdate((b) => (b.type === "intro" ? { ...b, greeting: e.target.value } : b))
          }
          placeholder="Greeting (e.g. Good morning, builders.)"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-semibold"
        />
        <textarea
          rows={2}
          value={block.lead}
          onChange={(e) =>
            onUpdate((b) => (b.type === "intro" ? { ...b, lead: e.target.value } : b))
          }
          placeholder="Opening hook..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[13px]"
        />
        <input
          type="text"
          value={block.tocHeading}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "intro" ? { ...b, tocHeading: e.target.value } : b
            )
          }
          placeholder="In today's SaaS Vibes:"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px] font-semibold"
        />
        <textarea
          rows={3}
          value={(block.tocItems || []).join("\n")}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "intro" ? { ...b, tocItems: e.target.value.split("\n") } : b
            )
          }
          placeholder="One bullet per line..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[12.5px]"
        />
      </div>
    );
  }

  /* ── STORY (RUNDOWN / MORNING BREW) ── */
  if (block.type === "story") {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={block.kicker}
            onChange={(e) =>
              onUpdate((b) => (b.type === "story" ? { ...b, kicker: e.target.value } : b))
            }
            placeholder="KICKER (e.g. DEEP DIVE, AI)"
            className="flex-1 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px] font-bold uppercase text-[#F04E18]"
          />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3 py-2 text-[12px] font-medium hover:bg-[#F5F4F0]">
            {uploadingId === block.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            Story Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadImage(f, block.id);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <input
          type="text"
          value={block.headline}
          onChange={(e) =>
            onUpdate((b) => (b.type === "story" ? { ...b, headline: e.target.value } : b))
          }
          placeholder="Bold Story Headline"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[14px] font-bold"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="url"
            value={block.imageUrl}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "story" ? { ...b, imageUrl: e.target.value } : b
              )
            }
            placeholder="Image URL (optional)"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px]"
          />
          <input
            type="text"
            value={block.imageCaption}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "story" ? { ...b, imageCaption: e.target.value } : b
              )
            }
            placeholder="Image caption"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px]"
          />
        </div>
        <textarea
          rows={2}
          value={block.rundown}
          onChange={(e) =>
            onUpdate((b) => (b.type === "story" ? { ...b, rundown: e.target.value } : b))
          }
          placeholder="The Rundown: punchy 2-sentence lead..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[13px]"
        />
        <textarea
          rows={3}
          value={(block.details || []).join("\n")}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "story" ? { ...b, details: e.target.value.split("\n") } : b
            )
          }
          placeholder="The Details (one bullet per line)..."
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[12.5px]"
        />
        <textarea
          rows={2}
          value={block.whyItMatters}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "story" ? { ...b, whyItMatters: e.target.value } : b
            )
          }
          placeholder="Why it matters: your sharp takeaway..."
          className="w-full rounded-xl border border-[#F04E18]/25 bg-[#FFF8F5] p-3 text-[13px]"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={block.ctaLabel}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "story" ? { ...b, ctaLabel: e.target.value } : b
              )
            }
            placeholder="Optional link label"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
          <input
            type="text"
            value={block.ctaUrl}
            onChange={(e) =>
              onUpdate((b) => (b.type === "story" ? { ...b, ctaUrl: e.target.value } : b))
            }
            placeholder="Link URL"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
        </div>
      </div>
    );
  }

  /* ── QUICK HITS ── */
  if (block.type === "quick_hits") {
    return (
      <div className="space-y-2.5">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={block.kicker}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "quick_hits" ? { ...b, kicker: e.target.value } : b
              )
            }
            placeholder="QUICK HITS"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px] font-bold uppercase text-[#F04E18]"
          />
          <input
            type="text"
            value={block.heading}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "quick_hits" ? { ...b, heading: e.target.value } : b
              )
            }
            placeholder="Section heading"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-bold sm:col-span-2"
          />
        </div>
        <div className="space-y-2">
          {(block.items || []).map((item, itemIdx) => (
            <div
              key={itemIdx}
              className="space-y-1.5 rounded-xl border border-[#EAE8E3] bg-[#FAF9F6] p-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    onUpdate((b) => {
                      if (b.type !== "quick_hits") return b;
                      const next = [...b.items];
                      next[itemIdx] = { ...next[itemIdx], title: e.target.value };
                      return { ...b, items: next };
                    })
                  }
                  placeholder="Bold title"
                  className="flex-1 rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-[12.5px] font-semibold"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) =>
                    onUpdate((b) => {
                      if (b.type !== "quick_hits") return b;
                      const next = [...b.items];
                      next[itemIdx] = { ...next[itemIdx], url: e.target.value };
                      return { ...b, items: next };
                    })
                  }
                  placeholder="https://..."
                  className="w-36 rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-[12px]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdate((b) =>
                      b.type === "quick_hits"
                        ? { ...b, items: b.items.filter((_, idx) => idx !== itemIdx) }
                        : b
                    )
                  }
                  className="rounded-lg p-1 text-[#8C8B87] hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  onUpdate((b) => {
                    if (b.type !== "quick_hits") return b;
                    const next = [...b.items];
                    next[itemIdx] = { ...next[itemIdx], description: e.target.value };
                    return { ...b, items: next };
                  })
                }
                placeholder="1-sentence description..."
                className="w-full rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-[12px]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdate((b) =>
                b.type === "quick_hits"
                  ? { ...b, items: [...b.items, { title: "", description: "", url: "" }] }
                  : b
              )
            }
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#D4D4D8] px-3 py-1.5 text-[12px] font-semibold text-[#52525B] hover:border-[#18181B]"
          >
            <Plus className="h-3.5 w-3.5" /> Add Quick Hit
          </button>
        </div>
      </div>
    );
  }

  /* ── RICHTEXT (TIPTAP) ── */
  if (block.type === "richtext") {
    return (
      <div className="space-y-2.5">
        <input
          type="text"
          value={block.heading}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "richtext" ? { ...b, heading: e.target.value } : b
            )
          }
          placeholder="Optional section heading"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-semibold"
        />
        <TipTapEditor
          value={block.html}
          onChange={(html) =>
            onUpdate((b) => (b.type === "richtext" ? { ...b, html } : b))
          }
        />
      </div>
    );
  }

  /* ── SPOTLIGHT / TOGETHER WITH ── */
  if (block.type === "spotlight") {
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={block.badge}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "spotlight" ? { ...b, badge: e.target.value } : b
              )
            }
            placeholder="TOGETHER WITH"
            className="w-40 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12px] font-bold uppercase"
          />
          <input
            type="text"
            value={block.dateLabel}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "spotlight" ? { ...b, dateLabel: e.target.value } : b
              )
            }
            placeholder="Tag / subtitle"
            className="flex-1 rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3 py-2 text-[12px] font-medium hover:bg-[#F5F4F0]">
            {uploadingId === block.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadImage(f, block.id);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <input
          type="text"
          value={block.title}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "spotlight" ? { ...b, title: e.target.value } : b
            )
          }
          placeholder="Sponsor / Featured Title"
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-bold"
        />
        <textarea
          rows={2}
          value={block.description}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "spotlight" ? { ...b, description: e.target.value } : b
            )
          }
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-3 text-[13px]"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={block.ctaLabel}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "spotlight" ? { ...b, ctaLabel: e.target.value } : b
              )
            }
            placeholder="CTA Label"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
          <input
            type="text"
            value={block.ctaUrl}
            onChange={(e) =>
              onUpdate((b) =>
                b.type === "spotlight" ? { ...b, ctaUrl: e.target.value } : b
              )
            }
            placeholder="CTA URL"
            className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
          />
        </div>
      </div>
    );
  }

  /* ── POLL ── */
  if (block.type === "poll") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={block.question}
          onChange={(e) =>
            onUpdate((b) => (b.type === "poll" ? { ...b, question: e.target.value } : b))
          }
          placeholder="Poll Question"
          className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13px] font-semibold"
        />
        <input
          type="text"
          value={block.sublabel}
          onChange={(e) =>
            onUpdate((b) => (b.type === "poll" ? { ...b, sublabel: e.target.value } : b))
          }
          placeholder="Helper text"
          className="rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[12.5px]"
        />
      </div>
    );
  }

  /* ── LEGACY HERO / PASTEL_CARD ── */
  if (block.type === "hero") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={block.title}
          onChange={(e) =>
            onUpdate((b) => (b.type === "hero" ? { ...b, title: e.target.value } : b))
          }
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-bold"
        />
        <textarea
          rows={2}
          value={block.subtitle}
          onChange={(e) =>
            onUpdate((b) => (b.type === "hero" ? { ...b, subtitle: e.target.value } : b))
          }
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-2.5 text-[13px]"
        />
      </div>
    );
  }

  if (block.type === "pastel_card") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={block.highlightStat}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "pastel_card" ? { ...b, highlightStat: e.target.value } : b
            )
          }
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] px-3 py-2 text-[13.5px] font-bold"
        />
        <textarea
          rows={2}
          value={block.description}
          onChange={(e) =>
            onUpdate((b) =>
              b.type === "pastel_card" ? { ...b, description: e.target.value } : b
            )
          }
          className="w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] p-2.5 text-[13px]"
        />
      </div>
    );
  }

  return null;
}
