import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDrafts = searchParams.get("all") === "true";

  const supabase = await createClient();
  let includeDrafts = false;
  if (requestedDrafts) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    includeDrafts = Boolean(user);
  }

  let query = supabase
    .from("newsletter_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (!includeDrafts) {
    query = query.eq("status", "published").eq("publish_to_web", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ posts: data ?? [] });
}
