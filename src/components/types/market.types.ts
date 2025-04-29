/**
 * Types pour les composants du marché
 */

/**
 * Props pour le composant MarketStatsCard
 */
export interface MarketStatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  isLoading?: boolean;
} 