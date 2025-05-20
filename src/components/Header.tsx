"use client"

import { SearchBar } from "@/components/SearchBar"
import { usePageTitle } from "@/store/use-page-title"
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats"
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice"
import { Clock, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
    showFees?: boolean;
}

export function Header({ 
    searchPlaceholder = "Search...",
    searchWidth = "w-[300px]",
    customTitle,
    showFees = false
}: HeaderProps) {
    const { title } = usePageTitle();
    const displayTitle = customTitle || title;
    const { feesStats, isLoading: feesLoading, error: feesError } = useFeesStats();
    const { price: hypePrice, lastSide, isLoading: hypePriceLoading } = useHypePrice();
    
    // Format numbers with up to 2 decimal places
    const formatFee = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Format price with more decimal places for precision
    const formatPrice = (value: number | null) => {
        if (value === null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }).format(value);
    };

    return (
        <div className="flex flex-wrap items-center justify-between w-full px-4 lg:px-8 py-3 gap-2">
            <div className="flex items-center gap-3 flex-shrink-0 ml-8 lg:ml-0">
                <h2 className="text-xl text-white whitespace-nowrap !font-['Higuen_Elegant_Serif'] max-lg:pl-3">{displayTitle}</h2>
                <SearchBar 
                    placeholder={searchPlaceholder} 
                    className={`hidden md:block border border-[#83E9FF33] rounded-xl shadow-sm ${searchWidth} transition-all hover:border-[#83E9FF66] focus-within:border-[#83E9FF]`}
                />
            </div>
            
            {/* Stats section - visible on all screen sizes */}
            {showFees && (
                <div className="flex items-center gap-2 lg:gap-3">
                    {/* HYPE Price Display */}
                    <div className={cn(
                        "bg-[#051728]/40 backdrop-blur-sm border rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all",
                        lastSide === "A" ? "border-red-500 animate-pulse" : 
                        lastSide === "B" ? "border-green-500 animate-pulse" : 
                        "border-[#83E9FF33] hover:border-[#83E9FF66]",
                        "group"
                    )}>
                        <div className="flex items-center gap-1.5">
                            <Image 
                                src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" 
                                alt="HYPE Logo" 
                                width={11} 
                                height={11}
                                className="text-[#83E9FF]" 
                            />
                            <span className="text-[#83E9FF99] text-[10px] font-medium">HYPE</span>
                        </div>
                        <div className={cn(
                            "text-white text-xs lg:text-sm font-medium transition-colors", 
                            lastSide === "A" ? "text-red-400" : 
                            lastSide === "B" ? "text-green-400" : 
                            "group-hover:text-[#83E9FF]"
                        )}>
                            {hypePriceLoading ? "Loading..." : formatPrice(hypePrice)}
                        </div>
                    </div>

                    {feesStats && !feesLoading && !feesError && (
                        <div className="flex gap-2 lg:gap-3">
                            <div className="bg-[#051728]/40 backdrop-blur-sm border border-[#83E9FF33] rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all hover:border-[#83E9FF66] group">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={11} className="text-[#83E9FF]" />
                                    <span className="text-[#83E9FF99] text-[10px] font-medium">Hourly fees</span>
                                </div>
                                <div className="text-white text-xs lg:text-sm font-medium group-hover:text-[#83E9FF] transition-colors">
                                    {formatFee(feesStats.hourlyFees)}
                                </div>
                            </div>
                            
                            <div className="bg-[#051728]/40 backdrop-blur-sm border border-[#83E9FF33] rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all hover:border-[#83E9FF66] group">
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays size={11} className="text-[#83E9FF]" />
                                    <span className="text-[#83E9FF99] text-[10px] font-medium">Daily fees</span>
                                </div>
                                <div className="text-white text-xs lg:text-sm font-medium group-hover:text-[#83E9FF] transition-colors">
                                    {formatFee(feesStats.dailyFees)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 