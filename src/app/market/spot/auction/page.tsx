"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AuctionCard } from "@/components/market/spot/auction/AuctionCard";
import { AuctionTable } from "@/components/market/spot/auction/AuctionTable";
import { AuctionChartSection } from "@/components/market/spot/auction/AuctionChartSection";

export default function SpotAuctionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Bouton menu mobile */}
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
      <div>
        <Header customTitle="Spot Auctions" showFees={true} />

        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search auctions..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <AuctionCard />
            <div className="md:col-span-2">
              <AuctionChartSection chartHeight={240} />
            </div>
          </div>
          <div>
            <h2 className="text-white text-lg font-bold mb-4 mt-2">Past Auctions</h2>
            <AuctionTable />
          </div>
        </main>
      </div>
    </div>
  );
}
