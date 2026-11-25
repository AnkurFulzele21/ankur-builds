import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function markUnsubscribed(email: string) {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || !cleaned.includes("@")) return false;
  const supabase = await createClient();
  await supabase
    .from("subscribers")
    .update({ status: "unsubscribed" })
    .eq("email", cleaned);
  return true;
}

/**
 * RFC-8058 One-Click Unsubscribe (POST) used automatically by Gmail & Yahoo.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let email = searchParams.get("email") || "";
  if (!email) {
    try {
      const body = await request.json();
      email = String(body.email || "");
    } catch {
      // Ignore non-JSON bodies from mail clients
    }
  }
  await markUnsubscribed(email);
  return NextResponse.json({ unsubscribed: true });
}

/**
 * Human-friendly 1-click unsubscribe redirect (GET) -> lands on /unsubscribe UI.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  if (email) {
    await markUnsubscribed(email);
  }
  const dest = new URL("/unsubscribe", url.origin);
  if (email) dest.searchParams.set("email", email);
  return NextResponse.redirect(dest, 302);
}
