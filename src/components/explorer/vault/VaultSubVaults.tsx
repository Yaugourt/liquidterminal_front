"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, ChevronRight } from "lucide-react";
import { useVaultSummaries } from "@/services/explorer/vault/hooks/useVaultSummaries";
import { InlineSpinner } from "@/components/ui/inline-spinner";
interface VaultSubVaultsProps {
  childAddresses: string[];
}

export function VaultSubVaults({ childAddresses }: VaultSubVaultsProps) {
  const { summaries, isLoading } = useVaultSummaries({ includeClosed: true, limit: 500 });

  const childSummaries = summaries.filter((s) =>
    childAddresses.includes(s.vaultAddress)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-brand-accent" />
        <h3 className="text-sm font-semibold text-text-primary">
          Sub-Vaults ({childAddresses.length})
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-muted">
          <InlineSpinner className="text-brand-accent" />
          <span className="text-sm">Loading sub-vaults…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {childAddresses.map((addr) => {
            const summary = childSummaries.find((s) => s.vaultAddress === addr);
            return (
              <Link
                key={addr}
                href={`/explorer/vaults/${addr}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-border-subtle hover:border-border-hover hover:bg-white/[0.05] transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {summary?.name ?? `${addr.slice(0, 8)}…${addr.slice(-6)}`}
                  </p>
                  <p className="text-xs text-text-muted font-mono">
                    {addr.slice(0, 10)}…{addr.slice(-6)}
                  </p>
                  {summary && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      {summary.followerCount.toLocaleString()} followers
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-accent transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
