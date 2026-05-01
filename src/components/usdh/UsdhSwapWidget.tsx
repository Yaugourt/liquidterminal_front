"use client";

import dynamic from "next/dynamic";

const USDHSwap = dynamic(
  () => import("@usdh-kit/widget").then((m) => ({ default: m.USDHSwap })),
  { ssr: false }
);

export function UsdhSwapWidget() {
  return (
    <USDHSwap
      network="mainnet"
      theme="dark"
      hideAttribution={false}
      onSwapComplete={(result) => {
        console.log("Swap complete", result);
      }}
    />
  );
}
