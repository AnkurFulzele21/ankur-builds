"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, MailX, RotateCcw, Sparkles } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "unsubscribed" | "resubscribed" | "error">(
    initialEmail ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");

  async function processUnsubscribe(targetEmail: string) {
    const cleaned = targetEmail.trim().toLowerCase();
    if (!cleaned || !cleaned.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(cleaned)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      });
      if (!res.ok) throw new Error("Failed to unsubscribe. Please try again.");
      setEmail(cleaned);
      setStatus("unsubscribed");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleResubscribe() {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "resubscribe" }),
      });
      if (!res.ok) throw new Error("Could not re-subscribe right now.");
      setStatus("resubscribed");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to re-subscribe.");
    }
  }

  useEffect(() => {
    if (initialEmail) {
      void processUnsubscribe(initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  return (
    <div className="w-full max-w-md rounded-[28px] border-2 border-[#0E1B2A] bg-white p-7 text-center shadow-[8px_8px_0px_#0E1B2A] sm:p-9">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[3px_3px_0px_#0E1B2A]">
        {status === "unsubscribed" || status === "resubscribed" ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <MailX className="h-6 w-6" />
        )}
      </div>

      {status === "loading" ? (
        <div className="py-6">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#F04E18]" />
          <p className="mt-3 text-[14.5px] font-semibold text-[#0E1B2A]/75">
            Updating your subscription preferences...
          </p>
        </div>
      ) : status === "unsubscribed" ? (
        <>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
            You&apos;ve been unsubscribed
          </h1>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#0E1B2A]/75">
            <strong className="text-[#0E1B2A]">{email}</strong> has been removed from future{" "}
            <strong>SaaS Vibes</strong> issues and automated sequences. No hard feelings!
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/newsletter"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E1B2A] px-5 py-3 font-display text-[13.5px] font-bold text-[#F8EAE0] transition hover:bg-[#F04E18]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to SaaS Vibes Archive
            </Link>
            <button
              type="button"
              onClick={handleResubscribe}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#0E1B2A]/20 bg-[#F8EAE0]/50 px-5 py-2.5 text-[12.5px] font-bold text-[#0E1B2A]/80 transition hover:border-[#0E1B2A] hover:bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clicked by mistake? Re-subscribe
            </button>
          </div>
        </>
      ) : status === "resubscribed" ? (
        <>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
            Welcome back!
          </h1>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#0E1B2A]/75">
            <strong className="text-[#0E1B2A]">{email}</strong> is back on the{" "}
            <strong>SaaS Vibes</strong> list. See you Wednesday &amp; Sunday!
          </p>
          <Link
            href="/newsletter"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F04E18] px-5 py-3 font-display text-[13.5px] font-bold text-white transition hover:bg-[#d84110]"
          >
            Browse Latest Issues
          </Link>
        </>
      ) : (
        <>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
            Unsubscribe from SaaS Vibes
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#0E1B2A]/70">
            Enter your email address below and we&apos;ll immediately stop sending you newsletter
            issues and sequence emails.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void processUnsubscribe(email);
            }}
            className="mt-5 space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-4 py-3 text-[14px] font-medium text-[#0E1B2A] placeholder:text-[#0E1B2A]/45 focus:border-[#F04E18] focus:bg-white focus:outline-none"
            />
            {message && (
              <p className="text-[12.5px] font-semibold text-[#F04E18]">{message}</p>
            )}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E1B2A] px-5 py-3 font-display text-[14px] font-bold text-white transition hover:bg-[#F04E18]"
            >
              Unsubscribe Me
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8EAE0] text-[#0E1B2A]">
      <header className="border-b border-[#0E1B2A]/10 bg-[#F8EAE0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/newsletter" className="inline-flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[2px_2px_0px_#0E1B2A]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-extrabold uppercase tracking-[-0.03em]">
              SaaS <span className="text-[#F04E18]">Vibes</span>
            </span>
          </Link>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#0E1B2A]/75 hover:text-[#F04E18]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Newsletter
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0E1B2A]/70">
              <Loader2 className="h-4 w-4 animate-spin text-[#F04E18]" />
              Loading...
            </div>
          }
        >
          <UnsubscribeContent />
        </Suspense>

        <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[12px] font-semibold text-[#0E1B2A]/60">
          <Link href="/privacy" className="hover:text-[#F04E18]">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#F04E18]">
            Terms of Service
          </Link>
        </footer>
      </main>
    </div>
  );
}
