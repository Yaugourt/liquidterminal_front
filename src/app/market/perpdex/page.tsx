"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { useWindowSize } from "@/hooks/use-window-size";
import { 
  PerpDexStatsCard, 
  PerpDexTable, 
  TopPerpDexsCard,
  Hip3InfoCard 
} from "@/components/market/perpDex";

export default function PerpDexsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { width } = useWindowSize();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

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

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
          <Header customTitle="PerpDexs (HIP-3)" showFees={true} />
        </div>
        
        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search DEX..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <PerpDexStatsCard />
            <TopPerpDexsCard />
            <Hip3InfoCard />
          </div>

          {/* DEX Table */}
          <div>
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
              All Builder DEXs
            </h2>
            <PerpDexTable />
          </div>
        </main>
      </div>
    </div>
  );
}

