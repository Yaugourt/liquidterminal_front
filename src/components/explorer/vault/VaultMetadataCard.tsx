"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Info, Copy, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type {
  IndexerVaultDetailsData,
  IndexerVaultSummaryItem,
} from "@/services/explorer/vault/types";

interface VaultMetadataCardProps {
  vaultAddress: string;
  details: IndexerVaultDetailsData | null;
  summaryFallback?: IndexerVaultSummaryItem | null;
  childAddresses: string[];
}

function formatLockup(seconds: number | undefined): string | null {
  if (seconds === undefined) return null;
  if (seconds <= 0) return "Instant";
  const days = Math.round(seconds / 86400);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.round(seconds / 3600);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

function formatAge(createTime: number | undefined): string | null {
  if (!createTime) return null;
  const diff = Date.now() - createTime;
  if (diff < 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remDays = (days % 365) % 30;
  if (years > 0) return `${years}y ${months}m ${remDays}d`;
  if (months > 0) return `${months}m ${remDays}d`;
  return `${days}d`;
}

export function VaultMetadataCard({
  vaultAddress,
  details,
  summaryFallback,
  childAddresses,
}: VaultMetadataCardProps) {
  const { format: dateFormat } = useDateFormat();
  const [copied, setCopied] = useState(false);

  const leader = details?.leader ?? summaryFallback?.leader ?? null;
  const createTime = details?.createTime ?? summaryFallback?.createTime;
  const lockup = formatLockup(details?.lockupDurationSeconds);
  const age = formatAge(createTime);
  const commission =
    details?.leaderCommission ?? summaryFallback?.leaderCommission ?? null;
  const allowDeposits = details?.allowDeposits;
  const subVaultCount = childAddresses.length;

  const copy = () => {
    navigator.clipboard.writeText(vaultAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const rows: Array<{ label: string; value: ReactNode }> = [];

  rows.push({
    label: "Vault address",
    value: (
      <span className="flex items-center gap-1.5 mono text-text-primary">
        {vaultAddress.slice(0, 8)}…{vaultAddress.slice(-6)}
        <button
          onClick={copy}
          className="text-text-tertiary hover:text-brand transition-colors"
          title="Copy address"
        >
          {copied ? (
            <CheckCircle2 className="w-3 h-3 text-success" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </span>
    ),
  });

  if (leader) {
    rows.push({ label: "Leader", value: <AddressDisplay address={leader} /> });
  }

  if (createTime) {
    rows.push({
      label: "Created",
      value: <span className="text-text-primary">{formatDate(createTime, dateFormat)}</span>,
    });
  }

  if (age) {
    rows.push({ label: "Age", value: <span className="text-text-primary">{age}</span> });
  }

  if (lockup) {
    rows.push({
      label: "Lockup period",
      value: <span className="text-text-primary">{lockup}</span>,
    });
  }

  if (commission !== null) {
    rows.push({
      label: "Commission",
      value: <span className="mono text-gold">{(commission * 100).toFixed(0)}%</span>,
    });
  }

  if (allowDeposits !== undefined) {
    rows.push({
      label: "Deposits",
      value: (
        <span className={allowDeposits ? "text-success" : "text-danger"}>
          {allowDeposits ? "Open" : "Restricted"}
        </span>
      ),
    });
  }

  if (subVaultCount > 0) {
    rows.push({
      label: "Sub-vaults",
      value: <span className="mono text-text-primary">{subVaultCount}</span>,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
    >
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Info size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Vault metadata</h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 px-3.5 py-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-1 text-xs"
            >
              <dt className="text-text-tertiary">{row.label}</dt>
              <dd className="text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </motion.div>
  );
}
