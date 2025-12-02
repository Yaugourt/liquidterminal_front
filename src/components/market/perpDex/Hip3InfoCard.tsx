"use client";

import { memo } from "react";
import { Info, Shield, Coins, Scale } from "lucide-react";

/**
 * Card explaining HIP-3 basics
 */
export const Hip3InfoCard = memo(function Hip3InfoCard() {
  return (
    <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
            <Info size={16} className="text-[#83e9ff]" />
          </div>
          <h3 className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">About HIP-3</h3>
        </div>
      </div>

      {/* Info content */}
      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="h-3 w-3 text-[#83e9ff]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Permissionless Perps</p>
            <p className="text-zinc-500 text-xs">
              Builders can deploy their own perpetual markets
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Coins className="h-3 w-3 text-[#83e9ff]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">500k HYPE Stake</p>
            <p className="text-zinc-500 text-xs">
              Required stake to deploy a perp dex
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#83e9ff]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="h-3 w-3 text-[#83e9ff]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">50% Fee Share</p>
            <p className="text-zinc-500 text-xs">
              Deployers receive 50% of trading fees
            </p>
          </div>
        </div>
      </div>

      {/* Link */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <a 
          href="https://hyperliquid.gitbook.io/hyperliquid-docs/technical-docs/hips/hip-3" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#83E9FF] text-xs hover:text-white transition-colors flex items-center gap-1"
        >
          Read full HIP-3 documentation →
        </a>
      </div>
    </div>
  );
});

