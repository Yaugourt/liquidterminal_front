/**
 * Mission catalog — the single source of truth for onboarding missions.
 *
 * Every `href` / `trackedRoutes` entry maps to a real route in `src/app`
 * (verified against docs/CODEMAP.md). Adding a mission here is enough for it
 * to appear in the widget; auto-completion is wired in
 * `components/missions/MissionTracker.tsx` (routes, store subscriptions) or
 * via `markMissionComplete()` for explicit hooks.
 */
import {
  LayoutDashboard,
  CandlestickChart,
  Blocks,
  BookOpen,
  Search,
  Settings2,
  Wallet,
  Radar,
  BookMarked,
} from "lucide-react";
import type { Mission, MissionCategory } from "./types";

export const MISSION_CATEGORY_ORDER: readonly MissionCategory[] = [
  "discover",
  "personalize",
  "engage",
];

export const MISSION_CATEGORY_LABELS: Record<MissionCategory, string> = {
  discover: "Discover",
  personalize: "Personalize",
  engage: "Engage",
};

export const MISSIONS: readonly Mission[] = [
  // ---- Discover: visit the key surfaces (route-visit, fully auto) ----
  {
    id: "visit-dashboard",
    title: "Check the ecosystem pulse",
    description: "Open the Dashboard: KPIs, movers, liquidations and auctions at a glance.",
    href: "/dashboard",
    icon: LayoutDashboard,
    xpReward: 10,
    category: "discover",
    requiresAuth: false,
    trackedRoutes: ["/dashboard"],
  },
  {
    id: "visit-market",
    title: "Explore the markets",
    description: "Browse spot and perp data: prices, volumes, auctions and builders.",
    href: "/market/spot",
    icon: CandlestickChart,
    xpReward: 10,
    category: "discover",
    requiresAuth: false,
    trackedRoutes: ["/market/spot", "/market/perp", "/market/perpdex", "/market/hip4", "/market/builders"],
  },
  {
    id: "visit-explorer",
    title: "Tour the Explorer",
    description: "Watch live blocks, transactions, vaults and validators on Hyperliquid.",
    href: "/explorer",
    icon: Blocks,
    xpReward: 10,
    category: "discover",
    requiresAuth: false,
    trackedRoutes: ["/explorer"],
  },
  {
    id: "visit-wiki",
    title: "Open the Wiki",
    description: "Curated educational resources to level up on the ecosystem.",
    href: "/wiki",
    icon: BookOpen,
    xpReward: 10,
    category: "discover",
    requiresAuth: false,
    trackedRoutes: ["/wiki"],
  },
  {
    id: "open-search",
    title: "Master quick search",
    description: "Press Cmd+K (Ctrl+K) to jump to any token, page or address.",
    href: "/dashboard",
    icon: Search,
    xpReward: 15,
    category: "discover",
    requiresAuth: false,
    clientAction: "open-search",
  },

  // ---- Personalize: make the terminal yours ----
  {
    id: "customize-sidebar",
    title: "Make it yours",
    description: "Use Customize at the bottom of the sidebar to reorder or hide sections.",
    href: "/dashboard",
    icon: Settings2,
    xpReward: 20,
    category: "personalize",
    requiresAuth: false,
  },

  // ---- Engage: log in and use the personal features ----
  {
    id: "connect-account",
    title: "Connect your account",
    description: "Sign in to unlock wallet tracking, read lists and XP rewards.",
    href: "/profile",
    icon: Wallet,
    xpReward: 25,
    category: "engage",
    requiresAuth: false,
    clientAction: "login",
  },
  {
    id: "track-wallet",
    title: "Track a wallet",
    description: "Add any address to your tracker and follow its positions.",
    href: "/market/tracker",
    icon: Radar,
    xpReward: 25,
    category: "engage",
    requiresAuth: true,
  },
  {
    id: "create-readlist",
    title: "Create a read list",
    description: "Save wiki resources into your own reading list.",
    href: "/wiki/readlist",
    icon: BookMarked,
    xpReward: 25,
    category: "engage",
    requiresAuth: true,
  },
];
