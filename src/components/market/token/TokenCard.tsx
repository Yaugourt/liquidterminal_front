"use client";

import { Card } from "@/components/ui/card";
import { TokenCardProps } from "./types";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useTokenWebSocket, marketIndexToCoinId } from "@/services/market/token";
import Image from "next/image";

export function TokenCard({ token, className }: TokenCardProps) {
  // Get user's number format preference
  const { format } = useNumberFormat();
  
  // Connect to WebSocket for real-time data if marketIndex is available
  const coinId = token.marketIndex !== undefined ? marketIndexToCoinId(token.marketIndex, token.name) : '';
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
    <Card className={cn(
      "w-fit p-3 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]",
      className
    )}>
      <div className="flex flex-wrap items-center gap-8 w-fit">
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
              "w-full h-full bg-gradient-to-br from-[#83E9FF] to-[#4ADE80] flex items-center justify-center",
              token.logo ? "hidden" : ""
            )}>
              <span className="text-[#051728] text-xs font-bold">
                {token.symbol.split('/')[0].charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{token.symbol}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-xs ",
              token.type === 'spot' 
                ? "bg-[#1E4620] text-[#4ADE80]" 
                : "bg-[#4A1E20] text-[#F87171]"
            )}>
              {token.type === 'spot' ? 'Spot' : 'Perp'}
            </span>
          </div>
        </div>

        {/* Price Data */}
        <div className="flex flex-wrap gap-6 lg:gap-8">
          {/* Mark/Price */}
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase tracking-wide">
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
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Oracle</span>
              <span className="text-white text-sm">
                {formatPriceValue(token.oracle)}
              </span>
            </div>
          )}

          {/* 24h Change */}
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase tracking-wide">24h Change</span>
            <span className={cn(
              "text-sm",
              token.change24h >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"
            )}>
              {formatPercentage(token.change24h)}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase tracking-wide">24h Volume</span>
            <span className="text-white text-sm">
              {formatVolumeValue(token.volume24h)}
            </span>
          </div>

          {/* Market Cap (Spot) or Open Interest (Perpetual) */}
          {token.type === 'spot' && token.marketCap && (
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Market Cap</span>
              <span className="text-white text-sm">
                {formatMarketCapValue(token.marketCap)}
              </span>
            </div>
          )}

          {token.type === 'perpetual' && token.openInterest && (
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Open Interest</span>
              <span className="text-white text-sm">
                {formatVolumeValue(token.openInterest)}
              </span>
            </div>
          )}

          {/* Contract */}
          {token.contract && (
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-[#83E9FF] text-sm font-medium">
                  {truncateAddress(token.contract)}
                </span>
                <Copy 
                  size={14} 
                  className="text-[#83E9FF] cursor-pointer hover:text-white transition-colors"
                  onClick={() => copyToClipboard(token.contract!)}
                />
              </div>
            </div>
          )}

          {/* Funding Rate / Countdown (Perpetual only) */}
          {token.type === 'perpetual' && (
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Funding / Countdown
              </span>
              <div className="flex flex-col">
                {token.fundingRate && (
                  <span className={cn(
                    "text-sm font-medium",
                    token.fundingRate >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"
                  )}>
                    {formatPercentage(token.fundingRate)}
                  </span>
                )}
                {token.countdown && (
                  <span className="text-gray-300 text-xs">
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
}
