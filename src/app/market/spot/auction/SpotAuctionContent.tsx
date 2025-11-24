"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AuctionCard, AuctionTable, AuctionChartSection } from "@/components/market/auction";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

export function SpotAuctionContent() {
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
        <Header 
          customTitle="Spot Auctions" 
          showFees={true} 
        />
        
        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <AuctionCard marketType="spot" />
            </div>
            <div className="md:w-2/3">
              <AuctionChartSection marketType="spot" chartHeight={270} />
            </div>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-4 mt-2">
              Past Auctions
            </h2>
            <AuctionTable marketType="spot" />
          </div>
        </main>
      </div>
    </div>
  );
}

