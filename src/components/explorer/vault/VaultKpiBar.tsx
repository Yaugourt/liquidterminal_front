"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

export function VaultKpiBar() {
  const { vaults, totalTvl, isLoading } = useVaults({ limit: 1000 });

  const stats = useMemo(() => {
    if (!vaults.length) return null;

    const openVaults = vaults.filter((v) => !v.summary.isClosed);
    const closedVaults = vaults.filter((v) => v.summary.isClosed);

    const aprs = vaults.map((v) => v.apr);
    const highestApr = aprs.length ? Math.max(...aprs) : 0;
    const avgApr = aprs.length ? aprs.reduce((a, b) => a + b, 0) / aprs.length : 0;

    return {
      totalTvl,
      openCount: openVaults.length,
      closedCount: closedVaults.length,
      highestApr,
      avgApr,
    };
  }, [vaults, totalTvl]);

  const items = [
    {
      label: "Total TVL",
      value: isLoading || !stats ? "—" : `$${formatLargeNumber(stats.totalTvl, { decimals: 2 })}`,
    },
    {
      label: "Active Vaults",
      value: isLoading || !stats ? "—" : String(stats.openCount),
    },
    {
      label: "Closed Vaults",
      value: isLoading || !stats ? "—" : String(stats.closedCount),
    },
    {
      label: "Highest APR",
      value: isLoading || !stats ? "—" : `${stats.highestApr.toFixed(2)}%`,
    },
    {
      label: "Average APR",
      value: isLoading || !stats ? "—" : `${stats.avgApr.toFixed(2)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="bg-surface border border-border-subtle rounded-lg px-3.5 py-3"
        >
          <div className="mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
              {item.label}
            </span>
          </div>
          <div className="mono text-[20px] leading-tight font-semibold text-text-primary">
            {isLoading && !stats ? (
              <span className="text-text-tertiary">…</span>
            ) : (
              item.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
