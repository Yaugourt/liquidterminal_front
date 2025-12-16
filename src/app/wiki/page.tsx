"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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
import { useWindowSize } from "@/hooks/use-window-size";

// Using education service hooks instead of mock data

export default function EducationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthContext();
  const { width } = useWindowSize();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);


  const { info: hyperliquidInfo, loading: infoLoading } = useHyperliquidInfo();
  const { education: hyperliquidEducation, loading: educationLoading } = useHyperliquidEducation();

  // Fetch categories to set default selection
  const { categories } = useEducationalCategories({
    limit: 100 // Get all categories for the page
  });



  // Set all categories as selected by default when categories are loaded (only if user hasn't interacted)
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0 && !hasUserInteracted) {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  }, [categories, selectedCategories.length, hasUserInteracted]);

  // Handle category changes and mark user interaction
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
    <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505]">
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
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
          <Header customTitle="Introduction" showFees={true} />
        </div>

        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar onSearch={setSearchQuery} placeholder="Search educational content..." />
        </div>

        <main className="px-6 py-8 space-y-6 max-w-[1920px] mx-auto">
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
              {/* User submission button - all authenticated users */}
              <UserSubmissionModal onSuccess={() => window.location.reload()} />
              {/* Mod/Admin advanced actions */}
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


        </main>
      </div>
    </div>
  );
}
