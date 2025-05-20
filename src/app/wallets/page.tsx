"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { useWindowSize } from "@/hooks/use-window-size";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { WalletTabs } from "@/components/wallets/WalletTabs";
import { StatsSection } from "@/components/wallets/stats/StatsSection";
import { AssetsSection } from "@/components/wallets/assets/AssetsSection";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export default function Wallets() {
  const { setTitle } = usePageTitle();
  const { isAuthenticated, login } = useAuthContext();
  const { width } = useWindowSize();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <div className="fixed inset-0 z-40 bg-[#051728]/10 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="bg-[#051728]/90 border border-[#83E9FF33] rounded-xl p-8 shadow-lg shadow-[#83E9FF]/10 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                <p className="text-[#83E9FF99] mb-6">You need to login to access your wallet data</p>
                <Button 
                  onClick={() => login()}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#2DCCFF] to-[#15748E] hover:from-[#83E9FF] hover:to-[#1692AD] text-white rounded-xl px-4 py-3 h-12 transition-all border-2 border-[#83E9FF33] shadow-[0_0_15px_rgba(131,233,255,0.15)]"
                >
                  <Image
                    src="/wallet-icon.svg" 
                    alt="Login"
                    width={20}
                    height={20}
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  <span className="font-medium">Login</span>
                </Button>
              </div>
            </div>
          )}
          
          <div className={isAuthenticated ? "" : "filter blur-[5px] pointer-events-none select-none"}>
            <div className="mb-8">
              <WalletTabs />
            </div>
            <div className="mb-8">
              <StatsSection />
            </div>
            <AssetsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
