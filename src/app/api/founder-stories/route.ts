import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface FounderPitchPayload {
  id: string;
  createdAt: string;
  pitchStatus: "new" | "shortlisted" | "featured" | "passed";
  founderName: string;
  email: string;
  xHandle: string;
  saasName: string;
  saasUrl: string;
  tagline: string;
  mrr: string;
  payingUsers: string;
  shipTime: string;
  techStack: string;
  story: string;
  biggestMistake: string;
  distributionPlay: string;
  founderPhotoUrl: string | null;
  proofScreenshots: string[];
  extraNotes: string;
}

function isAdminEmail(email?: string | null) {
  const allowed = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return Boolean(email);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

function extractPitchFromRow(row: Record<string, unknown>): FounderPitchPayload | null {
  const blocks = Array.isArray(row.template_blocks) ? row.template_blocks : [];
  const first = blocks[0] as Record<string, unknown> | undefined;
  const data = (first?.data as Record<string, unknown> | undefined) || {};
  return {
    id: String(row.id || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
    pitchStatus: (data.pitchStatus as FounderPitchPayload["pitchStatus"]) || "new",
    founderName: String(data.founderName || ""),
    email: String(data.email || ""),
    xHandle: String(data.xHandle || ""),
    saasName: String(data.saasName || row.title || ""),
    saasUrl: String(data.saasUrl || ""),
    tagline: String(data.tagline || row.subtitle || ""),
    mrr: String(data.mrr || ""),
    payingUsers: String(data.payingUsers || ""),
    shipTime: String(data.shipTime || ""),
    techStack: String(data.techStack || ""),
    story: String(data.story || row.content_markdown || ""),
    biggestMistake: String(data.biggestMistake || ""),
    distributionPlay: String(data.distributionPlay || ""),
    founderPhotoUrl: (data.founderPhotoUrl as string | null) || (row.thumbnail_url as string | null) || null,
    proofScreenshots: Array.isArray(data.proofScreenshots)
      ? (data.proofScreenshots as string[])
      : [],
    extraNotes: String(data.extraNotes || ""),
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("newsletter_posts")
    .select("*")
    .eq("category", "__founder_pitch__")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pitches = (data || [])
    .map((r) => extractPitchFromRow(r as Record<string, unknown>))
    .filter((p): p is FounderPitchPayload => Boolean(p));

  return NextResponse.json({ pitches });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const founderName = String(body.founderName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const saasName = String(body.saasName || "").trim();
    const saasUrl = String(body.saasUrl || "").trim();
    const story = String(body.story || "").trim();

    if (!founderName || !email.includes("@") || !saasName || !saasUrl || !story) {
      return NextResponse.json(
        { error: "Please fill in your name, email, SaaS name, URL, and story." },
        { status: 400 }
      );
    }

    const pitchData: Omit<FounderPitchPayload, "id" | "createdAt"> = {
      pitchStatus: "new",
      founderName,
      email,
      xHandle: String(body.xHandle || "").trim(),
      saasName,
      saasUrl,
      tagline: String(body.tagline || "").trim(),
      mrr: String(body.mrr || "").trim(),
      payingUsers: String(body.payingUsers || "").trim(),
      shipTime: String(body.shipTime || "").trim(),
      techStack: String(body.techStack || "").trim(),
      story,
      biggestMistake: String(body.biggestMistake || "").trim(),
      distributionPlay: String(body.distributionPlay || "").trim(),
      founderPhotoUrl: body.founderPhotoUrl ? String(body.founderPhotoUrl) : null,
      proofScreenshots: Array.isArray(body.proofScreenshots)
        ? body.proofScreenshots.map(String).slice(0, 8)
        : [],
      extraNotes: String(body.extraNotes || "").trim(),
    };

    const slug = `pitch-${saasName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

    const supabase = await createClient();
    const { data: inserted, error } = await supabase
      .from("newsletter_posts")
      .insert({
        slug,
        title: `${saasName} — ${founderName}`,
        subtitle: pitchData.tagline || `${pitchData.mrr || "Revenue"} · ${saasUrl}`,
        excerpt: story.slice(0, 180),
        content_markdown: story,
        thumbnail_url: pitchData.founderPhotoUrl,
        category: "__founder_pitch__",
        read_time: "Pitch",
        status: "draft",
        featured: false,
        publish_to_web: false,
        send_email: false,
        template_theme: "minimal",
        template_blocks: [
          {
            id: "founder-pitch",
            type: "pitch",
            data: pitchData,
          },
        ],
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Secretly email Ankur via Resend when a new founder pitches
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey && !resendKey.includes("placeholder")) {
      try {
        const notifyTo =
          process.env.ADMIN_EMAIL?.split(",")[0]?.trim() || "hello@ankurfulzele.in";
        const from = process.env.EMAIL_FROM || "SaaS Vibes <hello@ankurfulzele.in>";
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in").replace(
          /\/$/,
          ""
        );

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [notifyTo],
            reply_to: email,
            subject: `New Founder Pitch: ${saasName} (${pitchData.mrr || "No MRR"}) — ${founderName}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #0E1B2A;">
                <h2 style="margin-bottom: 4px;">New SaaS Vibes Story Pitch</h2>
                <p style="color: #F04E18; font-weight: 700; margin-top: 0;">${saasName} · ${pitchData.mrr || "Revenue not listed"}</p>
                <p><strong>Founder:</strong> ${founderName} (${email}) ${pitchData.xHandle ? `· ${pitchData.xHandle}` : ""}</p>
                <p><strong>SaaS URL:</strong> <a href="${saasUrl}">${saasUrl}</a></p>
                <p><strong>One-liner:</strong> ${pitchData.tagline || "-"}</p>
                <p><strong>Users / Ship Time:</strong> ${pitchData.payingUsers || "-"} · ${pitchData.shipTime || "-"}</p>
                <p><strong>Stack:</strong> ${pitchData.techStack || "-"}</p>
                <p><strong>Story:</strong><br/>${story.replace(/\n/g, "<br/>")}</p>
                <p><strong>Biggest Mistake:</strong><br/>${(pitchData.biggestMistake || "-").replace(/\n/g, "<br/>")}</p>
                <p><strong>Distribution Play:</strong><br/>${(pitchData.distributionPlay || "-").replace(/\n/g, "<br/>")}</p>
                <p><strong>Proof Screenshots Attached:</strong> ${pitchData.proofScreenshots.length}</p>
                <p style="margin-top: 24px;">
                  <a href="${siteUrl}/admin/stories" style="background: #0E1B2A; color: #F8EAE0; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">
                    Open in Admin Studio →
                  </a>
                </p>
              </div>
            `,
          }),
        });
      } catch {
        // Non-blocking notification failure
      }
    }

    return NextResponse.json({ ok: true, id: inserted?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit story" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id || "");
  const pitchStatus = String(body.pitchStatus || "new");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: existing, error: fetchErr } = await supabase
    .from("newsletter_posts")
    .select("template_blocks")
    .eq("id", id)
    .eq("category", "__founder_pitch__")
    .maybeSingle();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  const blocks = Array.isArray(existing.template_blocks) ? [...existing.template_blocks] : [];
  const first = (blocks[0] as Record<string, unknown>) || { id: "founder-pitch", type: "pitch", data: {} };
  const data = (first.data as Record<string, unknown>) || {};
  blocks[0] = { ...first, data: { ...data, pitchStatus } };

  const { error: updateErr } = await supabase
    .from("newsletter_posts")
    .update({ template_blocks: blocks })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("newsletter_posts")
    .delete()
    .eq("id", id)
    .eq("category", "__founder_pitch__");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
