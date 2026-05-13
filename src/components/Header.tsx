"use client"

import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar"
import { SettingsSelector } from "@/components/common"
import { UserAccountCompact } from "@/components/common"

interface HeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
}

export function Header({
    searchPlaceholder = "Search token, address, tx or block...",
    searchWidth = "w-[350px]",
}: HeaderProps) {
    return (
        <div className="w-full max-w-[1920px] mx-auto">
            <div className="flex items-center justify-between w-full px-2 sm:px-4 lg:px-6 xl:px-12 py-3 gap-2">
                <div className="flex items-center gap-3 flex-shrink-0 ml-8 lg:ml-0">
                    <ExplorerSearchBar
                        placeholder={searchPlaceholder}
                        className={`hidden lg:block bg-brand-main/80 backdrop-blur-xl border border-border-hover rounded-xl shadow-sm ${searchWidth} transition-all hover:border-white/20 focus-within:border-brand-accent`}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <UserAccountCompact />
                    <SettingsSelector />
                </div>
            </div>
        </div>
    )
} 