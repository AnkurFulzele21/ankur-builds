"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function NewsletterScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Strip any legacy #hash from URL so reloads never jump to an anchor
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const navEntry = performance.getEntriesByType?.("navigation")?.[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navEntry?.type === "reload";

    if (pathname === "/newsletter" || isReload) {
      const resetTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      resetTop();
      const raf = window.requestAnimationFrame(resetTop);
      const t1 = window.setTimeout(resetTop, 60);
      const t2 = window.setTimeout(resetTop, 180);

      const handleBeforeUnload = () => {
        window.scrollTo(0, 0);
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.cancelAnimationFrame(raf);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
