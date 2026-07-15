"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { usePrivy } from "@privy-io/react-auth";
import { Plus, ArrowLeft, LogIn } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { DeleteConfirmDialog, KpiRibbon, PageHeader, SearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { useMyPublicGoods, useDeletePublicGood, PublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";

// Lazy load heavy modals - only loaded when user interacts with them
const SubmitProjectModal = dynamic(
  () => import("@/components/ecosystem/publicgoods/ProjectFormModal").then(mod => ({ default: mod.SubmitProjectModal })),
  { ssr: false }
);

const EditProjectModal = dynamic(
  () => import("@/components/ecosystem/publicgoods/ProjectFormModal").then(mod => ({ default: mod.EditProjectModal })),
  { ssr: false }
);

export default function MySubmissionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<PublicGood | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<PublicGood | null>(null);
  const { user, login } = useAuthContext();
  const { ready, authenticated } = usePrivy();

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

  if (!user) {
    // Anonymous visitors: explicit sign-in prompt instead of a blank page.
    if (ready && !authenticated) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card padding="lg" interactive={false} className="max-w-md w-full mx-4 text-center space-y-4">
            <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center mx-auto">
              <LogIn className="h-8 w-8 text-brand" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Sign in to view your submissions</h2>
            <p className="text-text-secondary text-sm">
              Your submitted public goods projects are tied to your account.
            </p>
            <Button
              onClick={() => login()}
              className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold"
            >
              Sign In
            </Button>
          </Card>
        </div>
      );
    }
    // Privy still initializing or backend login in flight.
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState size="md" withCard={false} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb={
          <Link
            href="/ecosystem/publicgoods"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Goods
          </Link>
        }
        title="My Submissions"
        description="Track the status of your submitted projects and manage your applications."
        actions={
          <Button
            onClick={handleSubmitClick}
            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit New Project
          </Button>
        }
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <StatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={counts}
          />
          <div className="w-full lg:w-72">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search my submissions..."
            />
          </div>
        </div>
      </PageHeader>

      <KpiRibbon
        cells={[
          { label: "Total Submissions", value: counts.all },
          { label: "Approved", value: counts.approved, tone: "success" },
          { label: "Pending", value: counts.pending, tone: "gold" },
          { label: "Rejected", value: counts.rejected, tone: "danger" },
        ]}
      />

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
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
          }
        }}
        title="Delete Project"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{projectToDelete?.name || ""}</span>? All data
            associated with this project will be permanently removed.
          </>
        }
        confirmLabel="Delete Project"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
