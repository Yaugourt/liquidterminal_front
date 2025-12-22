"use client";

import { ReactNode } from "react";

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
    tokenInfoSlot,
    chartSlot,
    orderBookSlot,
    infoSidebarSlot,
    bottomSectionSlot
}: TradingLayoutProps) {
    return (
        <>
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
        </>
    );
}
