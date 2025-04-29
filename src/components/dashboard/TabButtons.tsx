import { Button } from "@/components/ui/button";
import { TabButtonsProps } from "@/components/types/dashboard.types";

export function TabButtons({ activeTab, setActiveTab }: TabButtonsProps) {
  return (
    <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
      <Button
        onClick={() => setActiveTab("vault")}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
          activeTab === "vault"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
        }`}
      >
        Vault
      </Button>
      <Button
        onClick={() => setActiveTab("stacking")}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
          activeTab === "stacking"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
        }`}
      >
        Staking
      </Button>
      <Button
        onClick={() => setActiveTab("auction")}
        variant="ghost"
        size="sm"
        className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
          activeTab === "auction"
            ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
        }`}
      >
        Auction
      </Button>
    </div>
  );
} 