"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, ProtectedAction } from "@/components/common";
import { WikiHub } from "@/components/wiki/hub/WikiHub";
import { ContributionsDialog } from "@/components/wiki/ContributionsDialog";
import { EducationModal } from "@/components/wiki/EducationModal";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";
import { useAuthContext } from "@/contexts/auth.context";

export default function WikiPage() {
  // Bumped after a submission/creation so the hub refetches without a reload
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
        description="One place per topic: the primer, then what the community wrote about it."
        actions={
          <div className="flex items-center gap-2">
            {authenticated && <ContributionsDialog />}
            <UserSubmissionModal onSuccess={handleContentAdded} />
            <ProtectedAction requiredRole="MODERATOR" user={user}>
              <EducationModal onSuccess={handleContentAdded} />
            </ProtectedAction>
          </div>
        }
      />

      <WikiHub refreshToken={refreshToken} />
    </div>
  );
}
