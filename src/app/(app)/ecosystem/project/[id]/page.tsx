"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useProject, useProjectMetrics } from "@/services/ecosystem/project";
import { ProjectDetailHeader, ProjectMetricsPanel, ProjectInfoRail } from "@/components/ecosystem/project/detail";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const projectId = parseInt(id);
  const router = useRouter();

  const { project, isLoading } = useProject(projectId);
  const { metrics, isLoading: metricsLoading } = useProjectMetrics(projectId);

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

      <ProjectDetailHeader project={project} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
        <ProjectMetricsPanel metrics={metrics} isLoading={metricsLoading} />
        <ProjectInfoRail project={project} />
      </div>
    </div>
  );
}
