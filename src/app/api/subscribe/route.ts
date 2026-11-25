import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSubscriberToMailCheap } from "@/lib/mailcheap";
import { buildWelcomeEmailPayload, parseWelcomeRow } from "@/lib/welcome-email";
import {
  buildSequenceStepPayload,
  getStepTrackingTag,
  parseCampaignsRow,
  subscriberMatchesCampaign,
} from "@/lib/email-sequences";

export async function GET() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { count: activeCount, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Public visitors ONLY receive aggregate count — never expose subscriber PII!
  if (!user) {
    return NextResponse.json({ count: activeCount ?? 0 });
  }

  const { data } = await supabase
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  return NextResponse.json({
    count: activeCount ?? 0,
    total: (data ?? []).length,
    subscribers: data ?? [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = body.name ? String(body.name).trim() : null;
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = await createClient();
    const refCode = `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { error } = await supabase.from("subscribers").insert({
      email,
      name,
      source: body.source ? String(body.source) : "website",
      tags: Array.isArray(body.tags) ? body.tags : [],
      referral_code: refCode,
      referred_by: body.referredBy ? String(body.referredBy) : null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ added: false, message: "Already subscribed!" }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also sync to self-hosted MailCheap if MAILCHEAP_URL + MAILCHEAP_SIGNUP_KEY are configured
    const mailcheap = await syncSubscriberToMailCheap({
      email,
      name,
      source: body.source ? String(body.source) : "website",
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    // Trigger Day 0 Onboarding Email (from 7-Day Sequence if enabled, else fallback Welcome Email)
    let welcomeSent = false;
    let welcomeError: string | null = null;
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const isLiveResend = Boolean(resendKey && !resendKey.includes("placeholder"));
    if (isLiveResend) {
      try {
        const [{ data: seqRow }, { data: welcomeRow }, { data: siteRow }] = await Promise.all([
          supabase.from("site_settings").select("*").eq("id", "email_sequence").maybeSingle(),
          supabase.from("site_settings").select("*").eq("id", "welcome_email").maybeSingle(),
          supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
        ]);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
        const fromEmail = process.env.EMAIL_FROM?.trim() || "SaaS Vibes <onboarding@resend.dev>";
        const replyTo = siteRow?.sender_email || "hello@ankurfulzele.in";

        const campaigns = parseCampaignsRow(seqRow as Record<string, unknown> | null);
        const subSource = body.source ? String(body.source) : "website";
        const baseTags = Array.isArray(body.tags) ? (body.tags as string[]) : [];

        const matchingDay0 = campaigns
          .filter(
            (c) =>
              c.enabled &&
              c.trigger !== "manual" &&
              subscriberMatchesCampaign(c, { source: subSource, tags: baseTags })
          )
          .map((c) => ({
            campaign: c,
            step: c.steps.find((s) => s.enabled && s.day === 0),
          }))
          .filter((item): item is { campaign: typeof item.campaign; step: NonNullable<typeof item.step> } =>
            Boolean(item.step)
          );

        if (matchingDay0.length > 0) {
          const newTags = [...baseTags];
          for (const { campaign, step } of matchingDay0) {
            const payload = buildSequenceStepPayload({
              step,
              campaignName: campaign.name,
              subscriberName: name,
              subscriberEmail: email,
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
                to: [email],
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
              welcomeSent = true;
              newTags.push(getStepTrackingTag(campaign.id, 0));
              await supabase.from("email_dispatches").insert({
                post_id: null,
                subject: `[Welcome] ${payload.subject}`,
                recipient_count: 1,
                provider: "resend",
                status: "sent",
              });
            } else {
              welcomeError = await res.text();
              console.error("[subscribe] Resend welcome sequence error:", welcomeError);
            }
          }
          if (welcomeSent) {
            await supabase.from("subscribers").update({ tags: newTags }).eq("email", email);
          }
        } else {
          const welcomeConfig = parseWelcomeRow(welcomeRow as Record<string, unknown> | null);
          if (welcomeConfig.enabled) {
            const emailPayload = buildWelcomeEmailPayload({
              config: welcomeConfig,
              subscriberName: name,
              subscriberEmail: email,
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
                to: [email],
                reply_to: replyTo,
                subject: emailPayload.subject,
                html: emailPayload.html,
                text: emailPayload.text,
                headers: {
                  "List-Unsubscribe": `<${emailPayload.unsubUrl}>`,
                  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
              }),
            });
            welcomeSent = res.ok;
          }
        }
      } catch {
        // Non-blocking: subscriber is already saved
      }
    }

    return NextResponse.json(
      { added: true, mailcheapSynced: mailcheap.synced, welcomeSent, welcomeError },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Subscription failed" },
      { status: 500 }
    );
  }
}
