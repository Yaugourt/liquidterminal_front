"use client";

import { Header } from "@/components/Header";
import { 
  StatsGrid, 
  RecentDataTable,
  ValidatorsTable, 
  TransfersDeployTable 
} from "@/components/explorer";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export default function Explorer() {
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
        {/* Header toujours en haut */}
        <Header customTitle="Explorer" showFees={true} />

        {/* Barre de recherche mobile */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Simplified Stats Section en haut */}
          <StatsGrid />

          {/* Graphique d'activité et tableau des données récentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentDataTable />
            <TransfersDeployTable />
          </div>

          {/* Table unifiée des validateurs */}
          <div className="grid grid-cols-1 gap-4">
            <ValidatorsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
