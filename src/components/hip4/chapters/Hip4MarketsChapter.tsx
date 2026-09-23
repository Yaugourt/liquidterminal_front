"use client";

import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4AssetTable } from "@/components/hip4/Hip4AssetTable";
import { Hip4PricesGrid } from "@/components/hip4/Hip4PricesGrid";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { Button } from "@/components/ui/button";
import { useHip4MarketsScan } from "@/hooks/use-hip4-markets-scan";
import { formatHypeWei, type Hip4ScanDeploymentResult, type Hip4ContestRow } from "@/services/hip4/markets-scan";
import { RefreshCw } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypedDataTable, type Column } from "@/components/common";

const SCAN_COLUMNS: Column<Hip4ContestRow>[] = [
  {
    key: "id",
    header: "Contest",
    accessor: (r) => `#${r.id}`,
  },
  {
    key: "pool",
    header: "Pool",
    type: "fees",
    accessor: (r) => formatHypeWei(r.pool),
  },
  {
    key: "status",
    header: "Status",
    accessor: (r) =>
      r.root ? (
        <StatusBadge variant="gold">Merkle root published</StatusBadge>
      ) : (
        <StatusBadge variant="neutral">{r.status}</StatusBadge>
      ),
  },
];

function ScanSection({ result }: { result: Hip4ScanDeploymentResult | null }) {
  if (!result) return null;
  const visible = result.rows.filter((r) => r.pool > 0n || r.root);
  return (
    <TypedDataTable<Hip4ContestRow>
      title={result.label}
      subtitle={result.address}
      headerAction={
        // Wrapping text, not a nowrap badge: RPC errors can be long.
        result.error ? <span className="min-w-0 break-words text-[11px] text-danger">RPC: {result.error}</span> : undefined
      }
      data={visible}
      columns={SCAN_COLUMNS}
      getRowKey={(r) => r.id}
      emptyMessage="No contests with pool > 0 or published root in scan window."
      emptyDescription=""
      density="compact"
    />
  );
}

function SectionBanner({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "core" | "evm";
}) {
  return (
    <div
      className={[
        "rounded-lg border px-4 py-3",
        tone === "core"
          ? "border-brand/25 bg-brand/5"
          : "border-border-default bg-surface/50",
      ].join(" ")}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-text-primary">{title}</div>
      <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function Hip4MarketsChapter() {
  const { v1, v2, loading, error, footnote, refresh } = useHip4MarketsScan();

  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <SectionBanner
        tone="core"
        title="HyperCore — # prediction markets"
        subtitle="Illustrative asset indices and price grid below. Outcome coins trade as #‑prefixed spot names on the native CLOB — not read from the EVM contest contracts."
      />

      <section className="space-y-3">
        <div>
          <Hip4SectionTitle className="!mb-1">Sample assets</Hip4SectionTitle>
          <p className="text-xs text-text-secondary">
            Illustrative mids / indices — not live API data.
          </p>
        </div>
        <Hip4AssetTable />
      </section>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Reference price grid</Hip4SectionTitle>
        <Hip4PricesGrid />
      </Hip4GlassPanel>

      <SectionBanner
        tone="evm"
        title="HyperEVM — third-party parimutuel scan"
        subtitle="RPC log scan of V1/V2 ContestCreated and pool state. Merkle settlement here is separate from native L1 VoteGlobalAction."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refresh()}
          disabled={loading}
          className="gap-2 border-border-subtle"
        >
          {loading ? (
            <InlineSpinner />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh on-chain scan
        </Button>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>

      <section className="space-y-3">
        <Hip4SectionTitle className="!mb-0">On-chain contests (RPC)</Hip4SectionTitle>
        {loading && !v1 && !v2 ? (
          <div className="flex items-center gap-2 py-8 text-text-secondary">
            <InlineSpinner className="h-6 w-6 text-brand" />
            Scanning ContestCreated logs…
          </div>
        ) : (
          <div className="space-y-4">
            <ScanSection result={v1} />
            <ScanSection result={v2} />
          </div>
        )}
        <p className="text-[11px] text-text-secondary">{footnote}</p>
      </section>
    </Hip4ChapterShell>
  );
}
