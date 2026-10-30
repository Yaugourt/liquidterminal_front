"use client";

import { memo } from "react";

import { TokenCardProps } from "./types";
import { formatNumber, formatPrice, truncateAddress } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import {
  useTokenLivePrice,
  useTokenAssetCtx,
  marketIndexToCoinId,
} from "@/services/market/token";
import { Card } from "@/components/ui/card";
import { TokenAvatar, DataStatus } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";

export const TokenCard = memo(function TokenCard({ token, className, perpCoinId }: TokenCardProps) {
  // Get user's number format preference
  const { format } = useNumberFormat();

  // Connect to WebSocket for real-time data
  // Use perpCoinId directly for perpetuals, or convert marketIndex for spot tokens
  const coinId = perpCoinId || (token.marketIndex !== undefined ? marketIndexToCoinId(token.marketIndex, token.name) : '');
  // Price/orderbook/trades are WebSocket-pushed. The hook surfaces the socket
  // state as `isLoading` (== !isConnected); invert it for the live cue.
  const { price: livePrice, lastSide, isLoading: wsLoading } = useTokenLivePrice(coinId);
  // 24h stats pushed ~1/s on the same socket. The REST row stays the first
  // paint and the fallback while the socket is down or silent.
  const assetCtx = useTokenAssetCtx(coinId);

  const isPerp = token.type === 'perpetual';
  const oracle = (isPerp ? assetCtx?.oraclePx : null) ?? token.oracle;
  const premium = (isPerp ? assetCtx?.premium : null) ?? token.premium;
  const fundingRate = (isPerp ? assetCtx?.funding : null) ?? token.fundingRate;
  // Same as the REST row: percent of the previous-day price off the mark
  // (change24h is already x100), and OI in USD (the context carries coins).
  const change24h =
    assetCtx && assetCtx.prevDayPx > 0
      ? (assetCtx.markPx / assetCtx.prevDayPx - 1) * 100
      : token.change24h;
  const volume24h = assetCtx?.dayNtlVlm ?? token.volume24h;
  const openInterest =
    isPerp && assetCtx?.openInterest != null
      ? assetCtx.openInterest * assetCtx.markPx
      : token.openInterest;

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
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatNumber(Math.abs(value), format, { maximumFractionDigits: 2 })}%`;
  };

  // `value` is HL's hourly funding as a fraction (0.0000125 = 0.00125%):
  // ×100, and 4 decimals so it doesn't flatten to 0.00%.
  const formatFundingRate = (value: number) => {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatNumber(Math.abs(value) * 100, format, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })}%`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className={cn("p-4 w-fit", className)}>
      <div className="flex flex-wrap items-center gap-6 w-fit">
        {/* Token Info */}
        <div className="flex items-center gap-2">
          <TokenAvatar
            assetName={token.symbol.split("/")[0]}
            kind={token.type === "spot" ? "spot" : "auto"}
            size="lg"
          />
          <div className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-medium">{token.symbol}</span>
            <StatusBadge variant="neutral">
              {token.type === 'spot' ? 'Spot' : 'Perp'}
            </StatusBadge>
            <DataStatus variant="live" connected={!wsLoading} className="ml-1" />
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
              "mono text-text-primary text-sm transition-colors",
              lastSide === "A" ? "text-danger" :
                lastSide === "B" ? "text-success" :
                  "text-text-primary"
            )}>
              {formatPriceValue(livePrice || token.mark || token.price || 0)}
            </span>
          </div>

          {/* Oracle (Perpetual only) */}
          {token.type === 'perpetual' && oracle && (
            <div className="flex flex-col">
              <span className="text-stat-label">Oracle</span>
              <span className="mono text-text-primary text-sm font-medium">
                {formatPriceValue(oracle)}
              </span>
            </div>
          )}

          {/* Premium (Perpetual only): mark vs oracle, signed */}
          {token.type === 'perpetual' && premium != null && (
            <div className="flex flex-col">
              <span className="text-stat-label">Premium</span>
              <span className={cn(
                "mono text-sm font-medium",
                premium >= 0 ? "text-success" : "text-danger"
              )}>
                {`${premium >= 0 ? '+' : ''}${(premium * 100).toFixed(4)}%`}
              </span>
            </div>
          )}

          {/* 24h Change: "N/A" when the stat is not available (no fake 0%) */}
          <div className="flex flex-col">
            <span className="text-stat-label">24h Change</span>
            {change24h != null ? (
              <span className={cn(
                "mono text-sm font-medium",
                change24h >= 0 ? "text-success" : "text-danger"
              )}>
                {formatPercentage(change24h)}
              </span>
            ) : (
              <span className="text-text-tertiary text-sm font-medium">N/A</span>
            )}
          </div>

          {/* 24h Volume: "N/A" when the stat is not available (no fake $0) */}
          <div className="flex flex-col">
            <span className="text-stat-label">24h Volume</span>
            <span className="mono text-text-primary text-sm font-medium">
              {volume24h != null ? formatVolumeValue(volume24h) : (
                <span className="text-text-tertiary">N/A</span>
              )}
            </span>
          </div>

          {/* Market Cap (Spot) or Open Interest (Perpetual) */}
          {token.type === 'spot' && token.marketCap && (
            <div className="flex flex-col">
              <span className="text-stat-label">Market Cap</span>
              <span className="mono text-text-primary text-sm font-medium">
                {formatMarketCapValue(token.marketCap)}
              </span>
            </div>
          )}

          {token.type === 'perpetual' && openInterest && (
            <div className="flex flex-col">
              <span className="text-stat-label">Open Interest</span>
              <span className="mono text-text-primary text-sm font-medium">
                {formatVolumeValue(openInterest)}
              </span>
            </div>
          )}

          {/* Contract */}
          {token.contract && (
            <div className="flex flex-col">
              <span className="text-stat-label">Contract</span>
              <div className="flex items-center gap-2">
                <span className="mono text-brand text-xs">
                  {truncateAddress(token.contract)}
                </span>
                <Copy
                  size={12}
                  className="text-text-tertiary cursor-pointer hover:text-text-primary transition-colors"
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
                {fundingRate != null ? (
                  <span className={cn(
                    "mono text-sm font-medium",
                    fundingRate >= 0 ? "text-success" : "text-danger"
                  )}>
                    {formatFundingRate(fundingRate)}
                  </span>
                ) : (
                  <span className="text-text-tertiary text-sm font-medium">N/A</span>
                )}
                {token.countdown && (
                  <span className="mono text-text-secondary text-xs">
                    {token.countdown}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </Card>
  );
});

