"use client";

import { useTokenDetails } from "@/services/market/token";
import { useTokenAuction } from "@/services/market/auction/hooks/useAuctions";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { TokenData } from "./types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";

interface TokenInfoSidebarProps {
  token: TokenData;
  className?: string;
}

import { NumberFormatType } from "@/store/number-format.store";

// Helper function to format large numbers with user's preferred format
const formatSupply = (value: string, format: NumberFormatType) => {
  const num = parseFloat(value);
  if (num >= 1e9) return `${formatNumber(num / 1e9, format, { maximumFractionDigits: 2 })}B`;
  if (num >= 1e6) return `${formatNumber(num / 1e6, format, { maximumFractionDigits: 2 })}M`;
  if (num >= 1e3) return `${formatNumber(num / 1e3, format, { maximumFractionDigits: 2 })}K`;
  return formatNumber(num, format, { maximumFractionDigits: 2 });
};

// Helper function to truncate address with dots in the middle
const truncateAddress = (address: string) => {
  if (!address || address.length <= 20) return address;
  return `${address.slice(0, 16)}...${address.slice(-8)}`;
};

export function TokenInfoSidebar({ token, className }: TokenInfoSidebarProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get user's number format preference
  const { format } = useNumberFormat();

  // Get token details using the contract address (tokenId)
  const { data: tokenDetails, isLoading } = useTokenDetails(token.contract || null);

  // Get auction info using token name from tokenDetails
  const { auctionInfo, isLoading: isAuctionLoading } = useTokenAuction(tokenDetails?.name || null);

  // Get holders info
  const { holdersCount, isLoading: isHoldersLoading } = useTokenHolders(token.name);

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  return (
    <GlassPanel className={`flex flex-col h-full overflow-hidden ${className || ''}`}>
      <div className="p-4 space-y-4 flex-1">
        {/* Token Header */}
        <div className="text-center space-y-2">
          <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-wider">Token details and supply information</p>
        </div>

        {/* Token Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-xs">Max supply</span>
            <span className="text-white text-xs font-medium text-right">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.maxSupply, format) : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-xs">Total supply</span>
            <span className="text-white text-xs font-medium text-right">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.totalSupply, format) : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-xs">Circulating</span>
            <span className="text-white text-xs font-medium text-right">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.circulatingSupply, format) : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-xs">Deploy gas</span>
            <span className="text-white text-xs font-medium text-right">
              {isAuctionLoading ? "Loading..." : auctionInfo ? `${formatNumber(parseFloat(auctionInfo.deployGas), format, { maximumFractionDigits: 2 })} ${auctionInfo.currency}` : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-xs">Holders</span>
            <span className="text-white text-xs font-medium text-right">
              {isHoldersLoading ? "Loading..." : formatNumber(holdersCount, format, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-3 border-t border-border-subtle pt-4">
          <div>
            <span className="text-text-secondary text-xs block mb-2">Deployer</span>
            <div className="flex items-center justify-between">
              <span className="text-brand-accent text-xs flex-1 truncate mr-1 font-mono">
                {isLoading ? "Loading..." : tokenDetails ? truncateAddress(tokenDetails.deployer) : "N/A"}
              </span>
              {tokenDetails?.deployer && (
                <button
                  onClick={() => copyToClipboard(tokenDetails.deployer)}
                  className="group p-1 rounded transition-colors flex-shrink-0 hover:bg-white/5"
                >
                  {copiedAddress === tokenDetails.deployer ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-text-muted group-hover:text-white transition-all duration-200" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="text-text-secondary text-xs block mb-2">Token address</span>
            <div className="flex items-center justify-between">
              <span className="text-brand-accent text-xs flex-1 truncate mr-1 font-mono">
                {token.contract ? truncateAddress(token.contract) : "N/A"}
              </span>
              {token.contract && (
                <button
                  onClick={() => copyToClipboard(token.contract!)}
                  className="group p-1 rounded transition-colors flex-shrink-0 hover:bg-white/5"
                >
                  {copiedAddress === token.contract ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-text-muted group-hover:text-white transition-all duration-200" />
                  )}
                </button>
              )}
            </div>
          </div>

          {tokenDetails?.deployTime && (
            <div>
              <span className="text-text-secondary text-xs block mb-2">Deploy time</span>
              <span className="text-white text-xs">
                {new Date(tokenDetails.deployTime).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassPanel>

  );
}
