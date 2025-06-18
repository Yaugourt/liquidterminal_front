import { memo } from "react";
import { ProjectCard } from "./ProjectCard";

// Temporary mock data
const MOCK_PROJECTS = [
  {
    id: 1,
    title: "HyperLend",
    desc: "Decentralized lending protocol built on Hyperliquid",
    logo: "/images/hyperlend.svg",
    twitter: "https://twitter.com/hyperlend",
    discord: "https://discord.gg/hyperlend",
    telegram: "https://t.me/hyperlend",
    website: "https://hyperlend.xyz",
    category: "DeFi"
  },
  {
    id: 2,
    title: "HyperSwap",
    desc: "Automated market maker for Hyperliquid ecosystem",
    logo: "/images/hyperswap.svg",
    twitter: "https://twitter.com/hyperswap",
    discord: "https://discord.gg/hyperswap",
    website: "https://hyperswap.fi",
    category: "DEX"
  },
  {
    id: 3,
    title: "HyperStake",
    desc: "Liquid staking solution for HYPE tokens",
    logo: "/images/hyperstake.svg",
    twitter: "https://twitter.com/hyperstake",
    telegram: "https://t.me/hyperstake",
    website: "https://hyperstake.finance",
    category: "Staking"
  }
];

export const ProjectsGrid = memo(function ProjectsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_PROJECTS.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
}); 