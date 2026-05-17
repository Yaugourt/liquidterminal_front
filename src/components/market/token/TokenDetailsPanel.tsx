"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useTokenDetails } from "@/services/market/token";
import { useTokenAuction } from "@/services/market/auction/hooks/useAuctions";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { StatsCard } from "@/components/common";
import type { TokenData } from "./types";

/**
 * Details panel rendered below `TokenCard` when expanded.
 *
 * The parent (`TokenCard`) guards mounting with a `hasBeenOpened` flag so that
 * the data hooks below (`useTokenDetails`, `useTokenAuction`, `useTokenHolders`)
 * fire **once** per page visit. Toggling between open/closed is pure height
 * animation in the parent — do not move that guard here.
 */
export function TokenDetailsPanel({ token }: { token: TokenData }) {
  const { format } = useNumberFormat();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: tokenDetails, isLoading } = useTokenDetails(token.contract || null);
  const { auctionInfo, isLoading: isAuctionLoading } = useTokenAuction(tokenDetails?.name || null);
  const { holdersCount, isLoading: isHoldersLoading } = useTokenHolders(token.name);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silent fail; clipboard may be blocked
    }
  };

  const renderValue = (loading: boolean, value: string | null | undefined, fallback = "N/A") =>
    loading ? "Loading..." : (value ?? fallback);

  return (
    <div className="space-y-4">
      {/* Supply & counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <DetailStat
          label="Max supply"
          value={renderValue(isLoading, tokenDetails ? formatSupply(tokenDetails.maxSupply, format) : null)}
        />
        <DetailStat
          label="Total supply"
          value={renderValue(isLoading, tokenDetails ? formatSupply(tokenDetails.totalSupply, format) : null)}
        />
        <DetailStat
          label="Circulating"
          value={renderValue(isLoading, tokenDetails ? formatSupply(tokenDetails.circulatingSupply, format) : null)}
        />
        <DetailStat
          label="Deploy gas"
          value={renderValue(
            isAuctionLoading,
            auctionInfo
              ? `${formatNumber(parseFloat(auctionInfo.deployGas), format, { maximumFractionDigits: 2 })} ${auctionInfo.currency}`
              : null
          )}
        />
        <DetailStat
          label="Holders"
          value={
            isHoldersLoading
              ? "Loading..."
              : formatNumber(holdersCount, format, { maximumFractionDigits: 0 })
          }
        />
      </div>

      {/* Addresses & deploy time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border-subtle pt-4">
        <DetailAddress
          label="Deployer"
          address={tokenDetails?.deployer}
          isLoading={isLoading}
          copied={copied}
          onCopy={copy}
        />
        <DetailAddress
          label="Token address"
          address={token.contract}
          isLoading={false}
          copied={copied}
          onCopy={copy}
        />
        <div className="flex flex-col">
          <span className="text-stat-label mb-1">Deploy time</span>
          <span className="text-text-primary text-xs">
            {tokenDetails?.deployTime
              ? new Date(tokenDetails.deployTime).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatSupply(value: string, format: NumberFormatType) {
  const num = parseFloat(value);
  if (!isFinite(num)) return "N/A";
  if (num >= 1e9) return `${formatNumber(num / 1e9, format, { maximumFractionDigits: 2 })}B`;
  if (num >= 1e6) return `${formatNumber(num / 1e6, format, { maximumFractionDigits: 2 })}M`;
  if (num >= 1e3) return `${formatNumber(num / 1e3, format, { maximumFractionDigits: 2 })}K`;
  return formatNumber(num, format, { maximumFractionDigits: 2 });
}

function truncateAddressLong(address: string) {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <StatsCard
      title={label}
      value={value}
      density="compact"
      withCard={false}
      className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2"
      titleClassName="text-stat-label"
      valueClassName="text-text-primary text-sm font-medium tabular-nums truncate"
    />
  );
}

function DetailAddress({
  label,
  address,
  isLoading,
  copied,
  onCopy,
}: {
  label: string;
  address: string | undefined;
  isLoading: boolean;
  copied: string | null;
  onCopy: (v: string) => void;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-stat-label mb-1">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-brand-accent text-xs truncate flex-1 min-w-0 font-mono">
          {isLoading ? "Loading..." : address ? truncateAddressLong(address) : "N/A"}
        </span>
        {address && (
          <button
            onClick={() => onCopy(address)}
            className="group p-1 rounded transition-colors flex-shrink-0 hover:bg-white/5"
            aria-label={`Copy ${label}`}
          >
            {copied === address ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
