"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AuctionCard, AuctionTable, AuctionChartSection } from "@/components/market/auction";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Menu } from "lucide-react";

export function SpotAuctionContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Bouton menu mobile en position fixe */}
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

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header 
            customTitle="Spot Auctions" 
            showFees={true} 
          />
        </div>

        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>
        
        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <AuctionCard marketType="spot" />
            </div>
            <div className="md:w-2/3">
              <AuctionChartSection marketType="spot" chartHeight={270} />
            </div>
          </div>

          <div>
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
              Past Auctions
            </h2>
            <AuctionTable marketType="spot" />
          </div>
        </main>
      </div>
    </div>
  );
}

