"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ValidatorStatsCard } from "@/components/validator/ValidatorStatsCard";
import { ValidatorTable } from "@/components/validator/ValidatorTable";
import { ValidatorChartSection } from "@/components/validator/ValidatorChartSection";
import { ValidatorTabButtons } from "@/components/validator/ValidatorTabButtons";

type ValidatorSubTab = 'all' | 'transactions' | 'unstaking';

export default function ValidatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');

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
        <Header customTitle="Validators" showFees={true} />

        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search validators..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <ValidatorStatsCard />
            <div className="md:col-span-2">
              <ValidatorChartSection />
            </div>
          </div>
          
          {/* Tabs au-dessus du tableau */}
          <ValidatorTabButtons 
            activeTab={validatorSubTab}
            onTabChange={setValidatorSubTab}
          />
          
          <div>
            <ValidatorTable activeTab={validatorSubTab} />
          </div>
        </main>
      </div>
    </div>
  );
} 