"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { SubmitProjectModal } from "@/components/ecosystem/publicgoods/SubmitProjectModal";
import { EditProjectModal } from "@/components/ecosystem/publicgoods/EditProjectModal";
import { DeleteConfirmDialog } from "@/components/ecosystem/publicgoods/DeleteConfirmDialog";
import { SimpleSearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { useMyPublicGoods, useDeletePublicGood, PublicGood } from "@/services/ecosystem/publicgood";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MySubmissionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleEdit = (project: PublicGood | import("@/components/ecosystem/publicgoods/mockData").PublicGoodsProject) => {
    setProjectToEdit(project as PublicGood);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setProjectToEdit(null);
  };

  const handleDelete = (project: PublicGood | import("@/components/ecosystem/publicgoods/mockData").PublicGoodsProject) => {
    setProjectToDelete(project as PublicGood);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
          <p className="text-gray-400">Please login to view your submissions</p>
          <Button onClick={() => login()} className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Bouton menu mobile en position fixe */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#051728] hover:bg-[#112941]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="">
        <Header customTitle="My Submissions" showFees={true} />
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search your projects..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Header section */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/ecosystem/publicgoods')}
              className="text-gray-400 hover:text-white -ml-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all projects
            </Button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">My Submissions</h1>
                <p className="text-gray-400 mt-1">
                  Manage your submitted projects
                </p>
              </div>
              <Button 
                onClick={handleSubmitClick}
                className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Submit New Project
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#83E9FF] animate-spin" />
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <PublicGoodsCard 
                  key={project.id} 
                  project={project}
                  currentUser={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#112941] rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-[#83E9FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery.trim() 
                  ? "Try adjusting your search criteria"
                  : activeTab === 'all' 
                    ? "You haven't submitted any projects yet"
                    : `You have no ${activeTab} projects`
                }
              </p>
              {!searchQuery.trim() && activeTab === 'all' && (
                <Button 
                  onClick={handleSubmitClick}
                  className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90"
                >
                  Submit your first project
                </Button>
              )}
            </div>
          )}

          {/* Stats footer */}
          <div className="border-t border-[#1E3851] pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#83E9FF]">{counts.all}</div>
                <div className="text-sm text-gray-400">Total Submissions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{counts.approved}</div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{counts.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{counts.rejected}</div>
                <div className="text-sm text-gray-400">Rejected</div>
              </div>
            </div>
          </div>
        </main>
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
    </div>
  );
}

