import { UsdhSwapWidget } from "@/components/usdh/UsdhSwapWidget";
import { UsdhInfoCard } from "@/components/usdh/UsdhInfoCard";
import { WalletConnectButton } from "@/components/usdh/WalletConnectButton";

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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Widget column — natural 480px width */}
        <div className="shrink-0 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Wallet
            </span>
            <WalletConnectButton />
          </div>
          <UsdhSwapWidget />
        </div>

        {/* Info column — fills remaining space */}
        <div className="flex-1 min-w-0">
          <UsdhInfoCard />
        </div>
      </div>
    </>
  );
}
