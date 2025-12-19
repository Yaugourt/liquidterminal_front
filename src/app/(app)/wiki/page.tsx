"use client";

import { useState, useEffect } from "react";
import { EducationContent } from "@/components/wiki/EducationContent";
import { EducationSidebar } from "@/components/wiki/EducationSidebar";
import { ResourcesSection } from "@/components/wiki/ResourcesSection";
import { CategoryFilter } from "@/components/wiki/CategoryFilter";
import { EducationModal } from "@/components/wiki/EducationModal";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";
import { SearchBar } from "@/components/common/SearchBar";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { useHyperliquidInfo } from "@/hooks/useHyperliquidInfo";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";
import { useEducationalCategories } from "@/services/wiki";

export default function EducationPage() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthContext();

  const { info: hyperliquidInfo, loading: infoLoading } = useHyperliquidInfo();
  const { education: hyperliquidEducation, loading: educationLoading } = useHyperliquidEducation();

  const { categories } = useEducationalCategories({
    limit: 100
  });

  // Set all categories as selected by default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0 && !hasUserInteracted) {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  }, [categories, selectedCategories.length, hasUserInteracted]);

  const handleCategoryChange = (categories: number[]) => {
    setHasUserInteracted(true);
    setSelectedCategories(categories);
  };

  // Transform data for the sidebar
  const sidebarInfo = hyperliquidInfo ? {
    title: hyperliquidInfo.title,
    description: hyperliquidInfo.description,
    colors: hyperliquidInfo.colors,
    consensus: hyperliquidInfo.consensus,
    executionLayer: hyperliquidInfo.executionLayer,
    foundationCreation: hyperliquidInfo.foundationCreation,
    mainnetLaunch: hyperliquidInfo.mainnetLaunch,
    links: {
      websiteLink: hyperliquidInfo.links.website,
      appLink: hyperliquidInfo.links.app,
      documentationLink: hyperliquidInfo.links.documentation,
      twitterLink: hyperliquidInfo.links.twitter,
      twitterFoundationLink: hyperliquidInfo.links.twitterFoundation,
      discordLink: hyperliquidInfo.links.discord,
      telegramLink: hyperliquidInfo.links.telegram,
      githubLink: hyperliquidInfo.links.github,
    }
  } : null;

  return (
    <>
      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {hyperliquidEducation && !educationLoading && (
            <EducationContent chapters={hyperliquidEducation.chapters} />
          )}
        </div>
        <div className="w-full lg:w-[320px]">
          {sidebarInfo && !infoLoading && <EducationSidebar info={sidebarInfo} />}
        </div>
      </div>

      {/* Category filter, Search bar and Admin Add Resource Button */}
      <div className="flex items-center gap-4 max-[599px]:grid max-[599px]:grid-cols-1 max-[599px]:gap-4">
        <div className="flex items-center gap-4">
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search in resources..."
            className="w-full sm:w-[320px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <UserSubmissionModal onSuccess={() => window.location.reload()} />
          <ProtectedAction requiredRole="MODERATOR" user={user}>
            <EducationModal onSuccess={() => window.location.reload()} />
          </ProtectedAction>
        </div>
      </div>

      {/* Resources section */}
      <ResourcesSection
        selectedCategoryIds={selectedCategories}
        sectionColor={hyperliquidInfo?.colors[0] || "#83E9FF"}
        searchQuery={searchQuery}
      />
    </>
  );
}
