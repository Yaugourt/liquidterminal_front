"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { EducationContent } from "@/components/education/EducationContent";
import { EducationSidebar } from "@/components/education/EducationSidebar";
import { ResourcesSection } from "@/components/education/ResourcesSection";
import { CategoryFilter } from "@/components/education/CategoryFilter";
import { useHyperliquidInfo } from "@/hooks/useHyperliquidInfo";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";

// Using education service hooks instead of mock data

export default function EducationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const { info: hyperliquidInfo, loading: infoLoading } = useHyperliquidInfo();
  const { education: hyperliquidEducation, loading: educationLoading } = useHyperliquidEducation();

  // Categories are now handled directly in the ResourcesSection component

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
    <div className="min-h-screen">
      {/* Mobile menu button */}
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

      {/* Main content */}
      <div className="">
        <Header customTitle="Education" showFees={true} />
        
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search educational content..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
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

          {/* Category filter */}
          <CategoryFilter 
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />

          {/* Resources section */}
          <ResourcesSection 
            selectedCategoryIds={selectedCategories}
            sectionColor={hyperliquidInfo?.colors[0] || "#83E9FF"}
          />
        </main>
      </div>
    </div>
  );
}
