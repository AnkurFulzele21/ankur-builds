import type { Metadata } from "next";
import { ShareStoryExperience } from "@/components/ShareStoryExperience";

export const metadata: Metadata = {
  title: "Share Your SaaS Story — SaaS Vibes",
  description:
    "Built a micro-SaaS people actually pay for? Drop your story, tech stack, and real receipts to get featured in SaaS Vibes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShareYourStoryPage() {
  return <ShareStoryExperience />;
}
