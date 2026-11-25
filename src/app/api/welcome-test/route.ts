import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWelcomeEmailPayload, type WelcomeEmailConfig } from "@/lib/welcome-email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Admin login required" }, { status: 401 });
    }

    const { testEmail, config } = (await request.json()) as {
      testEmail: string;
      config: WelcomeEmailConfig;
    };
    const to = String(testEmail || "").trim();
    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Enter a valid test email address." }, { status: 400 });
    }

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
    const payload = buildWelcomeEmailPayload({
      config,
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
        subject: `[Test] ${payload.subject}`,
        html: payload.html,
        text: payload.text,
        headers: {
          "List-Unsubscribe": `<${payload.unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `Resend error: ${errBody}` }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Test send failed" },
      { status: 500 }
    );
  }
}
