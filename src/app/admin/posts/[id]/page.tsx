"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { PostEditor } from "@/components/PostEditor";
import { createClient } from "@/lib/supabase/client";
import type { NewsletterPostRow } from "@/lib/beehiiv-db";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<NewsletterPostRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("newsletter_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as NewsletterPostRow | null) || null);
        setLoading(false);
      });
  }, [id]);

  return (
    <AdminShell title="Edit Post">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[#6E6D6A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading editor...
        </div>
      ) : (
        <PostEditor initialPost={post} />
      )}
    </AdminShell>
  );
}
