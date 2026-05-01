"use client";

import dynamic from "next/dynamic";
import { WalletConnectButton } from "./WalletConnectButton";

const USDHSwap = dynamic(
  () => import("@usdh-kit/widget").then((m) => ({ default: m.USDHSwap })),
  { ssr: false }
);

export function UsdhSwapWidget() {
  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
          Wallet
        </p>
        <WalletConnectButton />
      </div>
      {/* [&_.usdh-widget]:w-full forces the widget to fill the column */}
      <div className="[&_.usdh-widget]:w-full [&_.usdh-widget]:max-w-none">
        <USDHSwap
          network="mainnet"
          theme="dark"
          hideAttribution={false}
          onSwapComplete={(result) => {
            console.log("Swap complete", result);
          }}
        />
      </div>
    </div>
  );
}
