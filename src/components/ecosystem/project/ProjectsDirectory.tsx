"use client";

import { memo, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ModuleTable, ModuleTableRow, SearchBar } from "@/components/common";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ProjectModal } from "./ProjectModal";
import { useCategories, useProjectsMetricsMap } from "@/services/ecosystem/project";
import { fetchAllProjects } from "@/services/ecosystem/project/api";
import { Project, ProjectListMetric } from "@/services/ecosystem/project/types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useAuthContext } from "@/contexts/auth.context";
import { canCreateProject } from "@/lib/roleHelpers";
import { groupCategories } from "@/lib/categoryLabels";
import { compactUsd } from "@/lib/formatters/numberFormatting";

type DataState = "all" | "tracked" | "listing";

const DASH = <span className="mono text-text-tertiary">—</span>;
/** Below this a TVL headline compacts to "$0.00" — an anti-signal, render a dash. */
const TVL_DISPLAY_FLOOR = 1_000;
const CATEGORIES_COLLAPSED = 7;

/** Tiny logo with initials fallback (several r2.dev logos 404 in prod). */
function RowLogo({ logo, name, muted }: { logo: string; name: string; muted?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) {
    return (
      <span className={`w-6 h-6 rounded bg-surface-2 border border-border-subtle grid place-items-center text-[8px] font-semibold shrink-0 ${muted ? "text-text-tertiary" : "text-text-secondary"}`}>
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <Image src={logo} alt={name} width={24} height={24} className="rounded object-cover shrink-0" onError={() => setFailed(true)} />
  );
}

function changeCell(change7d: number | null | undefined): React.ReactNode {
  if (change7d == null) return DASH;
  const sign = change7d >= 0 ? "+" : "";
  return (
    <span className={`mono text-[11.5px] ${change7d >= 0 ? "text-success" : "text-danger"}`}>
      {sign}
      {change7d.toFixed(1)}%
    </span>
  );
}

/** Canonical category label of a project (dirty backend variants collapsed). */
function categoryLabelOf(project: Project): string | null {
  if (!project.categories || project.categories.length === 0) return null;
  return groupCategories(project.categories)[0]?.label ?? null;
}

/**
 * The verdict list: one comparable table (tracked projects ranked by TVL on HL,
 * then a "Listing only" section, alphabetical, with honest dashes) plus a
 * category rail that replaces the clipping filter pills.
 */
export const ProjectsDirectory = memo(function ProjectsDirectory() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [dataState, setDataState] = useState<DataState>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { metricsById } = useProjectsMetricsMap();
  const { refetch: refetchCategories } = useCategories();

  const {
    data: catalog,
    isLoading,
    error,
    refetch,
  } = useDataFetching<Project[]>({
    fetchFn: () => fetchAllProjects(),
    refreshInterval: 300000,
    dependencies: [],
    maxRetries: 2,
  });

  const projects = useMemo(() => catalog ?? [], [catalog]);

  // Category distribution over the whole catalog (canonical labels).
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const label = categoryLabelOf(p);
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const recentlyAdded = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [projects]
  );

  // Filters → then split tracked (ranked by TVL on HL) / listing-only (A–Z).
  const { tracked, listing, trackedTotal, listingTotal } = useMemo(() => {
    const metricOf = (p: Project): ProjectListMetric | undefined => metricsById.get(p.id);
    const isTracked = (p: Project): boolean => metricOf(p) !== undefined;

    const q = search.trim().toLowerCase();
    const matches = (p: Project): boolean => {
      if (categoryFilter && categoryLabelOf(p) !== categoryFilter) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    };

    const filtered = projects.filter(matches);
    const trackedRows = filtered
      .filter(isTracked)
      .sort((a, b) => {
        const ma = metricOf(a);
        const mb = metricOf(b);
        const tvlDiff = (mb?.hlTvl ?? 0) - (ma?.hlTvl ?? 0);
        if (tvlDiff !== 0) return tvlDiff;
        return (mb?.fees24h ?? 0) - (ma?.fees24h ?? 0);
      });
    const listingRows = filtered
      .filter((p) => !isTracked(p))
      .sort((a, b) => a.title.localeCompare(b.title));

    return {
      tracked: dataState === "listing" ? [] : trackedRows,
      listing: dataState === "tracked" ? [] : listingRows,
      trackedTotal: projects.filter(isTracked).length,
      listingTotal: projects.length - projects.filter(isTracked).length,
    };
  }, [projects, metricsById, search, categoryFilter, dataState]);

  const columns = [
    { header: "#", width: 44, align: "right" as const },
    { header: "Project", align: "left" as const },
    { header: "Category", width: 150, align: "left" as const },
    { header: "TVL on HL", width: 105 },
    { header: "7d", width: 70 },
    { header: "Fees 24h", width: 90 },
  ];

  const renderRow = (project: Project, rank: number | null) => {
    const metric = metricsById.get(project.id);
    const label = categoryLabelOf(project);
    const hlTvl = metric?.hlTvl != null && metric.hlTvl >= TVL_DISPLAY_FLOOR ? metric.hlTvl : null;
    return (
      <ModuleTableRow
        key={project.id}
        href={`/ecosystem/project/${project.id}`}
        cells={[
          <span key="rank" className="mono text-[11px] text-text-tertiary">{rank ?? "—"}</span>,
          <span key="name" className="flex items-center gap-2.5 min-w-0">
            <RowLogo logo={project.logo} name={project.title} muted={rank == null} />
            <span className="font-medium text-text-primary truncate shrink-0 max-w-[160px]">{project.title}</span>
            <span className="text-text-tertiary truncate hidden lg:inline text-[12px]">{project.desc}</span>
          </span>,
          // The DefiLlama category (Lending, Liquid Staking…) carries the rank;
          // the broader DB label (DeFi) is only the fallback for untracked rows.
          <span key="cat" className="text-[12px] text-text-secondary">
            {metric?.category ?? label ?? ""}
            {metric?.categoryRank != null && metric.category && (
              <span className="mono text-brand text-[11px] ml-1.5">#{metric.categoryRank}</span>
            )}
          </span>,
          hlTvl != null ? <span key="tvl" className="mono text-[12px] text-text-primary">{compactUsd(hlTvl)}</span> : DASH,
          changeCell(metric?.change7d),
          metric?.fees24h != null && metric.fees24h > 0 ? (
            <span key="fees" className="mono text-[12px] text-gold">{compactUsd(metric.fees24h)}</span>
          ) : (
            DASH
          ),
        ]}
      />
    );
  };

  const dataStateTab = (state: DataState, label: string, count: number) => (
    <button
      onClick={() => setDataState(state)}
      className={`text-xs transition-colors ${dataState === state ? "text-brand font-medium" : "text-text-tertiary hover:text-text-primary"}`}
    >
      {label} <span className="mono text-text-tertiary">{count}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
      {/* Directory table */}
      <div className="min-w-0 bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <SearchBar onSearch={setSearch} placeholder={`Search ${projects.length || 208} projects…`} className="flex-1 min-w-[180px] max-w-xs" />
          <div className="flex items-center gap-3">
            {dataStateTab("all", "All", projects.length)}
            {dataStateTab("tracked", "Tracked", trackedTotal)}
            {dataStateTab("listing", "Listing only", listingTotal)}
          </div>
          <span className="text-text-tertiary text-[11.5px] ml-auto shrink-0 hidden sm:inline">sorted by TVL on HL</span>
          {canCreateProject(user) && <ProjectModal onSuccess={() => { refetch(); refetchCategories(); }} />}
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="py-16"><LoadingState message="Loading projects..." size="sm" withCard={false} /></div>
        ) : error && projects.length === 0 ? (
          <ErrorState title="Failed to load projects" message={error.message || "Please try again later."} />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <ModuleTable columns={columns}>
                {tracked.map((p, i) => renderRow(p, i + 1))}
                {listing.length > 0 && dataState === "all" && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.08em] text-text-tertiary border-b border-border-subtle">
                      Listing only · {listingTotal} projects with no tracked on-chain data · A–Z
                    </td>
                  </tr>
                )}
                {listing.map((p) => renderRow(p, null))}
              </ModuleTable>
              {tracked.length === 0 && listing.length === 0 && (
                <p className="px-4 py-10 text-center text-[12.5px] text-text-tertiary">
                  No project matches {search ? `"${search}"` : "this filter"}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category rail — the filter that never clips */}
      <div className="space-y-4">
        <div className="bg-surface border border-border-subtle rounded-lg">
          <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
            <h3 className="text-[13px] font-medium text-text-primary">Categories</h3>
            {categoryFilter ? (
              <button onClick={() => setCategoryFilter(null)} className="text-[11px] text-brand hover:text-brand-hover">
                Clear
              </button>
            ) : (
              <span className="text-[11px] text-text-tertiary mono">{projects.length}</span>
            )}
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {categoryCounts
              .slice(0, categoriesExpanded ? undefined : CATEGORIES_COLLAPSED)
              .map(([label, count]) => {
                const max = categoryCounts[0]?.[1] ?? 1;
                const active = categoryFilter === label;
                return (
                  <button
                    key={label}
                    onClick={() => setCategoryFilter(active ? null : label)}
                    className="flex items-center gap-2 w-full text-left text-[12px] group"
                  >
                    <span className={`w-24 truncate shrink-0 ${active ? "text-brand font-medium" : "text-text-secondary group-hover:text-text-primary"}`}>
                      {label}
                    </span>
                    <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <span
                        className={`block h-full ${active ? "bg-brand" : "bg-brand/50"}`}
                        style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                      />
                    </span>
                    <span className="mono text-text-tertiary w-7 text-right shrink-0">{count}</span>
                  </button>
                );
              })}
            {categoryCounts.length > CATEGORIES_COLLAPSED && (
              <button
                onClick={() => setCategoriesExpanded((v) => !v)}
                className="text-[11.5px] text-brand hover:text-brand-hover pt-1"
              >
                {categoriesExpanded ? "Show less" : `+ ${categoryCounts.length - CATEGORIES_COLLAPSED} more categories`}
              </button>
            )}
          </div>
        </div>

        {recentlyAdded.length > 0 && (
          <div className="bg-surface border border-border-subtle rounded-lg">
            <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
              <h3 className="text-[13px] font-medium text-text-primary">Recently added</h3>
              <span className="text-[11px] text-text-tertiary mono">{recentlyAdded.length}</span>
            </div>
            <div className="px-2 py-2 text-[12px]">
              {recentlyAdded.map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/ecosystem/project/${p.id}`)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded w-full text-left hover:bg-surface-2"
                >
                  <RowLogo logo={p.logo} name={p.title} muted />
                  <span className="text-text-primary truncate">{p.title}</span>
                  <span className="mono text-text-tertiary text-[10.5px] ml-auto shrink-0">
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
