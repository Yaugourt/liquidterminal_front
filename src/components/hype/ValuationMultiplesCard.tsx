"use client";

import { memo, useMemo } from "react";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useHypeOverview } from "@/services/market/hype";
import { toValuationMultiples, useFeeRevenueHistory } from "@/services/market/fundamentals";

/**
 * What the market is paying for the earnings.
 *
 * The whole premise of reading a protocol as a business ends here: fees and
 * margins describe the operation, but only a multiple says whether the price
 * already reflects them. P/F and P/E are the two an exchange gets quoted on, so
 * they are the two here, on trailing twelve months.
 *
 * Both supply bases, side by side, because they disagree by more than a factor
 * of three and each answers a different question. Circulating is what the
 * market prices today. Fully diluted is what it prices once vesting finishes,
 * and with most of the supply still to enter float that is not a footnote.
 * Quoting one alone is a position, not a measurement.
 */

const ratio = (value: number | null): string =>
  value == null ? "—" : `${value < 10 ? value.toFixed(1) : Math.round(value)}×`;

const pct = (value: number | null): string =>
  value == null ? "—" : `${(value * 100).toFixed(1)}%`;

interface RowProps {
  label: string;
  hint: string;
  circulating: string;
  diluted: string;
}

function Row({ label, hint, circulating, diluted }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-3 py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="min-w-0">
        <div className="text-[12.5px] text-text-secondary">{label}</div>
        <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{hint}</div>
      </div>
      <span className="w-[74px] text-right text-[15px] font-semibold text-text-primary mono tabular-nums">
        {circulating}
      </span>
      <span className="w-[74px] text-right text-[15px] text-text-secondary mono tabular-nums">
        {diluted}
      </span>
    </div>
  );
}

export const ValuationMultiplesCard = memo(function ValuationMultiplesCard() {
  const { days, isLoading: loadingFees, error } = useFeeRevenueHistory();
  const { overview, isLoading: loadingOverview } = useHypeOverview();

  const multiples = useMemo(
    () => toValuationMultiples(days, overview?.marketCap ?? null, overview?.fdv ?? null),
    [days, overview]
  );

  const isLoading = (loadingFees || loadingOverview) && days.length === 0;
  const partial = multiples.ttmDays > 0 && multiples.ttmDays < 365;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Scale size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Valuation Multiples</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          {partial ? `${multiples.ttmDays}d trailing` : "trailing 12 months"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        {[
          {
            label: "TTM fees",
            value: compactUsd(multiples.ttmFees),
            sub: "what users paid over the year",
          },
          {
            label: "TTM revenue",
            value: compactUsd(multiples.ttmRevenue),
            sub: "what the protocol kept",
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div className="text-[16px] font-semibold text-text-primary mono mt-1">{cell.value}</div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-4 py-3">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 pb-1.5 border-b border-border-default">
              <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                Multiple
              </span>
              <span className="w-[74px] text-right text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                Circ.
              </span>
              <span className="w-[74px] text-right text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                Diluted
              </span>
            </div>

            <Row
              label="Price / Fees"
              hint="Valuation over what users paid"
              circulating={ratio(multiples.priceToFees)}
              diluted={ratio(multiples.priceToFeesFd)}
            />
            <Row
              label="Price / Earnings"
              hint="Valuation over what the protocol kept"
              circulating={ratio(multiples.priceToEarnings)}
              diluted={ratio(multiples.priceToEarningsFd)}
            />
            <Row
              label="Earnings yield"
              hint="The inverse of P/E, read as a return"
              circulating={pct(multiples.earningsYield)}
              diluted={pct(multiples.earningsYieldFd)}
            />

            <div className="grid grid-cols-2 gap-px bg-border-subtle mt-3 rounded-md overflow-hidden">
              <div className="bg-surface px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                  Market cap
                </div>
                <div className="text-[14px] font-semibold text-text-primary mono mt-0.5">
                  {compactUsd(multiples.marketCap)}
                </div>
              </div>
              <div className="bg-surface px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                  Fully diluted
                </div>
                <div className="text-[14px] font-semibold text-text-secondary mono mt-0.5">
                  {compactUsd(multiples.fdv)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Fees and revenue from DefiLlama · supply and price on-chain</span>
        {partial && (
          <>
            <span className="opacity-50">·</span>
            <span className="text-warning">
              {`Only ${multiples.ttmDays} days of history: these are not yet a full year.`}
            </span>
          </>
        )}
        <span className="opacity-50">·</span>
        <span>A multiple is a price, not a verdict. It says what is paid, not what is owed.</span>
      </div>
    </Card>
  );
});
