"use client";

export function TokenFilters() {
  return (
    <div className="flex gap-1 mb-4">
      <button className="px-8 py-1.5 text-sm text-white bg-[#1692AD] rounded">
        All
      </button>
      <button className="px-8 py-1.5 text-sm text-white bg-[#051728] hover:bg-[#0B2437] rounded">
        Strict
      </button>
      <button className="px-8 py-1.5 text-sm text-white bg-[#051728] hover:bg-[#0B2437] rounded">
        Auction
      </button>
    </div>
  );
}
