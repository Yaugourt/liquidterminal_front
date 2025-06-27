"use client";

import { useState } from "react";
import { TrendingTokens } from "./TrendingTokens";
import { Button } from "@/components/ui/button";

export const TrendingTokensTabs = () => {
  const [activeTab, setActiveTab] = useState<"perp" | "spot">("perp");

  return (
    <div className="w-full">
      {/* Onglets */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("perp")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "perp"
              ? "bg-[#051728] text-white border border-[#83E9FF4D]"
              : "bg-[#1692AD] text-white border-transparent"
          }`}
        >
          Perpetual
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("spot")}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === "spot"
              ? "bg-[#051728] text-white border border-[#83E9FF4D]"
              : "bg-[#1692AD] text-white border-transparent"
          }`}
        >
          Spot
        </Button>
      </div>

      {/* Contenu de l'onglet actif */}
      <TrendingTokens 
        type={activeTab} 
        title={activeTab === "perp" ? "Trending perpetual" : "Trending spot"} 
      />
    </div>
  );
}; 