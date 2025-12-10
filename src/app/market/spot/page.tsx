"use client";

import { Header } from "@/components/Header";
import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export default function Market() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505]">
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
        {/* Header avec glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
          <Header customTitle="Market Spot" showFees={true} />
        </div>

        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <GlobalStatsCard market="spot" />
            <div className="h-full">
              <UniversalTokenTable market="spot" mode="compact" />
            </div>
            <AuctionCard marketType="spot" />
          </div>
          <TokensSection market="spot" />
        </main>
      </div>
    </div>
  );
}
