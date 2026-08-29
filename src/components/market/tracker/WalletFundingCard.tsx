"use client";

import { useMemo } from "react";
import { Banknote } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  type KpiCell,
} from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useWalletFundingSummary } from "@/services/market/tracker/wallet-performance";

interface WalletFundingCardProps {
  address: string;
}

/**
 * Funding cost ledger for a wallet — net funding paid vs received, overall and
 * by coin. The backend aggregates the raw funding events into these totals, so
 * this component only formats them. Hidden when the wallet has no funding
 * history (or the summary endpoint is unavailable).
 */
export function WalletFundingCard({ address }: WalletFundingCardProps) {
  const { format } = useNumberFormat();
  const { funding, isLoading, error } = useWalletFundingSummary(address);

  const signed = (v: number) =>
    `${v >= 0 ? "+" : "-"}$${formatNumber(Math.abs(v), format, { maximumFractionDigits: 2 })}`;

  const cells = useMemo<KpiCell[]>(() => {
    if (!funding) return [];
    return [
      {
        key: "net",
        label: "Net funding",
        value: signed(funding.net_usdc),
        sub: funding.net_usdc >= 0 ? "net received" : "net cost",
        tone: funding.net_usdc >= 0 ? "success" : "danger",
      },
      {
        key: "received",
        label: "Received",
        value: `$${formatNumber(funding.received_usdc, format, { maximumFractionDigits: 2 })}`,
        sub: "funding earned",
        tone: "success",
      },
      {
        key: "paid",
        label: "Paid",
        value: `$${formatNumber(funding.paid_usdc, format, { maximumFractionDigits: 2 })}`,
        sub: "funding cost",
        tone: "danger",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funding, format]);

  // Self-gate: no funding history, or the summary endpoint isn't live yet.
  if (isLoading && !funding) return null;
  if (error || !funding || funding.event_count === 0) return null;

  const topCoins = funding.by_coin.slice(0, 6);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Banknote size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Funding ledger</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {funding.event_count.toLocaleString()} events
        </span>
      </div>

      <KpiRibbon cells={cells} />

      {topCoins.length > 0 && (
        <div className="border-t border-border-subtle">
          <div className="px-3.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
            Net funding by coin
          </div>
          <ModuleTable
            density="compact"
            columns={[
              { header: "Coin", align: "left" },
              { header: "Net funding", align: "right" },
            ]}
          >
            {topCoins.map((c) => (
              <ModuleTableRow
                key={c.coin}
                cells={[
                  <ModuleAsset key="c" tone="neutral" assetName={c.coin} kind="auto" name={c.coin} />,
                  <span
                    key="n"
                    className={`mono font-medium ${c.net_usdc >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {signed(c.net_usdc)}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
        </div>
      )}
    </Card>
  );
}
