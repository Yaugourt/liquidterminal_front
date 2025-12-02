"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Loader2 } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { SubmitProjectModal } from "@/components/ecosystem/publicgoods/SubmitProjectModal";
import { SimpleSearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { usePublicGoods } from "@/services/ecosystem/publicgood";
import { toast } from "sonner";
import { useWindowSize } from "@/hooks/use-window-size";

export default function PublicGoodsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const { width } = useWindowSize();
  
  const { user, login } = useAuthContext();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);
  
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
        
        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search projects..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Header section */}
          <div className="space-y-4">
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
                      <span className="text-[#83E9FF] font-bold">{counts.all}</span>
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
                className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Submit Project
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
                placeholder="Search projects..."
                className="max-w-sm"
              />
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 text-[#83E9FF] animate-spin mb-2" />
                <span className="text-zinc-500 text-sm">Loading projects...</span>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <PublicGoodsCard 
                  key={project.id} 
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-8">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#83e9ff]/10 rounded-2xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-[#83E9FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
                <p className="text-zinc-400 mb-4">
                  {searchQuery.trim() 
                    ? "Try adjusting your search criteria"
                    : activeTab === 'all' 
                      ? "No projects have been submitted yet"
                      : `No ${activeTab} projects found`
                  }
                </p>
                {!searchQuery.trim() && (
                  <Button 
                    onClick={handleSubmitClick}
                    className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
                  >
                    Submit the first project
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Submit Project Modal */}
      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
