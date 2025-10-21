"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { SimpleSearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { usePendingPublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/roleHelpers";

export default function PendingReviewPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [projectToReview, setProjectToReview] = useState<PublicGood | null>(null);
  
  const { user, login } = useAuthContext();
  const router = useRouter();

  // Check if user is moderator or admin
  const canReview = user ? hasRole(user, 'MODERATOR') : false;

  // Fetch pending projects from API
  const { pendingPublicGoods, isLoading, refetch } = usePendingPublicGoods({ limit: 50 });

  // Filter by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return pendingPublicGoods;

    const query = searchQuery.toLowerCase();
    return pendingPublicGoods.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.leadDeveloperName.toLowerCase().includes(query)
    );
  }, [searchQuery, pendingPublicGoods]);

  const handleReview = (project: PublicGood) => {
    setProjectToReview(project);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    refetch();
    setProjectToReview(null);
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
          <p className="text-gray-400">Please login to access this page</p>
          <Button onClick={() => login()} className="bg-[#F9E370] text-black hover:bg-[#F9E370]/90">
            Login
          </Button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canReview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400">You don&apos;t have permission to access this page</p>
          <p className="text-sm text-gray-500">Moderator or Admin role required</p>
          <Button 
            onClick={() => router.push('/ecosystem/publicgoods')}
            className="bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
          >
            Go to Public Goods
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
        <Header customTitle="Pending Review" showFees={true} />
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search pending projects..." />
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
                <h1 className="text-2xl font-bold text-white">Pending Review</h1>
                <p className="text-gray-400 mt-1">
                  Projects waiting for moderator approval
                </p>
              </div>
              {pendingPublicGoods.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium">
                    {pendingPublicGoods.length} project{pendingPublicGoods.length !== 1 ? 's' : ''} pending
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          {pendingPublicGoods.length > 0 && (
            <div className="flex justify-end">
              <SimpleSearchBar
                onSearch={setSearchQuery}
                placeholder="Search pending projects..."
                className="max-w-sm"
              />
            </div>
          )}

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
                  onReview={handleReview}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#112941] rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-[#83E9FF]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery.trim() ? "No projects found" : "All caught up!"}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchQuery.trim() 
                  ? "Try adjusting your search criteria"
                  : "There are no projects pending review at the moment"
                }
              </p>
              {!searchQuery.trim() && (
                <Button 
                  onClick={() => router.push('/ecosystem/publicgoods')}
                  className="bg-[#83E9FF] text-black hover:bg-[#83E9FF]/90"
                >
                  View All Projects
                </Button>
              )}
            </div>
          )}

          {/* Info Banner */}
          {pendingPublicGoods.length > 0 && (
            <div className="bg-[#112941] border border-[#1E3851] p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Review Guidelines</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Check that the project has a valid GitHub repository</li>
                <li>• Verify the project integrates with HyperLiquid</li>
                <li>• Ensure the description clearly explains the project&apos;s purpose</li>
                <li>• Confirm the project benefits the HyperLiquid ecosystem</li>
                <li>• Provide constructive feedback in review notes if rejecting</li>
              </ul>
            </div>
          )}
        </main>
      </div>
      
      {/* Review Modal */}
      {projectToReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setProjectToReview(null);
          }}
          onSuccess={handleReviewSuccess}
          project={projectToReview}
        />
      )}
    </div>
  );
}

