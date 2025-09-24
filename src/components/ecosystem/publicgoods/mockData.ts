/**
 * Données temporaires pour le développement de la section Public Goods
 */

export type ProjectStatus = 'pending' | 'approved' | 'rejected';
export type DevelopmentStatus = 'idea' | 'development' | 'beta' | 'production';

export interface PublicGoodsProject {
  id: number;
  
  // Section 1: Le projet
  name: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  websiteUrl?: string;
  category: string;
  discordContact?: string;
  telegramContact?: string;
  
  // Visuels
  logo?: string;
  banner?: string;
  screenshots?: string[];
  
  // Section 2: Impact HyperLiquid
  problemSolved: string;
  targetUsers: string[];
  hlIntegration: string;
  developmentStatus: DevelopmentStatus;
  
  // Section 3: Équipe & Technique
  leadDeveloper: {
    name: string;
    contact: string;
  };
  teamSize: 'solo' | '2-3' | '4+';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  technologies: string[];
  
  // Section 4: Soutien demandé
  supportRequested?: {
    types: ('promotion' | 'services' | 'funding')[];
    budgetRange?: '0-5k' | '5k-15k' | '15k-30k' | '30k-50k' | '50k+';
    timeline?: '3' | '6' | '12';
  };
  
  // Métadonnées
  status: ProjectStatus;
  submittedAt: string;
  reviewedAt?: string;
}

// Données mockées
export const mockProjects: PublicGoodsProject[] = [
  {
    id: 1,
    name: "HyperLiquid Trading Bot Framework",
    description: "An open-source framework for building automated trading bots on HyperLiquid. Provides easy-to-use APIs for strategy development, backtesting, and live trading with built-in risk management features.",
    githubUrl: "https://github.com/example/hl-bot-framework",
    demoUrl: "https://demo.hlbots.io",
    websiteUrl: "https://hlbots.io",
    category: "Trading Tools",
    discordContact: "hlbots#1234",
    telegramContact: "@hlbots",
    logo: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=80&h=80&fit=crop&crop=center",
    banner: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop&crop=center",
    problemSolved: "Simplifies bot development on HyperLiquid by providing pre-built components for common trading strategies and risk management.",
    targetUsers: ["developers", "traders", "quant researchers"],
    hlIntegration: "Uses HyperLiquid REST API, WebSocket streams, and Exchange Info endpoints",
    developmentStatus: "beta",
    leadDeveloper: {
      name: "John Doe",
      contact: "john@hlbots.io"
    },
    teamSize: "2-3",
    experienceLevel: "expert",
    technologies: ["Python", "TypeScript", "React", "PostgreSQL"],
    supportRequested: {
      types: ["promotion", "services"],
      budgetRange: "5k-15k",
      timeline: "6"
    },
    status: "approved",
    submittedAt: "2024-01-15T10:00:00Z",
    reviewedAt: "2024-01-16T14:00:00Z"
  },
  {
    id: 2,
    name: "HL Analytics Dashboard",
    description: "Real-time analytics dashboard for HyperLiquid traders. Track PnL, volume, funding rates, and market metrics with beautiful visualizations.",
    githubUrl: "https://github.com/example/hl-analytics",
    websiteUrl: "https://hlanalytics.xyz",
    category: "Analytics",
    discordContact: "analytics#5678",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center",
    banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center",
    problemSolved: "Provides comprehensive analytics that are missing from the native HyperLiquid interface.",
    targetUsers: ["traders", "analysts", "fund managers"],
    hlIntegration: "WebSocket subscriptions, Historical data API, User stats endpoints",
    developmentStatus: "production",
    leadDeveloper: {
      name: "Alice Smith",
      contact: "alice@hlanalytics.xyz"
    },
    teamSize: "solo",
    experienceLevel: "intermediate",
    technologies: ["Next.js", "TailwindCSS", "Chart.js", "Redis"],
    supportRequested: {
      types: ["promotion"],
      timeline: "3"
    },
    status: "approved",
    submittedAt: "2024-01-10T08:00:00Z",
    reviewedAt: "2024-01-11T12:00:00Z"
  },
  {
    id: 3,
    name: "HyperLiquid Mobile Wallet",
    description: "Native mobile wallet for HyperLiquid with support for trading, staking, and DeFi features. Built with React Native for iOS and Android.",
    githubUrl: "https://github.com/example/hl-mobile",
    category: "Wallet",
    telegramContact: "@hlmobile",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&h=80&fit=crop&crop=center",
    banner: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop&crop=center",
    problemSolved: "Enables mobile trading on HyperLiquid with a native experience optimized for small screens.",
    targetUsers: ["mobile traders", "casual users"],
    hlIntegration: "Full API integration including trading, deposits, withdrawals",
    developmentStatus: "development",
    leadDeveloper: {
      name: "Bob Johnson",
      contact: "bob@hlmobile.app"
    },
    teamSize: "4+",
    experienceLevel: "expert",
    technologies: ["React Native", "TypeScript", "Node.js", "MongoDB"],
    supportRequested: {
      types: ["funding", "services"],
      budgetRange: "30k-50k",
      timeline: "12"
    },
    status: "pending",
    submittedAt: "2024-01-20T15:00:00Z"
  },
  {
    id: 4,
    name: "Copy Trading Platform",
    description: "Allow users to copy trades from successful HyperLiquid traders automatically.",
    githubUrl: "https://github.com/example/copy-trade",
    category: "Trading Tools",
    logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=80&fit=crop&crop=center",
    problemSolved: "Democratizes access to successful trading strategies.",
    targetUsers: ["retail traders", "beginners"],
    hlIntegration: "Trade execution API, Position tracking",
    developmentStatus: "idea",
    leadDeveloper: {
      name: "Charlie Brown",
      contact: "charlie@copytrade.io"
    },
    teamSize: "2-3",
    experienceLevel: "beginner",
    technologies: ["Vue.js", "Python", "FastAPI"],
    status: "rejected",
    submittedAt: "2024-01-18T11:00:00Z",
    reviewedAt: "2024-01-19T09:00:00Z"
  },
  {
    id: 5,
    name: "HL Order Book Visualizer",
    description: "Advanced order book visualization tool with heatmaps, depth charts, and real-time updates for better market analysis.",
    githubUrl: "https://github.com/example/hl-orderbook",
    demoUrl: "https://orderbook.hl.tools",
    category: "Analytics",
    discordContact: "orderbook#9999",
    logo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=80&h=80&fit=crop&crop=center",
    banner: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=400&fit=crop&crop=center",
    problemSolved: "Provides professional-grade order book analysis tools for HyperLiquid markets.",
    targetUsers: ["professional traders", "market makers"],
    hlIntegration: "L2 Book WebSocket, Trade feed, Market data API",
    developmentStatus: "beta",
    leadDeveloper: {
      name: "David Lee",
      contact: "david@hltools.com"
    },
    teamSize: "solo",
    experienceLevel: "expert",
    technologies: ["React", "D3.js", "WebGL", "Rust"],
    supportRequested: {
      types: ["promotion", "services"],
      budgetRange: "15k-30k",
      timeline: "6"
    },
    status: "pending",
    submittedAt: "2024-01-22T16:30:00Z"
  }
];

export const categories = [
  "Trading Tools",
  "Analytics",
  "Wallet",
  "DeFi",
  "Infrastructure",
  "Education",
  "Other"
];
