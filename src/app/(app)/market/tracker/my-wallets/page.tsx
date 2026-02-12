"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/store/use-page-title";
import { useWallets } from "@/store/use-wallets";
import { WalletTabs } from "@/components/market/tracker";
import { PortfolioStats, PerformanceChart } from "@/components/market/tracker/stats";
import { AssetsSection } from "@/components/market/tracker/assets";
import { WalletAssetsNavigation } from "@/components/market/tracker/WalletAssetsNavigation";
import { OrdersSection, TwapSection } from "@/components/explorer/address/orders";
import { WalletRecentFillsSection } from "@/components/market/tracker";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { usePrivy } from "@privy-io/react-auth";

// Telegram brand icon
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export default function MyWallets() {
  const router = useRouter();
  const { setTitle } = usePageTitle();
  const { login, user: currentUser } = useAuthContext();
  const { ready: privyReady, authenticated } = usePrivy();
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
  // 2. Privy is fully ready
  // 3. User is confirmed not authenticated
  // This prevents the popup from flashing during navigation for logged-in users
  const showAuthPopup = isMounted && privyReady && !authenticated;

  return (
    <>
      {showAuthPopup && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-brand-secondary/80 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Authentication Required</h2>
              <p className="text-zinc-400 text-sm">You need to login to access your wallet data</p>
            </div>
            <Button
              onClick={() => login()}
              className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg py-2.5"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          </div>
        </div>
      )}

      <div className={showAuthPopup ? "filter blur-[5px] pointer-events-none select-none" : ""}>
        {/* Navigation principale */}
        <div className="mb-8">
          <WalletTabs />
        </div>

        {/* Telegram Alert Banner - only show if authenticated and not linked */}
        {authenticated && !currentUser?.telegramUsername && (
          <div className="mb-6 p-4 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#0088cc]/20 flex items-center justify-center">
                <TelegramIcon className="h-5 w-5 text-[#0088cc]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Get wallet alerts on Telegram</p>
                <p className="text-xs text-text-muted">Receive notifications for your tracked wallets</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/profile')}
              className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white text-sm"
            >
              <TelegramIcon className="h-4 w-4 mr-2" />
              Connect
            </Button>
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
            <div className="bg-brand-tertiary border-2 border-[#83E9FF4D] rounded-lg p-8 text-center">
              <h3 className="text-white text-lg font-medium mb-2">Orders</h3>
              <p className="text-[#FFFFFF80] text-sm">No wallet selected</p>
            </div>
          )
        )}

        {activeAssetsTab === "twap" && (
          activeWallet?.address ? (
            <TwapSection address={activeWallet.address} />
          ) : (
            <div className="bg-brand-tertiary border-2 border-[#83E9FF4D] rounded-lg p-8 text-center">
              <h3 className="text-white text-lg font-medium mb-2">TWAP</h3>
              <p className="text-[#FFFFFF80] text-sm">No wallet selected</p>
            </div>
          )
        )}
        {activeAssetsTab === "recent-fills" && <WalletRecentFillsSection />}
      </div>
    </>
  );
}
