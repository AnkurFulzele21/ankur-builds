export interface WelcomeEmailConfig {
  enabled: boolean;
  subject: string;
  greeting: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export const DEFAULT_WELCOME_EMAIL: WelcomeEmailConfig = {
  enabled: true,
  subject: "Welcome to SaaS Vibes — glad you're here 🚀",
  greeting: "Hey {{name}}, welcome to SaaS Vibes!",
  body: `You're officially in. Every week I send two zero-fluff issues straight from the lab:

• Weekday Brief — Deep-dive stories on how solo founders vibe-code, market, and scale micro-SaaS to millions.
• Weekend Brief — 5 scannable cards: Trending in SaaS, SaaS of the Week, Vibe Toolkit, Skills & Repos, and a Monday Distribution Play.

Quick favor: hit reply and tell me what you're building right now. I read every single email — and replying tells Gmail to keep SaaS Vibes in your Primary inbox.`,
  ctaLabel: "Read Latest Issues →",
  ctaUrl: "/newsletter",
};

/**
 * Parse a WelcomeEmailConfig stored inside `site_settings` row `id = 'welcome_email'`.
 * Uses existing columns so zero Supabase schema migration is required.
 */
export function parseWelcomeRow(row: Record<string, unknown> | null | undefined): WelcomeEmailConfig {
  if (!row) return DEFAULT_WELCOME_EMAIL;
  return {
    enabled: String(row.publication_name ?? "true") !== "false",
    subject: String(row.publication_tagline || DEFAULT_WELCOME_EMAIL.subject),
    greeting: String(row.owner_name || DEFAULT_WELCOME_EMAIL.greeting),
    body: String(row.bio || DEFAULT_WELCOME_EMAIL.body),
    ctaLabel: String(row.owner_handle || DEFAULT_WELCOME_EMAIL.ctaLabel),
    ctaUrl: String(row.twitter_url || DEFAULT_WELCOME_EMAIL.ctaUrl),
  };
}

export function serializeWelcomeRow(config: WelcomeEmailConfig) {
  return {
    id: "welcome_email",
    publication_name: config.enabled ? "true" : "false",
    publication_tagline: config.subject,
    owner_name: config.greeting,
    bio: config.body,
    owner_handle: config.ctaLabel,
    twitter_url: config.ctaUrl,
    location: "welcome-sequence",
    sender_name: "SaaS Vibes",
    sender_email: "hello@ankurfulzele.in",
    updated_at: new Date().toISOString(),
  };
}

export function buildWelcomeEmailPayload(params: {
  config: WelcomeEmailConfig;
  subscriberName?: string | null;
  subscriberEmail: string;
  siteUrl: string;
}) {
  const { config, subscriberName, subscriberEmail, siteUrl } = params;
  const safeBase = siteUrl.replace(/\/$/, "");
  const firstName = subscriberName?.trim() ? subscriberName.trim().split(/\s+/)[0] : "builder";
  const greeting = config.greeting.replace(/\{\{name\}\}/gi, firstName);
  const resolvedCtaUrl =
    config.ctaUrl.startsWith("http://") || config.ctaUrl.startsWith("https://")
      ? config.ctaUrl
      : `${safeBase}${config.ctaUrl.startsWith("/") ? "" : "/"}${config.ctaUrl}`;
  const unsubUrl = `${safeBase}/api/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

  const paragraphs = config.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const htmlParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="font-size:15.5px;line-height:1.7;color:#1F2937;margin:0 0 14px;white-space:pre-line;">${p
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<body style="background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:24px 16px;margin:0;color:#111827;">
  <div style="max-width:580px;margin:0 auto;">
    <div style="text-align:center;padding:4px 0 14px;border-bottom:2px solid #111827;">
      <div style="font-size:18px;font-weight:900;letter-spacing:0.08em;color:#111827;">SAAS VIBES</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#F04E18;text-transform:uppercase;margin-top:4px;">Ship SaaS on vibes.</div>
    </div>
    <div style="padding:24px 0 12px;">
      <h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 16px;">${greeting
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</h1>
      ${htmlParagraphs}
      ${
        config.ctaLabel
          ? `<div style="margin:22px 0 8px;">
        <a href="${resolvedCtaUrl}" style="display:inline-block;background:#F04E18;color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 22px;border-radius:10px;text-decoration:none;">${config.ctaLabel}</a>
      </div>`
          : ""
      }
    </div>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0 16px;" />
    <div style="text-align:center;font-size:12px;color:#6B7280;">
      <p style="margin:0 0 8px;">Written by <strong>Ankur Fulzele</strong> · <strong>SaaS Vibes</strong></p>
      <p style="margin:0 0 12px;">
        <a href="${safeBase}/newsletter" style="color:#111827;text-decoration:underline;">Browse archive</a>
        &nbsp;·&nbsp;
        <a href="${safeBase}/privacy" style="color:#6B7280;text-decoration:underline;">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="${safeBase}/terms" style="color:#6B7280;text-decoration:underline;">Terms</a>
      </p>
      <a href="${safeBase}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="display:inline-block;border:1px solid #D1D5DB;background:#F9FAFB;color:#374151;font-size:11.5px;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

  const text = `${greeting}\n\n${config.body}\n\n${
    config.ctaLabel ? `${config.ctaLabel}: ${resolvedCtaUrl}\n\n` : ""
  }---\nSaaS Vibes · Ankur Fulzele\nUnsubscribe: ${unsubUrl}`;

  return {
    subject: config.subject,
    html,
    text,
    unsubUrl,
  };
}
