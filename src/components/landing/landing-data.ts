import { CandlestickChart, Boxes, LayoutDashboard } from "lucide-react";
import { XIcon, DiscordIcon, GithubIcon } from "./landing-icons";

/**
 * Static content for the landing page editorial sections.
 *
 * Kept separate from the JSX so future copy/link/screenshot changes don't
 * touch the layout file.
 */

export const socials = [
  { name: "Discord", href: "#", Icon: DiscordIcon },
  { name: "Twitter", href: "https://x.com/liquidterminal", Icon: XIcon },
  { name: "Github", href: "https://github.com/Liquid-Terminal", Icon: GithubIcon },
] as const;

export const reasons = [
  {
    hypurr: "/hypurr/sherlock.png",
    stat: "01",
    label: "Unified",
    title: "Scattered data, fragmented insights",
    problem: "Market data, liquidations, and vault metrics live across multiple dashboards.",
    solution: "One unified terminal. Real-time spot, perps, auctions, and liquidations — all in one view.",
    accent: "accent" as const,
  },
  {
    hypurr: "/hypurr/handshake.png",
    stat: "02",
    label: "Verified",
    title: "Trust, transparency, proof",
    problem: "You need to verify what you see. Raw data without context can mislead.",
    solution: "On-chain verified data. Explorer, validators, and transaction history — trace everything back.",
    accent: "gold" as const,
  },
  {
    hypurr: "/hypurr/saiyan.png",
    stat: "03",
    label: "Execution",
    title: "From discovery to execution",
    problem: "Finding opportunities is one thing. Acting on them is another.",
    solution: "Discover trending tokens, track auctions, monitor vaults — then move with confidence.",
    accent: "accent" as const,
  },
] as const;

export const screenshots = [
  { title: "Market overview", subtitle: "Spot, perps, auctions", border: "border-brand/20", icon: CandlestickChart },
  { title: "Explorer & liquidations", subtitle: "On-chain verified", border: "border-gold/20", icon: Boxes },
  { title: "Dashboard & analytics", subtitle: "Portfolio, fees, trends", border: "border-brand/20", icon: LayoutDashboard },
] as const;

export const apiProviders = [
  { name: "HyperLiquid", href: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api", logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" },
  { name: "HypurrScan", href: "https://api.hypurrscan.io/ui/#/Experimental/hypurrscanAPI.get%20spotUSDC", logo: "/hypurrscan.jpg" },
  { name: "DefiLlama", href: "https://api-docs.defillama.com/", logo: "/defillama.jpg" },
] as const;
