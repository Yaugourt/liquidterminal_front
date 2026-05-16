"use client"

import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar"
import { SettingsSelector, UserAccountCompact, ThemeToggle } from "@/components/common"

interface HeaderProps {
    searchPlaceholder?: string;
    customTitle?: string;
}

export function Header({
    searchPlaceholder = "Search token, address, tx or block...",
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 h-14 bg-base/95 backdrop-blur-sm border-b border-border-subtle">
            <div className="flex items-center w-full h-full px-4 gap-3 max-w-[1920px] mx-auto">
                {/* Search: flex-1 max-w-[480px] per V4 ref */}
                <ExplorerSearchBar
                    placeholder={searchPlaceholder}
                    className="hidden lg:block bg-surface-2 border border-border-subtle rounded-md flex-1 max-w-[480px] ml-8 lg:ml-0 transition-colors hover:border-border-default focus-within:border-brand focus-within:bg-surface"
                />

                {/* Spacer pushes the right cluster to the end */}
                <div className="flex-1 hidden lg:block" />

                <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <UserAccountCompact />
                    <ThemeToggle />
                    <SettingsSelector />
                </div>
            </div>
        </header>
    )
} 