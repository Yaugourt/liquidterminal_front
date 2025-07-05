"use client";

import { useParams } from "next/navigation";
import { useTransactions, usePortfolio } from "@/services/explorer/address";
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { useAuthContext } from "@/contexts/auth.context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { AddressHeader, AddressCards, AddressTransactionList as TransactionList, TabNavigation, HoldingTabs, ADDRESS_TABS } from "@/components/explorer";

export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;
  const { transactions, isLoading, error } = useTransactions(address);
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(address);
  const { isAuthenticated, login } = useAuthContext();
  
  // States for dialogs
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

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
    <div className="min-h-screen">
      <Header customTitle="Explorer" showFees={true} />
      
      <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
        {/* Address Header */}
        <AddressHeader address={address} />

        {/* Address Cards */}
        <AddressCards 
          portfolio={portfolio || []} 
          loadingPortfolio={loadingPortfolio}
          onAddClick={handleAddWalletClick}
          address={address}
        />

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={ADDRESS_TABS}
        />

        {/* Content based on active tab */}
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

        {activeTab === "perps" && (
          <HoldingTabs 
            address={address}
            viewType="perp" 
          />
        )}

        {activeTab !== "transactions" && activeTab !== "holdings" && activeTab !== "perps" && (
          <div className="bg-[#0A1F32] h-[400px] border border-[#1E3851] rounded-xl flex items-center justify-center">
            <p className="text-[#83E9FF]">Coming soon: {activeTab} view</p>
          </div>
        )}
      </main>

      {/* Authentication Warning Dialog */}
      <Dialog open={isAuthWarningOpen} onOpenChange={setIsAuthWarningOpen}>
        <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription className="text-[#FFFFFF99]">
              You need to be logged in to add this wallet to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3 text-[#FF5252]">
            <AlertCircle className="h-5 w-5" />
            <p>Please log in to access this feature.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthWarningOpen(false)}
              className="border-[#83E9FF4D] text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsAuthWarningOpen(false);
                login();
              }}
              className="bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90"
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 