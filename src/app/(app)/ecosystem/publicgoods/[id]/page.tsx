"use client";

import { useState, use } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { DeleteConfirmDialog } from "@/components/ecosystem/publicgoods/DeleteConfirmDialog";
import { ProjectHeader } from "@/components/ecosystem/publicgoods/ProjectHeader";
import { ProjectContent } from "@/components/ecosystem/publicgoods/ProjectContent";
import { ProjectInfoSidebar } from "@/components/ecosystem/publicgoods/ProjectInfoSidebar";
import { useAuthContext } from "@/contexts/auth.context";
import { hasRole } from "@/lib/roleHelpers";
import { useRouter } from "next/navigation";
import { usePublicGood, useDeletePublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";

// Lazy load heavy modal - only loaded when user clicks Edit
const EditProjectModal = dynamic(
  () => import("@/components/ecosystem/publicgoods/ProjectFormModal").then(mod => ({ default: mod.EditProjectModal })),
  { ssr: false }
);

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuthContext();

  // Fetch project from API
  const { publicGood: project, isLoading, refetch } = usePublicGood(parseInt(resolvedParams.id));
  const { deletePublicGood, isLoading: isDeleting } = useDeletePublicGood();

  // Check permissions
  const isOwner = user && project ? Number(user.id) === project.submitterId : false;
  const isAdmin = user ? hasRole(user, 'ADMIN') : false;
  const isModerator = user ? hasRole(user, 'MODERATOR') : false;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canReview = (isModerator || isAdmin) && project?.status === 'PENDING';

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!project) return;

    try {
      await deletePublicGood(project.id);
      toast.success("Project deleted successfully!");
      router.push('/ecosystem/publicgoods');
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-6 h-6 text-brand-accent animate-spin mb-2" />
          <span className="text-zinc-500 text-sm">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-4">Project not found</h1>
            <Button onClick={() => router.back()} className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg">
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to projects
        </Button>
      </div>

      {/* Project header */}
      <ProjectHeader project={project} />

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <ProjectContent project={project} />

        {/* Sidebar */}
        <ProjectInfoSidebar
          project={project}
          canEdit={canEdit}
          canDelete={canDelete}
          canReview={canReview}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReview={handleReview}
        />
      </div>

      {/* Review Modal */}
      {project && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
          project={project}
        />
      )}

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          project={project}
        />
      )}

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        projectName={project?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
