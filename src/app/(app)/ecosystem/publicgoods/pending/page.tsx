"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { PublicGoodsCard } from "@/components/ecosystem/publicgoods/PublicGoodsCard";
import { PublicGoodsGrid } from "@/components/ecosystem/publicgoods/PublicGoodsGrid";
import { ReviewModal } from "@/components/ecosystem/publicgoods/ReviewModal";
import { PageHeader, SearchBar } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { usePendingPublicGoods, PublicGood } from "@/services/ecosystem/publicgood";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/roleHelpers";

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card padding="lg" className="max-w-md w-full mx-4 text-center space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Authentication Required</h2>
          <p className="text-text-secondary">Please login to access this page</p>
          <Button onClick={() => login()} className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold w-full">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  // Check permissions
  if (!canReview) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card padding="lg" className="max-w-md w-full mx-4 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-danger/10 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Access Denied</h2>
          <p className="text-text-secondary">You don&apos;t have permission to access this page</p>
          <p className="text-xs text-text-tertiary">Moderator or Admin role required</p>
          <Button
            onClick={() => router.push('/ecosystem/publicgoods')}
            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold w-full"
          >
            Go to Public Goods
          </Button>
        </Card>
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
        title="Pending Submissions"
        description="Review and vote on new project submissions. Community approval is required before projects are listed."
      >
        {pendingPublicGoods.length > 0 && (
          <div className="flex justify-end">
            <div className="w-full lg:w-72">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search pending projects..."
              />
            </div>
          </div>
        )}
      </PageHeader>

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
          icon: <AlertCircle className="w-8 h-8 text-brand" />,
          actionLabel: !searchQuery.trim() ? "View All Projects" : undefined,
          onAction: !searchQuery.trim() ? () => router.push('/ecosystem/publicgoods') : undefined
        }}
      />

      {/* Review Guidelines */}
      {pendingPublicGoods.length > 0 && (
        <Card padding="lg">
          <h3 className="text-text-primary font-semibold mb-3">Review Guidelines</h3>
          <ul className="text-text-secondary text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-brand">•</span>
              Check that the project has a valid GitHub repository
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand">•</span>
              Verify the project integrates with HyperLiquid
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand">•</span>
              Ensure the description clearly explains the project&apos;s purpose
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand">•</span>
              Confirm the project benefits the HyperLiquid ecosystem
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand">•</span>
              Provide constructive feedback in review notes if rejecting
            </li>
          </ul>
        </Card>
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
    </div>
  );
}
