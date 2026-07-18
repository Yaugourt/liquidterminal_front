"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, CheckCircle2, Vault, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/common";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type {
  IndexerVaultDetailsData,
  IndexerVaultSummaryItem,
} from "@/services/explorer/vault/types";

interface VaultDetailHeaderProps {
  vaultAddress: string;
  details: IndexerVaultDetailsData | null;
  summaryFallback?: IndexerVaultSummaryItem | null;
  isLoading: boolean;
}

function formatLockup(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "Instant";
  const days = Math.round(seconds / 86400);
  if (days >= 1) return `${days}d`;
  const hours = Math.round(seconds / 3600);
  return `${hours}h`;
}

export function VaultDetailHeader({
  vaultAddress,
  details,
  summaryFallback,
  isLoading,
}: VaultDetailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { format: dateFormat } = useDateFormat();

  const name = details?.name ?? summaryFallback?.name ?? "Vault";
  const leader = details?.leader ?? summaryFallback?.leader ?? "";
  const isClosed = details?.isClosed ?? summaryFallback?.isClosed ?? false;
  const leaderCommission = details?.leaderCommission ?? summaryFallback?.leaderCommission;
  const lockupSeconds = details?.lockupDurationSeconds;
  const allowDeposits = details?.allowDeposits;
  const createTime = details?.createTime ?? summaryFallback?.createTime;

  const lockupLabel = useMemo(() => formatLockup(lockupSeconds), [lockupSeconds]);

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
      className="bg-surface border border-border-subtle rounded-lg p-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
            <Vault className="w-5 h-5 text-brand" />
          </div>

          {isLoading ? (
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3 w-72 rounded" />
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-lg font-bold text-text-primary truncate">{name}</h1>
                <StatusBadge variant={isClosed ? "inactive" : "success"}>
                  {isClosed ? "Closed" : "Open"}
                </StatusBadge>
                {allowDeposits === false && !isClosed && (
                  <StatusBadge variant="warning">Deposits paused</StatusBadge>
                )}
              </div>
              <div className="flex items-center gap-1.5 mono text-xs text-text-tertiary">
                <span>{vaultAddress.slice(0, 8)}…{vaultAddress.slice(-6)}</span>
                <button
                  onClick={copy}
                  className="hover:text-brand transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <a
                  href={`https://app.hyperliquid.xyz/vaults/${vaultAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors"
                  title="Open on Hyperliquid"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {!isLoading && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {leader && (
              <Meta label="Leader">
                <AddressDisplay address={leader} />
              </Meta>
            )}
            {leaderCommission !== undefined && (
              <Meta label="Commission">
                <span className="mono text-gold">{(leaderCommission * 100).toFixed(0)}%</span>
              </Meta>
            )}
            <Meta label="Lockup">
              <span className="mono text-text-primary">{lockupLabel}</span>
            </Meta>
            {createTime && (
              <Meta label="Created">
                <span className="text-text-primary">{formatDate(createTime, dateFormat)}</span>
              </Meta>
            )}
          </div>
        )}

        {!isLoading && (
          <div className="flex items-center gap-2 lg:ml-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() =>
                window.open(
                  `https://app.hyperliquid.xyz/vaults/${vaultAddress}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              title="Withdraw on Hyperliquid"
            >
              <ArrowUpFromLine className="h-3 w-3" />
              Withdraw
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-text-on"
              disabled={isClosed}
              onClick={() =>
                window.open(
                  `https://app.hyperliquid.xyz/vaults/${vaultAddress}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              title={isClosed ? "Vault is closed" : "Deposit on Hyperliquid"}
            >
              <ArrowDownToLine className="h-3 w-3" />
              Deposit
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</span>
      {children}
    </div>
  );
}
