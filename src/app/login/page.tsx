"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8EAE0] p-6 text-[#0E1B2A]">
      <div className="w-full max-w-md rounded-[28px] border-2 border-[#0E1B2A] bg-white p-8 shadow-[8px_8px_0px_#0E1B2A]">
        <div className="flex items-center justify-between">
          <Link href="/newsletter" className="flex items-center gap-2 font-display font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#0E1B2A] bg-[#F04E18] text-white shadow-[2px_2px_0px_#0E1B2A]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              SaaS <span className="text-[#F04E18]">Vibes</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F8EAE0] px-2.5 py-1 font-mono-tech text-[10.5px] font-bold uppercase text-[#0E1B2A]">
            <Lock className="h-3 w-3 text-[#F04E18]" />
            Studio Login
          </span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
          Sign in to Admin Studio
        </h1>
        <p className="mt-1 text-[13.5px] text-[#0E1B2A]/65">
          Authorized publisher access only.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@ankurfulzele.in"
            className="h-11 w-full rounded-xl border border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-3.5 text-[13.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-11 w-full rounded-xl border border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-3.5 text-[13.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0E1B2A] font-display text-[14px] font-bold text-white transition hover:bg-[#F04E18] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
