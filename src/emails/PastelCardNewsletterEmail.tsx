import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import {
  extractDesign,
  getContentBlocks,
  getFontStack,
  type RelatedIssueItem,
  type TemplateBlock,
} from "@/lib/newsletter-blocks";

interface PastelCardNewsletterEmailProps {
  publicationName: string;
  postId: string;
  postSlug: string;
  title: string;
  previewText: string;
  blocks: TemplateBlock[];
  relatedPosts?: RelatedIssueItem[];
  fallbackMarkdown?: string;
  siteUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Full Beehiiv + MailCheap Editorial Email Template.
 * Renders all 16 scratch + editorial blocks respecting custom NewsletterDesign settings.
 */
export function PastelCardNewsletterEmail({
  publicationName,
  postId,
  postSlug,
  title,
  previewText,
  blocks,
  relatedPosts = [],
  fallbackMarkdown,
  siteUrl,
  unsubscribeUrl,
}: PastelCardNewsletterEmailProps) {
  const safeBase = siteUrl.replace(/\/$/, "");
  const webUrl = `${safeBase}/newsletter/${postSlug}`;
  const design = extractDesign(blocks);
  const contentBlocks = getContentBlocks(blocks);

  const accent = design.accentColor || "#F04E18";
  const ink = design.textColor || "#111827";
  const muted = design.mutedColor || "#6B7280";
  const pageBg = design.pageBg || "#FFFFFF";
  const surfaceBg = design.surfaceBg || "#FFFFFF";
  const fontStack = getFontStack(design.fontFamily);
  const maxWidth = design.contentWidth === "760px" ? "640px" : "600px";

  const resolveUrl = (url: string) => {
    if (!url) return webUrl;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${safeBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText || title}</Preview>
      <Body
        style={{
          backgroundColor: pageBg,
          fontFamily: fontStack,
          padding: "24px 12px",
          margin: 0,
          color: ink,
        }}
      >
        <Container
          style={{
            maxWidth,
            margin: "0 auto",
            backgroundColor: surfaceBg,
            padding: pageBg !== surfaceBg ? "28px 24px" : "8px 12px",
            borderRadius: pageBg !== surfaceBg ? "14px" : "0px",
          }}
        >
          {/* Editorial Masthead */}
          <Section style={{ padding: "4px 0 12px", textAlign: "center" }}>
            <Text
              style={{
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: ink,
                margin: "0 0 4px",
              }}
            >
              {publicationName.toUpperCase()}
            </Text>
            {design.issueLabel ? (
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: accent,
                  margin: "0 0 4px",
                }}
              >
                {design.issueLabel}
              </Text>
            ) : null}
            <Link
              href={webUrl}
              style={{ color: muted, fontSize: "12px", textDecoration: "underline" }}
            >
              Read online →
            </Link>
          </Section>

          <Hr style={{ borderColor: ink, borderTopWidth: "2px", margin: "0" }} />

          {/* Issue Headline */}
          <Section
            style={{
              padding: "20px 0 8px",
              textAlign: design.headerStyle === "centered" ? "center" : "left",
            }}
          >
            <Heading
              as="h1"
              style={{
                fontSize: "28px",
                lineHeight: "1.2",
                fontWeight: 800,
                color: ink,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Heading>
          </Section>

          {/* Content Blocks */}
          {contentBlocks.length > 0 ? (
            contentBlocks.map((block) => {
              /* HEADING */
              if (block.type === "heading") {
                const fontSize =
                  block.level === "h1"
                    ? "26px"
                    : block.level === "h3"
                    ? "18px"
                    : "22px";
                return (
                  <Section
                    key={block.id}
                    style={{ padding: "12px 0 6px", textAlign: block.align || "left" }}
                  >
                    {block.kicker ? (
                      <Text style={{ ...kickerBase, color: accent }}>{block.kicker}</Text>
                    ) : null}
                    <Heading
                      as={block.level}
                      style={{
                        fontSize,
                        lineHeight: "1.25",
                        fontWeight: 800,
                        color: block.color || ink,
                        margin: 0,
                      }}
                    >
                      {block.text}
                    </Heading>
                  </Section>
                );
              }

              /* IMAGE */
              if (block.type === "image") {
                if (!block.url) return null;
                const imgWidth =
                  block.width === "compact"
                    ? "320"
                    : block.width === "medium"
                    ? "460"
                    : "560";
                const imgNode = (
                  <Img
                    src={block.url}
                    alt={block.alt || block.caption || "Image"}
                    width={imgWidth}
                    style={{
                      width: "100%",
                      maxWidth: `${imgWidth}px`,
                      margin: "0 auto",
                      borderRadius: block.rounded ? "10px" : "0px",
                      display: "block",
                    }}
                  />
                );
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    {block.linkUrl ? (
                      <Link href={resolveUrl(block.linkUrl)}>{imgNode}</Link>
                    ) : (
                      imgNode
                    )}
                    {block.caption ? (
                      <Text
                        style={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          color: muted,
                          textAlign: "center",
                          margin: "6px 0 0",
                        }}
                      >
                        {block.caption}
                      </Text>
                    ) : null}
                  </Section>
                );
              }

              /* BUTTON (MailCheap bulletproof button style) */
              if (block.type === "button") {
                const borderRadius =
                  block.radius === "pill"
                    ? "999px"
                    : block.radius === "square"
                    ? "0px"
                    : "8px";
                const padding =
                  block.size === "sm"
                    ? "8px 16px"
                    : block.size === "lg"
                    ? "14px 28px"
                    : "11px 22px";
                return (
                  <Section
                    key={block.id}
                    style={{ padding: "12px 0", textAlign: block.align || "center" }}
                  >
                    <Button
                      href={resolveUrl(block.url)}
                      style={{
                        backgroundColor: block.bgColor || accent,
                        color: block.textColor || "#FFFFFF",
                        fontSize: block.size === "lg" ? "15.5px" : "14px",
                        fontWeight: 700,
                        padding,
                        borderRadius,
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      {block.label || "Click Here"}
                    </Button>
                  </Section>
                );
              }

              /* CALLOUT */
              if (block.type === "callout") {
                const boxStyle: React.CSSProperties =
                  block.variant === "left-bar"
                    ? {
                        backgroundColor: block.bgColor || "#FFF8F5",
                        borderLeft: `4px solid ${block.borderColor || accent}`,
                        padding: "14px 16px",
                        borderRadius: "0 8px 8px 0",
                      }
                    : block.variant === "boxed"
                    ? {
                        backgroundColor: block.bgColor || "#F9FAFB",
                        border: `1px solid ${block.borderColor || "#E5E7EB"}`,
                        padding: "14px 16px",
                        borderRadius: "10px",
                      }
                    : {
                        backgroundColor: block.bgColor || "#F4F4F5",
                        padding: "14px 16px",
                        borderRadius: "10px",
                      };
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    <Section style={boxStyle}>
                      {block.emoji || block.title ? (
                        <Text
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: ink,
                            margin: "0 0 6px",
                          }}
                        >
                          {block.emoji ? `${block.emoji} ` : ""}
                          {block.title}
                        </Text>
                      ) : null}
                      <Text
                        style={{
                          fontSize: "14.5px",
                          lineHeight: "1.65",
                          color: ink,
                          margin: 0,
                        }}
                      >
                        {block.body}
                      </Text>
                    </Section>
                  </Section>
                );
              }

              /* QUOTE */
              if (block.type === "quote") {
                return (
                  <Section key={block.id} style={{ padding: "12px 0" }}>
                    <Section
                      style={{
                        borderLeft: `4px solid ${block.accentColor || accent}`,
                        paddingLeft: "16px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "17px",
                          fontStyle: "italic",
                          fontWeight: 600,
                          lineHeight: "1.55",
                          color: ink,
                          margin: "0 0 6px",
                        }}
                      >
                        &ldquo;{block.quote}&rdquo;
                      </Text>
                      {block.author ? (
                        <Text style={{ fontSize: "13px", color: muted, margin: 0 }}>
                          — <strong>{block.author}</strong>
                          {block.role ? `, ${block.role}` : ""}
                        </Text>
                      ) : null}
                    </Section>
                  </Section>
                );
              }

              /* DIVIDER */
              if (block.type === "divider") {
                const margin =
                  block.spacing === "sm"
                    ? "8px 0"
                    : block.spacing === "lg"
                    ? "28px 0"
                    : "16px 0";
                return (
                  <Hr
                    key={block.id}
                    style={{
                      borderTopWidth: block.style === "thick" ? "3px" : "1px",
                      borderTopStyle:
                        block.style === "dashed"
                          ? "dashed"
                          : block.style === "dotted"
                          ? "dotted"
                          : "solid",
                      borderColor: block.color || "#E5E7EB",
                      margin,
                    }}
                  />
                );
              }

              /* SPACER */
              if (block.type === "spacer") {
                return (
                  <Section key={block.id} style={{ height: `${block.height || 24}px` }} />
                );
              }

              /* 2-COLUMN LAYOUT */
              if (block.type === "columns") {
                return (
                  <Section key={block.id} style={{ padding: "12px 0" }}>
                    <Row>
                      {[block.left, block.right].map((col, idx) => (
                        <Column
                          key={idx}
                          style={{
                            width: "50%",
                            verticalAlign: "top",
                            paddingRight: idx === 0 ? "8px" : "0px",
                            paddingLeft: idx === 1 ? "8px" : "0px",
                          }}
                        >
                          <Section
                            style={{
                              border: "1px solid #E5E7EB",
                              borderRadius: "10px",
                              padding: "14px",
                            }}
                          >
                            {col.imageUrl ? (
                              <Img
                                src={col.imageUrl}
                                alt={col.heading}
                                width="240"
                                style={{
                                  width: "100%",
                                  borderRadius: "6px",
                                  marginBottom: "8px",
                                }}
                              />
                            ) : null}
                            {col.heading ? (
                              <Text
                                style={{
                                  fontSize: "15.5px",
                                  fontWeight: 700,
                                  color: ink,
                                  margin: "0 0 6px",
                                }}
                              >
                                {col.heading}
                              </Text>
                            ) : null}
                            {col.text ? (
                              <Text
                                style={{
                                  fontSize: "13.5px",
                                  lineHeight: "1.55",
                                  color: muted,
                                  margin: "0 0 8px",
                                }}
                              >
                                {col.text}
                              </Text>
                            ) : null}
                            {col.linkLabel ? (
                              <Link
                                href={resolveUrl(col.linkUrl)}
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: accent,
                                  textDecoration: "underline",
                                }}
                              >
                                {col.linkLabel}
                              </Link>
                            ) : null}
                          </Section>
                        </Column>
                      ))}
                    </Row>
                  </Section>
                );
              }

              /* EMBED / BOOKMARK CARD */
              if (block.type === "embed_card") {
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    <Section
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "11px",
                          color: muted,
                          textTransform: "uppercase",
                          margin: "0 0 4px",
                        }}
                      >
                        {block.domain || "LINK"}
                      </Text>
                      <Link
                        href={resolveUrl(block.url)}
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: ink,
                          textDecoration: "underline",
                        }}
                      >
                        {block.title}
                      </Link>
                      {block.description ? (
                        <Text
                          style={{
                            fontSize: "13.5px",
                            lineHeight: "1.55",
                            color: muted,
                            margin: "6px 0 0",
                          }}
                        >
                          {block.description}
                        </Text>
                      ) : null}
                    </Section>
                  </Section>
                );
              }

              /* CODE SNIPPET */
              if (block.type === "code") {
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    <Section
                      style={{
                        backgroundColor: "#0F172A",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12.5px",
                          lineHeight: "1.55",
                          color: "#F8FAFC",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {block.code}
                      </Text>
                    </Section>
                  </Section>
                );
              }

              /* INTRO */
              if (block.type === "intro") {
                const validToc = (block.tocItems || []).filter((i) => i.trim());
                return (
                  <Section key={block.id} style={{ padding: "8px 0 14px" }}>
                    {block.greeting ? (
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: ink,
                          margin: "0 0 8px",
                        }}
                      >
                        {block.greeting}
                      </Text>
                    ) : null}
                    {block.lead ? (
                      <Text style={{ ...bodyCopyBase, color: ink }}>{block.lead}</Text>
                    ) : null}
                    {validToc.length > 0 ? (
                      <Section
                        style={{
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          marginTop: "12px",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: ink,
                            margin: "0 0 8px",
                          }}
                        >
                          {(block.tocHeading || "In today's issue:").toUpperCase()}
                        </Text>
                        {validToc.map((item, i) => (
                          <Text
                            key={i}
                            style={{
                              fontSize: "14.5px",
                              lineHeight: "1.55",
                              color: ink,
                              margin: "0 0 6px",
                            }}
                          >
                            • {item}
                          </Text>
                        ))}
                      </Section>
                    ) : null}
                  </Section>
                );
              }

              /* STORY */
              if (block.type === "story") {
                const validDetails = (block.details || []).filter((d) => d.trim());
                return (
                  <Section key={block.id} style={{ padding: "10px 0 14px" }}>
                    {block.kicker ? (
                      <Text style={{ ...kickerBase, color: accent }}>{block.kicker}</Text>
                    ) : null}
                    <Heading
                      as="h2"
                      style={{
                        fontSize: "22px",
                        lineHeight: "1.25",
                        fontWeight: 800,
                        color: ink,
                        margin: "0 0 10px",
                      }}
                    >
                      {block.headline}
                    </Heading>
                    {block.imageUrl ? (
                      <>
                        <Img
                          src={block.imageUrl}
                          alt={block.headline}
                          width="560"
                          style={{ width: "100%", borderRadius: "10px", display: "block" }}
                        />
                        {block.imageCaption ? (
                          <Text
                            style={{
                              fontSize: "12px",
                              fontStyle: "italic",
                              color: muted,
                              textAlign: "center",
                              margin: "6px 0 12px",
                            }}
                          >
                            {block.imageCaption}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                    {block.rundown ? (
                      <Text style={{ ...bodyCopyBase, color: ink }}>
                        <strong>The Rundown: </strong>
                        {block.rundown}
                      </Text>
                    ) : null}
                    {validDetails.length > 0 ? (
                      <Section style={{ marginTop: "6px", marginBottom: "8px" }}>
                        <Text
                          style={{
                            fontSize: "15.5px",
                            fontWeight: 700,
                            color: ink,
                            margin: "0 0 6px",
                          }}
                        >
                          The details:
                        </Text>
                        {validDetails.map((d, i) => (
                          <Text
                            key={i}
                            style={{
                              fontSize: "15px",
                              lineHeight: "1.65",
                              color: ink,
                              margin: "0 0 6px",
                              paddingLeft: "6px",
                            }}
                          >
                            • {d}
                          </Text>
                        ))}
                      </Section>
                    ) : null}
                    {block.whyItMatters ? (
                      <Section
                        style={{
                          backgroundColor: "#FFF8F5",
                          borderLeft: `3px solid ${accent}`,
                          padding: "12px 14px",
                          borderRadius: "0 8px 8px 0",
                          margin: "12px 0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: "15px",
                            lineHeight: "1.65",
                            color: ink,
                            margin: 0,
                          }}
                        >
                          <strong>Why it matters: </strong>
                          {block.whyItMatters}
                        </Text>
                      </Section>
                    ) : null}
                    {block.ctaLabel ? (
                      <Link
                        href={resolveUrl(block.ctaUrl)}
                        style={{
                          color: accent,
                          fontSize: "14.5px",
                          fontWeight: 700,
                          textDecoration: "underline",
                        }}
                      >
                        {block.ctaLabel}
                      </Link>
                    ) : null}
                  </Section>
                );
              }

              /* QUICK HITS */
              if (block.type === "quick_hits") {
                const validItems = (block.items || []).filter(
                  (i) => i.title.trim() || i.description.trim()
                );
                return (
                  <Section key={block.id} style={{ padding: "10px 0 14px" }}>
                    {block.kicker ? (
                      <Text style={{ ...kickerBase, color: accent }}>{block.kicker}</Text>
                    ) : null}
                    <Heading
                      as="h2"
                      style={{
                        fontSize: "21px",
                        fontWeight: 800,
                        color: ink,
                        margin: "0 0 10px",
                      }}
                    >
                      {block.heading || "Quick Hits"}
                    </Heading>
                    {validItems.map((item, i) => (
                      <Text
                        key={i}
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.65",
                          color: ink,
                          margin: "0 0 8px",
                        }}
                      >
                        •{" "}
                        {item.url ? (
                          <Link
                            href={resolveUrl(item.url)}
                            style={{ color: ink, fontWeight: 700, textDecoration: "underline" }}
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <strong>{item.title}</strong>
                        )}
                        {item.description ? ` — ${item.description}` : ""}
                      </Text>
                    ))}
                  </Section>
                );
              }

              /* RICHTEXT */
              if (block.type === "richtext") {
                const plainText = block.html
                  .replace(/<\/p>/gi, "\n\n")
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<li>/gi, "• ")
                  .replace(/<\/li>/gi, "\n")
                  .replace(/<[^>]+>/g, "")
                  .trim();
                return (
                  <Section key={block.id} style={{ padding: "8px 0 12px" }}>
                    {block.heading ? (
                      <Heading
                        as="h2"
                        style={{
                          fontSize: "21px",
                          fontWeight: 800,
                          color: ink,
                          margin: "0 0 10px",
                        }}
                      >
                        {block.heading}
                      </Heading>
                    ) : null}
                    {plainText.split(/\n\n+/).map((para, i) => (
                      <Text key={i} style={{ ...bodyCopyBase, color: ink }}>
                        {para}
                      </Text>
                    ))}
                  </Section>
                );
              }

              /* SPOTLIGHT */
              if (block.type === "spotlight") {
                return (
                  <Section key={block.id} style={{ padding: "10px 0 14px" }}>
                    <Section
                      style={{
                        backgroundColor: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: "10px",
                        padding: "18px 20px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          color: muted,
                          margin: "0 0 8px",
                        }}
                      >
                        {(block.badge || "TOGETHER WITH").toUpperCase()}
                      </Text>
                      <Heading
                        as="h3"
                        style={{
                          fontSize: "19px",
                          fontWeight: 800,
                          color: ink,
                          margin: "0 0 10px",
                        }}
                      >
                        {block.title}
                      </Heading>
                      {block.imageUrl ? (
                        <Img
                          src={block.imageUrl}
                          alt={block.title}
                          width="516"
                          style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
                        />
                      ) : null}
                      <Text style={{ ...bodyCopyBase, color: ink }}>{block.description}</Text>
                      {block.ctaLabel ? (
                        <Button
                          href={resolveUrl(block.ctaUrl)}
                          style={{
                            backgroundColor: accent,
                            color: "#FFFFFF",
                            fontSize: "13.5px",
                            fontWeight: 700,
                            padding: "11px 20px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          {block.ctaLabel}
                        </Button>
                      ) : null}
                    </Section>
                  </Section>
                );
              }

              /* POLL */
              if (block.type === "poll") {
                return (
                  <Section
                    key={block.id}
                    style={{ padding: "14px 0", textAlign: "center" }}
                  >
                    <Text style={{ ...kickerBase, color: accent }}>READER FEEDBACK</Text>
                    <Heading
                      as="h3"
                      style={{ fontSize: "18px", fontWeight: 800, color: ink, margin: "4px 0" }}
                    >
                      {block.question}
                    </Heading>
                    <Text style={{ fontSize: "13.5px", color: muted, margin: 0 }}>
                      {block.sublabel}
                    </Text>
                    <Section style={{ textAlign: "center", marginTop: "14px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Link
                          key={star}
                          href={`${safeBase}/api/poll?postId=${encodeURIComponent(postId)}&slug=${encodeURIComponent(postSlug)}&rating=${star}`}
                          style={{
                            display: "inline-block",
                            backgroundColor: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            color: accent,
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "6px 10px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            margin: "0 3px 6px",
                          }}
                        >
                          {"★".repeat(star)}
                        </Link>
                      ))}
                    </Section>
                  </Section>
                );
              }

              /* LEGACY HERO / PASTEL_CARD */
              if (block.type === "hero") {
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    <Text style={{ ...kickerBase, color: accent }}>{block.eyebrow}</Text>
                    <Heading as="h2" style={{ fontSize: "22px", fontWeight: 800, color: ink }}>
                      {block.title}
                    </Heading>
                    {block.imageUrl ? (
                      <Img
                        src={block.imageUrl}
                        alt={block.title}
                        width="560"
                        style={{ width: "100%", borderRadius: "10px" }}
                      />
                    ) : null}
                    <Text style={{ ...bodyCopyBase, color: ink }}>{block.subtitle}</Text>
                  </Section>
                );
              }

              if (block.type === "pastel_card") {
                return (
                  <Section key={block.id} style={{ padding: "10px 0" }}>
                    <Text style={{ ...kickerBase, color: accent }}>{block.label}</Text>
                    <Heading as="h2" style={{ fontSize: "21px", fontWeight: 800, color: ink }}>
                      {block.highlightStat}
                    </Heading>
                    <Text style={{ ...bodyCopyBase, color: ink }}>{block.description}</Text>
                  </Section>
                );
              }

              return null;
            })
          ) : (
            <Section style={{ padding: "10px 0" }}>
              <Text style={{ ...bodyCopyBase, color: ink }}>{fallbackMarkdown}</Text>
            </Section>
          )}

          {/* Marc Lou–Style "Keep reading · All issues →" Section in Email */}
          {design.showKeepReading && relatedPosts.length > 0 && (
            <>
              <Hr style={{ borderColor: "#E5E7EB", margin: "24px 0 18px" }} />
              <Section style={{ padding: "0 0 8px" }}>
                <Row>
                  <Column style={{ textAlign: "left" }}>
                    <Text
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: ink,
                        margin: "0 0 12px",
                      }}
                    >
                      Keep reading
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Link
                      href={`${safeBase}/newsletter`}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: muted,
                        textDecoration: "none",
                      }}
                    >
                      All issues →
                    </Link>
                  </Column>
                </Row>

                {relatedPosts.slice(0, 3).map((item) => (
                  <Section
                    key={item.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      marginBottom: "10px",
                    }}
                  >
                    <Row>
                      {item.thumbnail_url ? (
                        <Column style={{ width: "110px", verticalAlign: "top", paddingRight: "12px" }}>
                          <Link href={`${safeBase}/newsletter/${item.slug}`}>
                            <Img
                              src={item.thumbnail_url}
                              alt={item.title}
                              width="104"
                              style={{
                                width: "104px",
                                height: "66px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                display: "block",
                              }}
                            />
                          </Link>
                        </Column>
                      ) : null}
                      <Column style={{ verticalAlign: "top" }}>
                        <Link
                          href={`${safeBase}/newsletter/${item.slug}`}
                          style={{
                            fontSize: "14.5px",
                            fontWeight: 700,
                            color: ink,
                            textDecoration: "none",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {item.title}
                        </Link>
                        {item.subtitle || item.excerpt ? (
                          <Text
                            style={{
                              fontSize: "12.5px",
                              lineHeight: "1.45",
                              color: muted,
                              margin: 0,
                            }}
                          >
                            {(item.subtitle || item.excerpt || "").slice(0, 110)}
                          </Text>
                        ) : null}
                      </Column>
                    </Row>
                  </Section>
                ))}
              </Section>
            </>
          )}

          <Hr style={{ borderColor: "#E5E7EB", margin: "20px 0 16px" }} />
          <Section style={{ textAlign: "center", padding: "4px 0 18px" }}>
            <Text style={{ fontSize: "12.5px", color: muted, margin: "0 0 8px" }}>
              Written by <strong>Ankur Fulzele</strong> · <strong>{publicationName}</strong>
            </Text>
            <Text style={{ fontSize: "12px", color: muted, margin: "0 0 12px" }}>
              <Link href={webUrl} style={{ color: ink, textDecoration: "underline" }}>
                Read on web
              </Link>{" "}
              ·{" "}
              <Link
                href={`${safeBase}/newsletter`}
                style={{ color: ink, textDecoration: "underline" }}
              >
                Browse archive
              </Link>{" "}
              ·{" "}
              <Link
                href={`${safeBase}/privacy`}
                style={{ color: muted, textDecoration: "underline" }}
              >
                Privacy Policy
              </Link>{" "}
              ·{" "}
              <Link
                href={`${safeBase}/terms`}
                style={{ color: muted, textDecoration: "underline" }}
              >
                Terms
              </Link>
            </Text>
            <Link
              href={unsubscribeUrl || `${safeBase}/unsubscribe`}
              style={{
                display: "inline-block",
                border: "1px solid #D1D5DB",
                backgroundColor: "#F9FAFB",
                color: "#374151",
                fontSize: "11.5px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "999px",
                textDecoration: "none",
              }}
            >
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const kickerBase: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: "0 0 6px",
};

const bodyCopyBase: React.CSSProperties = {
  fontSize: "15.5px",
  lineHeight: "1.7",
  margin: "0 0 12px",
};
