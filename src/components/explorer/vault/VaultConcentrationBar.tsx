"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { AddressDisplay } from "@/components/ui/address-display";
import { chartPalette, Skeleton } from "@/components/common";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

interface VaultConcentrationBarProps {
  vaultAddress: string;
}

interface DepositorAgg {
  address: string;
  net: number;
}

/**
 * Aggregates net deposits per depositor from the vault ledger.
 * Shows the top 5 contributors as a stacked share bar with HHI concentration index.
 * `net` is signed: positive = depositor put more in than they pulled out.
 */
export function VaultConcentrationBar({ vaultAddress }: VaultConcentrationBarProps) {
  const { entries, isLoading } = useVaultLedger({ vaultAddress, limit: 2000 });

  const { top, others, totalNet, hhi } = useMemo(() => {
    if (!entries.length) {
      return { top: [] as DepositorAgg[], others: 0, totalNet: 0, hhi: 0 };
    }
    const vaultLower = vaultAddress.toLowerCase();
    const byAddress = new Map<string, number>();
    for (const e of entries) {
      if (e.userFrom.toLowerCase() === vaultLower) {
        // Withdrawal — userTo received funds back.
        byAddress.set(
          e.userTo.toLowerCase(),
          (byAddress.get(e.userTo.toLowerCase()) ?? 0) - e.amount
        );
      } else if (e.userTo.toLowerCase() === vaultLower) {
        // Deposit — userFrom contributed.
        byAddress.set(
          e.userFrom.toLowerCase(),
          (byAddress.get(e.userFrom.toLowerCase()) ?? 0) + e.amount
        );
      }
    }
    const positive = Array.from(byAddress.entries())
      .filter(([, v]) => v > 0)
      .map(([address, net]) => ({ address, net }))
      .sort((a, b) => b.net - a.net);

    const totalNet = positive.reduce((acc, d) => acc + d.net, 0);
    const top = positive.slice(0, 5);
    const others = positive.slice(5).reduce((acc, d) => acc + d.net, 0);

    // Herfindahl-Hirschman Index — sum of squared shares × 10 000 (industry convention).
    const hhi = totalNet
      ? positive.reduce((acc, d) => acc + Math.pow(d.net / totalNet, 2), 0) * 10000
      : 0;

    return { top, others, totalNet, hhi };
  }, [entries, vaultAddress]);

  const palette = chartPalette.multiSeries;
  const topShare = totalNet ? (top.reduce((a, d) => a + d.net, 0) / totalNet) * 100 : 0;
  const othersShare = totalNet ? (others / totalNet) * 100 : 0;

  const concentrationLabel =
    hhi >= 2500 ? "High" : hhi >= 1500 ? "Moderate" : "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text-primary">Depositor concentration</h3>
        </div>
        {/* Only show the stats when real ledger data backs them: zeroed HHI
            and a "Low" level on an empty ledger would be fake values. */}
        {!isLoading && top.length > 0 && (
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-text-tertiary">
              HHI <span className="mono text-text-primary">{hhi.toFixed(0)}</span>
            </span>
            <span className="text-text-tertiary">
              Top 5 <span className="mono text-text-primary">{topShare.toFixed(1)}%</span>
            </span>
            <span className="text-text-tertiary">
              Level <span className="text-text-primary">{concentrationLabel}</span>
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-10 rounded" />
      ) : entries.length === 0 ? (
        <p className="text-text-tertiary text-sm text-center py-6">
          Ledger data unavailable for this vault.
        </p>
      ) : top.length === 0 ? (
        <p className="text-text-tertiary text-sm text-center py-6">
          No net depositor data available.
        </p>
      ) : (
        <>
          <div className="h-3 w-full rounded-full overflow-hidden bg-surface-2 flex">
            {top.map((d, i) => {
              const pct = (d.net / totalNet) * 100;
              return (
                <div
                  key={d.address}
                  style={{ width: `${pct}%`, background: palette[i] }}
                  className="transition-all"
                  title={`${d.address.slice(0, 8)}…${d.address.slice(-4)} · ${pct.toFixed(2)}%`}
                />
              );
            })}
            {othersShare > 0 && (
              <div
                style={{ width: `${othersShare}%` }}
                className="bg-text-tertiary/30 transition-all"
                title={`Others · ${othersShare.toFixed(2)}%`}
              />
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {top.map((d, i) => (
              <div key={d.address} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: palette[i] }}
                />
                <AddressDisplay address={d.address} />
                <span className="mono text-text-secondary ml-auto">
                  ${formatLargeNumber(d.net, { decimals: 2 })}
                </span>
                <span className="mono text-text-tertiary w-12 text-right">
                  {((d.net / totalNet) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
            {others > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full flex-shrink-0 bg-text-tertiary/30" />
                <span className="text-text-secondary">Others</span>
                <span className="mono text-text-secondary ml-auto">
                  ${formatLargeNumber(others, { decimals: 2 })}
                </span>
                <span className="mono text-text-tertiary w-12 text-right">
                  {othersShare.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
