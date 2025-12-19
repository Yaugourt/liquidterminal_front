"use client";

import { useState, useEffect } from "react";
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

export default function Wallets() {
  const { setTitle } = usePageTitle();
  const { isAuthenticated, login } = useAuthContext();
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  const [activeAssetsTab, setActiveAssetsTab] = useState("holdings");

  useEffect(() => {
    setTitle("Wallets");
  }, [setTitle]);

  return (
    <>
      {!isAuthenticated && (
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

      <div className={isAuthenticated ? "" : "filter blur-[5px] pointer-events-none select-none"}>
        {/* Navigation principale */}
        <div className="mb-8">
          <WalletTabs />
        </div>

        {/* Stats et graphiques */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5">
              <PortfolioStats />
            </div>
            <div className="lg:col-span-7">
              <PerformanceChart />
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
