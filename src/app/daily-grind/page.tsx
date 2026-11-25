import type { Metadata } from "next";
import { DailyGrindExperience } from "@/components/DailyGrindExperience";

export const metadata: Metadata = {
  alternates: { canonical: "/daily-grind" },
  title: "Daily Grind — HYROX, Double Circuit & Marathons | Ankur Fulzele",
  description:
    "Outside the IDE: Ankur Fulzele's fitness competitions, HYROX, Double Circuit races, marathon medals, and hybrid athlete training alongside building micro-SaaS.",
};

export default function DailyGrindPage() {
  return <DailyGrindExperience />;
}
