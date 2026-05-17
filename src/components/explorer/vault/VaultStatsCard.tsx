"use client";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { BarChart2, FolderOpen, Database } from "lucide-react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { StatsPanel } from "@/components/common";

interface InlineStatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}

function InlineStat({ icon, label, value, isLoading }: InlineStatProps) {
  return (
    <div>
      <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
        <span className="mr-1.5">{icon}</span>
        {label}
      </div>
      <div className="text-text-primary font-bold text-xl pl-5">
        {isLoading ? <span className="animate-pulse text-text-muted">--</span> : value}
      </div>
    </div>
  );
}

export function VaultStatsCard() {
  const { totalTvl, totalCount, isLoading } = useVaults();
  const { format } = useNumberFormat();

  return (
    <StatsPanel
      title="Vault Stats"
      icon={<Database size={16} className="text-brand-accent" />}
    >
      <div className="grid grid-cols-1 gap-6 content-center h-full">
        <InlineStat
          icon={<BarChart2 className="h-3.5 w-3.5 text-brand-accent" />}
          label="Total TVL"
          value={<>${formatNumber(totalTvl, format, { maximumFractionDigits: 2 })}</>}
          isLoading={isLoading}
        />
        <InlineStat
          icon={<FolderOpen className="h-3.5 w-3.5 text-brand-accent" />}
          label="Open Vaults"
          value={totalCount}
          isLoading={isLoading}
        />
      </div>
    </StatsPanel>
  );
}
