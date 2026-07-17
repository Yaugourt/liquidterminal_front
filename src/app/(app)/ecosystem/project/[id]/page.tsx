"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { chartPalette } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import {
  useProject,
  useProjectMetrics,
  useProjectContext,
  useTvlHistory,
} from "@/services/ecosystem/project";
import {
  ProjectDetailHeader,
  MetricChartCard,
  ProjectContextKpis,
  ProjectPeersModule,
  FeesRevenueTable,
  PositionRailCard,
  ProjectLinksCard,
  OnHyperliquidCard,
  AboutMetaCard,
  ListingNotice,
} from "@/components/ecosystem/project/detail";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const projectId = parseInt(id);
  const router = useRouter();

  const { project, isLoading } = useProject(projectId);
  const { metrics, fees, revenue, tokenSymbol } = useProjectMetrics(projectId);
  const { context } = useProjectContext(projectId);
  const { history } = useTvlHistory(project?.defillamaSlug ?? null);

  const position = context?.position ?? null;
  const peers = context?.peers ?? [];
  const isLinked = Boolean(project?.defillamaSlug);

  // The header badge says the position once — it is not repeated below.
  const headerBadge = useMemo(() => {
    if (position?.categoryRank != null && position.categorySize != null && position.category) {
      return (
        <span className="text-[11px] px-2 py-0.5 rounded-md border font-medium bg-brand/10 border-brand/25 text-brand">
          #{position.categoryRank} of {position.categorySize} · {position.category} on Hyperliquid
        </span>
      );
    }
    if (project && !project.defillamaSlug) {
      return (
        <span className="text-[11px] px-2 py-0.5 rounded-md border bg-surface-2 border-border-subtle text-text-tertiary">
          Listing only
        </span>
      );
    }
    return null;
  }, [position, project]);

  // TVL chart: HL series preferred; global fallback is labeled honestly.
  const tvlSeries = history?.hl ?? history?.global ?? null;
  const tvlScope = history?.hl ? "Hyperliquid L1" : "all chains";

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
        ? `${dbCategoryName} on Hyperliquid`
        : "More on LiquidTerminal";
  const peersTag =
    context?.peersScope === "defillama-category" &&
    position?.categorySize != null &&
    position.categoryTvl != null
      ? `${position.categorySize} protocols · ${compactUsd(position.categoryTvl)}`
      : context?.peersScope === "db-category"
        ? "top by TVL"
        : undefined;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
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

      <ProjectDetailHeader
        project={project}
        badge={headerBadge}
        metaSuffix={`Listed ${new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}${isLinked ? " · data via DefiLlama" : ""}`}
      />

      {/* Listing-only: one honest full-width line, then the category as next destination. */}
      {!isLinked && <ListingNotice />}

      {/* Single fundamentals ribbon — the token price is a cell, not a card. */}
      {isLinked && <ProjectContextKpis position={position} metrics={metrics} tokenSymbol={tokenSymbol} />}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
        <div className="min-w-0 space-y-4">
          {tvlSeries && tvlSeries.length > 1 && (
            <MetricChartCard
              title={`TVL on ${tvlScope === "Hyperliquid L1" ? "Hyperliquid" : "all chains"}`}
              series={tvlSeries}
              currentValue={compactUsd(tvlSeries[tvlSeries.length - 1].v)}
              color={chartPalette.accent}
              formatValue={(v) => compactUsd(v)}
              defaultTimeframe="1Y"
            />
          )}

          {isLinked && <FeesRevenueTable fees={fees} revenue={revenue} />}

          <ProjectPeersModule
            title={peersTitle}
            tag={peersTag}
            peers={peers}
            showShare={context?.peersScope === "defillama-category"}
          />
        </div>

        <aside className="xl:sticky xl:top-6 space-y-4">
          {position && <PositionRailCard position={position} />}
          <ProjectLinksCard project={project} />
          {!isLinked && <AboutMetaCard project={project} />}
          {isLinked && context && <OnHyperliquidCard chain={context.chain} position={position} />}
        </aside>
      </div>
    </div>
  );
}
