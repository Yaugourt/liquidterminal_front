"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { KpiRibbon, KpiCell, chartPalette } from "@/components/common";
import { compactUsd, formatMetricValue } from "@/lib/formatters/numberFormatting";
import {
  useProject,
  useProjectMetrics,
  useProjectContext,
  useTvlHistory,
} from "@/services/ecosystem/project";
import {
  ProjectDetailHeader,
  ProjectInfoRail,
  MetricChartCard,
  ProjectContextKpis,
  ProjectPositionStrip,
  ProjectPeersModule,
  OnHyperliquidCard,
  ProjectDataNote,
} from "@/components/ecosystem/project/detail";
import { EcosystemBanner } from "@/components/ecosystem/project/EcosystemBanner";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const projectId = parseInt(id);
  const router = useRouter();

  const { project, isLoading } = useProject(projectId);
  const { metrics } = useProjectMetrics(projectId);
  const { context } = useProjectContext(projectId);
  const { history } = useTvlHistory(project?.defillamaSlug ?? null);

  const position = context?.position ?? null;
  const peers = context?.peers ?? [];
  const isLinked = Boolean(project?.defillamaSlug);

  // "Situer d'abord": the header badge carries the rank when there is one.
  const headerBadge = useMemo(() => {
    if (position?.categoryRank != null && position.category) {
      const isTop = position.categoryRank === 1;
      return (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
            isTop ? "bg-success/10 border-success/25 text-success" : "bg-brand/10 border-brand/25 text-brand"
          }`}
        >
          #{position.categoryRank} {position.category} on Hyperliquid
        </span>
      );
    }
    return null;
  }, [position]);

  // TVL chart: HL series preferred; global fallback is labeled honestly.
  const tvlSeries = history?.hl ?? history?.global ?? null;
  const tvlScope = history?.hl ? "Hyperliquid L1" : "all chains";

  const tokenCells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];
    if (metrics?.price) {
      out.push({
        key: "price",
        label: "Price",
        value: formatMetricValue(metrics.price.value, {
          prefix: "$",
          format: "US",
          minimumFractionDigits: 2,
          maximumFractionDigits: metrics.price.value < 1 ? 5 : 2,
        }),
        sub: metrics.price.source ? `via ${metrics.price.source}` : undefined,
      });
    }
    if (metrics?.marketCap) {
      out.push({ key: "mcap", label: "Market cap", value: compactUsd(metrics.marketCap.value) });
    }
    return out;
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState message="Loading project..." size="sm" withCard={false} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <h1 className="text-xl font-semibold text-text-primary">Project not found</h1>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const dbCategoryName = project.categories?.[0]?.name;
  const peersTitle =
    context?.peersScope === "defillama-category" && position?.category
      ? `${position.category} on Hyperliquid`
      : dbCategoryName
        ? `More in ${dbCategoryName} on LiquidTerminal`
        : "More on LiquidTerminal";
  const peersTag =
    context?.peersScope === "defillama-category" &&
    position?.categorySize != null &&
    position.categoryTvl != null
      ? `${position.categorySize} protocols · ${compactUsd(position.categoryTvl)}`
      : undefined;

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto">
      <nav className="flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
        <Link href="/ecosystem/project" className="hover:text-text-secondary">
          Ecosystem
        </Link>
        <span>/</span>
        <Link href="/ecosystem/project" className="hover:text-text-secondary">
          Projects
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{project.title}</span>
      </nav>

      <ProjectDetailHeader project={project} badge={headerBadge} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
        <div className="min-w-0 space-y-4">
          {/* Fundamentals, HL-scoped when positioned; global (labeled) otherwise. */}
          <ProjectContextKpis position={position} metrics={metrics} />

          {position && <ProjectPositionStrip position={position} chainTvl={context?.chain.tvl ?? null} />}

          {tvlSeries && tvlSeries.length > 1 && (
            <MetricChartCard
              title={`Total Value Locked · ${tvlScope}`}
              series={tvlSeries}
              currentValue={compactUsd(tvlSeries[tvlSeries.length - 1].v)}
              color={chartPalette.accent}
              formatValue={(v) => compactUsd(v)}
              defaultTimeframe="1Y"
            />
          )}

          {/* Unlinked pages still situate the project in its chain. */}
          {!isLinked && <EcosystemBanner stats={context?.chain} helper="the chain this project builds on" />}

          <ProjectPeersModule
            title={peersTitle}
            tag={peersTag}
            peers={peers}
            showShare={context?.peersScope === "defillama-category"}
          />

          {tokenCells.length > 0 && (
            <KpiRibbon header={{ label: "Token", helper: project.token ? `$${project.token}` : undefined }} cells={tokenCells} />
          )}
        </div>

        <aside className="xl:sticky xl:top-6 space-y-4">
          {context && (isLinked || position) ? (
            <OnHyperliquidCard chain={context.chain} position={position} />
          ) : null}
          {!isLinked && <ProjectDataNote />}
          <ProjectInfoRail project={project} sources={isLinked ? ["DEFILLAMA"] : undefined} />
        </aside>
      </div>
    </div>
  );
}
