"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { WalletConnectButton } from "./WalletConnectButton";

const USDHSwap = dynamic(
  () => import("@usdh-kit/widget").then((m) => ({ default: m.USDHSwap })),
  { ssr: false }
);

export function UsdhSwapWidget() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
          Wallet
        </p>
        <WalletConnectButton />
      </div>
      <div className="flex justify-center">
        <USDHSwap
          network="mainnet"
          theme="dark"
          hideAttribution={false}
          onSwapComplete={(result) => {
            console.log("Swap complete", result);
          }}
        />
      </div>
    </Card>
  );
}
