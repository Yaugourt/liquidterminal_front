"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { KpiRibbon, OverviewModule, ModuleTable, ModuleTableRow, type KpiCell } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ProjectLogo } from "@/components/ecosystem/project/ProjectLogo";
import { useRankedProjects, useChainStats, type RankedProject } from "@/services/ecosystem/project";
import { compactUsd } from "@/lib/formatters/numberFormatting";

const TOP_N = 8;
const CATEGORIES_SHOWN = 6;
/** Below this a TVL headline compacts to "$0.00" — an anti-signal, render a dash. */
const TVL_DISPLAY_FLOOR = 1_000;

const DASH = <span className="mono text-text-tertiary">—</span>;

type Ranking = "tvl" | "fees" | "movers";

const RANKINGS: Array<{ value: Ranking; label: string }> = [
  { value: "tvl", label: "TVL" },
  { value: "fees", label: "Fees 24h" },
  { value: "movers", label: "Movers 7d" },
];

function Change7d({ value }: { value: number | null }) {
  if (value == null) return DASH;
  return (
    <span className={`mono font-medium ${value >= 0 ? "text-success" : "text-danger"}`}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/**
 * ProjectsRecap — the ecosystem half of the Dashboard's Ecosystem scope.
 *
 * DefiLlama has been feeding /ecosystem/project for a while but never reached
 * the dashboard. Chain ribbon, a leaderboard switchable between the three
 * rankings the batch endpoint already carries, and the category split.
 */
export const ProjectsRecap = memo(function ProjectsRecap() {
  const { stats } = useChainStats();
  const { byTvl, byFees, byMove7d, categoriesByTvl, trackedCount, totalCount, isLoading } =
    useRankedProjects();
  const [ranking, setRanking] = useState<Ranking>("tvl");

  const cells: KpiCell[] = [
    { label: "TVL on Hyperliquid", value: compactUsd(stats?.tvl), sub: "DefiLlama" },
    { label: "Fees 24h", value: compactUsd(stats?.fees24h), tone: "gold", sub: "all protocols" },
    { label: "DEX Volume 24h", value: compactUsd(stats?.volumeDex24h), sub: "onchain" },
    {
      label: "Protocols",
      value: stats?.protocolsTracked != null ? String(stats.protocolsTracked) : "—",
      sub: "tracked on chain",
    },
  ];

  const rows = useMemo<RankedProject[]>(() => {
    const source = ranking === "fees" ? byFees : ranking === "movers" ? byMove7d : byTvl;
    return source.slice(0, TOP_N);
  }, [ranking, byTvl, byFees, byMove7d]);

  const topCategoryTvl = categoriesByTvl[0]?.tvl ?? 0;

  return (
    <div className="space-y-4">
      <KpiRibbon variant="plain" cells={cells} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
        <OverviewModule
          title="Projects"
          tagVariant="plain"
          tag={
            totalCount > 0
              ? `${trackedCount} of ${totalCount} have DefiLlama metrics`
              : undefined
          }
          viewAllLabel="All projects"
          href="/ecosystem/project"
          className="min-w-0"
        >
          <div className="px-3.5 py-2.5 border-b border-border-subtle">
            <PillTabs
              variant="text"
              tabs={RANKINGS}
              activeTab={ranking}
              onTabChange={(value) => setRanking(value as Ranking)}
            />
          </div>
          <div className="overflow-x-auto">
            <ModuleTable
              columns={[
                { header: "#", width: 40, align: "right" },
                { header: "Project", align: "left" },
                { header: "Category", width: 150, align: "left" },
                { header: "TVL on HL", width: 100 },
                { header: "Fees 24h", width: 90 },
                { header: "7d", width: 74 },
              ]}
            >
              {isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-2.5 text-[12px] text-text-tertiary">
                    …
                  </td>
                </tr>
              )}
              {rows.map(({ project, metric }) => {
                const hlTvl =
                  metric.hlTvl != null && metric.hlTvl >= TVL_DISPLAY_FLOOR ? metric.hlTvl : null;
                return (
                  <ModuleTableRow
                    key={project.id}
                    href={`/ecosystem/project/${project.id}`}
                    cells={[
                      <span key="rank" className="mono text-[11px] text-text-tertiary">
                        {metric.hlRank ?? "—"}
                      </span>,
                      <span key="name" className="flex items-center gap-2.5 min-w-0">
                        <ProjectLogo logo={project.logo} name={project.title} />
                        <span className="font-medium text-text-primary truncate">
                          {project.title}
                        </span>
                      </span>,
                      // Flex, not a plain span: `truncate` on an inline element
                      // does not clip, and category names run long.
                      <span key="cat" className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[12px] text-text-secondary truncate">
                          {metric.category ?? ""}
                        </span>
                        {metric.categoryRank != null && metric.category && (
                          <span className="mono text-brand text-[11px] shrink-0">
                            #{metric.categoryRank}
                          </span>
                        )}
                      </span>,
                      hlTvl != null ? (
                        <span key="tvl" className="mono text-text-primary">
                          {compactUsd(hlTvl)}
                        </span>
                      ) : (
                        DASH
                      ),
                      metric.fees24h != null && metric.fees24h > 0 ? (
                        <span key="fees" className="mono text-gold">
                          {compactUsd(metric.fees24h)}
                        </span>
                      ) : (
                        DASH
                      ),
                      <Change7d key="change" value={metric.change7d} />,
                    ]}
                  />
                );
              })}
            </ModuleTable>
          </div>
        </OverviewModule>

        {/* Category split — DefiLlama categories, summed over tracked projects */}
        <div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
          <div className="flex items-baseline gap-2 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
            <h3 className="text-[13px] font-semibold text-text-primary truncate">Categories</h3>
            <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">by TVL</span>
          </div>
          <div className="px-3.5 py-3 space-y-3">
            {categoriesByTvl.length === 0 && (
              <p className="text-[12px] text-text-tertiary">…</p>
            )}
            {categoriesByTvl.slice(0, CATEGORIES_SHOWN).map((row) => (
              <div key={row.category} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11.5px]">
                  <span className="text-text-secondary truncate">{row.category}</span>
                  <span className="mono text-text-tertiary shrink-0">{compactUsd(row.tvl)}</span>
                </div>
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand opacity-70"
                    style={{
                      width: `${topCategoryTvl > 0 ? (row.tvl / topCategoryTvl) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2.5 border-t border-border-subtle mt-auto">
            <Link
              href="/ecosystem/project"
              className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
            >
              Browse all categories →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
