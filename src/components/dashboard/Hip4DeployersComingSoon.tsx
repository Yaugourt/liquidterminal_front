"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

/**
 * Hip4DeployersComingSoon — placeholder card slotted next to `Hip4OutcomesCard`
 * while the HIP-4 deployer leaderboard is being built. Pure presentational
 * (no data fetch); kept light so the dashboard stays snappy.
 */
export const Hip4DeployersComingSoon = memo(function Hip4DeployersComingSoon() {
  return (
    <Card className="overflow-hidden flex flex-col relative">
      {/* card-head — matches min-h with siblings for hairline alignment */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Sparkles size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          HIP-4 Deployers
        </h3>
        <motion.span
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/25"
        >
          Coming soon
        </motion.span>
      </div>

      {/* body — gradient halo + centred hero text */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-brand/[0.05] via-transparent to-gold/[0.04] pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-brand/[0.04] blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 text-center space-y-3"
        >
          <div className="mono text-[26px] font-bold text-text-primary tracking-[-0.02em] leading-none">
            HIP-4{" "}
            <span className="bg-gradient-to-r from-brand to-gold bg-clip-text text-transparent">
              Deployers
            </span>
          </div>
          <div className="text-[12px] text-text-tertiary max-w-[280px] mx-auto leading-relaxed">
            Prediction-market deployer leaderboard. Unlocks with the next
            Hyperliquid update.
          </div>

          {/* Hyperliquid wordmark — discreet, all-caps wide-tracked */}
          <div className="pt-5">
            <span className="text-[10px] font-semibold tracking-[0.4em] text-text-tertiary/60 uppercase">
              Hyperliquid
            </span>
          </div>
        </motion.div>
      </div>
    </Card>
  );
});
