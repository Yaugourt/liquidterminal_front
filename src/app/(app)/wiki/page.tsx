"use client";

import { useState, useEffect } from "react";
import { EducationContent } from "@/components/wiki/EducationContent";
import { ResourcesSection } from "@/components/wiki/ResourcesSection";
import { CategoryFilter } from "@/components/wiki/CategoryFilter";
import { CategorySidebar } from "@/components/wiki/CategorySidebar";
import { EducationModal } from "@/components/wiki/EducationModal";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";
import { SearchBar, ProtectedAction, chartPalette } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { useHyperliquidInfo } from "@/hooks/useHyperliquidInfo";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";
import { useEducationalCategories } from "@/services/wiki";

export default function EducationPage() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthContext();

  const { info: hyperliquidInfo } = useHyperliquidInfo();
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

  // Only `colors` + `links` from the public info are still surfaced by the UI;
  // everything else (consensus, layers, dates) is now embedded in chapter stats.
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
    <>
      {/* Unified fundamentals card: hero + scrollable chapter tabs + content + resources footer */}
      {hyperliquidEducation && !educationLoading && (
        <EducationContent
          chapters={hyperliquidEducation.chapters}
          info={educationInfo}
        />
      )}

      {/* Resources browser: sticky category sidebar on lg+, stacked on smaller screens */}
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left: persistent category sidebar (lg+) */}
        <CategorySidebar
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          className="hidden lg:block lg:sticky lg:top-4 lg:self-start"
        />

        {/* Right: search + actions + resources */}
        <div className="min-w-0 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1 sm:min-w-0">
              {/* Dropdown variant only below lg */}
              <CategoryFilter
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                className="lg:hidden"
              />
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search in resources..."
                className="w-full sm:max-w-none sm:flex-1 lg:max-w-[420px]"
              />
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <UserSubmissionModal onSuccess={() => window.location.reload()} />
              <ProtectedAction requiredRole="MODERATOR" user={user}>
                <EducationModal onSuccess={() => window.location.reload()} />
              </ProtectedAction>
            </div>
          </div>

          <ResourcesSection
            selectedCategoryIds={selectedCategories}
            sectionColor={hyperliquidInfo?.colors[0] || chartPalette.accent}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </>
  );
}
