"use client";

import { memo } from "react";

import { TokenCardProps } from "./types";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Copy } from "lucide-react";
import { useTokenWebSocket, marketIndexToCoinId } from "@/services/market/token";
import Image from "next/image";

export const TokenCard = memo(function TokenCard({ token, className, perpCoinId }: TokenCardProps) {
  // Get user's number format preference
  const { format } = useNumberFormat();

  // Connect to WebSocket for real-time data
  // Use perpCoinId directly for perpetuals, or convert marketIndex for spot tokens
  const coinId = perpCoinId || (token.marketIndex !== undefined ? marketIndexToCoinId(token.marketIndex, token.name) : '');
  const { price: livePrice, lastSide } = useTokenWebSocket(coinId);

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
    <GlassPanel className={cn(
      "w-fit p-4 hover:border-border-hover transition-all",
      className
    )}>
      <div className="flex flex-wrap items-center gap-6 w-fit">
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
            <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
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
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Oracle</span>
              <span className="text-white text-sm font-medium">
                {formatPriceValue(token.oracle)}
              </span>
            </div>
          )}

          {/* 24h Change */}
          <div className="flex flex-col">
            <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">24h Change</span>
            <span className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-md w-fit",
              token.change24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              {formatPercentage(token.change24h)}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col">
            <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">24h Volume</span>
            <span className="text-white text-sm font-medium">
              {formatVolumeValue(token.volume24h)}
            </span>
          </div>

          {/* Market Cap (Spot) or Open Interest (Perpetual) */}
          {token.type === 'spot' && token.marketCap && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Market Cap</span>
              <span className="text-white text-sm font-medium">
                {formatMarketCapValue(token.marketCap)}
              </span>
            </div>
          )}

          {token.type === 'perpetual' && token.openInterest && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Open Interest</span>
              <span className="text-white text-sm font-medium">
                {formatVolumeValue(token.openInterest)}
              </span>
            </div>
          )}

          {/* Contract */}
          {token.contract && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-brand-accent text-xs font-mono">
                  {truncateAddress(token.contract)}
                </span>
                <Copy
                  size={12}
                  className="text-text-muted cursor-pointer hover:text-white transition-colors"
                  onClick={() => copyToClipboard(token.contract!)}
                />
              </div>
            </div>
          )}

          {/* Funding Rate / Countdown (Perpetual only) */}
          {token.type === 'perpetual' && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
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
      </div>
    </GlassPanel>

  );
});
