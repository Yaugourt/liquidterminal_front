"use client";

import { memo, useState } from "react";

import { TokenCardProps } from "./types";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import { ChevronDown, Copy } from "lucide-react";
import {
  useTokenWebSocket,
  marketIndexToCoinId,
} from "@/services/market/token";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TokenDetailsPanel } from "./TokenDetailsPanel";

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
              "w-full h-full bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center",
              token.logo ? "hidden" : ""
            )}>
              <span className="text-brand-text-on text-xs font-bold">
                {token.symbol.split('/')[0].charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-medium">{token.symbol}</span>
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
              "text-text-primary text-sm transition-colors",
              lastSide === "A" ? "text-red-400" :
                lastSide === "B" ? "text-green-400" :
                  "text-text-primary"
            )}>
              {formatPriceValue(livePrice || token.mark || token.price || 0)}
            </span>
          </div>

          {/* Oracle (Perpetual only) */}
          {token.type === 'perpetual' && token.oracle && (
            <div className="flex flex-col">
              <span className="text-stat-label">Oracle</span>
              <span className="text-text-primary text-sm font-medium">
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
            <span className="text-text-primary text-sm font-medium">
              {formatVolumeValue(token.volume24h)}
            </span>
          </div>

          {/* Market Cap (Spot) or Open Interest (Perpetual) */}
          {token.type === 'spot' && token.marketCap && (
            <div className="flex flex-col">
              <span className="text-stat-label">Market Cap</span>
              <span className="text-text-primary text-sm font-medium">
                {formatMarketCapValue(token.marketCap)}
              </span>
            </div>
          )}

          {token.type === 'perpetual' && token.openInterest && (
            <div className="flex flex-col">
              <span className="text-stat-label">Open Interest</span>
              <span className="text-text-primary text-sm font-medium">
                {formatVolumeValue(token.openInterest)}
              </span>
            </div>
          )}

          {/* Contract */}
          {token.contract && (
            <div className="flex flex-col">
              <span className="text-stat-label">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-brand text-xs">
                  {truncateAddress(token.contract)}
                </span>
                <Copy
                  size={12}
                  className="text-gold opacity-60 cursor-pointer hover:opacity-100 transition-all duration-200"
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
                  <span className="text-text-secondary text-xs">
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
              ? "border-brand/40 bg-brand/10 text-brand"
              : "border-border-subtle bg-white/[0.02] text-text-secondary hover:text-text-primary hover:border-border-default"
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

