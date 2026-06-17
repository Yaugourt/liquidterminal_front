"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { PageHeader, SearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { usePublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";

// Lazy load heavy modal - only loaded when user clicks "Submit Project"
const SubmitProjectModal = dynamic(
  () => import("@/components/ecosystem/publicgoods/ProjectFormModal").then(mod => ({ default: mod.SubmitProjectModal })),
  { ssr: false }
);

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
    <div className="space-y-8">
      <PageHeader
        title="Public Goods"
        description="Discover and support projects building on HyperEVM. Direct funding, transparent tracking, and community-driven development."
        actions={
          <>
            <Button
              className="bg-brand text-brand-text-on hover:bg-brand/90"
              onClick={handleSubmitClick}
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Project
            </Button>
            <Button asChild variant="outline">
              <Link href="/ecosystem/publicgoods/my-submissions">My Submissions</Link>
            </Button>
          </>
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
              placeholder="Search public goods..."
              onSearch={setSearchQuery}
            />
          </div>
        </div>
      </PageHeader>

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
    </div>
  );
}
