import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1 GB Free Tier
const RESEND_MONTHLY_LIMIT = 3000; // Resend Free Tier: 3,000 emails/month
const RESEND_DAILY_LIMIT = 100; // Resend Free Tier: 100 emails/day

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Admin login required" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    const [rootFilesRes, uploadFilesRes, monthDispatchRes, todayDispatchRes] =
      await Promise.all([
        supabase.storage.from("newsletter-media").list("", { limit: 1000 }),
        supabase.storage.from("newsletter-media").list("uploads", { limit: 1000 }),
        supabase
          .from("email_dispatches")
          .select("recipient_count, provider")
          .gte("sent_at", startOfMonth),
        supabase
          .from("email_dispatches")
          .select("recipient_count, provider")
          .gte("sent_at", startOfToday),
      ]);

    const allFiles = [
      ...(rootFilesRes.data ?? []).filter((f) => f.id !== null),
      ...(uploadFilesRes.data ?? []).filter((f) => f.id !== null),
    ];

    let usedBytes = 0;
    for (const file of allFiles) {
      const size = Number((file.metadata as { size?: number } | null)?.size ?? 0);
      if (Number.isFinite(size)) usedBytes += size;
    }

    const sentThisMonth = (monthDispatchRes.data ?? []).reduce(
      (sum, row) => sum + (Number(row.recipient_count) || 0),
      0
    );
    const sentToday = (todayDispatchRes.data ?? []).reduce(
      (sum, row) => sum + (Number(row.recipient_count) || 0),
      0
    );

    return NextResponse.json({
      storage: {
        usedBytes,
        limitBytes: SUPABASE_STORAGE_LIMIT_BYTES,
        fileCount: allFiles.length,
        usedPercent: Math.min(
          100,
          Number(((usedBytes / SUPABASE_STORAGE_LIMIT_BYTES) * 100).toFixed(2))
        ),
      },
      resend: {
        sentThisMonth,
        limitMonth: RESEND_MONTHLY_LIMIT,
        remainingMonth: Math.max(0, RESEND_MONTHLY_LIMIT - sentThisMonth),
        monthPercent: Math.min(
          100,
          Number(((sentThisMonth / RESEND_MONTHLY_LIMIT) * 100).toFixed(1))
        ),
        sentToday,
        limitDay: RESEND_DAILY_LIMIT,
        remainingToday: Math.max(0, RESEND_DAILY_LIMIT - sentToday),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load usage metrics" },
      { status: 500 }
    );
  }
}
