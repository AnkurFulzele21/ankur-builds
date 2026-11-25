export type SequenceAudience = "all" | "newsletter-hero" | "newsletter-bottom" | "embed-form" | "tag";
export type SequenceTrigger = "on_subscribe" | "on_tag" | "manual";

export interface SequenceStep {
  id: string;
  day: number; // 0 = immediate onboarding on subscribe, 1..N = days after signup
  enabled: boolean;
  subject: string;
  previewText?: string;
  greeting: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface EmailSequenceConfig {
  id: string;
  enabled: boolean;
  name: string;
  description?: string;
  trigger: SequenceTrigger;
  audience: SequenceAudience;
  targetTag: string;
  steps: SequenceStep[];
  createdAt?: string;
}

/**
 * Replaces {{first_name | builder}}, {{first_name}}, {{name}}, or {{name | fallback}}
 * with the subscriber's real first name (or the fallback if no name was provided).
 */
export function interpolateSubscriberName(
  text: string,
  subscriberName?: string | null
): string {
  const cleanFirst = subscriberName?.trim()
    ? subscriberName.trim().split(/\s+/)[0]
    : "";
  return text.replace(
    /\{\{\s*(?:first_name|name)(?:\s*\|\s*([^}]+))?\s*\}\}/gi,
    (_match, fallback) => {
      if (cleanFirst) return cleanFirst;
      return (fallback ? String(fallback).trim() : "builder") || "builder";
    }
  );
}

export const DEFAULT_7DAY_SEQUENCE: EmailSequenceConfig = {
  id: "camp-welcome-7day",
  enabled: true,
  name: "7-Day Vibe-Code & Ship Welcome Sequence",
  description: "Soap Opera Method onboarding taking new readers from localhost idea to live SaaS.",
  trigger: "on_subscribe",
  audience: "all",
  targetTag: "",
  steps: [
    {
      id: "seq-day-0",
      day: 0,
      enabled: true,
      subject: "Welcome to SaaS Vibes (and your AI Builder Vault)",
      previewText:
        "Two emails a week. Zero VC fluff. Plus your 7-day shipping sprint starts tomorrow.",
      greeting: "Hey {{first_name | builder}},",
      body: `Welcome to SaaS Vibes.

You just joined a corner of the internet for people who are tired of watching 45-minute AI tutorials and actually want to ship software that pays.

Here's what's about to happen:

1. Your free AI Builder Vault is unlocked. Inside you'll find my starter prompts, .cursorrules setup, and the exact stack I use to go from idea to deployed app fast.
2. Every Wednesday: You get The SaaS Story—a deep teardown of how a solo founder vibe-coded a real micro-SaaS in days and got people to pull out their credit cards.
3. Every Sunday: You get The Weekend Brief—5 minutes covering Trending SaaS News, SaaS of the Week, Vibe Toolkit, Skills & Repos, and one Distribution Play before Monday hits.

Wait—there's a bonus.
Starting tomorrow morning, I'm sending you our 7-Day Vibe-Code & Ship Sprint. Seven short daily emails taking you from "I have a half-baked idea" on Day 1 to a live, deployed SaaS with a payment link on Day 7.

One quick favor before tomorrow:
Hit reply and tell me in one sentence: What are you trying to build right now? (I actually read every reply—and it tells Gmail not to bury us in Promotions.)

Tomorrow's email drops at 9 AM: why 90% of AI builders never leave localhost—and the 15-minute trick we'll use on Day 1 to pick an idea people actually pay for.

Vibe. Ship. Repeat.
Ankur Fulzele
Founder, SaaS Vibes | @AnkurBuilds`,
      ctaLabel: "Open Your Free AI Builder Vault →",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-1",
      day: 1,
      enabled: true,
      subject: "Day 1: Why your best idea is probably a trap",
      previewText: 'Stop building "cool AI wrappers." Do this 15-minute check instead.',
      greeting: "Hey {{first_name | builder}},",
      body: `Let's be honest for a second.

If I opened your laptop right now, how many half-finished projects are sitting inside your localhost folder?

Three? Seven? Twelve?

When I started vibe coding, I spent three weeks building a sleek, dark-mode AI dashboard I thought was pure genius. Beautiful animations. Clean gradients. Zero bugs.

And zero paying customers.

Why? Because I built something that sounded cool to me—not something annoying enough that a stranger would pay $19/month to make it go away.

Your Day 1 Mission (15 minutes, no code yet):

1. Open Reddit, X, or G2 reviews for a boring software tool people already pay for.
2. Look for the 3-star reviews—the ones that say: "It works fine, BUT I hate doing [X] manually."
3. Pick one annoying micro-problem and write down one sentence: "My app takes [ugly input] and turns it into [paid result] in 30 seconds."

That's it. Do not open Figma. Do not pick a color palette. Do not buy a domain yet.

Tomorrow on Day 2, I'll show you how to set up your vibe-coding stack in 20 minutes—and the single .md file trick that stops your AI coding agent from hallucinating and breaking your app.

See you tomorrow,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-2",
      day: 2,
      enabled: true,
      subject: "Day 2: Stop debating tech stacks. Copy this one.",
      previewText: "The single file that makes AI coding agents 46% more accurate.",
      greeting: "Hey {{first_name | builder}},",
      body: `You know that guy on X who spends four days arguing about whether Next.js, Svelte, or Laravel is "better for scale"—while having zero users?

Don't be that guy.

Users do not care what database you used. They care if the button works when they click it.

For a 7-day vibe-coded SaaS, boring and popular beats clever every single time—because AI models have seen millions of examples of it.

Your Day 2 Mission (Setup in 20 minutes):

1. Pick the boring stack: Next.js + Tailwind + Supabase (or whatever your AI tool knows best).
2. Pick your co-pilot: Cursor, Claude Code, or Bolt/Lovable—pick one and close the other 14 tabs.
3. Create one CONTEXT.md file in your root folder. Write 10 lines inside it: what your app does, your exact stack, your folder rules, and "Keep solutions simple; never install extra libraries without asking."

Recent benchmarks showed that cleaning duplicate files and giving your agent one clean source of truth boosts accuracy dramatically—and saves you half your token bill.

Tomorrow on Day 3, we stop prepping and actually build the ugly working prototype in one focused sprint.

Keep it moving,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-3",
      day: 3,
      enabled: true,
      subject: "Day 3: Build the ugly version today",
      previewText: "No dark mode. No settings page. Just the core magic trick.",
      greeting: "Hey {{first_name | builder}},",
      body: `Here is the fastest way to kill a weekend SaaS:

Spending Day 3 building a login screen, a pricing toggle, a custom SVG logo, and a user profile settings page... for an app that doesn't even do its main job yet.

Think of your app like a magic trick.
If the rabbit doesn't come out of the hat, nobody cares how shiny the stage curtains are.

Your Day 3 Mission (One 2–3 hour sprint):

1. Open your editor with CONTEXT.md loaded.
2. Prompt your AI agent to build only the core input-to-output loop on a single page. (Example: paste a CSV → get a clean PDF report, or paste a URL → generate 5 tailored hooks.)
3. Hardcode dummy data if you have to. Make it ugly. Just make the core feature work end-to-end on your screen.

When you see the core feature actually work for the first time, your momentum triples.

Tomorrow on Day 4, we wire up auth and a real database—plus the 5-minute security check most vibe coders skip until someone drains their API credits.

Go break something,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-4",
      day: 4,
      enabled: true,
      subject: "Day 4: Vibe coding is fast. So are leaked API keys.",
      previewText: "Wire up users and run this 5-minute security sanity check.",
      greeting: "Hey {{first_name | builder}},",
      body: `Yesterday you got the core engine running. Now it's time to make it a real app—without waking up to a $400 OpenAI bill from a stranger on the internet.

Vibe coding lets you move at 10x speed, which also means AI agents occasionally leave front doors wide open if you don't check.

Your Day 4 Mission (Save users + lock the doors):

1. Connect Supabase (or Clerk + Postgres) for Google/email login and saving user projects.
2. Run the 5-Minute Vibe Security Audit:
   • Check that every AI/OpenAI/Anthropic key lives strictly on the server (.env / API routes), never in client-side code.
   • Turn on Row-Level Security (RLS) on database tables so User A can't read User B's data.
   • Add a basic rate limit or usage cap on AI endpoints before anyone touches it.

Boring? A little.
Way less boring than tweeting an apology thread on launch day? Definitely.

Tomorrow on Day 5, we do the step 80% of solo builders are terrified of: putting a real price tag and checkout button on your app.

See you at 9 AM,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-5",
      day: 5,
      enabled: true,
      subject: "Day 5: Put a Stripe button on it (yes, today)",
      previewText: "Free users give polite feedback. Paying users tell you the truth.",
      greeting: "Hey {{first_name | builder}},",
      body: `Right about now, a little voice in your head is whispering:

"Maybe I should make it completely free for beta users first... just until I add 12 more features."

Ignore that voice. It's fear wearing a product-manager hat.

Free users will tell you "Cool app!" and never open it again.
Someone who pays even $9 or $19 will immediately tell you what's broken, what they love, and what makes it worth $49.

Your Day 5 Mission (Monetize before it feels "ready"):

1. Pick one dead-simple price: $9–$19/month or a $29 lifetime/credit pack (skip complex 4-tier pricing tables).
2. Wire up Stripe, Lemon Squeezy, or Razorpay checkout to gate usage after a small free taste (e.g., 2 free runs, then upgrade).
3. Test one $1 or test-mode purchase yourself end to end so you know the webhook actually unlocks access.

The moment your app can legally take a stranger's credit card, it stops being a toy and becomes a cash-flowing asset.

Tomorrow on Day 6, we write a landing page that actually sells (without sounding like a generic AI brochure) and push it live to a real URL.

Almost there,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-6",
      day: 6,
      enabled: true,
      subject: 'Day 6: Delete "Revolutionize your workflow" right now',
      previewText: "How to write your homepage in 20 minutes and push to production.",
      greeting: "Hey {{first_name | builder}},",
      body: `If your AI agent wrote your landing page copy, I already know what your headline says:

"Unleash the power of AI to revolutionize your workflow seamlessly."

Delete that immediately. Nobody talks like that, and nobody buys from it.

Real people buy two things: escaping an annoying daily pain, or getting a concrete result faster.

Your Day 6 Mission (Copy + Deploy Live):

1. Rewrite your Hero in 3 lines:
   • Headline: [Do annoying thing] in [short time] without [old headache].
   • Subhead: Who it's for + what happens the second they paste/click.
   • Button: Outcome-based CTA (Generate My First [Result] →).
2. Record a 20-second screen demo showing the tool actually working (raw and fast beats studio polish).
3. Deploy to Vercel and connect your domain.

Your app is officially on the internet.

Tomorrow on Day 7, we talk about the only thing harder than building an app: getting your first 10 real users without feeling like a spammer.

One day left,
Ankur`,
      ctaLabel: "",
      ctaUrl: "/newsletter",
    },
    {
      id: "seq-day-7",
      day: 7,
      enabled: true,
      subject: "Day 7: Ship it ugly (your launch checklist)",
      previewText: "How to get your first 10 users today—and what happens next.",
      greeting: "Hey {{first_name | builder}},",
      body: `Seven days ago, this was a thought in your head.
Today, it's a live product with a payment link. That already puts you ahead of 95% of people talking about AI on the internet.

Now comes the part everyone skips: telling people it exists.

Don't wait for a "big Product Hunt launch" to get your first users. Do this today:

Your Day 7 Launch Moves:

1. Post a 30-second demo on X: Show the problem, show the 20-second screen recording, and share what you learned building it in 7 days.
2. Reply to 10 people actively complaining about that exact problem on X or Reddit—don't spam links, just share how you solved it and offer them early access.
3. DM 5 builder friends and ask for brutal feedback on where they got confused in the first 30 seconds.

If you get 0 signups today, good—now you have real data on what to fix in the headline or the hook. If you get your first $9 customer, screenshot it and celebrate.

What happens next:
You've graduated from the 7-day sprint. From here on, you'll hear from me twice a week:

• Every Wednesday: A fresh SaaS Story breaking down how a solo founder shipped and monetized fast.
• Every Sunday: The Weekend Brief with Trending SaaS News, SaaS of the Week, Vibe Toolkit, Skills & Repos, and The Distribution Play.

Hit reply and send me the link to what you built (or tell me where you got stuck)—I'd genuinely love to check it out.

Vibe. Ship. Repeat.
Ankur Fulzele
Founder, SaaS Vibes | @AnkurBuilds`,
      ctaLabel: "Browse SaaS Vibes Archive →",
      ctaUrl: "/newsletter",
    },
  ],
};

export function createNewCampaign(params: {
  name: string;
  description?: string;
  trigger: SequenceTrigger;
  audience: SequenceAudience;
  targetTag?: string;
  preset: "blank" | "launch-3day" | "soap-opera-7day";
}): EmailSequenceConfig {
  const id = `camp-${Date.now().toString(36)}`;
  if (params.preset === "soap-opera-7day") {
    return {
      ...JSON.parse(JSON.stringify(DEFAULT_7DAY_SEQUENCE)),
      id,
      name: params.name || "7-Day Welcome Sequence",
      description: params.description || DEFAULT_7DAY_SEQUENCE.description,
      trigger: params.trigger,
      audience: params.audience,
      targetTag: params.targetTag || "",
      createdAt: new Date().toISOString(),
    };
  }

  if (params.preset === "launch-3day") {
    return {
      id,
      enabled: false,
      name: params.name || "3-Day Product Launch Campaign",
      description: params.description || "Teaser → Launch Day → Last Chance sequence.",
      trigger: params.trigger,
      audience: params.audience,
      targetTag: params.targetTag || "",
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: `${id}-d0`,
          day: 0,
          enabled: true,
          subject: "Something new is dropping tomorrow 👀",
          previewText: "Early access for SaaS Vibes readers first.",
          greeting: "Hey {{first_name | builder}},",
          body: "Quick heads-up — I've been building something for the past two weeks and I'm opening early access tomorrow.\n\nKeep an eye on your inbox at 9 AM.",
          ctaLabel: "",
          ctaUrl: "/newsletter",
        },
        {
          id: `${id}-d1`,
          day: 1,
          enabled: true,
          subject: "It's live: early access is open 🚀",
          previewText: "Grab your early-bird spot before it closes.",
          greeting: "Hey {{first_name | builder}},",
          body: "It's officially live! Here is everything inside and how it helps you ship faster this week.",
          ctaLabel: "Check It Out →",
          ctaUrl: "/newsletter",
        },
        {
          id: `${id}-d3`,
          day: 3,
          enabled: true,
          subject: "Last call — closing launch pricing tonight",
          previewText: "Final 12 hours to lock in founder pricing.",
          greeting: "Hey {{first_name | builder}},",
          body: "Just a quick reminder before we close the launch offer tonight. Hit reply if you have any questions!",
          ctaLabel: "Claim Founder Access →",
          ctaUrl: "/newsletter",
        },
      ],
    };
  }

  return {
    id,
    enabled: false,
    name: params.name || "Untitled Campaign",
    description: params.description || "Custom automated email sequence.",
    trigger: params.trigger,
    audience: params.audience,
    targetTag: params.targetTag || "",
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: `${id}-d0`,
        day: 0,
        enabled: true,
        subject: "Welcome — here's your first email",
        previewText: "Quick note to get started.",
        greeting: "Hey {{first_name | builder}},",
        body: "Write your first automated email here. Use {{first_name | builder}} anywhere to personalize with the subscriber's name.",
        ctaLabel: "Explore More →",
        ctaUrl: "/newsletter",
      },
    ],
  };
}

/**
 * Parse all campaigns stored in `site_settings` row `id = 'email_sequence'`.
 * Automatically upgrades legacy single-sequence format into a multi-campaign array.
 */
export function parseCampaignsRow(
  row: Record<string, unknown> | null | undefined
): EmailSequenceConfig[] {
  if (!row || typeof row.bio !== "string") return [DEFAULT_7DAY_SEQUENCE];
  try {
    const parsed = JSON.parse(row.bio);
    if (Array.isArray(parsed?.campaigns) && parsed.campaigns.length > 0) {
      return parsed.campaigns.map((c: Partial<EmailSequenceConfig>, idx: number) => ({
        ...DEFAULT_7DAY_SEQUENCE,
        ...c,
        id: c.id || `camp-${idx}`,
        trigger: c.trigger || "on_subscribe",
        steps: Array.isArray(c.steps) ? c.steps : [],
      }));
    }
    if (Array.isArray(parsed?.steps)) {
      return [
        {
          ...DEFAULT_7DAY_SEQUENCE,
          ...parsed,
          id: parsed.id || DEFAULT_7DAY_SEQUENCE.id,
          trigger: parsed.trigger || "on_subscribe",
        },
      ];
    }
    return [DEFAULT_7DAY_SEQUENCE];
  } catch {
    return [DEFAULT_7DAY_SEQUENCE];
  }
}

export function serializeCampaignsRow(campaigns: EmailSequenceConfig[]) {
  const activeCount = campaigns.filter((c) => c.enabled).length;
  return {
    id: "email_sequence",
    publication_name: activeCount > 0 ? "true" : "false",
    publication_tagline: `${campaigns.length} Campaigns (${activeCount} active)`,
    owner_name: "multi-campaign",
    owner_handle: "",
    bio: JSON.stringify({ campaigns }),
    location: "sequence-engine",
    sender_name: "SaaS Vibes",
    sender_email: "hello@ankurfulzele.in",
    twitter_url: "https://x.com/AnkurBuilds",
    updated_at: new Date().toISOString(),
  };
}

export function subscriberMatchesCampaign(
  campaign: EmailSequenceConfig,
  sub: { source?: string | null; tags?: string[] | null }
): boolean {
  if (campaign.audience === "all") return true;
  if (campaign.audience === "tag") {
    const wanted = campaign.targetTag.trim().toLowerCase();
    if (!wanted) return true;
    return (sub.tags || []).some((t) => t.toLowerCase() === wanted);
  }
  return sub.source === campaign.audience;
}

export function getStepTrackingTag(campaignId: string, day: number): string {
  return `seq:${campaignId}:d${day}`;
}

export function hasReceivedStep(
  tags: string[] | null | undefined,
  campaignId: string,
  day: number
): boolean {
  const list = tags || [];
  if (list.includes(getStepTrackingTag(campaignId, day))) return true;
  if (campaignId === DEFAULT_7DAY_SEQUENCE.id && list.includes(`seq:day-${day}`)) {
    return true;
  }
  return false;
}

export function buildSequenceStepPayload(params: {
  step: SequenceStep;
  campaignName?: string;
  subscriberName?: string | null;
  subscriberEmail: string;
  siteUrl: string;
}) {
  const { step, campaignName, subscriberName, subscriberEmail, siteUrl } = params;
  const safeBase = siteUrl.replace(/\/$/, "");
  const subject = interpolateSubscriberName(step.subject, subscriberName);
  const previewText = interpolateSubscriberName(step.previewText || "", subscriberName);
  const greeting = interpolateSubscriberName(step.greeting, subscriberName);
  const interpolatedBody = interpolateSubscriberName(step.body, subscriberName);

  const resolvedCtaUrl =
    step.ctaUrl.startsWith("http://") || step.ctaUrl.startsWith("https://")
      ? step.ctaUrl
      : `${safeBase}${step.ctaUrl.startsWith("/") ? "" : "/"}${step.ctaUrl}`;
  const unsubUrl = `${safeBase}/api/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const paragraphs = interpolatedBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const htmlParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="font-size:15.5px;line-height:1.72;color:#1F2937;margin:0 0 14px;white-space:pre-line;">${escapeHtml(
          p
        )}</p>`
    )
    .join("");

  const preheaderSpan = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(
        previewText
      )}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : "";

  const kickerLabel =
    step.day === 0
      ? "WELCOME ONBOARD"
      : `DAY ${step.day} · ${(campaignName || "7-DAY VIBE-CODE & SHIP SPRINT").toUpperCase()}`;

  const html = `<!DOCTYPE html>
<html>
<body style="background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:24px 16px;margin:0;color:#111827;">
  ${preheaderSpan}
  <div style="max-width:580px;margin:0 auto;">
    <div style="text-align:center;padding:4px 0 14px;border-bottom:2px solid #111827;">
      <div style="font-size:18px;font-weight:900;letter-spacing:0.08em;color:#111827;">SAAS VIBES</div>
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#F04E18;text-transform:uppercase;margin-top:4px;">${escapeHtml(
        kickerLabel
      )}</div>
    </div>
    <div style="padding:24px 0 12px;">
      <h1 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 16px;">${escapeHtml(
        greeting
      )}</h1>
      ${htmlParagraphs}
      ${
        step.ctaLabel
          ? `<div style="margin:22px 0 8px;">
        <a href="${resolvedCtaUrl}" style="display:inline-block;background:#F04E18;color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 22px;border-radius:10px;text-decoration:none;">${escapeHtml(
          step.ctaLabel
        )}</a>
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

  const text = `${greeting}\n\n${interpolatedBody}\n\n${
    step.ctaLabel ? `${step.ctaLabel}: ${resolvedCtaUrl}\n\n` : ""
  }---\nSaaS Vibes · Ankur Fulzele\nUnsubscribe: ${unsubUrl}`;

  return {
    subject,
    html,
    text,
    unsubUrl,
  };
}
