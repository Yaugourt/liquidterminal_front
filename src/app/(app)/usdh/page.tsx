import { UsdhSwapWidget } from "@/components/usdh/UsdhSwapWidget";
import { UsdhInfoCard } from "@/components/usdh/UsdhInfoCard";

export default function UsdhPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          USDH Swap
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Swap USDC into USDH — Hyperliquid&apos;s native stablecoin. Routes
          automatically between HyperCore (direct) and HyperEVM (bridge + swap).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start max-w-5xl">
        <UsdhSwapWidget />
        <UsdhInfoCard />
      </div>
    </>
  );
}
