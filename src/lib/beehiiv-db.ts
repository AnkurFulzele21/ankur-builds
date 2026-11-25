import { createClient } from "@/lib/supabase/client";
import type { TemplateBlock } from "@/lib/newsletter-blocks";

export interface SiteSettings {
  id: string;
  owner_name: string;
  owner_handle: string;
  location: string;
  bio: string;
  publication_name: string;
  publication_tagline: string;
  sender_name: string;
  sender_email: string;
  twitter_url: string;
}

export interface PortfolioProjectRow {
  id: string;
  name: string;
  tagline: string;
  status: "Live" | "Building" | "Open Source" | "Sold";
  metric_label: string;
  url: string;
  sparkline: number[];
  position: number;
}

export interface NewsletterPostRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content_markdown: string;
  thumbnail_url: string | null;
  category: string;
  read_time: string;
  status: "draft" | "scheduled" | "published";
  featured: boolean;
  publish_to_web: boolean;
  send_email: boolean;
  email_subject: string | null;
  email_preview_text: string | null;
  audience_segment: string;
  views_count: number;
  emails_sent_count: number;
  opens_count: number;
  clicks_count: number;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  template_theme?: string;
  template_blocks?: TemplateBlock[];
}

export interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed" | "bounced";
  source: string;
  tags: string[];
  referral_code: string | null;
  subscribed_at: string;
}

export interface DispatchRow {
  id: string;
  post_id: string | null;
  subject: string;
  recipient_count: number;
  provider: string;
  status: string;
  sent_at: string;
}

export async function uploadNewsletterMedia(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "png";
  const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("newsletter-media").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("newsletter-media").getPublicUrl(filePath);
  return data.publicUrl;
}
