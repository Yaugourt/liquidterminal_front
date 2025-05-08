"use client"

import { SearchBar } from "@/components/SearchBar"
import { usePageTitle } from "@/store/use-page-title"
import { AccountHeader } from "@/components/AccountHeader"
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats"
import { formatFullNumber } from "@/lib/formatting"

interface HeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
}

export function Header({ 
    searchPlaceholder = "Search...",
    searchWidth = "w-[300px]",
    customTitle
}: HeaderProps) {
    const { title } = usePageTitle();
    const displayTitle = customTitle || title;
    const { feesStats, isLoading: feesLoading, error: feesError } = useFeesStats();

    return (
        <div className="flex items-center justify-between w-full px-8 py-4">
            <div className="flex items-center gap-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white whitespace-nowrap">{displayTitle}</h2>
                <SearchBar 
                    placeholder={searchPlaceholder} 
                    className={`border-[#83E9FF4D] border-[2px] rounded-lg ${searchWidth}`}
                />
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 text-xs text-white flex-wrap justify-center mx-auto px-4 whitespace-nowrap flex-grow">
                {feesLoading && (
                    <>
                        <span className="opacity-75">Hourly Fees: Loading...</span>
                        <span className="opacity-75">Daily Fees: Loading...</span>
                    </>
                )}
                {feesError && (
                    <span className="text-red-400">Fees data unavailable</span>
                )}
                {feesStats && !feesLoading && !feesError && (
                    <>
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-1">Hourly:</span>
                            <span>${formatFullNumber(feesStats.hourlyFees)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-1">Daily:</span>
                            <span>${formatFullNumber(feesStats.dailyFees)}</span>
                        </div>
                    </>
                )}
            </div>
            <div className="flex-shrink-0">
                <AccountHeader />
            </div>
        </div>
    )
} 