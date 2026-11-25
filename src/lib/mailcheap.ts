/**
 * Optional MailCheap (marclou/mailcheap) REST API v1 bridge.
 * When MAILCHEAP_URL and MAILCHEAP_SIGNUP_KEY are configured in .env.local,
 * every subscriber on ankurfulzele.in is automatically synced to MailCheap.
 */
export async function syncSubscriberToMailCheap(params: {
  email: string;
  name?: string | null;
  source?: string;
  tags?: string[];
}): Promise<{ synced: boolean; status?: number; error?: string }> {
  const baseUrl = process.env.MAILCHEAP_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.MAILCHEAP_SIGNUP_KEY?.trim();
  const newsletter = process.env.MAILCHEAP_NEWSLETTER_ID?.trim();

  if (!baseUrl || !apiKey) {
    return { synced: false };
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: params.email,
        firstName: params.name || undefined,
        source: params.source || "website",
        tags: params.tags?.length ? params.tags : undefined,
        newsletter: newsletter || undefined,
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return { synced: false, status: res.status, error: msg.slice(0, 200) };
    }

    return { synced: true, status: res.status };
  } catch (err) {
    return {
      synced: false,
      error: err instanceof Error ? err.message : "MailCheap sync failed",
    };
  }
}
