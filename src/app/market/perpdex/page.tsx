"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { 
  PerpDexStatsCard, 
  PerpDexTable, 
  TopPerpDexsCard,
  Hip3InfoCard 
} from "@/components/market/perpDex";

export default function PerpDexsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <Header customTitle="PerpDexs (HIP-3)" showFees={true} />
        
        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search DEX..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <PerpDexStatsCard />
            <TopPerpDexsCard />
            <Hip3InfoCard />
          </div>

          {/* DEX Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">
                All Builder DEXs
              </h2>
            </div>
            <PerpDexTable />
          </div>
        </main>
      </div>
    </div>
  );
}

