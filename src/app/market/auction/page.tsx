"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AuctionCard, AuctionTable, AuctionChartSection } from "@/components/market/auction";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function AuctionPage() {
  const [marketType, setMarketType] = useState<"spot" | "perp">("spot");
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
          customTitle={marketType === "spot" ? "Spot Auctions" : "Perpetual Auctions"} 
          showFees={true} 
        />
        
                <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Switch entre Spot et Perp */}
            <div className="flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]">
              <Button
                variant={marketType === "spot" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMarketType("spot")}
                className={`text-xs px-3 py-1.5 transition-colors ${
                  marketType === "spot"
                    ? "bg-[#1692AD] text-white hover:bg-[#127d95]"
                    : "text-[#FFFFFF80] hover:text-white hover:bg-[#051728]"
                }`}
              >
                Spot
              </Button>
              <Button
                variant={marketType === "perp" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMarketType("perp")}
                className={`text-xs px-3 py-1.5 transition-colors ${
                  marketType === "perp"
                    ? "bg-[#1692AD] text-white hover:bg-[#127d95]"
                    : "text-[#FFFFFF80] hover:text-white hover:bg-[#051728]"
                }`}
              >
                Perp
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <AuctionCard key={`card-${marketType}`} marketType={marketType} />
            </div>
            <div className="md:w-2/3">
              <AuctionChartSection key={marketType} chartHeight={270} marketType={marketType} />
            </div>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-4 mt-2">
              {marketType === "spot" ? "Past Auctions" : "Perpetual Auctions"}
            </h2>
            <AuctionTable key={`table-${marketType}`} marketType={marketType} />
          </div>
        </main>
      </div>
    </div>
  );
}
