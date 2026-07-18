"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, ProtectedAction } from "@/components/common";
import { ChapterView } from "@/components/wiki/atlas/ChapterView";
import { EducationModal } from "@/components/wiki/EducationModal";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";
import { useAuthContext } from "@/contexts/auth.context";

export default function WikiPage() {
  // Bumped after a submission/creation so the home refetches without a reload
  const [refreshToken, setRefreshToken] = useState(0);
  const { user, authenticated } = useAuthContext();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  const handleContentAdded = () => setRefreshToken((token) => token + 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wiki"
        description="The Hyperliquid curriculum and what the community writes about it."
        actions={
          <div className="flex items-center gap-2">
            {authenticated && (
              <Link
                href="/wiki/contributions"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-default bg-surface-2 px-3 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                My contributions
              </Link>
            )}
            <UserSubmissionModal onSuccess={handleContentAdded} />
            <ProtectedAction requiredRole="MODERATOR" user={user}>
              <EducationModal onSuccess={handleContentAdded} />
            </ProtectedAction>
          </div>
        }
      />

      <ChapterView key={refreshToken} chapterSlug="introduction" />
    </div>
  );
}
