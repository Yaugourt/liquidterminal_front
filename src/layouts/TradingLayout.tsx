"use client";

import { ReactNode } from "react";

interface TradingLayoutProps {
    marketType: 'spot' | 'perp';
    tokenName: string;
    tokenInfoSlot: ReactNode;
    chartSlot: ReactNode;
    orderBookSlot: ReactNode;
    /**
     * Optional right-side info panel. When omitted, chart + orderbook expand
     * to fill the row (the token details now live inside the top TokenCard
     * as a collapsible panel).
     */
    infoSidebarSlot?: ReactNode;
    bottomSectionSlot: ReactNode;
}

export function TradingLayout({
    tokenInfoSlot,
    chartSlot,
    orderBookSlot,
    infoSidebarSlot,
    bottomSectionSlot
}: TradingLayoutProps) {
    const hasSidebar = Boolean(infoSidebarSlot);

    return (
        <>
            {/* Token Overview Card */}
            {tokenInfoSlot}

            {/* Trading Interface Layout */}
            <div
                className={
                    hasSidebar
                        ? "grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-stretch"
                        : "grid grid-cols-1 xl:grid-cols-10 gap-4 xl:items-stretch"
                }
            >
                {/* Chart Section (Main) */}
                <div className="xl:col-span-7 flex flex-col">
                    {chartSlot}
                </div>

                {/* Order Book Section */}
                <div className="xl:col-span-3">
                    {orderBookSlot}
                </div>

                {/* Info Sidebar Section (Right) — optional */}
                {hasSidebar && (
                    <div className="xl:col-span-2">
                        {infoSidebarSlot}
                    </div>
                )}
            </div>

            {/* Bottom Section (Tables/History) */}
            <div className="w-full">
                {bottomSectionSlot}
            </div>
        </>
    );
}
