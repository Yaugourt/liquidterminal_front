"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { SearchBar } from "@/components/common/SearchBar";
import { useAuthContext } from "@/contexts/auth.context";
import { usePendingPublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/roleHelpers";
import { ProjectsPageLayout } from "@/components/ecosystem/publicgoods/layout/ProjectsPageLayout";

export default function PendingReviewPage() {
  const { user, login } = useAuthContext();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [projectToReview, setProjectToReview] = useState<PublicGood | null>(null);

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
      <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505] flex items-center justify-center">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Authentication Required</h2>
            <p className="text-zinc-400">Please login to access this page</p>
            <Button onClick={() => login()} className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg w-full">
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canReview) {
    return (
      <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505] flex items-center justify-center">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/10 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Access Denied</h2>
            <p className="text-zinc-400">You don&apos;t have permission to access this page</p>
            <p className="text-xs text-zinc-500">Moderator or Admin role required</p>
            <Button
              onClick={() => router.push('/ecosystem/publicgoods')}
              className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg w-full"
            >
              Go to Public Goods
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
          <h1 className="text-2xl font-bold text-white">Pending Review</h1>
          <p className="text-zinc-400 mt-1">
            Projects waiting for moderator approval
          </p>
        </div>
        {pendingPublicGoods.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
            <p className="text-amber-400 text-sm font-medium">
              {pendingPublicGoods.length} project{pendingPublicGoods.length !== 1 ? 's' : ''} pending
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Filters Content
  const filters = pendingPublicGoods.length > 0 ? (
    <div className="flex justify-end w-full">
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="Search pending projects..."
        className="max-w-sm"
      />
    </div>
  ) : null;

  return (
    <div className="">
      <ProjectsPageLayout
        headerTitle="Pending Review"
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
              onReview={handleReview}
            />
          )}
          emptyState={{
            title: searchQuery.trim() ? "No projects found" : "All caught up!",
            description: searchQuery.trim()
              ? "Try adjusting your search criteria"
              : "There are no projects pending review at the moment",
            icon: <AlertCircle className="w-8 h-8 text-brand-accent" />,
            actionLabel: !searchQuery.trim() ? "View All Projects" : undefined,
            onAction: !searchQuery.trim() ? () => router.push('/ecosystem/publicgoods') : undefined
          }}
        />

        {/* Info Banner */}
        {pendingPublicGoods.length > 0 && (
          <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6 mt-8">
            <h3 className="text-white font-semibold mb-3">Review Guidelines</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-accent">•</span>
                Check that the project has a valid GitHub repository
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent">•</span>
                Verify the project integrates with HyperLiquid
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent">•</span>
                Ensure the description clearly explains the project&apos;s purpose
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent">•</span>
                Confirm the project benefits the HyperLiquid ecosystem
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent">•</span>
                Provide constructive feedback in review notes if rejecting
              </li>
            </ul>
          </div>
        )}

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
      </ProjectsPageLayout>
    </div>
  );
}

