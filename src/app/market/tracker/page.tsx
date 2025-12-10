"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { useWindowSize } from "@/hooks/use-window-size";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { WalletTabs } from "@/components/market/tracker";
import { PortfolioStats, PerformanceChart } from "@/components/market/tracker/stats";
import { AssetsSection } from "@/components/market/tracker/assets";
import { WalletAssetsNavigation } from "@/components/market/tracker/WalletAssetsNavigation";
import { WalletOrdersSection, WalletTwapSection } from "@/components/market/tracker/orders";
import { WalletRecentFillsSection } from "@/components/market/tracker";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { PiSignIn } from "react-icons/pi";
import { SearchBar } from "@/components/SearchBar";

export default function Wallets() {
  const { setTitle } = usePageTitle();
  const { isAuthenticated, login } = useAuthContext();
  const { width } = useWindowSize();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAssetsTab, setActiveAssetsTab] = useState("holdings");

  useEffect(() => {
    setTitle("Wallets");
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [setTitle, width]);

  return (
    <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505]">
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
          <Header customTitle="Wallets" showFees={true} />
        </div>
        
        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-6 py-8 space-y-6 max-w-[1920px] mx-auto">
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
                  <PiSignIn className="w-5 h-5 mr-2" />
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
            {activeAssetsTab === "orders" && <WalletOrdersSection />}
            {activeAssetsTab === "twap" && <WalletTwapSection />}
            {activeAssetsTab === "recent-fills" && <WalletRecentFillsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
