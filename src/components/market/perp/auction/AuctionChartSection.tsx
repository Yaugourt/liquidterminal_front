"use client";

import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";

interface AuctionChartSectionProps {
  chartHeight: number;
}

export function AuctionChartSection({ chartHeight }: AuctionChartSectionProps) {
  return (
    <Card 
      className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg"
      style={{ height: chartHeight }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-white text-lg mb-2">Coming Soon</p>
          <p className="text-[#FFFFFF80] text-sm">Perpetual auctions chart will be available soon.</p>
        </div>
      </div>
    </Card>
  );
} 