"use client"

import { SearchBar } from "@/components/SearchBar"
import { usePageTitle } from "@/store/use-page-title"

interface UnifiedHeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
}

export function UnifiedHeader({ 
    searchPlaceholder = "Search...",
    searchWidth = "w-[300px]",
    customTitle
}: UnifiedHeaderProps) {
    const { title } = usePageTitle();
    const displayTitle = customTitle || title;

    return (
        <div className="flex items-center gap-4 ">
            <h2 className="text-xl font-bold text-white">{displayTitle}</h2>
            <SearchBar 
                placeholder={searchPlaceholder} 
                className={`border-[#83E9FF4D] border-[2px] rounded-lg ${searchWidth}`}
            />
        </div>
    )
} 