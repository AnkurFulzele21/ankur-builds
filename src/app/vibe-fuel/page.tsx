import type { Metadata } from "next";
import { VibeFuelExperience } from "@/components/VibeFuelExperience";

export const metadata: Metadata = {
  alternates: { canonical: "/vibe-fuel" },
  title: "Vibe Fuel — Stack, Coffee & Builder Rituals | Ankur Fulzele",
  description:
    "The exact AI stack, coffee rituals, focus systems, and mental models Ankur Fulzele uses to ship micro-SaaS solo.",
};

export default function VibeFuelPage() {
  return <VibeFuelExperience />;
}
