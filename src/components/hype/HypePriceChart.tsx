"use client";

import { Fragment, memo, useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AuroraAreaChart, chartPalette } from "@/components/common";
import { useTokenCandles } from "@/services/market/token";
import { useHypePrice, HYPE_SPOT_COIN } from "@/services/market/hype";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { fmtSignedPct } from "./format";

type TF = "7D" | "30D" | "90D" | "1Y" | "All";
type CandleInterval = "1h" | "4h" | "1d";

const TF_ORDER: readonly TF[] = ["7D", "30D", "90D", "1Y", "All"] as const;
const TF_CFG: Record<TF, { interval: CandleInterval; days: number }> = {
  "7D": { interval: "1h", days: 7 },
  "30D": { interval: "4h", days: 30 },
  "90D": { interval: "1d", days: 90 },
  "1Y": { interval: "1d", days: 365 },
  All: { interval: "1d", days: 430 },
};
const DAY = 86_400_000;

const fmtUsdAxis = (v: number): string => {
  if (!Number.isFinite(v)) return "";
  return `$${v >= 100 ? Math.round(v) : v.toFixed(1)}`;
};

/**
 * HypePriceChart — HYPE price history as an area chart with a timeframe
 * selector, plus the all-time high / low and distance-from-ATH derived live
 * from daily candles. Price series and ATH/ATL both come from the on-chain
 * candle snapshot (`@107`).
 */
export const HypePriceChart = memo(function HypePriceChart() {
  const [tf, setTf] = useState<TF>("30D");
  const { format } = useNumberFormat();
  const { price: livePrice } = useHypePrice();
  const cfg = TF_CFG[tf];

  const startTime = useMemo(() => Date.now() - cfg.days * DAY, [cfg.days]);
  const { candles, isLoading } = useTokenCandles({
    coin: HYPE_SPOT_COIN,
    interval: cfg.interval,
    startTime,
  });

  // All-time daily candles for a stable ATH / ATL, independent of the selected TF.
  const allStart = useMemo(() => Date.now() - 430 * DAY, []);
  const { candles: allCandles } = useTokenCandles({
    coin: HYPE_SPOT_COIN,
    interval: "1d",
    startTime: allStart,
  });

  const series = useMemo(
    () => candles.map((c) => ({ time: c.t, value: parseFloat(c.c) })),
    [candles],
  );
  const ath = useMemo(
    () => (allCandles.length ? Math.max(...allCandles.map((c) => parseFloat(c.h))) : null),
    [allCandles],
  );
  const atl = useMemo(
    () => (allCandles.length ? Math.min(...allCandles.map((c) => parseFloat(c.l))) : null),
    [allCandles],
  );

  const seriesLast = series.length ? series[series.length - 1].value : null;
  const current = livePrice && livePrice > 0 ? livePrice : seriesLast;
  // Window change is derived from the candle closes (not the live tick) so the
  // chart line color stays stable across price ticks and recharts doesn't
  // re-animate on every trade.
  const windowChange =
    series.length > 1 && series[0].value > 0 && seriesLast != null
      ? ((seriesLast - series[0].value) / series[0].value) * 100
      : null;
  const fromAth = ath != null && current != null ? ((current - ath) / ath) * 100 : null;

  const changeColor =
    windowChange == null ? "text-text-tertiary" : windowChange >= 0 ? "text-success" : "text-danger";
  const lineColor =
    windowChange != null && windowChange < 0 ? chartPalette.danger : chartPalette.accent;

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <LineChart size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Price</h3>
        <span className="hidden sm:flex items-center gap-2.5">
          <span className="mono text-[14px] font-semibold text-text-primary">
            {current != null ? formatPrice(current, format) : "—"}
          </span>
          <span className={`mono text-[11px] font-semibold ${changeColor}`}>
            {fmtSignedPct(windowChange)} {tf}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold">
          {TF_ORDER.map((t, i) => (
            <Fragment key={t}>
              {i > 0 && <span className="text-text-tertiary/40">·</span>}
              <button
                type="button"
                onClick={() => setTf(t)}
                className={`px-1 py-0.5 transition-colors hover:text-text-primary ${
                  t === tf ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {t}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      {/* ATH / ATL strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-3.5 py-2 border-b border-border-subtle text-[11px]">
        <span className="text-text-tertiary">
          ATH <span className="mono text-text-secondary font-semibold">{ath != null ? formatPrice(ath, format) : "—"}</span>
        </span>
        {fromAth != null && (
          <span className={`mono font-semibold ${fromAth >= 0 ? "text-success" : "text-danger"}`}>
            {fmtSignedPct(fromAth)} from ATH
          </span>
        )}
        <span className="text-text-tertiary">
          ATL <span className="mono text-text-secondary font-semibold">{atl != null ? formatPrice(atl, format) : "—"}</span>
        </span>
        <span className="ml-auto text-[10px] text-text-tertiary/70">Hyperliquid candles · {HYPE_SPOT_COIN}</span>
      </div>

      <div className="px-1.5 pt-2 pb-1.5">
        <div style={{ height: 240 }}>
          {series.length > 1 ? (
            <AuroraAreaChart
              data={series}
              lineColor={lineColor}
              height={240}
              yAxisWidth={52}
              formatValue={fmtUsdAxis}
              formatTime={fmtTime}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[11px] text-text-tertiary">
              {isLoading ? "Loading price…" : "No price history"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
