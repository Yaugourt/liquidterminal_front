"use client";

import { memo, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { useProjects, useCategories } from "@/services/project";
import { Skeleton } from "@/components/ui/skeleton";

export const ProjectsGrid = memo(function ProjectsGrid() {
  const [activeTab, setActiveTab] = useState<'all' | number>('all');
  
  // Récupérer les catégories
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Récupérer les projets selon l'onglet actif
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects({
    categoryId: activeTab === 'all' ? undefined : activeTab,
    limit: 50
  });

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
      {/* Tabs Navigation */}
              <div className="border-b border-[#F9E37020]">
        <nav className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF33] scrollbar-track-transparent">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'border-[#83E9FF] text-[#83E9FF]'
                : 'border-transparent text-white hover:text-[#F9E370] hover:border-gray-600'
            }`}
          >
            All Projects
          </button>
          
          {categoriesError ? (
            <div className="text-red-400 text-sm py-2">
              Failed to load categories
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === category.id
                    ? 'border-[#83E9FF] text-[#83E9FF]'
                    : 'border-transparent text-white hover:text-[#F9E370] hover:border-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </nav>
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
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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