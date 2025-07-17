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

  // Simple tab change handler
  const handleTabChange = (newTab: "spot" | "perp") => {
    setActiveSubTab(newTab);
  };

  // Mesurer la hauteur TOTALE (sous-tabs + contenu)
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

    // Mesure initiale avec délai
    setTimeout(measureHeight, 100);

    return () => resizeObserver.disconnect();
  }, [onHeightChange]);

  // Remesurer quand les données ou le tab changent
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
      {/* Header avec sous-tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1 w-fit">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSubTab === "spot" && (
          <Link
            href="/market/spot/auction"
            className="flex items-center gap-1 px-3 py-1 text-sm text-[#f9e370] hover:text-white transition-colors"
          >
            See All
            <ExternalLink size={14} />
          </Link>
        )}
      </div>

      {/* Contenu de l'onglet actif */}
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
          <div className="flex flex-col items-center justify-center h-full bg-[#051728E5] border border-[#83E9FF4D] rounded-lg">
            <span className="text-white text-lg font-medium mb-2">Coming Soon</span>
            <span className="text-[#FFFFFF80] text-sm">Perp past auctions will be available soon</span>
          </div>
        )}
      </div>
    </div>
  );
}; 