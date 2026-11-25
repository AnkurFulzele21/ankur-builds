import type { Metadata } from "next";
import { VibeLabsExperience } from "@/components/VibeLabsExperience";
import type { LabDeckProject } from "@/components/VibeLabsCardDeck";

export const metadata: Metadata = {
  alternates: { canonical: "/vibe-labs" },
  title: "Vibe Labs — Micro-SaaS, LifeOS & AI Workflows | Ankur Fulzele",
  description:
    "A growing collection of apps built on zero VC funding and questionable amounts of caffeine — LifeOS (3,000+ downloads), Learn To Use AI, Habits App, and 75 Hard App.",
};

const FLAGSHIP_DECK_PROJECTS: LabDeckProject[] = [
  {
    id: "life-os",
    number: "01",
    name: "LifeOS: Focus & Habit Tracker",
    headline: "LifeOS crossed 3,000+ downloads on Google Play",
    tagline:
      "The ultimate ADHD-friendly planner and focus tracker. Track daily habits, block distractions, and get things done — my flagship Play Store app growing organically every week.",
    status: "Live on Play Store",
    category: "Android App · Health & Focus",
    metric: "3,000+ Downloads",
    stack: ["Google Play", "Focus & ADHD Planner", "Habit Tracker", "Android"],
    url: "https://play.google.com/store/apps/details?id=com.buildkarmedia.lifeos&pcampaignid=web_share",
    primaryLabel: "Get on Google Play",
    secondaryUrl: "https://www.lifeoshq.com/",
    secondaryLabel: "lifeoshq.com",
    badgeInitials: "LO",
    badgeColor: "#0E1B2A",
  },
  {
    id: "learn-to-use-ai",
    number: "02",
    name: "Learn To Use AI",
    headline: "Practical AI workflows & product-market playbooks",
    tagline:
      "My dedicated AI website where I share real-world AI workflows, automations, and product-market strategies — built for founders who want working systems instead of hype.",
    status: "Live Website",
    category: "AI Workflows & Product",
    metric: "learntouseai.in",
    stack: ["AI Workflows", "Product-Market", "Playbooks", "Automation"],
    url: "https://learntouseai.in",
    primaryLabel: "Visit learntouseai.in",
    badgeInitials: "AI",
    badgeColor: "#26465C",
  },
  {
    id: "habits-app",
    number: "03",
    name: "Habits App",
    headline: "Atomic daily habits, inspired by James Clear's Atoms",
    tagline:
      "A clean, distraction-free productivity app built around tiny compounding daily habits. Designed to make consistency visual, rewarding, and effortless.",
    status: "Shipped",
    category: "Productivity · Atomic Habits",
    metric: "Atoms-Inspired",
    stack: ["Mobile App", "Habit Loops", "Streaks", "Minimal UI"],
    url: "https://github.com/AnkurFulzele21",
    primaryLabel: "View on GitHub",
    badgeInitials: "HA",
    badgeColor: "#4D7C5B",
  },
  {
    id: "75-hard-app",
    number: "04",
    name: "75 Hard App",
    headline: "Zero-excuses companion for the 75 Hard Challenge",
    tagline:
      "Built for completing the 75 Hard mental toughness protocol — daily 2× workouts, water & reading checklists, progress photos, and strict streak accountability.",
    status: "Shipped",
    category: "Fitness & Mental Toughness",
    metric: "75-Day Protocol",
    stack: ["Fitness", "Daily Checklists", "Accountability", "Mobile"],
    url: "https://github.com/AnkurFulzele21",
    primaryLabel: "View on GitHub",
    badgeInitials: "75",
    badgeColor: "#F04E18",
  },
];

export default function VibeLabsPage() {
  return <VibeLabsExperience projects={FLAGSHIP_DECK_PROJECTS} />;
}
