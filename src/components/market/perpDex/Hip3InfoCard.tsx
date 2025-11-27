"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Info, Shield, Coins, Scale } from "lucide-react";

/**
 * Card explaining HIP-3 basics
 */
export const Hip3InfoCard = memo(function Hip3InfoCard() {
  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Info size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">ABOUT HIP-3</h3>
        </div>
      </div>

      {/* Info content */}
      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-2.5">
          <Shield className="h-3.5 w-3.5 text-[#f9e370] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Permissionless Perps</p>
            <p className="text-[#FFFFFF80] text-xs">
              Builders can deploy their own perpetual markets
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Coins className="h-3.5 w-3.5 text-[#f9e370] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">500k HYPE Stake</p>
            <p className="text-[#FFFFFF80] text-xs">
              Required stake to deploy a perp dex
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Scale className="h-3.5 w-3.5 text-[#f9e370] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">50% Fee Share</p>
            <p className="text-[#FFFFFF80] text-xs">
              Deployers receive 50% of trading fees
            </p>
          </div>
        </div>
      </div>

      {/* Link */}
      <div className="mt-4 pt-3 border-t border-[#83E9FF1A]">
        <a 
          href="https://hyperliquid.gitbook.io/hyperliquid-docs/technical-docs/hips/hip-3" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#83E9FF] text-xs hover:text-[#83E9FF] hover:underline flex items-center gap-1"
        >
          Read full HIP-3 documentation →
        </a>
      </div>
    </Card>
  );
});

