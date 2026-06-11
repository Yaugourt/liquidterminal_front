// Types pour les positions spot
interface Holding {
  coin: string;
  token: string;
  total: string;
  entryNtl: string;
  price?: string;
  pnl?: string;
  pnlPercentage?: string;
  logo?: string;
}

// Types pour les positions perp
interface PerpHolding {
  coin: string;
  type: 'Short' | 'Long';
  marginUsed: string;
  positionValue: string;
  entryPrice: string;
  liquidation: string;
  logo?: string;
}

// Types étendus pour l'affichage
export interface PerpHoldingDisplay extends PerpHolding {
  id: string;
  marginUsedValue: number;
  positionValueNum: number;
  entryPriceNum: number;
  liquidationNum: number;
  price: number;
  change24h: number;
  type: 'Short' | 'Long';
  marginUsed: string;
  positionValue: string;
  liquidation: string;
  // Nouvelles propriétés
  leverage: {
    type: string;
    value: number;
  };
  szi: string;
  unrealizedPnl: string;
  funding: string;
}

export interface HoldingDisplay extends Omit<Holding, 'pnl' | 'pnlPercentage' | 'price'> {
  id: string;
  totalValue: number;
  price: number;
  pnl: number;
  pnlPercentage: number;
  entryPrice: number;
  total: string;
}

// Type commun pour le tri
export type SortableHolding = HoldingDisplay | PerpHoldingDisplay;
 