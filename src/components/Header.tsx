"use client"

import { SearchBar } from "@/components/SearchBar"
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats"
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice"
import { useHypeBuyPressure } from "@/services/market/order/hooks/useHypeBuyPressure"
import { Clock, CalendarDays, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SettingsSelector } from "@/components/common/settings/SettingsSelector"
import { useNumberFormat } from "@/store/number-format.store"
import { formatNumber } from "@/lib/numberFormatting"

interface HeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
    showFees?: boolean;
}

export function Header({ 
    searchPlaceholder = "Search token, address, tx or block...",
    searchWidth = "w-[400px]",
    showFees = false
}: HeaderProps) {
    const { feesStats, isLoading: feesLoading, error: feesError } = useFeesStats();
    const { price: hypePrice, lastSide, isLoading: hypePriceLoading } = useHypePrice();
    const { buyPressure, isLoading: buyPressureLoading } = useHypeBuyPressure();
    const { format } = useNumberFormat();
    
    // Format numbers with up to 2 decimal places
    const formatFee = (value: number) => {
        return formatNumber(value, format, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            currency: '$',
            showCurrency: true
        });
    };

    // Format price with more decimal places for precision
    const formatPrice = (value: number | null) => {
        if (value === null) return '$0.00';
        return formatNumber(value, format, {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
            currency: '$',
            showCurrency: true
        });
    };

    // Format buy pressure with appropriate sign and color (integer only)
    const formatBuyPressure = (value: number) => {
        const isPositive = value >= 0;
        const formatted = formatNumber(Math.abs(value), format, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            currency: '$',
            showCurrency: true
        });
        return {
            value: formatted,
            isPositive,
            display: isPositive ? `+${formatted}` : `-${formatted}`
        };
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto">
            <div className="flex flex-wrap items-center justify-between w-full px-2 sm:px-4 lg:px-6 xl:px-12 py-3 gap-2">
                <div className="flex items-center gap-3 flex-shrink-0 ml-8 lg:ml-0">
                    {/* <h2 className="text-xl text-white whitespace-nowrap !font-['Higuen_Elegant_Serif'] max-lg:pl-3">{displayTitle}</h2> */}
                    <SearchBar 
                        placeholder={searchPlaceholder} 
                        className={`hidden lg:block border border-[#83E9FF33] rounded-xl shadow-sm ${searchWidth} transition-all hover:border-[#83E9FF66] focus-within:border-[#83E9FF]`}
                    />
                </div>
                
                <div className="flex items-center gap-4">
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
                                    <span className="text-[#FFFFFF] text-[10px] font-medium">HYPE</span>
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

                            {/* HYPE Buy Pressure Display */}
                            <div className={cn(
                                "bg-[#051728]/40 backdrop-blur-sm border rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all",
                                buyPressure > 0 ? "border-green-500/50 hover:border-green-500" : 
                                buyPressure < 0 ? "border-red-500/50 hover:border-red-500" : 
                                "border-[#83E9FF33] hover:border-[#83E9FF66]",
                                "group"
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={11} className={cn(
                                        buyPressure > 0 ? "text-green-400" : 
                                        buyPressure < 0 ? "text-red-400" : 
                                        "text-[#83E9FF]"
                                    )} />
                                    <span className="text-[#FFFFFF] text-[10px] font-medium">TWAPs HYPE buy</span>
                                </div>
                                <div className={cn(
                                    "text-xs lg:text-sm font-medium transition-colors",
                                    buyPressure > 0 ? "text-green-400" : 
                                    buyPressure < 0 ? "text-red-400" : 
                                    "text-white group-hover:text-[#83E9FF]"
                                )}>
                                    {buyPressureLoading ? "Loading..." : formatBuyPressure(buyPressure).display}
                                </div>
                            </div>

                            {feesStats && !feesLoading && !feesError && (
                                <div className="bg-[#051728]/40 backdrop-blur-sm border border-[#83E9FF33] rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all hover:border-[#83E9FF66] group">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={11} className="text-[#f9e370]" />
                                                <span className="text-[#FFFFFF] text-[10px] font-medium">Hourly fees</span>
                                            </div>
                                            <div className="text-white text-xs lg:text-sm font-medium group-hover:text-[#83E9FF] transition-colors">
                                                {formatFee(feesStats.hourlyFees)}
                                            </div>
                                        </div>
                                        
                                        <div className="w-px h-8 bg-[#83E9FF33]"></div>
                                        
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays size={11} className="text-[#f9e370]" />
                                                <span className="text-[#FFFFFF] text-[10px] font-medium">Daily fees</span>
                                            </div>
                                            <div className="text-white text-xs lg:text-sm font-medium group-hover:text-[#83E9FF] transition-colors">
                                                {formatFee(feesStats.dailyFees)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Settings Selector */}
                    <div className="flex items-center">
                        <SettingsSelector />
                    </div>
                </div>
            </div>
        </div>
    )
} 