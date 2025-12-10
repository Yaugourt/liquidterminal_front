"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { SubmitProjectModal } from "@/components/ecosystem/publicgoods/SubmitProjectModal";
import { EditProjectModal } from "@/components/ecosystem/publicgoods/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ecosystem/publicgoods/DeleteConfirmDialog";
import { SimpleSearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { useMyPublicGoods, useDeletePublicGood, PublicGood } from "@/services/ecosystem/publicgood";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectsPageLayout } from "@/components/ecosystem/publicgoods/layout/ProjectsPageLayout";

export default function MySubmissionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<PublicGood | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<PublicGood | null>(null);
  const { user, login } = useAuthContext();
  const router = useRouter();

  // Fetch user's projects from API
  const { myPublicGoods, isLoading, refetch } = useMyPublicGoods({ limit: 50 });
  const { deletePublicGood, isLoading: isDeleting } = useDeletePublicGood();

  // Filter projects based on active tab and search
  const filteredProjects = useMemo(() => {
    let filtered = myPublicGoods;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(project => project.status === activeTab.toUpperCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        project.problemSolved.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [activeTab, searchQuery, myPublicGoods]);

  // Calculate counts for tabs
  const counts = useMemo(() => ({
    all: myPublicGoods.length,
    approved: myPublicGoods.filter(p => p.status === 'APPROVED').length,
    pending: myPublicGoods.filter(p => p.status === 'PENDING').length,
    rejected: myPublicGoods.filter(p => p.status === 'REJECTED').length,
  }), [myPublicGoods]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSubmitClick = () => {
    if (!user) {
      toast.info("Please login to submit a project");
      login();
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitSuccess = () => {
    refetch();
  };

  const handleEdit = (project: PublicGood) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setProjectToEdit(null);
  };

  const handleDelete = (project: PublicGood) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deletePublicGood(projectToDelete.id);
      toast.success("Project deleted successfully!");
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      refetch();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Authentication Required</h2>
            <p className="text-zinc-400">Please login to view your submissions</p>
            <Button onClick={() => login()} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg w-full">
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Header Content
  const pageHeader = (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/ecosystem/publicgoods')}
        className="text-zinc-400 hover:text-white hover:bg-white/5 -ml-2 mb-2 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all projects
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Submissions</h1>
          <p className="text-zinc-400 mt-1">
            Manage your submitted projects
          </p>
        </div>
        <Button
          onClick={handleSubmitClick}
          className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Submit New Project
        </Button>
      </div>
    </div>
  );

  // Filters Content
  const filters = (
    <>
      <div className="flex-1">
        <StatusTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
        />
      </div>
      <div className="flex-shrink-0">
        <SimpleSearchBar
          onSearch={setSearchQuery}
          placeholder="Search your projects..."
          className="max-w-sm"
        />
      </div>
    </>
  );

  return (
    <div className="">
      <ProjectsPageLayout
        headerTitle="My Submissions"
        pageHeader={pageHeader}
        filters={filters}
      >
        {/* Projects Grid */}
        <PublicGoodsGrid
          isLoading={isLoading}
          items={filteredProjects}
          renderItem={(project) => (
            <PublicGoodsCard
              key={project.id}
              project={project}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          emptyState={{
            title: "No projects found",
            description: searchQuery.trim()
              ? "Try adjusting your search criteria"
              : activeTab === 'all'
                ? "You haven't submitted any projects yet"
                : `You have no ${activeTab} projects`,
            actionLabel: (!searchQuery.trim() && activeTab === 'all') ? "Submit your first project" : undefined,
            onAction: (!searchQuery.trim() && activeTab === 'all') ? handleSubmitClick : undefined
          }}
        />

        {/* Stats footer */}
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#83E9FF]">{counts.all}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Total Submissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{counts.approved}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{counts.pending}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-400">{counts.rejected}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Rejected</div>
            </div>
          </div>
        </div>

        {/* Submit Project Modal */}
        <SubmitProjectModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={handleSubmitSuccess}
        />

        {/* Edit Project Modal */}
        {projectToEdit && (
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setProjectToEdit(null);
            }}
            onSuccess={handleEditSuccess}
            project={projectToEdit}
          />
        )}

        {/* Delete Confirm Dialog */}
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
          }}
          onConfirm={confirmDelete}
          projectName={projectToDelete?.name || ""}
          isDeleting={isDeleting}
        />
      </ProjectsPageLayout>
    </div>
  );
}

