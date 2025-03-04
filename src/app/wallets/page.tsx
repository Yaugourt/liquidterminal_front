"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { WalletHeader } from "@/components/wallets/WalletHeader";
import { WalletTabs } from "@/components/wallets/WalletTabs";
import { StatsSection } from "@/components/wallets/stats/StatsSection";
import { AssetsSection } from "@/components/wallets/assets/AssetsSection";

export default function Wallets() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wallets");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      <div className="p-8 space-y-8">
        <WalletHeader />
        <WalletTabs />
        <StatsSection />
        <AssetsSection />
      </div>
    </div>
  );
}
