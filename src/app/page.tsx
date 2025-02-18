"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { SearchBar } from "@/components/SearchBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useWindowSize } from "@/hooks/use-window-size";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TabSection } from "@/components/dashboard/TabSection";

export default function Home() {
  const { setTitle } = usePageTitle();
  const { width } = useWindowSize();
  const chartHeight = width >= 1024 ? 345 : 296;
  const [activeTab, setActiveTab] = useState("vault");

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      <main className="p-2 mt-[5%] lg:p-8 space-y-3 lg:space-y-8">
        <StatsGrid />

        <div className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
            <TransactionsTable volume="460 000" users="460 000" />
            <TransactionsTable volume="460 000" users="460 000" />
          </div>
        </div>

        <TabSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chartHeight={chartHeight}
        />
      </main>
    </div>
  );
}
