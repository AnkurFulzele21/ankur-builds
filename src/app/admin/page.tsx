"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Gauge,
  HardDrive,
  Loader2,
  Mail,
  PenSquare,
  Send,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";
import type { DispatchRow, NewsletterPostRow, SubscriberRow } from "@/lib/beehiiv-db";

interface UsageMetrics {
  storage: {
    usedBytes: number;
    limitBytes: number;
    fileCount: number;
    usedPercent: number;
  };
  resend: {
    sentThisMonth: number;
    limitMonth: number;
    remainingMonth: number;
    monthPercent: number;
    sentToday: number;
    limitDay: number;
    remainingToday: number;
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function BeehiivAdminDashboard() {
  const [posts, setPosts] = useState<NewsletterPostRow[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRow[]>([]);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [pRes, sRes, dRes, uRes] = await Promise.all([
        supabase
          .from("newsletter_posts")
          .select("*")
          .neq("category", "__founder_pitch__")
          .order("created_at", { ascending: false }),
        supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false }),
        supabase
          .from("email_dispatches")
          .select("*")
          .order("sent_at", { ascending: false })
          .limit(8),
        fetch("/api/admin/usage")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      setPosts((pRes.data ?? []) as NewsletterPostRow[]);
      setSubscribers((sRes.data ?? []) as SubscriberRow[]);
      setDispatches((dRes.data ?? []) as DispatchRow[]);
      if (uRes) setUsage(uRes as UsageMetrics);
      setLoading(false);
    }
    load();
  }, []);

  const activeSubs = subscribers.filter((s) => s.status === "active");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const totalEmailsSent = posts.reduce((s, p) => s + (p.emails_sent_count || 0), 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = subscribers.filter((s) => (s.subscribed_at || "").startsWith(key)).length;
    return { key, label, count };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const storagePct = usage?.storage.usedPercent ?? 0;
  const resendPct = usage?.resend.monthPercent ?? 0;

  return (
    <AdminShell title="Dashboard">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[12.5px] text-[#6E6D6A]">SaaS Vibes · Supabase PostgreSQL + Resend</p>
          <h1 className="mt-0.5 text-[28px] font-semibold tracking-tight text-[#18181B]">
            Publication Overview
          </h1>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#18181B] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#27272A]"
        >
          <PenSquare className="h-4 w-4" />
          Start Writing
        </Link>
      </div>

      {/* Primary KPI Cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5">
          <div className="flex items-center justify-between text-[12.5px] text-[#6E6D6A]">
            <span>Active Subscribers</span>
            <Users className="h-4 w-4 text-[#18181B]" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-[#18181B]">
            {activeSubs.length}
          </p>
          <p className="mt-1 text-[11.5px] text-[#6E6D6A]">{subscribers.length} total contacts</p>
        </div>

        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5">
          <div className="flex items-center justify-between text-[12.5px] text-[#6E6D6A]">
            <span>Published Posts</span>
            <FileText className="h-4 w-4 text-[#18181B]" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-[#18181B]">
            {publishedPosts.length}
          </p>
          <p className="mt-1 text-[11.5px] text-[#6E6D6A]">
            {posts.filter((p) => p.status === "draft").length} drafts saved
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5">
          <div className="flex items-center justify-between text-[12.5px] text-[#6E6D6A]">
            <span>All-Time Emails Sent</span>
            <Send className="h-4 w-4 text-[#18181B]" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-[#18181B]">
            {Math.max(totalEmailsSent, usage?.resend.sentThisMonth ?? 0)}
          </p>
          <p className="mt-1 text-[11.5px] text-[#6E6D6A]">{dispatches.length} recent dispatches</p>
        </div>
      </section>

      {/* Live Infrastructure Quota KPIs: Supabase Storage + Resend Email Limits */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Supabase Storage Quota */}
        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0E1B2A]/8 text-[#0E1B2A]">
                <HardDrive className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#0E1B2A]">Supabase Media Storage</p>
                <p className="text-[11px] text-[#6E6D6A]">
                  Bucket: newsletter-media · {usage?.storage.fileCount ?? 0} files
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#F5F4F0] px-2.5 py-1 font-mono text-[11px] font-bold text-[#0E1B2A]">
              {storagePct}% used
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-[#0E1B2A]">
              {usage ? formatBytes(usage.storage.usedBytes) : "—"}
              <span className="ml-1.5 text-[13px] font-medium text-[#6E6D6A]">/ 1 GB</span>
            </p>
            <span className="text-[12px] font-semibold text-emerald-700">
              {usage
                ? `${formatBytes(Math.max(0, usage.storage.limitBytes - usage.storage.usedBytes))} left`
                : "Free Tier"}
            </span>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F0EC]">
            <div
              style={{ width: `${Math.max(storagePct, usage && usage.storage.usedBytes > 0 ? 2 : 0)}%` }}
              className={`h-full rounded-full transition-all ${
                storagePct > 90
                  ? "bg-red-500"
                  : storagePct > 75
                  ? "bg-amber-500"
                  : "bg-[#0E1B2A]"
              }`}
            />
          </div>
        </div>

        {/* Resend API Email Quota (Monthly + Daily) */}
        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4EF] text-[#F04E18]">
                <Gauge className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#0E1B2A]">Resend Monthly Email Quota</p>
                <p className="text-[11px] text-[#6E6D6A]">
                  Today: {usage?.resend.sentToday ?? 0} / {usage?.resend.limitDay ?? 100} daily limit
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#FFF4EF] px-2.5 py-1 font-mono text-[11px] font-bold text-[#F04E18]">
              {resendPct}% used
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold tabular-nums text-[#0E1B2A]">
              {usage ? usage.resend.sentThisMonth.toLocaleString() : "—"}
              <span className="ml-1.5 text-[13px] font-medium text-[#6E6D6A]">
                / {(usage?.resend.limitMonth ?? 3000).toLocaleString()} emails
              </span>
            </p>
            <span className="text-[12px] font-semibold text-emerald-700">
              {usage ? `${usage.resend.remainingMonth.toLocaleString()} left this mo` : "Free Tier"}
            </span>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F0EC]">
            <div
              style={{
                width: `${Math.max(resendPct, usage && usage.resend.sentThisMonth > 0 ? 2 : 0)}%`,
              }}
              className={`h-full rounded-full transition-all ${
                resendPct > 90
                  ? "bg-red-500"
                  : resendPct > 75
                  ? "bg-amber-500"
                  : "bg-[#F04E18]"
              }`}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#6E6D6A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading publication data...
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          {/* 14-Day Subscriber Growth Chart */}
          <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 lg:col-span-7">
            <h2 className="text-[15px] font-semibold text-[#18181B]">
              New Subscribers (Last 14 Days)
            </h2>
            <div className="mt-6 flex h-44 items-end gap-2">
              {days.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    title={`${d.label}: ${d.count}`}
                    style={{ height: `${Math.max(8, Math.round((d.count / maxDay) * 130))}px` }}
                    className={`w-full max-w-[26px] rounded-t-md ${
                      d.count > 0 ? "bg-[#18181B]" : "bg-[#EAE7E0]"
                    }`}
                  />
                  <span className="text-[10px] text-[#8C8B87]">{d.label.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Email Dispatches */}
          <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 lg:col-span-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#18181B]">
              <Mail className="h-4 w-4" />
              Recent Email Dispatches
            </h2>
            {dispatches.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-[#8C8B87]">
                No email campaigns dispatched yet. Publish a post to send your first issue!
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EAE8E3]">
                {dispatches.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3 text-[12.5px]">
                    <div className="min-w-0 pr-3">
                      <p className="truncate font-medium text-[#18181B]">{d.subject}</p>
                      <p className="text-[11px] text-[#6E6D6A]">
                        {d.recipient_count} recipients · {d.provider}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-[#8C8B87]">
                      {new Date(d.sent_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
}
