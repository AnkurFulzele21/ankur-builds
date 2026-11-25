"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  MailCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isPostEditorRoute =
    pathname.startsWith("/admin/posts/new") ||
    (pathname.startsWith("/admin/posts/") && pathname !== "/admin/posts");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isPostEditorRoute);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Posts", href: "/admin/posts", icon: FileText },
    { label: "Sequences", href: "/admin/sequences", icon: MailCheck },
    { label: "Audience", href: "/admin/subscribers", icon: Users },
    { label: "Grow & Forms", href: "/admin/grow", icon: TrendingUp },
    { label: "Site & Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#ECEAE4] p-1.5 sm:p-3">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1680px] overflow-hidden rounded-[22px] border border-[#E5E3DC] bg-[#F7F6F3] shadow-[0_20px_60px_-24px_rgba(24,24,27,0.18)]">
        {/* Collapsible Left Sidebar */}
        <aside
          className={`hidden shrink-0 flex-col justify-between border-r border-[#EAE8E3] bg-[#F5F4F0] transition-all duration-200 lg:flex ${
            sidebarCollapsed ? "w-[68px] items-center p-2.5" : "w-[228px] p-4"
          }`}
        >
          <div className="w-full">
            <div
              className={`mb-4 flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between px-1"
              }`}
            >
              <Link
                href="/admin"
                className="flex items-center gap-2.5 py-1"
                title="SaaS Vibes Studio"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0E1B2A] text-white">
                  <Sparkles className="h-4 w-4 text-[#F04E18]" />
                </span>
                {!sidebarCollapsed && (
                  <div className="leading-tight">
                    <p className="text-[14px] font-extrabold tracking-tight text-[#0E1B2A]">
                      SaaS Vibes
                    </p>
                    <p className="text-[10.5px] font-medium text-[#6E6D6A]">Admin Studio</p>
                  </div>
                )}
              </Link>
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  title="Collapse sidebar"
                  className="rounded-lg p-1.5 text-[#6E6D6A] transition hover:bg-[#EAE8E3] hover:text-[#0E1B2A]"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              )}
            </div>

            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar"
                className="mb-3 flex h-9 w-full items-center justify-center rounded-xl border border-[#EAE8E3] bg-white text-[#6E6D6A] transition hover:text-[#0E1B2A]"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/admin/posts/new"
              title="Start Writing"
              className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E1B2A] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#F04E18] ${
                sidebarCollapsed ? "px-0" : "px-3"
              }`}
            >
              <PenSquare className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Start Writing</span>}
            </Link>

            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center rounded-xl py-2.5 text-[13.5px] transition ${
                      sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
                    } ${
                      active
                        ? "border border-[#EAE8E3] bg-white font-semibold text-[#0E1B2A] shadow-2xs"
                        : "text-[#6E6D6A] hover:bg-[#EFECE6] hover:text-[#0E1B2A]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 border-t border-[#EAE8E3] pt-4">
              {!sidebarCollapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[#8C8B87]">
                  Public Site
                </p>
              )}
              <Link
                href="/"
                title="Portfolio Home"
                className={`flex items-center rounded-xl py-2 text-[13px] text-[#6E6D6A] hover:bg-[#EFECE6] hover:text-[#0E1B2A] ${
                  sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-3"
                }`}
              >
                <Compass className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Portfolio Home</span>}
              </Link>
              <Link
                href="/newsletter"
                title="Newsletter Archive"
                className={`flex items-center rounded-xl py-2 text-[13px] text-[#6E6D6A] hover:bg-[#EFECE6] hover:text-[#0E1B2A] ${
                  sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-3"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Newsletter Archive</span>}
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className={`flex w-full items-center rounded-xl border border-[#EAE8E3] bg-white py-2 text-[12.5px] font-medium text-[#6E6D6A] transition hover:text-[#0E1B2A] ${
              sidebarCollapsed ? "justify-center px-0" : "gap-2 px-3"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#F7F6F3] px-5 py-3">
            <div className="flex items-center gap-2.5 text-[12.5px] text-[#6E6D6A]">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
                className="hidden rounded-lg border border-[#EAE8E3] bg-white p-1.5 text-[#6E6D6A] transition hover:text-[#0E1B2A] lg:inline-flex"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="h-2 w-2 rounded-full bg-[#F04E18]" />
              <span>Studio</span>
              <span>/</span>
              <span className="font-semibold text-[#0E1B2A]">{title}</span>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E1B2A] px-3.5 py-1.5 text-[12.5px] font-medium text-white lg:hidden"
            >
              <PenSquare className="h-3.5 w-3.5" />
              Write
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
