import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 1-click email poll link handler: GET /api/poll?postId=...&slug=...&rating=5
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const slug = searchParams.get("slug");
  const rating = Number(searchParams.get("rating"));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  if (postId && rating >= 1 && rating <= 5) {
    const supabase = await createClient();
    await supabase.from("poll_votes").insert({
      post_id: postId,
      rating,
    });
  }

  const target = slug ? `${siteUrl}/newsletter/${slug}?voted=${rating}` : `${siteUrl}/newsletter`;
  return NextResponse.redirect(target);
}

// Interactive web poll vote handler: POST /api/poll
export async function POST(request: Request) {
  const body = await request.json();
  const postId = String(body.postId || "");
  const rating = Number(body.rating);

  if (!postId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Valid postId and rating (1-5) required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("poll_votes").insert({
    post_id: postId,
    rating,
    voter_email: body.email || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: votes } = await supabase
    .from("poll_votes")
    .select("rating")
    .eq("post_id", postId);

  const list = (votes || []) as { rating: number }[];
  const totalVotes = list.length;
  const avgRating =
    totalVotes > 0 ? list.reduce((sum, v) => sum + v.rating, 0) / totalVotes : rating;

  return NextResponse.json({ ok: true, totalVotes, avgRating });
}
