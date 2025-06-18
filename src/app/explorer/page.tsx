"use client";

import { Header } from "@/components/Header";
import { 
  StatsGrid, 
  BlocksTable, 
  RecentTransactionsTable, 
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

      {/* Header toujours en haut */}
      <Header customTitle="Explorer" showFees={true} />

      {/* Barre de recherche mobile */}
      <div className="p-2 lg:hidden">
        <SearchBar placeholder="Search..." />
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Simplified Stats Section en haut */}
        <StatsGrid />

        {/* Graphique d'activité et tableau des validateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValidatorsTable />
          <TransfersDeployTable />
        </div>

        {/* Tables des blocs et transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BlocksTable />
          <RecentTransactionsTable />
        </div>
      </div>
    </div>
  );
}
