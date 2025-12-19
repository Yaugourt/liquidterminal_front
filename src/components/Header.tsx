"use client"

import { SearchBar } from "@/components/SearchBar"
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats"
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice"
import { useHypeBuyPressure } from "@/services/market/order/hooks/useHypeBuyPressure"
import { useAssistanceFund } from "@/services/market/assistanceFund/hooks/useAssistanceFund"
import { Clock, CalendarDays, TrendingUp, Shield, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SettingsSelector } from "@/components/common/settings/SettingsSelector"
import { useNumberFormat } from "@/store/number-format.store"
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting"

interface HeaderProps {
    searchPlaceholder?: string;
    searchWidth?: string;
    customTitle?: string;
    showFees?: boolean;
}

export function Header({
    searchPlaceholder = "Search token, address, tx or block...",
    searchWidth = "w-[350px]",
    showFees = false
}: HeaderProps) {
    const { feesStats, isLoading: feesLoading, error: feesError } = useFeesStats();
    const { price: hypePrice, lastSide, isLoading: hypePriceLoading } = useHypePrice();
    const { buyPressure, isLoading: buyPressureLoading } = useHypeBuyPressure();
    const { data: assistanceFund, isLoading: assistanceFundLoading, error: assistanceFundError } = useAssistanceFund();
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

    // Format HYPE balance without decimals
    const formatHypeBalance = (value: number) => {
        return formatNumber(value, format, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Format USD value with compact notation (K, M, B)
    const formatCompactUsd = (value: number) => {
        return formatLargeNumber(value, {
            prefix: '$',
            decimals: 1
        });
    };

    // Generate Twitter share URL
    const generateTwitterUrl = () => {
        if (!feesStats || !assistanceFund) return '#';

        const dailyFees = formatFee(feesStats.dailyFees);
        const hourlyFees = formatFee(feesStats.hourlyFees);
        const assistanceFundAmount = `${formatHypeBalance(assistanceFund.hypeBalance)} HYPE (${formatCompactUsd(assistanceFund.hypeValueUsd)})`;

        const tweetText = `Daily fees: ${dailyFees}
Hourly fees: ${hourlyFees}
Assistance fund: ${assistanceFundAmount}

Source: @Liquidterminal`;

        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto">
            <div className="flex flex-wrap items-center justify-between w-full px-2 sm:px-4 lg:px-6 xl:px-12 py-3 gap-2">
                <div className="flex items-center gap-3 flex-shrink-0 ml-8 lg:ml-0">
                    {/* <h2 className="text-xl text-white whitespace-nowrap !font-['Higuen_Elegant_Serif'] max-lg:pl-3">{displayTitle}</h2> */}
                    <SearchBar
                        placeholder={searchPlaceholder}
                        className={`hidden lg:block bg-brand-main/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-sm ${searchWidth} transition-all hover:border-white/20 focus-within:border-brand-accent`}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats section - visible on all screen sizes */}
                    {showFees && (
                        <div className="flex items-center gap-2 lg:gap-3">
                            {/* HYPE Price Display */}
                            <div className={cn(
                                "bg-[#151A25]/40 backdrop-blur-sm border rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all text-secondary",
                                lastSide === "A" ? "border-red-500 animate-pulse" :
                                    lastSide === "B" ? "border-green-500 animate-pulse" :
                                        "border-white/10 hover:border-white/20",
                                "group"
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <Image
                                        src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg"
                                        alt="HYPE Logo"
                                        width={11}
                                        height={11}
                                        className="text-brand-accent"
                                    />
                                    <span className="text-white text-[10px] font-medium">HYPE</span>
                                </div>
                                <div className={cn(
                                    "text-white text-xs lg:text-sm font-medium transition-colors",
                                    lastSide === "A" ? "text-red-400" :
                                        lastSide === "B" ? "text-green-400" :
                                            "group-hover:text-brand-accent"
                                )}>
                                    {hypePriceLoading ? "Loading..." : formatPrice(hypePrice)}
                                </div>
                            </div>

                            {/* HYPE Buy Pressure Display */}
                            <div className={cn(
                                "bg-[#151A25]/40 backdrop-blur-sm border rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all",
                                buyPressure > 0 ? "border-green-500/50 hover:border-green-500" :
                                    buyPressure < 0 ? "border-red-500/50 hover:border-red-500" :
                                        "border-white/10 hover:border-white/20",
                                "group"
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={11} className={cn(
                                        buyPressure > 0 ? "text-green-400" :
                                            buyPressure < 0 ? "text-red-400" :
                                                "text-brand-accent"
                                    )} />
                                    <span className="text-white text-[10px] font-medium">TWAPs HYPE buy</span>
                                </div>
                                <div className={cn(
                                    "text-xs lg:text-sm font-medium transition-colors",
                                    buyPressure > 0 ? "text-green-400" :
                                        buyPressure < 0 ? "text-red-400" :
                                            "text-white group-hover:text-brand-accent"
                                )}>
                                    {buyPressureLoading ? "Loading..." : formatBuyPressure(buyPressure).display}
                                </div>
                            </div>

                            {/* Combined Fees and Assistance Fund Display with Share Button - Desktop only */}
                            {feesStats && assistanceFund && !feesLoading && !feesError && !assistanceFundLoading && !assistanceFundError && (
                                <div className="hidden md:block bg-[#151A25]/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 transition-all hover:border-white/20 group relative">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={11} className="text-brand-gold" />
                                                <span className="text-white text-[10px] font-medium">Hourly fees</span>
                                            </div>
                                            <div className="text-white text-xs lg:text-sm font-medium group-hover:text-brand-accent transition-colors">
                                                {formatFee(feesStats.hourlyFees)}
                                            </div>
                                        </div>

                                        <div className="w-px h-8 bg-white/10"></div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays size={11} className="text-brand-gold" />
                                                <span className="text-white text-[10px] font-medium">Daily fees</span>
                                            </div>
                                            <div className="text-white text-xs lg:text-sm font-medium group-hover:text-brand-accent transition-colors">
                                                {formatFee(feesStats.dailyFees)}
                                            </div>
                                        </div>

                                        <div className="w-px h-8 bg-white/10"></div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <Shield size={11} className="text-brand-success" />
                                                <span className="text-white text-[10px] font-medium">Assistance Fund</span>
                                            </div>
                                            <div className="text-white text-xs lg:text-sm font-medium group-hover:text-brand-accent transition-colors">
                                                {formatHypeBalance(assistanceFund.hypeBalance)} HYPE ({formatCompactUsd(assistanceFund.hypeValueUsd)})
                                            </div>
                                        </div>

                                        <div className="w-px h-8 bg-white/10"></div>

                                        <a
                                            href={generateTwitterUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-8 h-8 rounded-md bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
                                            title="Share on Twitter"
                                        >
                                            <ArrowUpRight size={14} className="text-[#1DA1F2]" />
                                        </a>
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

                {/* Mobile Fees and Assistance Fund Display - Compact version below */}
                {showFees && feesStats && assistanceFund && !feesLoading && !feesError && !assistanceFundLoading && !assistanceFundError && (
                    <div className="md:hidden w-full px-2 sm:px-4 py-2">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            {/* Fees combined */}
                            <div className="bg-[#151A25]/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1.5 transition-all hover:border-white/20 group flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <Clock size={9} className="text-brand-gold" />
                                            <span className="text-white text-[9px] font-medium">1H</span>
                                        </div>
                                        <div className="text-white text-xs font-medium group-hover:text-brand-accent transition-colors">
                                            {formatFee(feesStats.hourlyFees)}
                                        </div>
                                    </div>
                                    <div className="w-px h-6 bg-white/10"></div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <CalendarDays size={9} className="text-brand-gold" />
                                            <span className="text-white text-[9px] font-medium">24H</span>
                                        </div>
                                        <div className="text-white text-xs font-medium group-hover:text-brand-accent transition-colors">
                                            {formatFee(feesStats.dailyFees)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assistance Fund */}
                            <div className="bg-[#151A25]/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1.5 transition-all hover:border-white/20 group flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    <Shield size={9} className="text-brand-success" />
                                    <span className="text-white text-[9px] font-medium">Fund</span>
                                </div>
                                <div className="text-white text-xs font-medium group-hover:text-brand-accent transition-colors">
                                    {formatCompactUsd(assistanceFund.hypeValueUsd)}
                                </div>
                            </div>

                            {/* Share Button */}
                            <a
                                href={generateTwitterUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors flex-shrink-0"
                                title="Share on Twitter"
                            >
                                <ArrowUpRight size={12} className="text-[#1DA1F2]" />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 