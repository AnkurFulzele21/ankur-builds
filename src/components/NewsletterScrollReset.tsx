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
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      const raf = window.requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => window.cancelAnimationFrame(raf);
    }
  }, [pathname]);

  return null;
}
