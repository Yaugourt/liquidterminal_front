"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, ProtectedAction } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { EducationContent } from "@/components/wiki/EducationContent";
import { WikiLibrary } from "@/components/wiki/library/WikiLibrary";
import { ContributionsPanel } from "@/components/wiki/ContributionsPanel";
import { EducationModal } from "@/components/wiki/EducationModal";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";
import { useAuthContext } from "@/contexts/auth.context";
import { useHyperliquidInfo } from "@/hooks/useHyperliquidInfo";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";

type WikiTab = "library" | "learn" | "contributions";

const WIKI_TABS = [
  { value: "library", label: "Library" },
  { value: "learn", label: "Learn" },
  { value: "contributions", label: "My contributions" },
];

export default function WikiPage() {
  const [activeTab, setActiveTab] = useState<WikiTab>("library");
  // Bumped after a submission/creation so the library refetches without a reload
  const [refreshToken, setRefreshToken] = useState(0);
  const { user } = useAuthContext();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  const { info: hyperliquidInfo } = useHyperliquidInfo();
  const { education: hyperliquidEducation, loading: educationLoading } = useHyperliquidEducation();

  const handleContentAdded = () => setRefreshToken((token) => token + 1);

  // Only `colors` + `links` from the public info are still surfaced by the UI;
  // everything else (consensus, layers, dates) is embedded in chapter stats.
  const educationInfo = hyperliquidInfo
    ? {
        title: hyperliquidInfo.title,
        description: hyperliquidInfo.description,
        colors: hyperliquidInfo.colors,
        links: {
          websiteLink: hyperliquidInfo.links.website,
          appLink: hyperliquidInfo.links.app,
          documentationLink: hyperliquidInfo.links.documentation,
          twitterLink: hyperliquidInfo.links.twitter,
          twitterFoundationLink: hyperliquidInfo.links.twitterFoundation,
          discordLink: hyperliquidInfo.links.discord,
          telegramLink: hyperliquidInfo.links.telegram,
          githubLink: hyperliquidInfo.links.github,
        },
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wiki"
        description="Curated Hyperliquid knowledge: fundamentals, community articles and read lists."
        actions={
          <div className="flex items-center gap-2">
            <UserSubmissionModal onSuccess={handleContentAdded} />
            <ProtectedAction requiredRole="MODERATOR" user={user}>
              <EducationModal onSuccess={handleContentAdded} />
            </ProtectedAction>
          </div>
        }
      >
        <PillTabs
          tabs={WIKI_TABS}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as WikiTab)}
        />
      </PageHeader>

      {activeTab === "library" && <WikiLibrary refreshToken={refreshToken} />}

      {activeTab === "learn" && (
        hyperliquidEducation && !educationLoading ? (
          <EducationContent
            chapters={hyperliquidEducation.chapters}
            info={educationInfo}
          />
        ) : (
          <div className="h-96 animate-pulse rounded-lg border border-border-subtle bg-surface" />
        )
      )}

      {activeTab === "contributions" && <ContributionsPanel />}
    </div>
  );
}
