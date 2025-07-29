"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { ProjectBulkActions } from "./ProjectBulkActions";
import { useProjects, useCategories } from "@/services/project";
import { useDeleteProject } from "@/services/project/hooks/useDeleteProject";
import { useBulkDeleteProjects } from "@/services/project/hooks/useBulkDeleteProjects";
import { useAuthContext } from "@/contexts/auth.context";
import { canCreateProject, canDeleteProject } from "@/utils/roleHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Project } from "@/services/project/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ProjectsGrid = memo(function ProjectsGrid() {
  const [activeTab, setActiveTab] = useState<'all' | number>('all');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const { user } = useAuthContext();
  
  // Récupérer les catégories
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Récupérer les projets selon l'onglet actif
  const { projects, isLoading: projectsLoading, error: projectsError, refetch } = useProjects({
    categoryId: activeTab === 'all' ? undefined : activeTab,
    limit: 50
  });

  // Hooks pour la suppression
  const { deleteProject, isLoading: isDeletingSingle } = useDeleteProject();
  const { bulkDeleteProjects, isLoading: isDeletingBulk } = useBulkDeleteProjects();

  // Vérification des rôles
  const userCanCreateProject = canCreateProject(user);
  const userCanDeleteProject = canDeleteProject(user);

  // Logique de scroll pour les tabs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Vérifier si le défilement est possible
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      
      // Ajouter le support de la molette horizontale
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          // Si c'est déjà un scroll horizontal, le laisser passer
          return;
        }
        if (e.deltaY !== 0) {
          // Convertir le scroll vertical en horizontal
          e.preventDefault();
          container.scrollBy({ left: e.deltaY > 0 ? 60 : -60, behavior: 'smooth' });
        }
      };
      
      container.addEventListener('wheel', handleWheel);
      
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [categories]);

  // Fonctions de défilement
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  // Synchroniser les projets locaux avec les données du serveur
  useEffect(() => {
    // Synchroniser seulement si localProjects est vide (premier chargement)
    // ou si on change d'onglet et qu'il n'y a pas de projets locaux
    if (projects.length > 0 && localProjects.length === 0) {
      setLocalProjects(projects);
    }
  }, [projects, localProjects.length]);

  // Handlers pour la suppression avec mise à jour optimiste
  const handleSingleDelete = useCallback(async (projectId: number) => {
    // Mise à jour optimiste immédiate
    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
    setSelectedProjects(prev => prev.filter(id => id !== projectId));
    
    try {
      const success = await deleteProject(projectId);
      if (success) {
        toast.success("Project deleted successfully");
        // Refetch en arrière-plan pour synchroniser
        refetch();
      } else {
        // Rollback si échec
        toast.error("Failed to delete project");
        refetch();
      }
    } catch {
      // Rollback si erreur
      toast.error("Failed to delete project");
      refetch();
    }
  }, [deleteProject, refetch]);

  const handleBulkDelete = useCallback(async (projectIds: number[]) => {
    // Mise à jour optimiste immédiate
    setLocalProjects(prev => prev.filter(p => !projectIds.includes(p.id)));
    setSelectedProjects([]);
    
    try {
      const success = await bulkDeleteProjects(projectIds);
      if (success) {
        // Refetch en arrière-plan pour synchroniser
        refetch();
      } else {
        // Rollback si échec
        toast.error("Failed to delete projects");
        refetch();
      }
    } catch {
      // Rollback si erreur
      toast.error("Failed to delete projects");
      refetch();
    }
  }, [bulkDeleteProjects, refetch]);

  const handleSelectionChange = useCallback((projectId: number, selected: boolean) => {
    setSelectedProjects(prev => {
      if (selected) {
        return [...prev, projectId];
      } else {
        return prev.filter(id => id !== projectId);
      }
    });
  }, []);

  // Show loading state only for initial load
  if (categoriesLoading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-[#83E9FF1A]">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 bg-[#112941]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-[#112941]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-start">
        {userCanCreateProject && (
          <ProjectModal onSuccess={(newProject) => {
            // Ajouter le nouveau projet au state local
            if (newProject) {
              setLocalProjects(prev => [newProject, ...prev]);
            }
            // Refetch en arrière-plan pour synchroniser
            refetch();
          }} />
        )}
      </div>

      {/* Bulk Actions */}
      {userCanDeleteProject && localProjects.length > 0 && (
        <ProjectBulkActions
          projects={localProjects}
          selectedProjects={selectedProjects}
          onSelectionChange={setSelectedProjects}
          onBulkDelete={handleBulkDelete}
          isDeleting={isDeletingBulk}
        />
      )}
      
      {/* Tabs Navigation */}
      <div className="flex items-center mb-4 w-full max-w-full overflow-hidden">
        {/* Section tabs avec défilement - prend maximum d'espace disponible */}
        <div className="flex items-center gap-1 flex-1 min-w-0 mr-4">
          {/* Bouton scroll gauche */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:text-[#83E9FF] hover:bg-[#FFFFFF0A] rounded-md transition-colors"
              title="Défiler vers la gauche"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          
          {/* Container des tabs avec défilement */}
          <div className="flex-1 min-w-0">
            <div
              ref={scrollContainerRef}
              className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1 overflow-x-auto gap-1 w-fit"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                    : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                }`}
              >
                All Projects
              </button>
              
              {categoriesError ? (
                <div className="text-red-400 text-sm py-2 px-3">
                  Failed to load categories
                </div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === category.id
                        ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                        : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Bouton scroll droite */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:text-[#83E9FF] hover:bg-[#FFFFFF0A] rounded-md transition-colors"
              title="Défiler vers la droite"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
        
      
      </div>

      {/* Projects Grid */}
      {projectsLoading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-[#112941]" />
          ))}
        </div>
      ) : (
        <>
          {projectsError ? (
            <div className="text-center py-16">
              <p className="text-red-400 text-lg">Failed to load projects</p>
              <p className="text-gray-500 text-sm mt-2">
                {projectsError.message || "Please try again later."}
              </p>
            </div>
          ) : localProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onDelete={userCanDeleteProject ? handleSingleDelete : undefined}
                  isDeleting={isDeletingSingle}
                  isSelected={selectedProjects.includes(project.id)}
                  onSelectionChange={handleSelectionChange}
                  showSelection={userCanDeleteProject}
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
        </>
      )}
    </div>
  );
}); 