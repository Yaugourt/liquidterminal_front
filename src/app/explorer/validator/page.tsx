"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ValidatorStatsCard } from "@/components/explorer/validator/ValidatorStatsCard";
import { ValidatorTable } from "@/components/explorer/validator/ValidatorTable";
import { ValidatorChartSection } from "@/components/explorer/validator/chart/ValidatorChartSection";
import { ValidatorTabButtons } from "@/components/explorer/validator/ValidatorTabButtons";
import { ValidatorSubTab } from "@/components/explorer/validator/types";
import { useWindowSize } from "@/hooks/use-window-size";

export default function ValidatorPage() {
  const { width } = useWindowSize();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');

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

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="">
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-main/80 border-b border-white/5">
          <Header customTitle="Validators" showFees={true} />
        </div>

        {/* Mobile SearchBar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search validators..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <ValidatorStatsCard />
            </div>
            <div className="md:col-span-2 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <ValidatorChartSection />
            </div>
          </div>
          
          {/* Tabs above table */}
          <ValidatorTabButtons 
            activeTab={validatorSubTab}
            onTabChange={setValidatorSubTab}
          />
          
          <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <ValidatorTable activeTab={validatorSubTab} />
          </div>
        </main>
      </div>
    </div>
  );
} 