import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TabButtonsProps } from "@/components/types/dashboard.types";

export const TabButtons = memo(({ activeTab, setActiveTab }: TabButtonsProps) => {
  const handleVaultClick = useCallback(() => setActiveTab("vault"), [setActiveTab]);
  const handleStackingClick = useCallback(() => setActiveTab("stacking"), [setActiveTab]);
  const handleAuctionClick = useCallback(() => setActiveTab("auction"), [setActiveTab]);

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
      <Button
        onClick={handleVaultClick}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
          ${activeTab === "vault"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
        `}
      >
        VAULT
      </Button>
      <Button
        onClick={handleStackingClick}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
          ${activeTab === "stacking"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
        `}
      >
        STAKING
      </Button>
      <Button
        onClick={handleAuctionClick}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap uppercase font-bold
          ${activeTab === "auction"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"}
        `}
      >
        AUCTION
      </Button>
    </div>
  );
}); 