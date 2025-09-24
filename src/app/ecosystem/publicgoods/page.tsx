"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { StatusTabs } from "@/components/ecosystem/publicgoods/StatusTabs";
import { mockProjects } from "@/components/ecosystem/publicgoods/mockData";
import { SimpleSearchBar } from "@/components/common";

export default function PublicGoodsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects based on active tab and search
  const filteredProjects = useMemo(() => {
    let filtered = mockProjects;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(project => project.status === activeTab);
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
  }, [activeTab, searchQuery]);

  // Calculate counts for tabs
  const counts = useMemo(() => ({
    all: mockProjects.length,
    approved: mockProjects.filter(p => p.status === 'approved').length,
    pending: mockProjects.filter(p => p.status === 'pending').length,
    rejected: mockProjects.filter(p => p.status === 'rejected').length,
  }), []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

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
        <Header customTitle="Public Goods" showFees={true} />
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search projects..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Header section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Public Goods Program</h1>
                <p className="text-gray-400 mt-1">
                  Supporting open source projects that benefit the HyperLiquid ecosystem
                </p>
              </div>
              <Button className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90 flex items-center gap-2">
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
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <PublicGoodsCard 
                  key={project.id} 
                  project={project}
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
                    ? "No projects have been submitted yet"
                    : `No ${activeTab} projects found`
                }
              </p>
              {!searchQuery.trim() && (
                <Button className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90">
                  Submit the first project
                </Button>
              )}
            </div>
          )}

          {/* Stats footer */}
          <div className="border-t border-[#1E3851] pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#83E9FF]">{counts.all}</div>
                <div className="text-sm text-gray-400">Total Projects</div>
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
    </div>
  );
}
