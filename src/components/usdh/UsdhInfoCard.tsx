import { Card } from "@/components/ui/card";
import { Coins, ArrowRightLeft, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: ArrowRightLeft,
    label: "Smart routing",
    desc: "Auto-selects HyperCore (direct) or HyperEVM (bridge + swap) for the best path.",
  },
  {
    icon: Shield,
    label: "Fully reserved",
    desc: "1:1 backed — no fractional reserve, no yield dilution.",
  },
  {
    icon: Coins,
    label: "Revenue share",
    desc: "50% of swap fees route to the Hyperliquid Assistance Fund.",
  },
] as const;

export function UsdhInfoCard() {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-white">What is USDH?</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          USDH is Hyperliquid&apos;s native fully-reserved stablecoin, designed
          as the primary stable on HyperCore and HyperEVM.
        </p>
      </div>

      <div className="space-y-4">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border-subtle space-y-1.5">
        <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
          Powered by
        </p>
        <p className="text-xs text-text-secondary">
          <span className="text-white font-medium">usdh-kit</span> — open-source
          SDK for USDC → USDH swaps on Hyperliquid.
        </p>
      </div>
    </Card>
  );
}
