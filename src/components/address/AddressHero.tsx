"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalAliases } from "@/services/explorer";
import { useWallets } from "@/store/use-wallets";
import { AddToTrackListButton } from "@/components/market/tracker/AddToTrackListButton";
import { Card } from "@/components/ui/card";

interface AddressHeroProps {
  address: string;
  /** External explorer URL (defaults to HyperLiquid address explorer). */
  externalUrl?: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 18) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

/** Compute a stable gradient from the address bytes (deterministic, no deps). */
function useAddressGradient(address: string): string {
  return useMemo(() => {
    const normalized = address.toLowerCase().replace(/^0x/, "");
    const h1 = parseInt(normalized.slice(0, 6) || "0", 16) % 360;
    const h2 = (h1 + 40 + (parseInt(normalized.slice(6, 12) || "0", 16) % 80)) % 360;
    return `linear-gradient(135deg, hsl(${h1} 80% 55% / 0.35) 0%, hsl(${h2} 80% 45% / 0.25) 100%)`;
  }, [address]);
}

export function AddressHero({ address, externalUrl }: AddressHeroProps) {
  const [copied, setCopied] = useState(false);
  const { getAlias, isLoading: aliasLoading } = useGlobalAliases();
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const alias = getAlias(address);
  const gradient = useAddressGradient(address);

  const isTracked = useMemo(() => {
    if (!authenticated || !wallets) return false;
    return wallets.some(
      (w) => w.address.toLowerCase() === address.toLowerCase()
    );
  }, [authenticated, wallets, address]);

  const explorerHref =
    externalUrl ?? `https://app.hyperliquid.xyz/explorer/address/${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  return (
    <section className="relative mb-6">
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/4 h-32 w-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-1/4 h-24 w-1/3 rounded-full bg-gold/5 blur-3xl"
      />

      <Card className="relative p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand/20 shadow-inner shadow-black/30"
              style={{ background: gradient }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                {address.slice(2, 4)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Address
                </span>
                {aliasLoading ? (
                  <div className="h-4 w-20 animate-pulse rounded-md bg-brand/20" />
                ) : alias ? (
                  <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                    {alias}
                  </span>
                ) : null}
                {isTracked && (
                  <span className="flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <Check size={10} />
                    Tracked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <code className="hidden truncate text-base font-medium tabular-nums text-brand sm:block">
                  {address}
                </code>
                <code className="truncate text-sm font-medium tabular-nums text-brand sm:hidden">
                  {truncateAddress(address)}
                </code>

                <TooltipProvider delayDuration={0}>
                  <Tooltip open={copied}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="group rounded-lg p-1.5 transition-all hover:bg-white/5"
                        aria-label="Copy address"
                      >
                        {copied ? (
                          <Check
                            size={15}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Copy
                            size={15}
                            className="text-gold opacity-60 transition-opacity group-hover:opacity-100"
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-surface border border-brand text-text-primary">
                      <p className="px-1 text-xs font-medium">Copied</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg p-1.5 transition-all hover:bg-white/5"
                  aria-label="Open in explorer"
                >
                  <ExternalLink
                    size={15}
                    className="text-text-tertiary opacity-80 transition-colors group-hover:text-brand"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <AddToTrackListButton address={address} />
          </div>
        </div>
      </Card>
    </section>
  );
}
