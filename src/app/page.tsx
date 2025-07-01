"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useWindowSize } from "@/hooks/use-window-size";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TrendingTokensTabs } from "@/components/dashboard/tokens/TrendingTokensTabs";
import { TabSection } from "@/components/dashboard/vaultStakingAuction";
import { TwapSection } from "@/components/dashboard/twap";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Home() {
  const { width } = useWindowSize();
  const chartHeight = 270; // Hauteur exacte pour s'aligner avec le tableau
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

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <StatsGrid />

          <div className="flex flex-col md:flex-row gap-6 w-full md:items-start">
            <div className="w-full md:w-[35%]">
              <TrendingTokensTabs />
            </div>
            <div className="flex-1 flex flex-col justify-start">
              <ChartSection chartHeight={chartHeight} />
            </div>
          </div>

          <div className="flex flex-col custom:flex-row custom:gap-8">
            <div className="w-full custom:w-[35%] mb-6 custom:mb-0">
              <TabSection />
            </div>
            <div className="w-full custom:w-[65%]">
              <TwapSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
