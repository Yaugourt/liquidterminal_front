"use client";

import { useParams } from "next/navigation";
import { useTransactions, usePortfolio } from "@/services/explorer/address";
import React, { useState } from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { AddressHeader, AddressCards, AddressTransactionList as TransactionList, TabNavigation, ADDRESS_TABS, StakingTable } from "@/components/explorer";
import { AssetsSection } from "@/components/market/tracker/assets";
import { OrdersSection, TwapSection } from "@/components/explorer/address/orders";
import { VaultDepositList } from "@/components/explorer/address/VaultDepositList";

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
    } else {
      setIsAuthWarningOpen(true);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <>
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
        <div className="mt-6">
          <AssetsSection
            initialViewType="spot"
            addressOverride={address}
          />
        </div>
      )}

      {activeTab === "orders" && (
        <OrdersSection
          address={address}
        />
      )}

      {activeTab === "twap" && (
        <TwapSection
          address={address}
        />
      )}

      {activeTab === "perps" && (
        <div className="mt-6">
          <AssetsSection
            initialViewType="perp"
            addressOverride={address}
          />
        </div>
      )}

      {activeTab === "staking" && (
        <StakingTable address={address} />
      )}

      {activeTab !== "transactions" && activeTab !== "holdings" && activeTab !== "orders" && activeTab !== "twap" && activeTab !== "perps" && activeTab !== "vaults" && activeTab !== "staking" && (
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl h-[400px] flex items-center justify-center shadow-xl shadow-black/20">
          <p className="text-brand-accent">Coming soon: {activeTab} view</p>
        </div>
      )}

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
    </>
  );
}