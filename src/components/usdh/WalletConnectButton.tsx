"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

const EVM_EXCLUDED = ["phantom", "solana", "backpack"];

function isEvmConnector(name: string, id: string): boolean {
  const lower = (name + id).toLowerCase();
  return !EVM_EXCLUDED.some((kw) => lower.includes(kw));
}

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const evmConnectors = connectors.filter((c) =>
    isEvmConnector(c.name, c.id ?? "")
  );

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-text-secondary bg-white/5 border border-border-subtle rounded-lg px-3 py-1.5">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => disconnect()}
          className="text-text-secondary hover:text-text-primary"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {evmConnectors.map((connector) => (
        <Button
          key={connector.id}
          size="sm"
          onClick={() => connect({ connector })}
          className="bg-brand/10 text-brand border border-brand/30 hover:bg-brand/20"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
