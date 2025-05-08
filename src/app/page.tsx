"use client";

import { useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { SearchBar } from "@/components/SearchBar";
import {  Header } from "@/components/Header";
import { useWindowSize } from "@/hooks/use-window-size";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TrendingTokens } from "@/components/dashboard/TrendingTokens";
import { TabSection } from "@/components/dashboard/TabSection";
import { ChartSection } from "@/components/dashboard/ChartSection";

export default function Home() {
  const { setTitle } = usePageTitle();
  const { width } = useWindowSize();
  const chartHeight = width >= 1024 ? 345 : width >= 640 ? 296 : 246;
  const [activeTab, setActiveTab] = useState("vault");


  return (
    <div className="min-h-screen p-4">
      < Header customTitle="Dashboard" />
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      <main className="p-3 sm:p-4 lg:p-6 xl:p-12 space-y-4 sm:space-y-6">
        <StatsGrid />

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full">
          <TrendingTokens type="perp" />
          <TrendingTokens type="spot" />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-4">
          <TabSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <ChartSection chartHeight={chartHeight} />
        </div>
      </main>
    </div>
  );
}
