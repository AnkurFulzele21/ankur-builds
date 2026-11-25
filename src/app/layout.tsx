import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0E1B2A",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ankurfulzele.in"),
  alternates: {
    canonical: "/",
  },
  title: "Ankur Fulzele — Ship SaaS on vibes.",
  description:
    "Ship SaaS on vibes. Interactive studio of Ankur Fulzele (ankurfulzele.in) — vibe-coding micro-SaaS products with AI, shipping in public, and publishing SaaS Vibes every Wednesday & Sunday.",
  openGraph: {
    title: "Ankur Fulzele — Ship SaaS on vibes.",
    description:
      "Ship SaaS on vibes. Vibe-coding micro-SaaS products with AI, shipping in public, and publishing the SaaS Vibes newsletter every Wednesday & Sunday.",
    siteName: "SaaS Vibes · Ankur Fulzele",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ankur Fulzele — Ship SaaS on vibes.",
    description:
      "Ship SaaS on vibes. Vibe-coding micro-SaaS with AI, real teardowns, GitHub repos & distribution plays.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#EFE9DC] text-[#151E28] font-sans antialiased selection:bg-[#E85A2A] selection:text-[#EFE9DC]">
        {children}
      </body>
    </html>
  );
}
