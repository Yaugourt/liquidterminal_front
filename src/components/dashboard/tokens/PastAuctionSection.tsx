"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { AuctionsTable } from "@/components/dashboard/vaultValidator/DataTablesContent";
import { useLatestAuctions } from "@/services/dashboard";

interface PastAuctionSectionProps {
  onHeightChange?: (height: number) => void;
}

export const PastAuctionSection = ({ onHeightChange }: PastAuctionSectionProps) => {
  const [activeSubTab, setActiveSubTab] = useState<"spot" | "perp">("spot");
  const containerRef = useRef<HTMLDivElement>(null);

  const subTabs: { key: "spot" | "perp"; label: string }[] = [
    { key: 'spot', label: 'Spot' },
    { key: 'perp', label: 'Perp' }
  ];

  // Fetch past auctions data
  const { auctions: usdcAuctions, isLoading: usdcLoading, error: usdcError } = useLatestAuctions(undefined, 'USDC');
  const { auctions: hypeAuctions, isLoading: hypeLoading, error: hypeError } = useLatestAuctions(undefined, 'HYPE');

  // Combine and sort auctions, limit to 5 most recent
  const allAuctions = [...(usdcAuctions || []), ...(hypeAuctions || [])]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const handleTabChange = (newTab: "spot" | "perp") => {
    setActiveSubTab(newTab);
  };

  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;

    const measureHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        onHeightChange(height);
      }
    };

    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(containerRef.current);

    setTimeout(measureHeight, 100);

    return () => resizeObserver.disconnect();
  }, [onHeightChange]);

  useEffect(() => {
    if (containerRef.current && onHeightChange) {
      setTimeout(() => {
        if (containerRef.current) {
          const height = containerRef.current.offsetHeight;
          onHeightChange(height);
        }
      }, 100);
    }
  }, [allAuctions, usdcLoading, hypeLoading, activeSubTab, onHeightChange]);

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                activeSubTab === tab.key
                  ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSubTab === "spot" && (
          <Link
            href="/market/spot/auction"
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-brand-accent transition-colors"
          >
            See All
            <ExternalLink size={10} />
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {activeSubTab === "spot" ? (
          <AuctionsTable
            auctions={allAuctions}
            isLoading={usdcLoading || hypeLoading}
            error={usdcError || hypeError}
            paginationDisabled={true}
            hidePageNavigation={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full border border-white/5 rounded-xl bg-white/[0.02]">
            <span className="text-white text-sm font-medium mb-1">Coming Soon</span>
            <span className="text-zinc-500 text-xs">Perp past auctions will be available soon</span>
          </div>
        )}
      </div>
    </div>
  );
};
