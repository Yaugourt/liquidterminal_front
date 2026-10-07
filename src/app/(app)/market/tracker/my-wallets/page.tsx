"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { useWallets } from "@/store/use-wallets";
import { WalletTabs } from "@/components/market/tracker";
import { PortfolioStats, PerformanceChart } from "@/components/market/tracker/stats";
import { AssetsSection } from "@/components/market/tracker/assets";
import { WalletAssetsNavigation } from "@/components/market/tracker/WalletAssetsNavigation";
import { OrdersSection, AddressTwapSection } from "@/components/explorer/address/orders";
import { WalletRecentFillsSection } from "@/components/market/tracker";
import { ListAlertsPanel } from "@/components/market/tracker/walletlists/ListAlertsPanel";
import { LiveWalletActivity } from "@/components/market/tracker/LiveWalletActivity";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { usePrivy, useModalStatus, useSignedOut } from "@/services/auth/privy";

export default function MyWallets() {
  const { setTitle } = usePageTitle();
  const { login } = useAuthContext();
  const { authenticated } = usePrivy();
  const signedOut = useSignedOut();
  // Privy's own modal open-state — the gate hides while Privy's login modal is
  // up so Radix's focus trap doesn't fight it (see the Dialog below).
  const { isOpen: privyModalOpen } = useModalStatus();
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  const [activeAssetsTab, setActiveAssetsTab] = useState("holdings");
  const [isMounted, setIsMounted] = useState(false);

  // Lift API calls to page level to avoid duplicate fetches in child components
  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio(activeWallet?.address || '');
  const { spotBalances, perpPositions, isLoading: balancesLoading } = useWalletsBalances(activeWallet?.address || '');

  useEffect(() => {
    setTitle("My Wallets");
    setIsMounted(true);
  }, [setTitle]);

  // Only show auth popup after:
  // 1. Component is mounted (client-side)
  // 2. The visitor is known to be signed out: Privy says so, or the browser
  //    holds no session for it to restore (see useSignedOut)
  // This prevents the popup from flashing during navigation for logged-in users
  const showAuthPopup = isMounted && signedOut;

  return (
    <>
      {/* Auth gate — non-dismissable until the user logs in. The modal overlay
          darkens + blurs the inert page behind it (no manual blur wrapper).
          Hidden while Privy's modal is open so the focus traps don't fight;
          reappears automatically if the user dismisses Privy without auth. */}
      <Dialog open={showAuthPopup && !privyModalOpen}>
        <DialogContent
          hideClose
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>You need to login to access your wallet data</DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => login()}
            className="w-full bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg py-2.5"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </Button>
        </DialogContent>
      </Dialog>

      <div>
        {/* Navigation principale */}
        <div className="mb-8">
          <WalletTabs />
        </div>

        {/* Telegram alerts per list (links Telegram in place when needed) */}
        {authenticated && (
          <div className="mb-8 grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ListAlertsPanel />
            <LiveWalletActivity />
          </div>
        )}

        {/* Stats et graphiques */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5">
              <PortfolioStats
                portfolioData={portfolioData}
                perpPositions={perpPositions}
              />
            </div>
            <div className="lg:col-span-7">
              <PerformanceChart
                portfolioData={portfolioData}
                portfolioLoading={portfolioLoading}
                spotBalances={spotBalances}
                balancesLoading={balancesLoading}
              />
            </div>
          </div>
        </div>

        {/* Navigation des assets */}
        <WalletAssetsNavigation
          activeTab={activeAssetsTab}
          onChange={setActiveAssetsTab}
        />

        {/* Contenu selon l'onglet des assets */}
        {activeAssetsTab === "holdings" && <AssetsSection />}

        {activeAssetsTab === "orders" && (
          activeWallet?.address ? (
            <OrdersSection address={activeWallet.address} />
          ) : (
            <EmptyState title="Orders" description="No wallet selected" />
          )
        )}

        {activeAssetsTab === "twap" && (
          activeWallet?.address ? (
            <AddressTwapSection address={activeWallet.address} />
          ) : (
            <EmptyState title="TWAP" description="No wallet selected" />
          )
        )}
        {activeAssetsTab === "recent-fills" && <WalletRecentFillsSection />}
      </div>
    </>
  );
}
