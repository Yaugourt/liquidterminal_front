"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type FilterType = "all" | "strict" | "auction";

export function TokenFilters() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

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
