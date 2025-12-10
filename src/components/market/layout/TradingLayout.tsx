"use client";

import { useState, ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface TradingLayoutProps {
    marketType: 'spot' | 'perp';
    tokenName: string;
    tokenInfoSlot: ReactNode;
    chartSlot: ReactNode;
    orderBookSlot: ReactNode;
    infoSidebarSlot: ReactNode;
    bottomSectionSlot: ReactNode;
}

export function TradingLayout({
    marketType,
    tokenName,
    tokenInfoSlot,
    chartSlot,
    orderBookSlot,
    infoSidebarSlot,
    bottomSectionSlot
}: TradingLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pageTitle = `${tokenName} - Market ${marketType === 'perp' ? 'Perpetual' : 'Spot'}`;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Navigation Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                    <Header customTitle={pageTitle} showFees={true} />
                </div>

                <div className="p-2 lg:hidden">
                    <SearchBar placeholder="Search tokens..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                    {/* Token Overview Card */}
                    {tokenInfoSlot}

                    {/* Trading Interface Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-stretch">
                        {/* Chart Section (Main) */}
                        <div className="xl:col-span-7 flex flex-col">
                            {chartSlot}
                        </div>

                        {/* Order Book Section */}
                        <div className="xl:col-span-3">
                            {orderBookSlot}
                        </div>

                        {/* Info Sidebar Section (Right) */}
                        <div className="xl:col-span-2">
                            {infoSidebarSlot}
                        </div>
                    </div>

                    {/* Bottom Section (Tables/History) */}
                    <div className="w-full">
                        {bottomSectionSlot}
                    </div>
                </main>
            </div>
        </div>
    );
}
