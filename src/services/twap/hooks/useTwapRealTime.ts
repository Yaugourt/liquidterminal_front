import { useEffect, useState } from "react";
import {
  calculateRealTimeProgression,
  type TwapProgressionInput,
  type TwapRealTimeData,
} from "../utils";

/**
 * Polls real-time TWAP progression at 50ms for ultra-smooth UI updates.
 *
 * Returns a `Map<id, TwapRealTimeData>` keyed by `twap.id`. Only **active**
 * orders (not `ended` and not in an `error` state) are tracked.
 *
 * @param twaps  Source orders. Each must include `id`, `time`, `duration`,
 *               `amount`, `value` and may include `ended` / `error` flags.
 */
export function useTwapRealTime<
  T extends TwapProgressionInput & { ended?: string | null; error?: string | null }
>(twaps: T[]): Map<string, TwapRealTimeData> {
  const [realTimeData, setRealTimeData] = useState<Map<string, TwapRealTimeData>>(new Map());

  useEffect(() => {
    if (!twaps || twaps.length === 0) return;

    const update = () => {
      const next = new Map<string, TwapRealTimeData>();
      for (const twap of twaps) {
        if (!twap.ended && !twap.error) {
          next.set(twap.id, calculateRealTimeProgression(twap));
        }
      }
      setRealTimeData(next);
    };

    update();
    const interval = setInterval(update, 50);
    return () => clearInterval(interval);
  }, [twaps]);

  return realTimeData;
}
