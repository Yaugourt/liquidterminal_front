"use client";

export function SpotTokenTabs() {
  return (
    <div className="flex gap-2 mb-6">
      <button className="px-5 py-1.5 text-sm font-medium text-white bg-[#1692AD]/90 rounded-lg shadow-md border border-[#83E9FF33] hover:bg-[#1A9CBC] transition-all duration-200">
        All
      </button>
      <button className="px-5 py-1.5 text-sm font-medium text-white bg-[#051728]/40 backdrop-blur-sm border border-[#83E9FF20] rounded-lg shadow-sm hover:bg-[#0B2437]/60 hover:border-[#83E9FF40] transition-all duration-200">
        Strict
      </button>
    </div>
  );
}
