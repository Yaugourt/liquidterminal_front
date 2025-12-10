"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useWindowSize } from "@/hooks/use-window-size";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TrendingTokensTabs } from "@/components/dashboard/tokens/TrendingTokensTabs";
import { TabSection } from "@/components/dashboard/vaultValidator";
import { TwapSection } from "@/components/dashboard/twap";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function Home() {
  const { width } = useWindowSize();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setActiveTokenTab] = useState<"perp" | "spot" | "auction" | "past-auction">("perp");
  const [, setPastAuctionHeight] = useState<number>(270);

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Mobile menu */}
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
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle="Home" showFees={true} />
        </div>

        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">

          {/* Stats Grid */}
          <StatsGrid />

          {/* Tokens + Chart */}
          <div className="flex flex-col md:flex-row gap-8 w-full md:items-stretch">
            <GlassPanel className="w-full md:w-[35%] flex flex-col">
              <TrendingTokensTabs
                onTabChange={setActiveTokenTab}
                onPastAuctionHeightChange={setPastAuctionHeight}
              />
            </GlassPanel>
            <GlassPanel className="flex-1 flex flex-col">
              <ChartSection />
            </GlassPanel>
          </div>

          {/* Vaults/Validators + TWAP */}
          <div className="flex flex-col custom:flex-row custom:gap-8">
            <GlassPanel className="w-full custom:w-[35%] mb-6 custom:mb-0">
              <TabSection />
            </GlassPanel>
            <GlassPanel className="w-full custom:w-[65%]">
              <TwapSection />
            </GlassPanel>
          </div>
        </main>
      </div>
    </div>
  );
}
