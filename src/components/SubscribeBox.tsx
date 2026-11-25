"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

interface SubscribeBoxProps {
  compact?: boolean;
  placeholder?: string;
  buttonLabel?: string;
}

export function SubscribeBox({
  compact = false,
  placeholder = "Where should we send the good stuff?",
  buttonLabel = "Catch the Vibes",
}: SubscribeBoxProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Could not subscribe.");
        return;
      }
      setStatus("done");
      setMessage(data.added ? "You're subscribed! Welcome aboard." : "You're already on the list!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-900">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-2" : "flex flex-col gap-2 sm:flex-row"}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="h-11 flex-1 rounded-xl border border-[#E5E3DC] bg-white px-3.5 text-[13.5px] text-[#18181B] placeholder:text-[#8C8B87] focus:border-[#18181B] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#18181B] px-5 text-[13.5px] font-medium text-white transition hover:bg-[#27272A] disabled:opacity-60 ${
          compact ? "w-full" : "shrink-0"
        }`}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {buttonLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
      {status === "error" && <p className="text-[12px] text-red-700">{message}</p>}
    </form>
  );
}
