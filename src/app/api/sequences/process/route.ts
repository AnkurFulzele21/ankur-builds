import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildSequenceStepPayload,
  getStepTrackingTag,
  hasReceivedStep,
  parseCampaignsRow,
  subscriberMatchesCampaign,
  type SequenceStep,
} from "@/lib/email-sequences";
import type { SubscriberRow } from "@/lib/beehiiv-db";

/**
 * Vercel Cron invokes GET with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  return POST(request);
}

/**
 * Processes due emails across ALL enabled campaigns (or a specific campaignId)
 * OR sends a test email for a single step.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const cronSecret = process.env.CRON_SECRET?.trim();
    const authHeader = request.headers.get("authorization");
    const isCron = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isCron) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Admin login required" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const isLiveResend = Boolean(resendKey && !resendKey.includes("placeholder"));
    if (!isLiveResend) {
      return NextResponse.json(
        { error: "Add a live RESEND_API_KEY in .env.local first." },
        { status: 400 }
      );
    }

    const { data: siteRow } = await supabase
      .from("site_settings")
      .select("sender_email")
      .eq("id", "default")
      .maybeSingle();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const fromEmail = process.env.EMAIL_FROM?.trim() || "SaaS Vibes <onboarding@resend.dev>";
    const replyTo = siteRow?.sender_email || "hello@ankurfulzele.in";

    // Mode A: Test send a single sequence step
    if (body.testEmail && body.step) {
      const to = String(body.testEmail).trim();
      const step = body.step as SequenceStep;
      const payload = buildSequenceStepPayload({
        step,
        campaignName: body.campaignName ? String(body.campaignName) : undefined,
        subscriberName: "Ankur",
        subscriberEmail: to,
        siteUrl,
      });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          reply_to: replyTo,
          subject: `[Test Day ${step.day}] ${payload.subject}`,
          html: payload.html,
          text: payload.text,
          headers: {
            "List-Unsubscribe": `<${payload.unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: await res.text() }, { status: 500 });
      }
      return NextResponse.json({ sent: 1, mode: "test" });
    }

    // Mode B: Process all due sequence steps across enabled campaigns
    const [{ data: seqRow }, { data: subsData }] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", "email_sequence").maybeSingle(),
      supabase.from("subscribers").select("*").eq("status", "active"),
    ]);

    const allCampaigns = parseCampaignsRow(seqRow as Record<string, unknown> | null);
    const targetCampaigns = allCampaigns.filter((c) => {
      if (!c.enabled) return false;
      if (body.campaignId && c.id !== body.campaignId) return false;
      return true;
    });

    if (targetCampaigns.length === 0) {
      return NextResponse.json({ sent: 0, checked: 0, message: "No active campaigns to run." });
    }

    const subscribers = (subsData as SubscriberRow[]) ?? [];
    const now = Date.now();
    let totalSent = 0;

    for (const sub of subscribers) {
      const daysSinceSignup = Math.floor(
        (now - new Date(sub.subscribed_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      let currentTags = Array.isArray(sub.tags) ? [...sub.tags] : [];
      let tagsChanged = false;

      for (const campaign of targetCampaigns) {
        if (!subscriberMatchesCampaign(campaign, sub)) continue;

        const minDay = campaign.trigger === "manual" ? 0 : 1;
        const activeSteps = campaign.steps
          .filter((s) => s.enabled && s.day >= minDay)
          .sort((a, b) => a.day - b.day);

        const dueStep = activeSteps.find(
          (step) =>
            daysSinceSignup >= step.day && !hasReceivedStep(currentTags, campaign.id, step.day)
        );
        if (!dueStep) continue;

        const payload = buildSequenceStepPayload({
          step: dueStep,
          campaignName: campaign.name,
          subscriberName: sub.name,
          subscriberEmail: sub.email,
          siteUrl,
        });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [sub.email],
            reply_to: replyTo,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            headers: {
              "List-Unsubscribe": `<${payload.unsubUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }),
        });

        if (res.ok) {
          totalSent += 1;
          currentTags = [...currentTags, getStepTrackingTag(campaign.id, dueStep.day)];
          tagsChanged = true;
          await supabase.from("email_dispatches").insert({
            post_id: null,
            subject: `[Seq D${dueStep.day}] ${payload.subject}`,
            recipient_count: 1,
            provider: "resend",
            status: "sent",
          });
        }
      }

      if (tagsChanged) {
        await supabase.from("subscribers").update({ tags: currentTags }).eq("id", sub.id);
      }
    }

    return NextResponse.json({
      sent: totalSent,
      checked: subscribers.length,
      campaignsProcessed: targetCampaigns.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sequence processing failed" },
      { status: 500 }
    );
  }
}
