"use client";

import { ModuleTable, ModuleTableRow } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { DefiLlamaMoneyBlock } from "@/services/ecosystem/project/types";

const DASH = <span className="mono text-text-tertiary">—</span>;

function usd(value: number | null, gold = false): React.ReactNode {
  if (value == null) return DASH;
  return <span className={`mono text-[12px] ${gold ? "text-gold" : "text-text-primary"}`}>{compactUsd(value)}</span>;
}

/** "24h" cell: value plus its real Δ1d when the API provides one. */
function usdWithDelta(block: DefiLlamaMoneyBlock, gold = false): React.ReactNode {
  if (block.total24h == null) return DASH;
  return (
    <span className="whitespace-nowrap">
      <span className={`mono text-[12px] ${gold ? "text-gold" : "text-text-primary"}`}>
        {compactUsd(block.total24h)}
      </span>
      {block.change_1d != null && (
        <span className={`mono text-[10.5px] ml-1.5 ${block.change_1d >= 0 ? "text-success" : "text-danger"}`}>
          {block.change_1d >= 0 ? "+" : ""}
          {block.change_1d.toFixed(1)}%
        </span>
      )}
    </span>
  );
}

interface FeesRevenueTableProps {
  fees: DefiLlamaMoneyBlock | null;
  revenue: DefiLlamaMoneyBlock | null;
}

/**
 * Multi-period fees/revenue card (verdict graft from designer 2): the
 * 7d/30d/all-time depth the API always served and the page never showed.
 * Renders nothing when neither block exists.
 */
export function FeesRevenueTable({ fees, revenue }: FeesRevenueTableProps) {
  if (!fees && !revenue) return null;

  const columns = [
    { header: "", align: "left" as const },
    { header: "24h · Δ1d", width: 130 },
    { header: "7d", width: 90 },
    { header: "30d", width: 90 },
    { header: "All time", width: 100 },
  ];

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-semibold text-text-primary">Fees &amp; revenue</h3>
        <span className="text-[11px] text-text-tertiary">via DefiLlama</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <ModuleTable columns={columns}>
            {fees && (
              <ModuleTableRow
                cells={[
                  <span key="l" className="text-[12.5px] text-text-secondary">Fees paid by users</span>,
                  usdWithDelta(fees, true),
                  usd(fees.total7d),
                  usd(fees.total30d),
                  usd(fees.totalAllTime),
                ]}
              />
            )}
            {revenue && (
              <ModuleTableRow
                cells={[
                  <span key="l" className="text-[12.5px] text-text-secondary">Protocol revenue</span>,
                  usdWithDelta(revenue),
                  usd(revenue.total7d),
                  usd(revenue.total30d),
                  usd(revenue.totalAllTime),
                ]}
              />
            )}
          </ModuleTable>
        </div>
      </div>
    </div>
  );
}
