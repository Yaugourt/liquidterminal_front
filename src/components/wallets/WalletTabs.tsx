"use client";

export function WalletTabs() {
  return (
    <div className="flex gap-2 items-center">
      <button className="px-4 py-1.5 bg-[#051728] text-white rounded-sm hover:bg-[#0B2437]">
        Wallet 1
      </button>
      <button className="px-4 py-1.5 bg-[#1692AD] text-white rounded-sm">
        Wallet 2
      </button>
      <button className="px-4 py-1.5 bg-[#1692AD] text-white rounded-sm">
        Wallet 3
      </button>
      <button className="ml-auto px-4 py-1.5 bg-[#F0D04E] text-black rounded-sm hover:bg-[#F0D04E]/90">
        + Add Wallet
      </button>
    </div>
  );
}
