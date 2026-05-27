    import { useMemo, useState, useEffect } from 'react';
import { useTwapOrders } from './useTwapOrders';
import { EnrichedTwapOrder } from '../types';

export interface HypeBuyPressureResult {
  /** Combined HYPE buy/sell pressure across spot HYPE + perp HYPE TWAPs. */
  buyPressure: number;
  totalBuyValue: number;
  totalSellValue: number;
  isLoading: boolean;
  error: Error | null;
}

// Helper function to calculate real-time progression (EXACTLY same logic as TwapTable)
const calculateRealTimeProgression = (order: EnrichedTwapOrder) => {
  const startTime = order.time;
  const durationMs = order.action.twap.m * 60 * 1000; // minutes to ms
  const currentTime = Date.now();
  const elapsedTime = Math.max(0, currentTime - startTime);
  
  // Calculate smooth progression based on elapsed time (SAME AS TWAP TABLE)
  const timeProgressionPercent = Math.min(100, Math.max(0, (elapsedTime / durationMs) * 100));
  
  // Calculate remaining quantity and value based on smooth time progression
  const remainingPercent = Math.max(0, 100 - timeProgressionPercent);
  const originalAmount = parseFloat(order.action.twap.s);
  const remainingAmount = originalAmount * (remainingPercent / 100);
  
  // For value calculation, use the remaining amount with current token price
  const remainingValue = remainingAmount * (order.totalValueUSD / parseFloat(order.action.twap.s));
  
  return {
    progression: timeProgressionPercent,
    remainingValue: Math.max(0, remainingValue),
    isCompleted: timeProgressionPercent >= 100
  };
};

/**
 * Hook to calculate HYPE buy pressure from active TWAP orders
 * Buy pressure = Total HYPE buy orders value - Total HYPE sell orders value
 */
export function useHypeBuyPressure(): HypeBuyPressureResult {
  const { orders, isLoading, error } = useTwapOrders({
    limit: 10000, // Increased limit to ensure we get ALL active orders
    status: "active" // Only active orders
  });

  const [realTimeData, setRealTimeData] = useState<Map<string, { progression: number; remainingValue: number; isCompleted: boolean }>>(new Map());

  // Real-time progression calculation (independent from API refresh)
  // Note: API 30s refresh only adds/removes orders, progression calculated here
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const updateRealTimeData = () => {
      const newRealTimeData = new Map();
      
      orders.forEach(order => {
        // Only update active TWAP orders (not completed, cancelled, or errored)
        if (!order.ended && !order.error) {
          const realTimeCalc = calculateRealTimeProgression(order);
          newRealTimeData.set(order.hash, realTimeCalc);
        }
      });
      
      setRealTimeData(newRealTimeData);
    };

    // Initial calculation
    updateRealTimeData();

    // Update every 100ms for progression calculation (not order list)
    const interval = setInterval(updateRealTimeData, 100);

    return () => clearInterval(interval);
  }, [orders]);

  const aggregated = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { buyPressure: 0, totalBuyValue: 0, totalSellValue: 0 };
    }

    let buy = 0;
    let sell = 0;

    for (const order of orders) {
      if (order.ended || order.error) continue;
      // Only HYPE — spot HYPE pair OR native perp HYPE. HIP-3 never carries
      // HYPE as the traded ticker, so marketType `hip3` is skipped implicitly.
      const sym = order.tokenSymbol.toUpperCase();
      const isHype =
        sym === 'HYPE' &&
        (order.marketType === 'spot' || order.marketType === 'perp');
      if (!isHype) continue;

      const rt = realTimeData.get(order.hash);
      const value = rt ? rt.remainingValue : order.totalValueUSD;
      if (order.action.twap.b) buy += value;
      else sell += value;
    }

    return {
      buyPressure: buy - sell,
      totalBuyValue: buy,
      totalSellValue: sell,
    };
  }, [orders, realTimeData]);

  return {
    ...aggregated,
    isLoading,
    error
  };
}