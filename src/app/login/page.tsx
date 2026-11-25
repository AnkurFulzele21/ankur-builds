"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "forgot" | "update">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
        setError("");
        setInfo("Recovery verified — enter your new password below.");
      }
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "unauthorized") {
        setError("This email is not on the authorized admin list.");
      }
      const code = params.get("code");
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ error: exErr }) => {
          if (exErr) {
            setError(exErr.message);
          } else {
            setMode("update");
            setInfo("Recovery verified — enter your new password below.");
          }
        });
      } else if (params.get("mode") === "reset") {
        setMode("update");
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/login?mode=reset`
            : "https://ankurfulzele.in/login?mode=reset";
        const { error: err } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        );
        if (err) {
          setError(err.message);
          return;
        }
        setInfo("Password reset link sent! Check your inbox and spam folder.");
        return;
      }

      if (mode === "update") {
        const { error: err } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (err) {
          setError(err.message);
          return;
        }
        setInfo("Password updated! Signing you in...");
        router.push("/admin");
        router.refresh();
        return;
      }

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
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F8EAE0] px-2.5 py-1 font-display text-[11.5px] font-bold text-[#0E1B2A]">
            <Lock className="h-3 w-3 text-[#F04E18]" />
            Studio Login
          </span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-[#0E1B2A]">
          {mode === "forgot"
            ? "Reset Admin Password"
            : mode === "update"
              ? "Set New Password"
              : "Sign in to Admin Studio"}
        </h1>
        <p className="mt-1 text-[13.5px] text-[#0E1B2A]/65">
          {mode === "forgot"
            ? "Enter your admin email to receive a password reset link."
            : mode === "update"
              ? "Choose a new password (at least 6 characters)."
              : "Authorized publisher access only."}
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] font-medium text-red-800">
            {error}
          </div>
        )}

        {info && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode !== "update" && (
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ankurfulzele867@gmail.com"
              className="h-11 w-full rounded-xl border border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-3.5 text-[13.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
            />
          )}

          {mode === "signin" && (
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-3.5 text-[13.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
            />
          )}

          {mode === "update" && (
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="h-11 w-full rounded-xl border border-[#0E1B2A]/20 bg-[#F8EAE0]/30 px-3.5 text-[13.5px] font-medium text-[#0E1B2A] focus:border-[#F04E18] focus:bg-white focus:outline-none"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0E1B2A] font-display text-[14px] font-bold text-white transition hover:bg-[#F04E18] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "forgot"
                  ? "Send Reset Link"
                  : mode === "update"
                    ? "Save New Password"
                    : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError("");
                setInfo("");
              }}
              className="font-display text-[12.5px] font-bold text-[#0E1B2A]/65 transition hover:text-[#F04E18]"
            >
              Forgot password? Send reset link
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
              className="font-display text-[12.5px] font-bold text-[#0E1B2A]/65 transition hover:text-[#F04E18]"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
