"use client";

import { useParams } from "next/navigation";
import { useTransactions, usePortfolio } from "@/services/explorer/address";
import React, { useState, useCallback } from "react";
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

  // Track which tabs have been visited (lazy mount + keep alive)
  // Initialize with "transactions" since it's the default tab
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["transactions"]));

  // Handler for add wallet button click
  const handleAddWalletClick = () => {
    if (isAuthenticated) {
      // Logic for authenticated users
    } else {
      setIsAuthWarningOpen(true);
    }
  };

  // Handle tab change - mark tab as visited
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setVisitedTabs(prev => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }, []);

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

      {/* Content based on active tab - lazy mount + keep alive pattern */}
      {/* Components are only mounted on first visit, then stay in memory */}

      {visitedTabs.has("vaults") && (
        <div className={activeTab === "vaults" ? "" : "hidden"}>
          <VaultDepositList address={address} />
        </div>
      )}

      {visitedTabs.has("transactions") && (
        <div className={activeTab === "transactions" ? "" : "hidden"}>
          <TransactionList
            transactions={transactions || []}
            isLoading={isLoading}
            error={error}
            currentAddress={address}
          />
        </div>
      )}

      {visitedTabs.has("holdings") && (
        <div className={activeTab === "holdings" ? "mt-6" : "hidden"}>
          <AssetsSection
            initialViewType="spot"
            addressOverride={address}
          />
        </div>
      )}

      {visitedTabs.has("orders") && (
        <div className={activeTab === "orders" ? "" : "hidden"}>
          <OrdersSection
            address={address}
          />
        </div>
      )}

      {visitedTabs.has("twap") && (
        <div className={activeTab === "twap" ? "" : "hidden"}>
          <TwapSection
            address={address}
          />
        </div>
      )}

      {visitedTabs.has("perps") && (
        <div className={activeTab === "perps" ? "mt-6" : "hidden"}>
          <AssetsSection
            initialViewType="perp"
            addressOverride={address}
          />
        </div>
      )}

      {visitedTabs.has("staking") && (
        <div className={activeTab === "staking" ? "" : "hidden"}>
          <StakingTable address={address} />
        </div>
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