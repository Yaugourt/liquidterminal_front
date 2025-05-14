"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { Header } from "@/components/Header";
import { WalletTabs } from "@/components/wallets/WalletTabs";
import { StatsSection } from "@/components/wallets/stats/StatsSection";
import { AssetsSection } from "@/components/wallets/assets/AssetsSection";
import { useAuthContext } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Wallets() {
  const { setTitle } = usePageTitle();
  const { isAuthenticated, login } = useAuthContext();

  useEffect(() => {
    setTitle("Wallets");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
          <Header customTitle="Wallets" showFees={true} />
      <div className="p-8 space-y-8">        
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
      </div>
    </div>
  );
}
