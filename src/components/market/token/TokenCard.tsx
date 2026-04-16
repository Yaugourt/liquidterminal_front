"use client";

import { memo, useState } from "react";

import { TokenCardProps, TokenData } from "./types";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Copy } from "lucide-react";
import {
  useTokenWebSocket,
  marketIndexToCoinId,
  useTokenDetails,
} from "@/services/market/token";
import { useTokenAuction } from "@/services/market/auction/hooks/useAuctions";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const TokenCard = memo(function TokenCard({ token, className, perpCoinId }: TokenCardProps) {
  // Get user's number format preference
  const { format } = useNumberFormat();

  // Connect to WebSocket for real-time data
  // Use perpCoinId directly for perpetuals, or convert marketIndex for spot tokens
  const coinId = perpCoinId || (token.marketIndex !== undefined ? marketIndexToCoinId(token.marketIndex, token.name) : '');
  const { price: livePrice, lastSide } = useTokenWebSocket(coinId);

  // Expandable details panel (replaces the old right-side TokenInfoSidebar).
  // `hasBeenOpened` ensures we mount TokenDetailsPanel at most once per page
  // visit — subsequent toggles are pure CSS/motion, so the data hooks don't
  // refire and we don't spam the backend on every open/close.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  const toggleDetails = () => {
    setDetailsOpen((prev) => {
      const next = !prev;
      if (next) setHasBeenOpened(true);
      return next;
    });
  };

  const formatPriceValue = (value: number) => {
    return formatPrice(value, format);
  };

  const formatVolumeValue = (value: number) => {
    return formatNumber(value, format, { currency: '$', showCurrency: true, maximumFractionDigits: 0 });
  };

  const formatMarketCapValue = (value: number) => {
    return formatNumber(value, format, { currency: '$', showCurrency: true, maximumFractionDigits: 0 });
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatNumber(Math.abs(value), format, { maximumFractionDigits: 2 })}%`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card
      className={cn(
        "p-4 transition-[width,max-width] duration-300",
        detailsOpen ? "w-full" : "w-fit",
        className
      )}
    >
      <div className={cn(
        "flex flex-wrap items-center gap-6",
        detailsOpen ? "w-full" : "w-fit"
      )}>
        {/* Token Info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
            {token.logo ? (
              <Image
                src={token.logo}
                alt={token.symbol}
                width={24}
                height={24}
                className="w-full h-full object-cover"
                onError={() => {
                  // Fallback to gradient avatar if image fails to load
                  const imgElement = document.querySelector(`img[src="${token.logo}"]`) as HTMLImageElement;
                  if (imgElement) {
                    imgElement.style.display = 'none';
                    imgElement.nextElementSibling?.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div className={cn(
              "w-full h-full bg-gradient-to-br from-brand-accent to-[#4ADE80] flex items-center justify-center",
              token.logo ? "hidden" : ""
            )}>
              <span className="text-brand-tertiary text-xs font-bold">
                {token.symbol.split('/')[0].charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">{token.symbol}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-md text-xs font-medium",
              token.type === 'spot'
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}>
              {token.type === 'spot' ? 'Spot' : 'Perp'}
            </span>
          </div>
        </div>

        {/* Price Data */}
        <div className="flex flex-wrap gap-6">
          {/* Mark/Price */}
          <div className="flex flex-col">
            <span className="text-stat-label">
              {token.type === 'perpetual' ? 'Mark' : 'Price'}
            </span>
            <span className={cn(
              "text-white text-sm transition-colors",
              lastSide === "A" ? "text-red-400" :
                lastSide === "B" ? "text-green-400" :
                  "text-white"
            )}>
              {formatPriceValue(livePrice || token.mark || token.price || 0)}
            </span>
          </div>

          {/* Oracle (Perpetual only) */}
          {token.type === 'perpetual' && token.oracle && (
            <div className="flex flex-col">
              <span className="text-stat-label">Oracle</span>
              <span className="text-white text-sm font-medium">
                {formatPriceValue(token.oracle)}
              </span>
            </div>
          )}

          {/* 24h Change */}
          <div className="flex flex-col">
            <span className="text-stat-label">24h Change</span>
            <span className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-md w-fit",
              token.change24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              {formatPercentage(token.change24h)}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col">
            <span className="text-stat-label">24h Volume</span>
            <span className="text-white text-sm font-medium">
              {formatVolumeValue(token.volume24h)}
            </span>
          </div>

          {/* Market Cap (Spot) or Open Interest (Perpetual) */}
          {token.type === 'spot' && token.marketCap && (
            <div className="flex flex-col">
              <span className="text-stat-label">Market Cap</span>
              <span className="text-white text-sm font-medium">
                {formatMarketCapValue(token.marketCap)}
              </span>
            </div>
          )}

          {token.type === 'perpetual' && token.openInterest && (
            <div className="flex flex-col">
              <span className="text-stat-label">Open Interest</span>
              <span className="text-white text-sm font-medium">
                {formatVolumeValue(token.openInterest)}
              </span>
            </div>
          )}

          {/* Contract */}
          {token.contract && (
            <div className="flex flex-col">
              <span className="text-stat-label">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-brand-accent text-xs">
                  {truncateAddress(token.contract)}
                </span>
                <Copy
                  size={12}
                  className="text-brand-gold opacity-60 cursor-pointer hover:opacity-100 transition-all duration-200"
                  onClick={() => copyToClipboard(token.contract!)}
                />
              </div>
            </div>
          )}

          {/* Funding Rate / Countdown (Perpetual only) */}
          {token.type === 'perpetual' && (
            <div className="flex flex-col">
              <span className="text-stat-label">
                Funding / Countdown
              </span>
              <div className="flex flex-col">
                {token.fundingRate && (
                  <span className={cn(
                    "text-sm font-medium",
                    token.fundingRate >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {formatPercentage(token.fundingRate)}
                  </span>
                )}
                {token.countdown && (
                  <span className="text-white/80 text-xs">
                    {token.countdown}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Details toggle — opens supply / address / deploy info panel */}
        <button
          type="button"
          onClick={toggleDetails}
          aria-expanded={detailsOpen}
          aria-controls="token-details-panel"
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
            detailsOpen
              ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
              : "border-border-subtle bg-white/[0.02] text-text-secondary hover:text-white hover:border-border-hover"
          )}
        >
          <span>{detailsOpen ? "Hide details" : "Details"}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              detailsOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Expandable details panel (supply, addresses, deploy time).
          Mounted on first open and kept mounted after that — toggling
          between open/closed is pure height animation so the data hooks
          inside TokenDetailsPanel don't refire on every click. */}
      {hasBeenOpened && (
        <motion.div
          id="token-details-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={detailsOpen
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
          aria-hidden={!detailsOpen}
        >
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <TokenDetailsPanel token={token} />
          </div>
        </motion.div>
      )}
    </Card>

  );
});

// ────────────────────────────────────────────────────────────────────
// Details panel — supply, addresses and deploy time.
// Rendered only when the user opens the details section so that the
// underlying data hooks don't fire unnecessarily.
// ────────────────────────────────────────────────────────────────────
const formatSupply = (value: string, format: NumberFormatType) => {
  const num = parseFloat(value);
  if (!isFinite(num)) return "N/A";
  if (num >= 1e9) return `${formatNumber(num / 1e9, format, { maximumFractionDigits: 2 })}B`;
  if (num >= 1e6) return `${formatNumber(num / 1e6, format, { maximumFractionDigits: 2 })}M`;
  if (num >= 1e3) return `${formatNumber(num / 1e3, format, { maximumFractionDigits: 2 })}K`;
  return formatNumber(num, format, { maximumFractionDigits: 2 });
};

const truncateAddressLong = (address: string) => {
  if (!address || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

function TokenDetailsPanel({ token }: { token: TokenData }) {
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
          <span className="text-white text-xs">
            {tokenDetails?.deployTime
              ? new Date(tokenDetails.deployTime).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2">
      <span className="text-stat-label">{label}</span>
      <span className="text-white text-sm font-medium tabular-nums truncate">
        {value}
      </span>
    </div>
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
