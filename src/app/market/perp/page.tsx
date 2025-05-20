"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { MarketStatsSectionPerp } from "@/components/market/perp/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/perp/PerpTokensSection";
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

      {/* Header toujours en haut */}
      <div className="p-4">
        <Header customTitle="Market Perpetual" showFees={true} />
        
        {/* Barre de recherche mobile */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <MarketStatsSectionPerp />
        <PerpTokensSection />
      </div>
    </div>
  );
} 