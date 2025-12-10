"use client";

import { useParams } from "next/navigation";
import { useTransactions, usePortfolio } from "@/services/explorer/address";
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuthContext } from "@/contexts/auth.context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Menu } from "lucide-react";
import { AddressHeader, AddressCards, AddressTransactionList as TransactionList, TabNavigation, HoldingTabs, ADDRESS_TABS, StakingTable, OrdersTable } from "@/components/explorer";
import { TwapSection } from "@/components/explorer/address/orders";
import { VaultDepositList } from "@/components/explorer/address/VaultDepositList";
import { SearchBar } from "@/components/SearchBar";
import { useWindowSize } from "@/hooks/use-window-size";

export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;
  const { transactions, isLoading, error } = useTransactions(address);
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(address);

  const { isAuthenticated, login } = useAuthContext();
  const { width } = useWindowSize();
  
  // States for dialogs
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

  // Handler for add wallet button click
  const handleAddWalletClick = () => {
    if (isAuthenticated) {
      // Logic for authenticated users
      // This would be where you'd open the wallet add dialog
    } else {
      setIsAuthWarningOpen(true);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

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
          <Header customTitle="Explorer" showFees={true} />
        </div>

        {/* Mobile SearchBar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>
      
        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Address Header */}
          <AddressHeader address={address} />

          {/* Address Cards */}
          <AddressCards 
            portfolio={portfolio || []} 
            loadingPortfolio={loadingPortfolio}
            onAddClick={handleAddWalletClick}
            address={address}
            transactions={transactions}
            isLoadingTransactions={isLoading}
          />

          {/* Tab Navigation */}
          <TabNavigation 
            activeTab={activeTab}
            onChange={handleTabChange}
            tabs={ADDRESS_TABS}
          />

          {/* Content based on active tab */}
          {activeTab === "vaults" && (
            <VaultDepositList address={address} />
          )}

          {activeTab === "transactions" && (
            <TransactionList 
              transactions={transactions || []}
              isLoading={isLoading}
              error={error}
              currentAddress={address}
            />
          )}

          {activeTab === "holdings" && (
            <HoldingTabs 
              address={address}
              viewType="spot" 
            />
          )}

          {activeTab === "orders" && (
            <OrdersTable 
              address={address}
            />
          )}

          {activeTab === "twap" && (
            <TwapSection 
              address={address}
            />
          )}

          {activeTab === "perps" && (
            <HoldingTabs 
              address={address}
              viewType="perp" 
            />
          )}

          {activeTab === "staking" && (
            <StakingTable address={address} />
          )}

          {activeTab !== "transactions" && activeTab !== "holdings" && activeTab !== "orders" && activeTab !== "twap" && activeTab !== "perps" && activeTab !== "vaults" && activeTab !== "staking" && (
            <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl h-[400px] flex items-center justify-center shadow-xl shadow-black/20">
              <p className="text-brand-accent">Coming soon: {activeTab} view</p>
            </div>
          )}
        </main>

        {/* Authentication Warning Dialog */}
        <Dialog open={isAuthWarningOpen} onOpenChange={setIsAuthWarningOpen}>
          <DialogContent className="bg-brand-secondary border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Authentication Required</DialogTitle>
              <DialogDescription className="text-zinc-400">
                You need to be logged in to add this wallet to your list.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex items-center gap-3 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <p>Please log in to access this feature.</p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAuthWarningOpen(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setIsAuthWarningOpen(false);
                  login();
                }}
                className="bg-brand-accent text-brand-tertiary hover:bg-brand-accent/90 font-bold"
              >
                Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 