    import { useMemo, useState, useEffect } from 'react';
import { useTwapOrders } from './useTwapOrders';
import { EnrichedTwapOrder } from '../types';
import { isTwapStalled, twapDoneFraction } from '../twap-progress';

export interface HypeBuyPressureResult {
  /** Combined HYPE buy/sell pressure across spot HYPE + perp HYPE TWAPs. */
  buyPressure: number;
  totalBuyValue: number;
  totalSellValue: number;
  isLoading: boolean;
  error: Error | null;
}

interface RealTimeCalc {
  progression: number;
  remainingValue: number;
  isCompleted: boolean;
  /** Tracked since its start, running on paper, no fill for 10 minutes: not pressure. */
  stalled: boolean;
}

// Same math as the dashboard's TWAP board: the executed share when the live
// feed knows it, the time elapsed otherwise (see twap-progress.ts).
const calculateRealTimeProgression = (order: EnrichedTwapOrder, now: number): RealTimeCalc => {
  const done = twapDoneFraction(order, now);
  return {
    progression: done * 100,
    remainingValue: Math.max(0, order.totalValueUSD * (1 - done)),
    isCompleted: done >= 1,
    stalled: isTwapStalled(order, now),
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

  const [realTimeData, setRealTimeData] = useState<Map<string, RealTimeCalc>>(new Map());

  // Real-time progression calculation (independent from API refresh)
  // Note: the polled list and the live feed add/remove orders and move executed sizes, the clock part is calculated here
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const updateRealTimeData = () => {
      const newRealTimeData = new Map<string, RealTimeCalc>();
      const now = Date.now();
      
      orders.forEach(order => {
        // Only update active TWAP orders (not completed, cancelled, or errored)
        if (!order.ended && !order.error) {
          const realTimeCalc = calculateRealTimeProgression(order, now);
          newRealTimeData.set(order.hash, realTimeCalc);
        }
      });
      
      setRealTimeData(newRealTimeData);
    };

    // Initial calculation
    updateRealTimeData();

    // Recompute progression once per second (not the order list). A 100ms tick
    // re-rendered every consumer 10×/s for a headline number.
    const interval = setInterval(updateRealTimeData, 1_000);

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
      if (rt?.stalled) continue;
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