"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { SubmitProjectModal } from "@/components/ecosystem/publicgoods/ProjectFormModal";
import { SearchBar } from "@/components/common/SearchBar";
import { useAuthContext } from "@/contexts/auth.context";
import { usePublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";
import { ProjectsLayout } from "@/layouts/ProjectsLayout";

export default function PublicGoodsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { user, login } = useAuthContext();

  // Fetch projects from API
  const { publicGoods, isLoading, refetch } = usePublicGoods({
    status: activeTab as 'all' | 'pending' | 'approved' | 'rejected',
    limit: 50
  });

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    let filtered = publicGoods;

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
  }, [publicGoods, searchQuery]);

  // Calculate counts for tabs
  const counts = useMemo(() => ({
    all: publicGoods.length,
    approved: publicGoods.filter(p => p.status === 'APPROVED').length,
    pending: publicGoods.filter(p => p.status === 'PENDING').length,
    rejected: publicGoods.filter(p => p.status === 'REJECTED').length,
  }), [publicGoods]);

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





  return (
    <ProjectsLayout
      headerTitle="Public Goods"
      pageHeader={
        <>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-secondary">
              Public Goods
            </h1>
            <p className="text-zinc-400 max-w-2xl">
              Discover and support projects building on HyperEVM. Direct funding, transparent tracking, and community-driven development.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-brand-accent text-brand-tertiary hover:bg-brand-accent/90"
              onClick={() => setIsSubmitModalOpen(true)} // Changed to isSubmitModalOpen
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Project
            </Button>
            <Button
              variant="outline"
              className="border-white/10 text-zinc-300 hover:bg-white/5"
            // onClick={() => router.push('/ecosystem/publicgoods/my-submissions')} // router is not defined in this context
            >
              My Submissions
            </Button>
          </div>

          {/* <ProjectStats /> */} {/* ProjectStats is not defined in this context */}
        </>
      }
      filters={
        <>
          <StatusTabs
            activeTab={activeTab} // Changed to activeTab
            onTabChange={handleTabChange} // Changed to handleTabChange
            counts={{
              all: counts.all, // Using existing counts
              approved: counts.approved,
              pending: counts.pending,
              rejected: counts.rejected,
            }}
          />
          <div className="w-full lg:w-72">
            <SearchBar
              placeholder="Search public goods..."
              onSearch={setSearchQuery}
            />
          </div>
        </>
      }
    >
      <PublicGoodsGrid
        isLoading={isLoading}
        items={filteredProjects}
        renderItem={(project: PublicGood) => (
          <PublicGoodsCard
            key={project.id}
            project={project}
          />
        )}
        emptyState={{
          title: "No projects found",
          description: searchQuery.trim()
            ? "Try adjusting your search criteria"
            : activeTab === 'all'
              ? "No projects have been submitted yet"
              : `No ${activeTab} projects found`,
          actionLabel: !searchQuery.trim() ? "Submit the first project" : undefined,
          onAction: !searchQuery.trim() ? handleSubmitClick : undefined
        }}
      />

      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleSubmitSuccess}
      />
    </ProjectsLayout>
  );
}
