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
import { Badge } from "@/components/ui/badge";
import { TypedDataTable, type Column } from "@/components/common";

function buildScanColumns(result: Hip4ScanDeploymentResult): Column<Hip4ContestRow>[] {
  return [
    {
      key: "id",
      header: "Contest",
      type: "address",
      accessor: (r) => <span className="font-mono">#{r.id}</span>,
    },
    {
      key: "pool",
      header: (
        <span>
          Pool —{" "}
          <span className="font-semibold text-text-primary">{result.label}</span>{" "}
          <span className="font-mono text-[11px] text-brand-accent">{result.address}</span>
          {result.error ? (
            <span className="ml-2 text-red-400">RPC: {result.error}</span>
          ) : null}
        </span>
      ),
      type: "fees",
      accessor: (r) => (
        <span className="font-semibold text-brand-gold">{formatHypeWei(r.pool)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) =>
        r.root ? (
          <Badge className="bg-brand-gold/15 text-brand-gold">Merkle root published</Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            {r.status}
          </Badge>
        ),
    },
  ];
}

function ScanSection({ result }: { result: Hip4ScanDeploymentResult | null }) {
  if (!result) return null;
  const visible = result.rows.filter((r) => r.pool > 0n || r.root);
  return (
    <TypedDataTable<Hip4ContestRow>
      data={visible}
      columns={buildScanColumns(result)}
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
          ? "border-brand-accent/25 bg-brand-accent/5"
          : "border-border-hover bg-brand-secondary/50",
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

      <Hip4GlassPanel>
        <Hip4SectionTitle>Sample assets</Hip4SectionTitle>
        <p className="mb-4 text-xs text-text-secondary">
          Illustrative mids / indices — not live API data.
        </p>
        <Hip4AssetTable />
      </Hip4GlassPanel>

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
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </div>

      <Hip4GlassPanel>
        <Hip4SectionTitle>On-chain contests (RPC)</Hip4SectionTitle>
        {loading && !v1 && !v2 ? (
          <div className="flex items-center gap-2 py-8 text-text-secondary">
            <InlineSpinner className="h-6 w-6 text-brand-accent" />
            Scanning ContestCreated logs…
          </div>
        ) : (
          <div className="space-y-8">
            <ScanSection result={v1} />
            <ScanSection result={v2} />
          </div>
        )}
        <p className="mt-4 text-[11px] text-text-secondary">{footnote}</p>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
