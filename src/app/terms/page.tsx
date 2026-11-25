import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — SaaS Vibes",
  description:
    "Terms of Service for reading and subscribing to the SaaS Vibes newsletter and AI Builder Vault on ankurfulzele.in.",
};

export default function TermsOfServicePage() {
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
            <FileText className="h-3.5 w-3.5" />
            Legal · SaaS Vibes Newsletter
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-[13.5px] font-medium text-[#0E1B2A]/60">
            Effective Date: November 2026 · Operated by Ankur Fulzele (ankurfulzele.in)
          </p>

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[#0E1B2A]/85">
            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                1. Newsletter Subscription
              </h2>
              <p className="mt-2">
                By subscribing to <strong>SaaS Vibes</strong> on{" "}
                <strong>ankurfulzele.in</strong>, you agree to receive our free Wednesday &amp;
                Sunday newsletter issues, our 7-day onboarding sequence, and occasional product
                announcements. You may opt out at any time with 1 click via any email footer or the{" "}
                <Link href="/unsubscribe" className="font-bold text-[#F04E18] underline">
                  Unsubscribe page
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                2. Informational &amp; Educational Content
              </h2>
              <p className="mt-2">
                All case studies, revenue breakdowns, code snippets, AI prompts, GitHub repos, and
                distribution strategies published in SaaS Vibes are provided for educational and
                informational purposes only. We do not guarantee specific financial or business
                outcomes from applying these playbooks.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                3. Intellectual Property
              </h2>
              <p className="mt-2">
                Unless explicitly marked open-source, all original essays, teardowns, branding, and
                curated guides published under <strong>SaaS Vibes</strong> belong to Ankur Fulzele.
                You are welcome to quote short excerpts with attribution and a link back to{" "}
                <strong>ankurfulzele.in/newsletter</strong>, but please do not republish entire
                issues without permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                4. Third-Party Links &amp; Tools
              </h2>
              <p className="mt-2">
                Our issues frequently link to third-party SaaS products, GitHub repositories, and
                AI developer tools. We are not responsible for the content, availability, or
                privacy practices of external websites.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B2A]">
                5. Changes &amp; Contact
              </h2>
              <p className="mt-2">
                We may update these Terms as SaaS Vibes evolves. If you have questions, email{" "}
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
          <Link href="/privacy" className="hover:text-[#F04E18]">
            Privacy Policy
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
