"use client";

import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TooltipIcon } from "@/components/common";
import { formatExpiryDate } from "@/lib/hip4/market-formatter";
import { parseOutcomeDescription } from "@/lib/hip4/outcome-meta";
import type { Hip4DetailLayout } from "@/lib/hip4/detail-layout";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";

interface Hip4RulesCardProps {
  market: Hip4MarketEnrichedRow;
  layout: Hip4DetailLayout;
}

/** Human-readable resolution prose. Structured price markets get a synthesized
 * sentence; prose markets (NBA/Fed/CPI) carry their own text in the description,
 * which we surface verbatim (minus the trailing `metadata=…` machine tag). */
function buildRuleText(market: Hip4MarketEnrichedRow, isPriceBinary: boolean): string | null {
  const raw = (market.question_description ?? "").trim();
  const structured = /(^|\|)\s*class\s*:/.test(raw);

  if (isPriceBinary && market.underlying && market.target_price != null && market.expiry) {
    const price =
      market.target_price >= 1000
        ? market.target_price.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : String(market.target_price);
    return `This market resolves YES if ${market.underlying} is at or above ${price} at ${formatExpiryDate(
      market.expiry
    )}, and NO otherwise. It settles automatically from the ${market.underlying} oracle price.`;
  }

  if (!raw) return null;
  if (structured) return null; // machine string with no prose — metadata grid covers it
  // Strip the trailing `metadata=category:…|subCategory:…` machine tag.
  return raw.replace(/\s*metadata=.*$/, "").trim() || null;
}

/**
 * Rules & Resolution — surfaces the per-outcome resolution description that the
 * data layer fetches but the page previously discarded, plus the structured
 * metadata (underlying, threshold, resolution date, recurrence) and how the
 * market settles. Long prose collapses behind a "Show more" toggle.
 */
export function Hip4RulesCard({ market, layout }: Hip4RulesCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isPriceMarket = layout.kind === "price-binary" || !!market.underlying;
  const ruleText = useMemo(
    () => buildRuleText(market, layout.kind === "price-binary"),
    [market, layout.kind]
  );

  const parsed = useMemo(
    () => parseOutcomeDescription(market.question_description ?? ""),
    [market.question_description]
  );

  // Oracle-settled when there's an underlying price feed driving the outcome;
  // everything else (sports, macro events) resolves manually.
  const resolutionMode = isPriceMarket ? "Oracle · automatic" : "Manual";

  const meta: Array<{ label: string; value: string }> = [];
  if (market.underlying) meta.push({ label: "Underlying", value: market.underlying });
  if (market.target_price != null) {
    meta.push({
      label: "Threshold",
      value:
        market.target_price >= 1000
          ? market.target_price.toLocaleString("en-US", { maximumFractionDigits: 0 })
          : String(market.target_price),
    });
  }
  if (market.expiry) meta.push({ label: "Resolves", value: formatExpiryDate(market.expiry) });
  if (market.period || parsed.period)
    meta.push({ label: "Recurrence", value: market.period ?? parsed.period ?? "" });
  meta.push({ label: "Settlement", value: resolutionMode });

  const isLong = (ruleText?.length ?? 0) > 220;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
          <Scale size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Rules &amp; Resolution</h3>
        <span className="ml-auto inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {resolutionMode}
          <TooltipIcon>
            {isPriceMarket
              ? "Resolved automatically from the underlying oracle price at expiry."
              : "Resolved manually by the market operator from the official result."}
          </TooltipIcon>
        </span>
      </div>

      <div className="space-y-3 p-3.5">
        {ruleText ? (
          <div>
            <p
              className={`text-[12px] leading-relaxed text-text-secondary ${
                isLong && !expanded ? "line-clamp-3" : ""
              }`}
            >
              {ruleText}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-[11px] font-semibold text-brand transition-colors hover:text-brand/80"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        ) : (
          <p className="text-[12px] leading-relaxed text-text-tertiary">
            Resolution details for this market aren&apos;t published on-chain. See the metadata
            below for how and when it settles.
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border-subtle pt-3">
          {meta.map((m) => (
            <div key={m.label} className="flex flex-col gap-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                {m.label}
              </dt>
              <dd className="mono text-[12px] font-medium text-text-primary">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
