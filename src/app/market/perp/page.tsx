"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { GlobalStats } from "@/components/market/perp/GlobalStats";
import { TrendingTokens } from "@/components/market/perp/TrendingTokens";
import { PerpTokensSection } from "@/components/market/perp/PerpTokensSection";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { AuctionCard } from "@/components/market/auction/AuctionCard";

export default function MarketPerp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Bouton menu mobile en position fixe */}
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

      {/* Header toujours en haut */}
      <Header customTitle="Market Perpetual" showFees={true} />
      
      {/* Barre de recherche mobile */}
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlobalStats />
          <TrendingTokens />
          <AuctionCard />
        </div>
        <PerpTokensSection />
      </div>
    </div>
  );
} 