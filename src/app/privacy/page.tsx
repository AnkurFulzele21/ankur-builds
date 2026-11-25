import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — SaaS Vibes",
  description:
    "How SaaS Vibes (ankurfulzele.in) collects, uses, and protects your email address and subscriber data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8EAE0] text-[#0E1B2A]">
      <header className="sticky top-0 z-30 border-b border-[#0E1B2A]/10 bg-[#F8EAE0]/90 backdrop-blur-xl">
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
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0E1B2A] bg-white px-4 py-1.5 text-[12.5px] font-bold transition hover:bg-[#0E1B2A] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Newsletter
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-[28px] border-2 border-[#0E1B2A] bg-white p-7 shadow-[8px_8px_0px_#0E1B2A] sm:p-11">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8EAE0] px-3.5 py-1 font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#F04E18]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Legal · SaaS Vibes Newsletter
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-[13.5px] font-medium text-[#0E1B2A]/60">
            Effective Date: November 2026 · Operated by Ankur Fulzele (ankurfulzele.in)
          </p>

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[#0E1B2A]/85">
            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                1. What We Collect
              </h2>
              <p className="mt-2">
                When you subscribe to <strong>SaaS Vibes</strong>, we collect only the information
                you voluntarily provide:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Email address</strong> (required to deliver our Wednesday &amp; Sunday
                  issues and onboarding sequence).
                </li>
                <li>
                  <strong>First name</strong> (optional, used solely to personalize your emails).
                </li>
                <li>
                  <strong>Signup source &amp; referral code</strong> (so we know which page or
                  reader referred you).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                2. How We Use Your Data
              </h2>
              <p className="mt-2">
                We use your email strictly to send you the <strong>SaaS Vibes</strong> newsletter
                (Wednesday SaaS Story, Sunday Weekend Brief, and the 7-day onboarding sequence) and
                occasional updates about tools or resources we build.{" "}
                <strong>We never sell, rent, or trade your email address to third parties.</strong>
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                3. Service Providers (Sub-Processors)
              </h2>
              <p className="mt-2">
                To run SaaS Vibes reliably, your subscriber record is stored securely in{" "}
                <strong>Supabase</strong> (PostgreSQL database) and emails are delivered via{" "}
                <strong>Resend</strong>. Both providers maintain industry-standard encryption and
                security practices.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                4. Unsubscribe &amp; Data Deletion (1-Click)
              </h2>
              <p className="mt-2">
                Every email we send includes a 1-click <strong>Unsubscribe</strong> button at the
                bottom and supports RFC-8058 one-click unsubscribe in Gmail and Apple Mail. You can
                also unsubscribe anytime on our{" "}
                <Link href="/unsubscribe" className="font-bold text-[#F04E18] underline">
                  Unsubscribe page
                </Link>
                . To request permanent deletion of your data, email{" "}
                <a
                  href="mailto:hello@ankurfulzele.in"
                  className="font-bold text-[#0E1B2A] underline"
                >
                  hello@ankurfulzele.in
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                5. Contact
              </h2>
              <p className="mt-2">
                Questions about this Privacy Policy? Reach out directly at{" "}
                <a
                  href="mailto:hello@ankurfulzele.in"
                  className="font-bold text-[#F04E18] underline"
                >
                  hello@ankurfulzele.in
                </a>
                .
              </p>
            </section>
          </div>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[12.5px] font-semibold text-[#0E1B2A]/65">
          <Link href="/newsletter" className="hover:text-[#F04E18]">
            Newsletter
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#F04E18]">
            Terms of Service
          </Link>
          <span>·</span>
          <Link href="/unsubscribe" className="hover:text-[#F04E18]">
            Unsubscribe
          </Link>
        </footer>
      </main>
    </div>
  );
}
