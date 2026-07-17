"use client";

import { memo, useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { CategoryTabs } from "./CategoryTabs";
import { useProjects, useCategories, useProjectsMetricsMap } from "@/services/ecosystem/project";
import { fetchAllProjects } from "@/services/ecosystem/project/api";
import { Project, ProjectListMetric } from "@/services/ecosystem/project/types";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useAuthContext } from "@/contexts/auth.context";
import { canCreateProject } from "@/lib/roleHelpers";
import { Pagination, SearchBar, SkeletonGrid } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

type SortMode = "az" | "tvl";

const SORT_TABS = [
  { value: "az", label: "A–Z" },
  { value: "tvl", label: "TVL on HL" },
];

interface ProjectsGridProps {
  activeTab?: string;
  currentPage?: number;
  onTabChange?: (tabId: string) => void;
  onPageChange?: (page: number) => void;
}

export const ProjectsGrid = memo(function ProjectsGrid({
  activeTab = 'all',
  currentPage = 1,
  onTabChange,
  onPageChange
}: ProjectsGridProps) {
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("az");
  const { user } = useAuthContext();

  // Récupérer les catégories pour les tabs
  const { categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  // Hyperliquid metrics of linked projects (single batch request).
  const { metricsById } = useProjectsMetricsMap();

  // Filtres partagés (tab catégorie + recherche).
  const filterParams = useMemo(() => {
    const base = searchQuery ? { search: searchQuery } : {};
    if (activeTab === 'all') return base;
    return {
      ...base,
      // A tab can carry several ids ("10,11") when dirty duplicate
      // categories were merged into one label by CategoryTabs.
      categoryIds: activeTab.split(',').map((id) => parseInt(id, 10))
    };
  }, [activeTab, searchQuery]);

  const projectParams = useMemo(
    () => ({ ...filterParams, page: currentPage, limit: rowsPerPage }),
    [filterParams, currentPage, rowsPerPage]
  );

  const { projects: pagedProjects, isLoading: pagedLoading, error: pagedError, refetch, pagination } = useProjects(projectParams);

  // TVL mode walks every page (backend caps limit at 100) then sorts client-side.
  const { data: allProjects, isLoading: allLoading, error: allError } = useDataFetching<Project[] | null>({
    fetchFn: () => (sortMode === "tvl" ? fetchAllProjects(filterParams) : Promise.resolve(null)),
    refreshInterval: 0,
    dependencies: [sortMode, JSON.stringify(filterParams)],
    maxRetries: 2,
  });

  const projects = useMemo(
    () => (sortMode === "tvl" ? (allProjects ?? []) : pagedProjects),
    [sortMode, allProjects, pagedProjects]
  );
  const projectsLoading = sortMode === "tvl" ? allLoading : pagedLoading;
  const projectsError = sortMode === "tvl" ? allError : pagedError;

  // TVL mode: ranked first (TVL on HL desc), then fees-ranked, then the rest A–Z
  // under a separator — degradation is today's alphabetical card, never "TVL —".
  const { ranked, unranked } = useMemo(() => {
    if (sortMode !== "tvl") return { ranked: projects, unranked: [] as Project[] };
    const metricOf = (p: Project): ProjectListMetric | undefined => metricsById.get(p.id);
    const hasSignal = (p: Project): boolean => {
      const m = metricOf(p);
      return Boolean((m?.hlTvl ?? 0) > 0 || (m?.feesRank24h != null && m.feesRank24h <= 30));
    };
    const withSignal = projects.filter(hasSignal).sort((a, b) => {
      const ma = metricOf(a);
      const mb = metricOf(b);
      const tvlDiff = (mb?.hlTvl ?? 0) - (ma?.hlTvl ?? 0);
      if (tvlDiff !== 0) return tvlDiff;
      return (mb?.fees24h ?? 0) - (ma?.fees24h ?? 0);
    });
    const rest = projects
      .filter((p) => !hasSignal(p))
      .sort((a, b) => a.title.localeCompare(b.title));
    return { ranked: withSignal, unranked: rest };
  }, [projects, sortMode, metricsById]);

  // Vérification des rôles
  const userCanCreateProject = canCreateProject(user);

  // Handlers de pagination
  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    onPageChange?.(1); // Reset à la page 1 quand on change rowsPerPage
  };

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId);
    onPageChange?.(1); // Reset à la page 1 quand on change de tab
  };

  const handleSortChange = (mode: string) => {
    setSortMode(mode as SortMode);
    onPageChange?.(1);
  };

  const handleProjectSuccess = () => {
    refetch(); // Recharger les projets après création
    refetchCategories(); // Recharger les catégories aussi (au cas où une nouvelle catégorie a été créée)
  };

  const renderCards = (items: Project[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          metric={metricsById.get(project.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Tabs · Sort · Search · Create */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full min-w-0">
        {/* Scrollable, not hidden: with 13+ category tabs, overflow-hidden made
            the tail tabs unreachable (and failed the render gate). */}
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-brand">
          <CategoryTabs
            categories={categories}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isLoading={categoriesLoading}
            error={categoriesError}
          />
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 w-full md:w-auto">
          <PillTabs tabs={SORT_TABS} activeTab={sortMode} onTabChange={handleSortChange} />
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search projects..."
            className="w-full md:max-w-sm"
          />
          {userCanCreateProject && (
            <ProjectModal onSuccess={handleProjectSuccess} />
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <SkeletonGrid count={6} gap="gap-6" />
      ) : projectsError ? (
        <ErrorState
          title="Failed to load projects"
          message={projectsError.message || "Please try again later."}
        />
      ) : projects.length > 0 ? (
        <div className="space-y-6">
          {renderCards(ranked)}
          {unranked.length > 0 && (
            <>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10.5px] uppercase tracking-wide text-text-tertiary shrink-0">
                  Not ranked · A–Z
                </span>
                <span className="h-px flex-1 bg-border-subtle" />
              </div>
              {renderCards(unranked)}
            </>
          )}
        </div>
      ) : (
        <EmptyState
          title="No projects found"
          description={activeTab === 'all' ? "No projects have been added yet." : "No projects in this category yet."}
        />
      )}

      {/* Pagination — hidden in TVL mode (whole catalog is rendered at once). */}
      {sortMode === "az" && pagination && pagination.total > 0 && (
        <div className="mt-8">
          <Pagination
            total={pagination.total}
            page={currentPage - 1} // Pagination component utilise 0-based
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => handlePageChange(page + 1)} // Convertir en 1-based
            onRowsPerPageChange={handleRowsPerPageChange}
            disabled={projectsLoading}
          />
        </div>
      )}
    </div>
  );
});