"use client";

import { Header } from "@/components/Header";
import { useState, use, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, Loader2 } from "lucide-react";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { EditProjectModal } from "@/components/ecosystem/publicgoods/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ecosystem/publicgoods/DeleteConfirmDialog";
import { ProjectHeader } from "@/components/ecosystem/publicgoods/ProjectHeader";
import { ProjectContent } from "@/components/ecosystem/publicgoods/ProjectContent";
import { ProjectInfoSidebar } from "@/components/ecosystem/publicgoods/ProjectInfoSidebar";
import { useAuthContext } from "@/contexts/auth.context";
import { hasRole } from "@/lib/roleHelpers";
import { useRouter } from "next/navigation";
import { usePublicGood, useDeletePublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";
import { useWindowSize } from "@/hooks/use-window-size";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { width } = useWindowSize();

  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuthContext();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

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
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-6 h-6 text-[#83E9FF] animate-spin mb-2" />
          <span className="text-zinc-500 text-sm">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-4">Project not found</h1>
            <Button onClick={() => router.back()} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg">
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="">
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle="Public Goods" showFees={true} />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
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
        </main>
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
    </div>
  );
}
