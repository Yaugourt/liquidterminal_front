import { memo } from "react";
import { Info, Shield, Coins, Scale } from "lucide-react";

/**
 * Card explaining HIP-3 basics
 */
export const Hip3InfoCard = memo(function Hip3InfoCard() {
  return (
    <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center">
            <Info size={16} className="text-brand-accent" />
          </div>
          <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">About HIP-3</h3>
        </div>
      </div>

      {/* Info content */}
      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="h-3 w-3 text-brand-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Permissionless Perps</p>
            <p className="text-text-muted text-xs">
              Builders can deploy their own perpetual markets
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Coins className="h-3 w-3 text-brand-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">500k HYPE Stake</p>
            <p className="text-text-muted text-xs">
              Required stake to deploy a perp dex
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="h-3 w-3 text-brand-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">50% Fee Share</p>
            <p className="text-text-muted text-xs">
              Deployers receive 50% of trading fees
            </p>
          </div>
        </div>
      </div>

      {/* Link */}
      <div className="mt-4 pt-3 border-t border-border-subtle">
        <a
          href="https://hyperliquid.gitbook.io/hyperliquid-docs/technical-docs/hips/hip-3"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-accent text-xs hover:text-white transition-colors flex items-center gap-1"
        >
          Read full HIP-3 documentation →
        </a>
      </div>
    </div>
  );
});

