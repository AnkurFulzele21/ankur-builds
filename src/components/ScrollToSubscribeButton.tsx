"use client";

export function ScrollToSubscribeButton({ accentColor }: { accentColor: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const el = document.getElementById("subscribe-footer");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      style={{ backgroundColor: accentColor }}
      className="rounded-full px-4 py-1.5 font-display text-[13px] font-bold text-white transition hover:opacity-90"
    >
      Subscribe
    </button>
  );
}
