import { Project, Category, ProjectsResponse, CategoriesResponse } from './types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "DeFi",
    description: "Decentralized Finance protocols",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "DEX",
    description: "Decentralized Exchanges",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "Gaming",
    description: "Gaming and NFT projects",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    name: "Infrastructure",
    description: "Infrastructure and tooling",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "HyperLend",
    desc: "Decentralized lending protocol built on Hyperliquid with advanced risk management",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    twitter: "https://twitter.com/hyperlend",
    discord: "https://discord.gg/hyperlend",
    telegram: "https://t.me/hyperlend",
    website: "https://hyperlend.xyz",
    categoryId: 1,
    category: MOCK_CATEGORIES[0],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "HyperSwap",
    desc: "Automated market maker for Hyperliquid ecosystem with concentrated liquidity",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    twitter: "https://twitter.com/hyperswap",
    discord: "https://discord.gg/hyperswap",
    website: "https://hyperswap.fi",
    categoryId: 2,
    category: MOCK_CATEGORIES[1],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    title: "HyperStake",
    desc: "Liquid staking solution for HYPE tokens with auto-compounding rewards",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    twitter: "https://twitter.com/hyperstake",
    telegram: "https://t.me/hyperstake",
    website: "https://hyperstake.finance",
    categoryId: 1,
    category: MOCK_CATEGORIES[0],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    title: "HyperGame",
    desc: "Play-to-earn gaming platform with NFT integration on Hyperliquid",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    discord: "https://discord.gg/hypergame",
    website: "https://hypergame.io",
    categoryId: 3,
    category: MOCK_CATEGORIES[2],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 5,
    title: "HyperBridge",
    desc: "Cross-chain bridge infrastructure for seamless asset transfers",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    twitter: "https://twitter.com/hyperbridge",
    website: "https://hyperbridge.tech",
    categoryId: 4,
    category: MOCK_CATEGORIES[3],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 6,
    title: "HyperDEX Pro",
    desc: "Professional trading interface with advanced charting and analytics",
    logo: "https://app.hyperliquid.xyz/coins/HYPE_USDC.svg",
    twitter: "https://twitter.com/hyperdexpro",
    discord: "https://discord.gg/hyperdexpro",
    website: "https://hyperdexpro.com",
    categoryId: 2,
    category: MOCK_CATEGORIES[1],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export const getMockProjectsResponse = (params?: { categoryId?: number }): ProjectsResponse => {
  const filteredProjects = params?.categoryId 
    ? MOCK_PROJECTS.filter(p => p.categoryId === params.categoryId)
    : MOCK_PROJECTS;

  return {
    success: true,
    data: filteredProjects,
    pagination: {
      total: filteredProjects.length,
      page: 1,
      limit: 50,
      totalPages: 1
    }
  };
};

export const getMockCategoriesResponse = (): CategoriesResponse => {
  return {
    success: true,
    data: MOCK_CATEGORIES,
    pagination: {
      total: MOCK_CATEGORIES.length,
      page: 1,
      limit: 50,
      totalPages: 1
    }
  };
}; 