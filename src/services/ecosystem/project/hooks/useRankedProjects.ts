import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAllProjects } from '../api';
import { Project, ProjectListMetric } from '../types';
import { useProjectsMetricsMap } from './useProjectsMetricsMap';

/** A catalog project joined with its DefiLlama metrics. */
export interface RankedProject {
  project: Project;
  metric: ProjectListMetric;
}

export interface ProjectCategoryTotal {
  category: string;
  /** Summed TVL on Hyperliquid across the tracked projects of that category. */
  tvl: number;
  count: number;
}

export interface UseRankedProjectsResult {
  /** Tracked projects ordered by TVL on Hyperliquid, highest first. */
  byTvl: RankedProject[];
  /** Tracked projects ordered by 24h fees, highest first. */
  byFees: RankedProject[];
  /** Tracked projects that report a 7d change, biggest absolute move first. */
  byMove7d: RankedProject[];
  /** Category totals of TVL on Hyperliquid, highest first. */
  categoriesByTvl: ProjectCategoryTotal[];
  /** Projects carrying DefiLlama metrics (a minority of the catalog). */
  trackedCount: number;
  /** Whole catalog, tracked or listing-only. */
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Catalog joined with the DefiLlama batch, ranked every way the ecosystem
 * recap needs. Shared by the dashboard Overview (top 3) and the Ecosystem
 * scope (full table + category rail) so both read the same ordering.
 *
 * Only projects with metrics are ranked: a listing-only project has no TVL to
 * sort on, and padding the table with dashes would be a fake leaderboard.
 */
export const useRankedProjects = (): UseRankedProjectsResult => {
  const { metricsById, isLoading: metricsLoading, error: metricsError } = useProjectsMetricsMap();

  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useDataFetching<Project[]>({
    fetchFn: () => fetchAllProjects(),
    refreshInterval: 300000,
    dependencies: [],
    maxRetries: 2,
  });

  const tracked = useMemo<RankedProject[]>(() => {
    const rows: RankedProject[] = [];
    for (const project of catalog ?? []) {
      const metric = metricsById.get(project.id);
      if (metric) rows.push({ project, metric });
    }
    return rows;
  }, [catalog, metricsById]);

  const byTvl = useMemo(
    () =>
      [...tracked].sort((a, b) => {
        const diff = (b.metric.hlTvl ?? 0) - (a.metric.hlTvl ?? 0);
        return diff !== 0 ? diff : (b.metric.fees24h ?? 0) - (a.metric.fees24h ?? 0);
      }),
    [tracked]
  );

  const byFees = useMemo(
    () =>
      tracked
        .filter((r) => r.metric.fees24h != null)
        .sort((a, b) => (b.metric.fees24h ?? 0) - (a.metric.fees24h ?? 0)),
    [tracked]
  );

  const byMove7d = useMemo(
    () =>
      tracked
        .filter((r) => r.metric.change7d != null)
        .sort((a, b) => Math.abs(b.metric.change7d ?? 0) - Math.abs(a.metric.change7d ?? 0)),
    [tracked]
  );

  const categoriesByTvl = useMemo<ProjectCategoryTotal[]>(() => {
    const totals = new Map<string, ProjectCategoryTotal>();
    for (const { metric } of tracked) {
      if (!metric.category) continue;
      const current = totals.get(metric.category);
      if (current) {
        current.tvl += metric.hlTvl ?? 0;
        current.count += 1;
      } else {
        totals.set(metric.category, {
          category: metric.category,
          tvl: metric.hlTvl ?? 0,
          count: 1,
        });
      }
    }
    return [...totals.values()].sort((a, b) => b.tvl - a.tvl);
  }, [tracked]);

  return {
    byTvl,
    byFees,
    byMove7d,
    categoriesByTvl,
    trackedCount: tracked.length,
    totalCount: catalog?.length ?? 0,
    isLoading: catalogLoading || metricsLoading,
    error: catalogError ?? metricsError,
  };
};
