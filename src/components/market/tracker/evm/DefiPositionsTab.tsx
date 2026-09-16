"use client";

import { useMemo } from "react";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRibbon, ModuleTable, ModuleTableRow, Skeleton, type KpiCell } from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { formatAssetValue, formatNumber, compactUsd } from "@/lib/formatters/numberFormatting";
import { useDefiPositions, type DefiPosition, type DefiProtocol } from "@/services/market/tracker/hyperfolio";
import { ProtocolAvatar } from "./ProtocolAvatar";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface DefiPositionsTabProps {
  address: string;
}

/** Same thresholds lending UIs use: comfortable ≥ 1.5, watch ≥ 1.1, at risk below. */
const healthTone = (ratio: number): string =>
  ratio >= 1.5 ? "text-success" : ratio >= 1.1 ? "text-gold" : "text-danger";

const SIDE_TONE: Record<string, string> = {
  supplied: "text-success border-success/30 bg-success/10",
  borrowed: "text-danger border-danger/30 bg-danger/10",
};

const label = (s: string): string => s.replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function SidePill({ side }: { side: string }) {
  const tone = SIDE_TONE[side] ?? "text-text-secondary border-border-subtle bg-surface-2";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>
      {label(side)}
    </span>
  );
}

function PositionTokens({ position }: { position: DefiPosition }) {
  const { format } = useNumberFormat();
  if (position.tokens.length === 0) return <span className="text-text-tertiary">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {position.tokens.slice(0, 3).map((t) => (
        <span key={`${t.address}-${t.symbol}`} className="inline-flex items-center gap-1.5 min-w-0">
          <ProtocolAvatar name={t.symbol} logo={t.logo} size="sm" />
          <span className="mono text-text-primary truncate">
            {formatNumber(t.amount, format, { maximumFractionDigits: t.amount >= 1000 ? 0 : 4 })}
          </span>
          <span className="text-text-tertiary truncate">{t.symbol}</span>
        </span>
      ))}
      {position.reward && position.reward.claimable > 0 && (
        <span className="text-[10px] text-gold">
          +{formatNumber(position.reward.claimable, format, { maximumFractionDigits: 4 })} {position.reward.symbol} claimable
        </span>
      )}
    </div>
  );
}

function ProtocolGroup({ protocol }: { protocol: DefiProtocol }) {
  const { format } = useNumberFormat();
  return (
    <div className="border-t border-border-subtle first:border-t-0">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] flex-wrap">
        <ProtocolAvatar name={protocol.name} logo={protocol.logo} />
        <a
          href={protocol.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-primary hover:text-brand transition-colors"
        >
          {protocol.name}
          <ExternalLink size={12} className="text-text-tertiary" />
        </a>
        {protocol.partial && (
          <span
            title={protocol.warning ?? "Partial data: some token prices were unavailable"}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold"
          >
            <AlertTriangle size={11} />
            partial
          </span>
        )}
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {protocol.positions.length} position{protocol.positions.length > 1 ? "s" : ""}
        </span>
        <span className="mono text-sm font-bold text-text-primary">{formatAssetValue(protocol.totalValue, format)}</span>
      </div>
      {/* Five columns do not fit a phone: the table scrolls inside the card. */}
      <div className="overflow-x-auto scrollbar-brand">
      <ModuleTable
        density="compact"
        columns={[
          { header: "Position", align: "left", width: 150 },
          { header: "Tokens", align: "left", width: 170 },
          { header: "Value", align: "right", width: 100 },
          { header: "APY", align: "right", width: 64 },
          { header: "Health", align: "right", width: 64 },
        ]}
      >
        {protocol.positions.map((p) => (
          <ModuleTableRow
            key={p.id}
            cells={[
              <span key="pos" className="inline-flex items-center gap-1.5 flex-wrap">
                <span className="text-text-primary">{label(p.type)}</span>
                <SidePill side={p.positionType} />
              </span>,
              <PositionTokens key="tok" position={p} />,
              <span key="val" className="mono text-text-primary">
                {formatAssetValue(p.value, format)}
              </span>,
              <span key="apy" className={`mono ${p.apy !== null && p.apy > 0 ? "text-success" : "text-text-tertiary"}`}>
                {p.apy !== null ? `${p.apy.toFixed(2)}%` : "—"}
              </span>,
              <span key="hf" className={`mono ${p.healthRatio !== null ? healthTone(p.healthRatio) : "text-text-tertiary"}`}>
                {p.healthRatio !== null ? p.healthRatio.toFixed(2) : "—"}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
      </div>
    </div>
  );
}

/**
 * DeFi positions grouped by protocol, streamed from the Hyperfolio SSE proxy.
 * Groups appear as each protocol answers; the progress strip tracks
 * `completed/total` until the feed completes (or falls back to JSON).
 */
export function DefiPositionsTab({ address }: DefiPositionsTabProps) {
  const { protocols, progress, stats, status, error, refresh, isLoading } = useDefiPositions(address);
  const { format } = useNumberFormat();

  const active = useMemo(() => protocols.filter((p) => p.positions.length > 0 || p.totalValue > 0), [protocols]);
  const streaming = status === "streaming";

  const cells = useMemo<KpiCell[]>(() => {
    if (!stats) return [];
    return [
      { key: "total", label: "DeFi value", value: compactUsd(stats.totalValue), sub: `${active.length} protocols` },
      {
        key: "apy",
        label: "Weighted APY",
        value: stats.weightedApy !== null ? `${stats.weightedApy.toFixed(2)}%` : "—",
        sub: `${stats.positionsWithApy}/${stats.totalPositions} positions yield`,
        tone: stats.weightedApy !== null && stats.weightedApy > 0 ? "success" : "default",
      },
      {
        key: "daily",
        label: "Est. daily yield",
        value: `$${formatNumber(stats.estimatedYieldDaily, format, { maximumFractionDigits: 2 })}`,
        tone: "gold",
      },
      {
        key: "monthly",
        label: "Est. monthly yield",
        value: `$${formatNumber(stats.estimatedYieldMonthly, format, { maximumFractionDigits: 2 })}`,
        tone: "gold",
      },
    ];
  }, [stats, active.length, format]);

  return (
    <div className="flex flex-col">
      {(streaming || (isLoading && status !== "error" && status !== "rate-limited")) && (
        <div className="px-3.5 py-2 border-b border-border-subtle">
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Scanning HyperEVM protocols…</span>
            <span className="mono text-text-tertiary">
              {progress ? `${progress.completed}/${progress.total}` : "…"}
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-brand transition-[width] duration-300"
              style={{ width: progress && progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : "8%" }}
            />
          </div>
        </div>
      )}

      {(status === "error" || status === "rate-limited") && (
        <div className="p-3.5">
          <HyperfolioNotice kind={status === "rate-limited" ? "rate-limited" : "error"} message={error} onRetry={refresh} />
        </div>
      )}

      {cells.length > 0 && <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4" />}

      {isLoading && active.length === 0 && status !== "error" && status !== "rate-limited" && (
        <div className="p-3.5 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && active.length === 0 && status === "complete" && (
        <EmptyState
          withCard={false}
          title="No DeFi positions"
          description="This wallet holds no positions on HyperEVM protocols."
          minHeight="min-h-[160px]"
        />
      )}

      {active.map((protocol) => (
        <ProtocolGroup key={protocol.id} protocol={protocol} />
      ))}
    </div>
  );
}
