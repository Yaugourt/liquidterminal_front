"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { GlobalStats, TrendingTokens, PerpTokensSection, AuctionCard } from "@/components/market";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

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

      {/* Main content */}
      <div className="">
      <Header customTitle="Market Perpetual" showFees={true} />
      
      {/* Barre de recherche mobile */}
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlobalStats />
          <TrendingTokens />
          <AuctionCard />
        </div>
        <PerpTokensSection />
        </main>
      </div>
    </div>
  );
} 