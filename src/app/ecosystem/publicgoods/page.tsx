"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { SubmitProjectModal } from "@/components/ecosystem/publicgoods/SubmitProjectModal";
import { SearchBar } from "@/components/common/SearchBar";
import { useAuthContext } from "@/contexts/auth.context";
import { usePublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";
import { ProjectsPageLayout } from "@/components/ecosystem/publicgoods/layout/ProjectsPageLayout";

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

  // Header content (Title, Desc, Stats, Button)
  const pageHeader = (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Public Goods Program</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <p className="text-zinc-400">
            Supporting open source projects that benefit the HyperLiquid ecosystem
          </p>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          {/* Stats inline */}
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Total:</span>
              <span className="text-brand-accent font-bold">{counts.all}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Approved:</span>
              <span className="text-emerald-400 font-bold">{counts.approved}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Pending:</span>
              <span className="text-amber-400 font-bold">{counts.pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Rejected:</span>
              <span className="text-rose-400 font-bold">{counts.rejected}</span>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={handleSubmitClick}
        className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg flex items-center gap-2 shrink-0"
      >
        <Plus className="w-4 h-4" />
        Submit Project
      </Button>
    </div>
  );

  // Filters content (Tabs, Search)
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
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search projects..."
          className="max-w-sm"
        />
      </div>
    </>
  );

  return (
    <div className="">
      <ProjectsPageLayout
        headerTitle="Public Goods"
        pageHeader={pageHeader}
        filters={filters}
      >
        {/* Projects Grid */}
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

        {/* Submit Project Modal */}
        <SubmitProjectModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={handleSubmitSuccess}
        />
      </ProjectsPageLayout>
    </div>
  );
}
