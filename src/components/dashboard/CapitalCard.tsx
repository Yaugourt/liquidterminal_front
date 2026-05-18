"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Vault, Shield, ArrowUpRight } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useValidators } from "@/services/explorer/validator";
import type { Validator } from "@/services/explorer/validator/types/validators";
import { compactUsd, formatStakeValue } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * CapitalCard — où se trouve le capital de l'écosystème : vaults OU validators.
 *
 * Remonte des données jusqu'ici cachées : pour les vaults, le Leader ; pour
 * les validators, Uptime et Commission (signaux de confiance) + le compte de
 * validators actifs en sous-titre.
 */

type Kind = "vaults" | "validators";

const TOP_N = 6;

interface VaultRow {
  name: string;
  leader: string;
  vaultAddress: string;
  apr: number;
  tvl: number;
}

/** Commission/uptime arrivent tantôt en fraction (0-1), tantôt en pourcent. */
const asPercent = (v: number) => (v <= 1 ? v * 100 : v);

function VaultsTable() {
  const { format } = useNumberFormat();
  const { vaults, totalTvl, totalCount, isLoading, error } = useVaults({
    limit: 1000,
    sortBy: "tvl",
  });

  const rows: VaultRow[] = useMemo(
    () =>
      vaults.slice(0, TOP_N).map((v) => ({
        name: v.summary.name,
        leader: v.summary.leader,
        vaultAddress: v.summary.vaultAddress,
        apr: v.apr,
        tvl: parseFloat(v.summary.tvl),
      })),
    [vaults],
  );

  const columns: Column<VaultRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Vault",
        accessor: (v) => (
          <span className="font-medium text-text-primary truncate block max-w-[180px]" title={v.name}>
            {v.name}
          </span>
        ),
      },
      { key: "leader", header: "Leader", type: "address", accessor: "leader" },
      {
        key: "apr",
        header: "APR",
        type: "numeric",
        accessor: (v) => `${v.apr.toFixed(1)}%`,
      },
      {
        key: "tvl",
        header: "TVL",
        type: "numeric",
        accessor: (v) => compactUsd(v.tvl),
      },
    ],
    [],
  );

  void format;

  return (
    <TypedDataTable<VaultRow>
      title="Top Vaults"
      icon={<Vault size={14} className="text-brand" />}
      subtitle={
        <span className="mono text-text-secondary">
          {compactUsd(totalTvl)}{" "}
          <span className="font-sans text-text-tertiary">TVL · {totalCount} vaults</span>
        </span>
      }
      headerAction={
        <Link
          href="/explorer/vaults"
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      }
      data={rows}
      columns={columns}
      getRowKey={(v) => v.vaultAddress}
      isLoading={isLoading}
      error={error}
      emptyMessage="No vaults available"
      emptyDescription=""
      density="compact"
      rowMotion
    />
  );
}

function ValidatorsTable() {
  const { format } = useNumberFormat();
  const { validators, stats, isLoading, error } = useValidators();

  const rows = useMemo(
    () => [...validators].sort((a, b) => b.stake - a.stake).slice(0, TOP_N),
    [validators],
  );

  const columns: Column<Validator>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Validator",
        accessor: (v) => (
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                v.isActive ? "bg-success" : "bg-text-tertiary"
              }`}
              title={v.isActive ? "Active" : "Inactive"}
            />
            <span className="font-medium text-text-primary truncate" title={v.name}>
              {v.name}
            </span>
          </div>
        ),
      },
      {
        key: "apr",
        header: "APR",
        type: "numeric",
        accessor: (v) => `${v.apr.toFixed(1)}%`,
      },
      {
        key: "commission",
        header: "Comm.",
        type: "numeric",
        accessor: (v) => `${asPercent(v.commission).toFixed(1)}%`,
      },
      {
        key: "uptime",
        header: "Uptime",
        type: "numeric",
        accessor: (v) => `${asPercent(v.uptime).toFixed(1)}%`,
      },
      {
        key: "stake",
        header: "Stake",
        type: "numeric",
        accessor: (v) => formatStakeValue(v.stake, format),
      },
    ],
    [format],
  );

  return (
    <TypedDataTable<Validator>
      title="Top Validators"
      icon={<Shield size={14} className="text-brand" />}
      subtitle={
        <span className="text-text-tertiary">
          <span className="mono text-success">{stats.active}</span> active
          <span className="mx-1">·</span>
          <span className="mono text-text-secondary">{stats.total}</span> total
        </span>
      }
      headerAction={
        <Link
          href="/explorer/validator"
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      }
      data={rows}
      columns={columns}
      getRowKey={(v) => v.validator}
      isLoading={isLoading}
      error={error}
      emptyMessage="No validators available"
      emptyDescription=""
      density="compact"
      rowMotion
    />
  );
}

export const CapitalCard = memo(function CapitalCard({ kind }: { kind: Kind }) {
  return kind === "vaults" ? <VaultsTable /> : <ValidatorsTable />;
});
