"use client"

import { SearchBar } from "@/components/SearchBar"

interface ExplorerHeaderProps {
    showSearch?: boolean
}

export function ExplorerHeader({ showSearch = true }: ExplorerHeaderProps) {
    return (
        <div className="p-2 md:p-4 lg:pt-20 space-y-2 md:space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">HyperLiquid L1 explorer</h2>
            {showSearch && (
                <div className="w-[65%] md:w-1/2">
                    <SearchBar placeholder="Search by Block, Txn Hash, User..." />
                </div>
            )}
        </div>
    )
} 