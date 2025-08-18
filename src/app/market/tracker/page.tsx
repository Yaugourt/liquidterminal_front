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
    <div className="min-h-screen">
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
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="">
        <Header customTitle="Wallets" showFees={true} />
        
        {/* Barre de recherche mobile */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 max-w-[1920px] mx-auto">
          {!isAuthenticated && (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md p-6 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-white mb-2">Authentication Required</h2>
                  <p className="text-[#83E9FF]/60 text-sm">You need to login to access your wallet data</p>
                </div>
                <Button 
                  onClick={() => login()}
                  className="group relative w-full bg-[#051728] rounded-lg overflow-hidden"
                >
                  <div className="absolute inset-[1px] bg-[#051728] rounded-lg z-10" />
                  <div className="absolute inset-0 bg-[#83E9FF] blur-[2px]" />
                  <div className="relative z-20 flex items-center justify-center gap-2 py-2.5">
                    <PiSignIn className="w-5 h-5 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-[#83E9FF] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(131,233,255,0.6)] transition-all duration-300">
                      Login
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          )}
          
          <div className={isAuthenticated ? "" : "filter blur-[5px] pointer-events-none select-none"}>
            <div className="mb-8">
              <WalletTabs />
            </div>
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
            <WalletAssetsNavigation 
              activeTab={activeAssetsTab}
              onChange={setActiveAssetsTab}
            />
            
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
