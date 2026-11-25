"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Mail, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "About Me", href: "/about" },
  { label: "Vibe Fuel", href: "/vibe-fuel" },
  { label: "Vibe Labs", href: "/vibe-labs" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Daily Grind", href: "/daily-grind" },
];

export function SiteSubpageHeader({ theme = "cream" }: { theme?: "cream" | "navy" }) {
  const pathname = usePathname();
  const isNavy = theme === "navy";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        isNavy
          ? "border-white/10 bg-[#0E1B2A]/90 text-[#F8EAE0]"
          : "border-[#0E1B2A]/10 bg-[#F8EAE0]/90 text-[#0E1B2A]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-4">
        <Link
          href="/"
          data-magnetic="true"
          className={`inline-flex items-center gap-2 font-display text-[14px] font-extrabold uppercase tracking-[-0.03em] transition hover:text-[#F04E18] sm:text-[15px] ${
            isNavy ? "text-[#F8EAE0]" : "text-[#0E1B2A]"
          }`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 shadow-[2px_2px_0px_#F04E18] ${
              isNavy
                ? "border-white/25 bg-white/10 text-white"
                : "border-[#0E1B2A] bg-[#0E1B2A] text-[#F8EAE0]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span>Ankur Fulzele</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-5 font-mono-tech text-[11px] font-bold uppercase tracking-[0.16em] md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${
                  active
                    ? "text-[#F04E18] underline decoration-2 underline-offset-4"
                    : isNavy
                      ? "text-[#F8EAE0]/70 hover:text-[#F04E18]"
                      : "text-[#0E1B2A]/70 hover:text-[#F04E18]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/newsletter"
            data-magnetic="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F04E18] px-3.5 py-2 font-display text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(240,78,24,0.28)] transition hover:bg-[#d84110] sm:px-4 sm:text-[12.5px]"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>SaaS Vibes</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border md:hidden ${
              isNavy
                ? "border-white/20 bg-white/10 text-white"
                : "border-[#0E1B2A]/20 bg-white text-[#0E1B2A]"
            }`}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div
          className={`border-t px-4 pb-5 pt-3 md:hidden ${
            isNavy
              ? "border-white/10 bg-[#0E1B2A]/98 text-[#F8EAE0]"
              : "border-[#0E1B2A]/10 bg-[#F8EAE0]/98 text-[#0E1B2A]"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 font-display text-[15px] font-bold transition ${
                    active
                      ? "bg-[#F04E18] text-white"
                      : isNavy
                        ? "hover:bg-white/10"
                        : "hover:bg-[#0E1B2A]/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
