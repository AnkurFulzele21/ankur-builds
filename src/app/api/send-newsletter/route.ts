import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { PastelCardNewsletterEmail } from "@/emails/PastelCardNewsletterEmail";
import type { TemplateBlock } from "@/lib/newsletter-blocks";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Admin login required" }, { status: 401 });
    }

    const { postId, testEmail } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const [{ data: post, error: postErr }, { data: settings }, { data: relatedData }] =
      await Promise.all([
        supabase.from("newsletter_posts").select("*").eq("id", postId).single(),
        supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
        supabase
          .from("newsletter_posts")
          .select("id, slug, title, subtitle, excerpt, thumbnail_url, published_at, created_at, read_time")
          .eq("status", "published")
          .neq("id", postId)
          .order("published_at", { ascending: false })
          .limit(3),
      ]);

    if (postErr || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let recipients: string[] = [];
    if (testEmail) {
      recipients = [String(testEmail).trim()];
    } else {
      const { data: subs } = await supabase
        .from("subscribers")
        .select("email")
        .eq("status", "active");
      recipients = (subs ?? []).map((s) => s.email);
    }

    const subject = post.email_subject || post.title;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const blocks: TemplateBlock[] = Array.isArray(post.template_blocks)
      ? (post.template_blocks as TemplateBlock[])
      : [];

    // Auto-migrate stale "Just Vibe & Ship" publication name in Supabase site_settings
    let resolvedPubName = settings?.publication_name || "SaaS Vibes";
    if (/just\s+vibe\s*&?\s*ship/i.test(resolvedPubName)) {
      resolvedPubName = "SaaS Vibes";
      await supabase
        .from("site_settings")
        .update({ publication_name: "SaaS Vibes", updated_at: new Date().toISOString() })
        .eq("id", "default");
    }

    const safeBase = siteUrl.replace(/\/$/, "");
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.EMAIL_FROM?.trim() || "SaaS Vibes <onboarding@resend.dev>";
    const replyTo = settings?.sender_email || "hello@ankurfulzele.in";
    const isLiveResend = Boolean(resendKey && !resendKey.includes("placeholder"));

    // Compile base HTML + Plain-Text fallback for Gmail / Yahoo deliverability
    const baseEmailEl = PastelCardNewsletterEmail({
      publicationName: resolvedPubName,
      postId: post.id,
      postSlug: post.slug,
      title: post.title,
      previewText: post.email_preview_text || post.subtitle || post.title,
      blocks,
      relatedPosts: relatedData ?? [],
      fallbackMarkdown: post.content_markdown,
      siteUrl: safeBase,
      unsubscribeUrl: `${safeBase}/api/unsubscribe?email=__RECIPIENT_EMAIL__`,
    });

    const [baseHtml, baseText] = await Promise.all([
      render(baseEmailEl),
      render(baseEmailEl, { plainText: true }),
    ]);

    let sentCount = 0;
    if (isLiveResend && recipients.length > 0) {
      for (const to of recipients) {
        const encodedEmail = encodeURIComponent(to);
        const unsubUrl = `${safeBase}/api/unsubscribe?email=${encodedEmail}`;
        const personalizedHtml = baseHtml.replace(/__RECIPIENT_EMAIL__/g, encodedEmail);
        const personalizedText = baseText.replace(/__RECIPIENT_EMAIL__/g, encodedEmail);

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
            subject,
            html: personalizedHtml,
            text: personalizedText,
            headers: {
              "List-Unsubscribe": `<${unsubUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }),
        });
        if (res.ok) sentCount += 1;
      }
    } else {
      sentCount = recipients.length;
    }

    if (!testEmail) {
      await supabase
        .from("newsletter_posts")
        .update({ emails_sent_count: (post.emails_sent_count || 0) + sentCount })
        .eq("id", post.id);

      await supabase.from("email_dispatches").insert({
        post_id: post.id,
        subject,
        recipient_count: sentCount,
        provider: isLiveResend ? "resend" : "sandbox_dry_run",
        status: "sent",
      });
    }

    return NextResponse.json({
      sent: true,
      recipientCount: sentCount,
      dryRun: !isLiveResend,
      htmlLength: baseHtml.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email dispatch failed" },
      { status: 500 }
    );
  }
}
