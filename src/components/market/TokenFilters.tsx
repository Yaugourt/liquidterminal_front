"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

type FilterType = "all" | "strict" | "auction"

export function TokenFilters() {
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all")

    return (
        <div className="flex gap-2 mb-4">
            <button
                onClick={() => setSelectedFilter("all")}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-sm transition-colors",
                    selectedFilter === "all"
                        ? "bg-[#1692AD] text-white"
                        : "bg-[#051728] text-[#FFFFFF99] hover:bg-[#112941]"
                )}
            >
                All
            </button>
            <button
                onClick={() => setSelectedFilter("strict")}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-sm transition-colors",
                    selectedFilter === "strict"
                        ? "bg-[#1692AD] text-white"
                        : "bg-[#051728] text-[#FFFFFF99] hover:bg-[#112941]"
                )}
            >
                Strict
            </button>
            <button
                onClick={() => setSelectedFilter("auction")}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-sm transition-colors",
                    selectedFilter === "auction"
                        ? "bg-[#1692AD] text-white"
                        : "bg-[#051728] text-[#FFFFFF99] hover:bg-[#112941]"
                )}
            >
                Auction
            </button>
        </div>
    )
} 