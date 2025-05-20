"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useWindowSize } from "@/hooks/use-window-size";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TrendingTokens } from "@/components/dashboard/TrendingTokens";
import { TabSection } from "@/components/dashboard/TabSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Home() {
  const { width } = useWindowSize();
  const chartHeight = width >= 1024 ? 345 : width >= 640 ? 296 : 246;
  const [activeTab, setActiveTab] = useState("vault");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fermer automatiquement le sidebar sur les écrans plus larges
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

  return (
    <div className="min-h-screen">
      {/* Mobile menu toggle button - visible uniquement sur mobile */}
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
        <Header customTitle="Home" showFees={true} />
        
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 max-w-[1920px] mx-auto">
          <StatsGrid />

          <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
            <TrendingTokens type="perp" />
            <TrendingTokens type="spot" />
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-4">
            <div className="w-full lg:w-[400px] mb-4 lg:mb-0 lg:mt-10 xl:mt-0">
              <TabSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            <div className="w-full lg:flex-1">
              <ChartSection chartHeight={chartHeight} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
