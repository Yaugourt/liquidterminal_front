"use client";

import { motion } from "framer-motion";
import { ExternalLink, Copy, CheckCircle2, Vault } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { IndexerVaultDetailsData, IndexerVaultSummaryItem } from "@/services/explorer/vault/types";

interface VaultDetailHeaderProps {
  vaultAddress: string;
  details: IndexerVaultDetailsData | null;
  summaryFallback?: IndexerVaultSummaryItem | null;
  isLoading: boolean;
}

export function VaultDetailHeader({
  vaultAddress,
  details,
  summaryFallback,
  isLoading,
}: VaultDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const name = details?.name ?? summaryFallback?.name ?? "Vault";
  const leader = details?.leader ?? summaryFallback?.leader ?? "";
  const isClosed = details?.isClosed ?? summaryFallback?.isClosed ?? false;
  const leaderCommission = details?.leaderCommission ?? summaryFallback?.leaderCommission;

  const copy = () => {
    navigator.clipboard.writeText(vaultAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center flex-shrink-0">
          <Vault className="w-6 h-6 text-brand-accent" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-6 w-48 bg-white/5 animate-pulse rounded" />
              <div className="h-4 w-72 bg-white/5 animate-pulse rounded" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-inter font-bold text-text-primary">{name}</h1>
                <StatusBadge variant={isClosed ? "error" : "success"}>
                  {isClosed ? "Closed" : "Open"}
                </StatusBadge>
                {leaderCommission !== undefined && (
                  <span className="text-[11px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full font-medium">
                    {(leaderCommission * 100).toFixed(0)}% commission
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {/* Vault address */}
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted text-xs">Vault</span>
                  <code className="font-mono text-xs text-brand-accent">
                    {vaultAddress.slice(0, 8)}…{vaultAddress.slice(-6)}
                  </code>
                  <button
                    onClick={copy}
                    className="text-text-muted hover:text-brand-accent transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`https://app.hyperliquid.xyz/vaults/${vaultAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-brand-accent transition-colors"
                    title="Open on HyperLiquid"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Leader */}
                {leader && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted text-xs">Leader</span>
                    <AddressDisplay address={leader} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
