"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Loader2, Mail, PenSquare, Search, Send, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";
import type { NewsletterPostRow } from "@/lib/beehiiv-db";

export default function BeehiivAdminPostsPage() {
  const [posts, setPosts] = useState<NewsletterPostRow[]>([]);
  const [tab, setTab] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("newsletter_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    setPosts((data ?? []) as NewsletterPostRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function notify(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  async function handleSendEmail(post: NewsletterPostRow) {
    if (!window.confirm(`Send "${post.title}" to all active subscribers now?`)) return;
    setSendingId(post.id);
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(`Error: ${data.error}`);
      } else {
        notify(
          data.dryRun
            ? `Logged campaign for ${data.recipientCount} subscribers (add RESEND_API_KEY in .env.local for live delivery).`
            : `Sent email to ${data.recipientCount} subscribers via Resend!`
        );
        await load();
      }
    } finally {
      setSendingId(null);
    }
  }

  async function handleDelete(post: NewsletterPostRow) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    const supabase = createClient();
    await supabase.from("newsletter_posts").delete().eq("id", post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    notify("Post deleted.");
  }

  const filtered = posts.filter((p) => {
    const matchTab = tab === "all" || p.status === tab;
    const matchQ = !query.trim() || p.title.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQ;
  });

  return (
    <AdminShell title="Posts">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-[#18181B]">Posts</h1>
          <p className="mt-1 text-[13.5px] text-[#6E6D6A]">
            Write, schedule, publish to your website, and send newsletter issues to subscribers.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#18181B] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#27272A]"
        >
          <PenSquare className="h-4 w-4" />
          Start Writing
        </Link>
      </div>

      {toastMsg && (
        <div className="mt-4 rounded-xl border border-[#18181B] bg-white px-4 py-2.5 text-[13px] font-medium text-[#18181B]">
          {toastMsg}
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-[#EAE8E3] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE8E3] pb-4">
          <div className="flex gap-1.5">
            {(["all", "published", "draft", "scheduled"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-medium capitalize ${
                  tab === t ? "bg-[#18181B] text-white" : "bg-[#F5F4F0] text-[#6E6D6A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8B87]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="h-9 w-full rounded-xl border border-[#EAE8E3] bg-[#F7F6F3] pl-9 pr-3 text-[13px]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[#6E6D6A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading posts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] font-medium text-[#18181B]">No posts here yet</p>
            <Link
              href="/admin/posts/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-[12.5px] font-medium text-white"
            >
              <PenSquare className="h-3.5 w-3.5" />
              Write Your First Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE8E3]">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="truncate text-[15px] font-semibold text-[#18181B] hover:underline"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${
                        post.status === "published"
                          ? "bg-[#18181B] text-white"
                          : "bg-[#EFECE6] text-[#6E6D6A]"
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.publish_to_web && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#F5F4F0] px-1.5 py-0.5 text-[10.5px] text-[#52524E]">
                        <Globe className="h-3 w-3" /> Web
                      </span>
                    )}
                    {post.send_email && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#F5F4F0] px-1.5 py-0.5 text-[10.5px] text-[#52524E]">
                        <Mail className="h-3 w-3" /> Email ({post.emails_sent_count})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-[#6E6D6A]">
                    {post.category} · {post.read_time} · /{post.slug}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="rounded-xl border border-[#EAE8E3] bg-white px-3 py-1.5 text-[12px] font-medium hover:bg-[#F7F6F3]"
                  >
                    Edit
                  </Link>
                  {post.status === "published" && (
                    <button
                      type="button"
                      disabled={sendingId === post.id}
                      onClick={() => handleSendEmail(post)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#18181B] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                    >
                      {sendingId === post.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      Send Email
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="rounded-xl border border-[#EAE8E3] p-1.5 text-[#6E6D6A] hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
