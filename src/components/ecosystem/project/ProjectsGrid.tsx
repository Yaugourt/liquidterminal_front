"use client";

import { memo, useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { CategoryTabs } from "./CategoryTabs";
import { useProjects, useCategories } from "@/services/ecosystem/project";
import { useAuthContext } from "@/contexts/auth.context";
import { canCreateProject } from "@/lib/roleHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";

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
  const { user } = useAuthContext();
  
  // Récupérer les catégories pour les tabs
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Construire les paramètres pour les projets selon le tab actif
  const projectParams = useMemo(() => {
    const baseParams = { page: currentPage, limit: rowsPerPage };
    
    if (activeTab === 'all') {
      return baseParams; // Pas de categoryIds = tous les projets
    } else {
      return {
        ...baseParams,
        categoryIds: [parseInt(activeTab)] // Avec categoryIds = filtrés
      };
    }
  }, [activeTab, currentPage, rowsPerPage]);
  
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
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-start">
        {userCanCreateProject && (
          <ProjectModal onSuccess={handleProjectSuccess} />
        )}
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLoading={categoriesLoading}
        error={categoriesError}
      />

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-[#112941]" />
          ))}
        </div>
      ) : projectsError ? (
        <div className="text-center py-16">
          <p className="text-red-400 text-lg">Failed to load projects</p>
          <p className="text-gray-500 text-sm mt-2">
            {projectsError.message || "Please try again later."}
          </p>
        </div>
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
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No projects found</p>
          <p className="text-gray-500 text-sm mt-2">
            {activeTab === 'all' 
              ? "No projects have been added yet."
              : "No projects in this category yet."}
          </p>
        </div>
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