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

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        <div className="w-full lg:w-3/5">
          <UsdhSwapWidget />
        </div>
        <div className="w-full lg:w-2/5">
          <UsdhInfoCard />
        </div>
      </div>
    </>
  );
}
