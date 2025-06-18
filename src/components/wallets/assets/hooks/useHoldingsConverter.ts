import { useMemo, useCallback } from 'react';
import { HoldingDisplay, PerpHoldingDisplay } from "@/components/types/wallet.types";
import { SpotToken } from "@/services/market/spot/types";
import { PerpMarketData } from "@/services/market/perp/types";
import { 
  HyperliquidBalance as SpotBalance,
  HyperliquidPerpResponse as PerpPositions,
  HyperliquidPerpAssetPosition
} from "@/services/wallets/types";

interface UseHoldingsConverterProps {
  viewType: "spot" | "perp";
  spotBalances?: SpotBalance[];
  perpPositions?: PerpPositions | null;
  spotMarketTokens?: SpotToken[];
  perpMarketTokens?: PerpMarketData[];
  isMounted: boolean;
}

export function useHoldingsConverter({
  viewType,
  spotBalances,
  perpPositions,
  spotMarketTokens,
  perpMarketTokens,
  isMounted
}: UseHoldingsConverterProps) {
  // Normaliser les noms de token pour faciliter la correspondance
  const normalizeTokenName = useCallback((name: string): string => {
    return name.toLowerCase().trim().replace('@', '');
  }, []);

  // Convertir les balances en holdings enrichis avec le marché spot
  const convertedHoldings = useMemo(() => {
    if (!isMounted) return [];
    
    if (viewType === "spot" && spotBalances && spotMarketTokens) {
      return spotBalances.map(balance => {
        const normalizedBalanceCoin = normalizeTokenName(balance.coin);
        
        // Rechercher le token dans les données de marché en normalisant les noms
        const marketToken = spotMarketTokens.find(t => {
          const normalizedMarketName = normalizeTokenName(t.name);
          return normalizedMarketName === normalizedBalanceCoin;
        });
        
        // Calculer la valeur totale basée sur le prix du marché si disponible
        const price = marketToken ? parseFloat(marketToken.price.toString()) : 0;
        const total = parseFloat(balance.total);
        const totalValue = price * total;
        const entryPrice = parseFloat(balance.entryNtl || "0");
        const pnl = totalValue - (entryPrice * total);
        
        const holding: HoldingDisplay = {
          id: `${balance.coin}-${balance.token || 'USDC'}`,
          coin: balance.coin,
          token: "USDC",
          total: balance.total,
          totalValue: totalValue,
          entryPrice: entryPrice,
          entryNtl: balance.entryNtl || "0",
          price: price,
          pnl: pnl,
          pnlPercentage: marketToken ? parseFloat(marketToken.change24h.toString()) : 0,
          logo: marketToken?.logo || undefined,
        };
        
        return holding;
      });
    } else if (viewType === "perp" && perpPositions && perpMarketTokens) {
      return perpPositions.assetPositions.map((position: HyperliquidPerpAssetPosition) => {
        const normalizedPositionCoin = normalizeTokenName(position.position.coin);
        
        // Rechercher le token dans les données de marché perp
        const marketToken = perpMarketTokens.find(t => {
          const normalizedMarketName = normalizeTokenName(t.name);
          return normalizedMarketName === normalizedPositionCoin;
        });
        
        const szi = parseFloat(position.position.szi);
        const entryPx = parseFloat(position.position.entryPx);
        const marginUsed = parseFloat(position.position.marginUsed);
        const liquidationPx = parseFloat(position.position.liquidationPx);
        const positionValue = Math.abs(szi) * entryPx;
        
        // Prix actuel du marché pour calculer le PNL
        const currentPrice = marketToken ? marketToken.price : entryPx;
        
        const holding: PerpHoldingDisplay = {
          id: `${position.position.coin}-${szi > 0 ? 'long' : 'short'}`,
          coin: position.position.coin,
          type: szi > 0 ? 'Long' : 'Short',
          marginUsed: position.position.marginUsed,
          marginUsedValue: marginUsed,
          positionValue: positionValue.toString(),
          positionValueNum: positionValue,
          entryPrice: position.position.entryPx,
          entryPriceNum: entryPx,
          liquidation: position.position.liquidationPx,
          liquidationNum: liquidationPx,
          logo: marketToken?.logo || undefined,
          price: currentPrice,
          change24h: marketToken ? marketToken.change24h : 0,
        };
        
        return holding;
      });
    }
    return [];
  }, [isMounted, viewType, spotBalances, perpPositions, spotMarketTokens, perpMarketTokens, normalizeTokenName]);

  return { convertedHoldings };
} 