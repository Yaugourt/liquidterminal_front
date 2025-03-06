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

      <main className="p-4 lg:p-12 space-y-6">
        <StatsGrid />

        <div className="flex flex-col md:flex-row gap-4 w-full justify-between">
          <TransactionsTable volume="460 000" users="460 000" />
          <TransactionsTable volume="460 000" users="460 000" />
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
