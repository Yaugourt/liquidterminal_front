"use client";

import { memo, useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { CategoryTabs } from "./CategoryTabs";
import { useProjects, useCategories } from "@/services/ecosystem/project";
import { useAuthContext } from "@/contexts/auth.context";
import { canCreateProject } from "@/lib/roleHelpers";
import { Pagination, SearchBar, SkeletonGrid } from "@/components/common";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

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
  const { user } = useAuthContext();

  // Récupérer les catégories pour les tabs
  const { categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  // Construire les paramètres pour les projets selon le tab actif
  const projectParams = useMemo(() => {
    const baseParams = {
      page: currentPage,
      limit: rowsPerPage,
      ...(searchQuery && { search: searchQuery })
    };

    if (activeTab === 'all') {
      return baseParams; // No categoryIds = every project
    } else {
      return {
        ...baseParams,
        // A tab can carry several ids ("10,11") when dirty duplicate
        // categories were merged into one label by CategoryTabs.
        categoryIds: activeTab.split(',').map((id) => parseInt(id, 10))
      };
    }
  }, [activeTab, currentPage, rowsPerPage, searchQuery]);

  const { projects, isLoading: projectsLoading, error: projectsError, refetch, pagination } = useProjects(projectParams);

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

  const handleProjectSuccess = () => {
    refetch(); // Recharger les projets après création
    refetchCategories(); // Recharger les catégories aussi (au cas où une nouvelle catégorie a été créée)
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs · Search · Create */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full min-w-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <CategoryTabs
            categories={categories}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isLoading={categoriesLoading}
            error={categoriesError}
          />
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 w-full md:w-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No projects found"
          description={activeTab === 'all' ? "No projects have been added yet." : "No projects in this category yet."}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
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