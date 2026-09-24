import { useEffect, useState } from "react";
import {
  calculateRealTimeProgression,
  type TwapProgressionInput,
  type TwapRealTimeData,
} from "../twap-real-time";

const TICK_MS = 1_000;

/**
 * Recomputes real-time TWAP progression once per second. The displayed
 * values (1-decimal %, USD value) barely move faster than that, and a 50ms tick
 * re-rendered whole tables 20×/s.
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
    const interval = setInterval(update, TICK_MS);
    return () => clearInterval(interval);
  }, [twaps]);

  return realTimeData;
}
