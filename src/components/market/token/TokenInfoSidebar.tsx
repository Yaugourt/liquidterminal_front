"use client";

import { Card } from "@/components/ui/card";
import { useTokenDetails } from "@/services/market/token";
import { useTokenAuction } from "@/services/market/auction/hooks/useAuctions";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/numberFormatting";
import { TokenData } from "./types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

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
    <Card className={`bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] ${className}`}>
      <div className="p-4 space-y-4">
        {/* Token Header */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-xs">Token details and supply information</p>
        </div>

        {/* Token Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Max supply</span>
            <span className="text-white text-xs font-medium">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.maxSupply, format) : "N/A"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Total supply</span>
            <span className="text-white text-xs font-medium">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.totalSupply, format) : "N/A"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Circulating supply</span>
            <span className="text-white text-xs font-medium">
              {isLoading ? "Loading..." : tokenDetails ? formatSupply(tokenDetails.circulatingSupply, format) : "N/A"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Deploy gas</span>
            <span className="text-white text-xs font-medium">
              {isAuctionLoading ? "Loading..." : auctionInfo ? `${formatNumber(parseFloat(auctionInfo.deployGas), format, { maximumFractionDigits: 2 })} ${auctionInfo.currency}` : "N/A"}
            </span>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-3 border-t border-[#83E9FF33] pt-4">
          <div>
            <span className="text-gray-400 text-xs block mb-1">Deployer</span>
            <div className="flex items-center justify-between">
              <span className="text-[#83E9FF] text-xs">
                {isLoading ? "Loading..." : tokenDetails ? truncateAddress(tokenDetails.deployer) : "N/A"}
              </span>
              {tokenDetails?.deployer && (
                <button 
                  onClick={() => copyToClipboard(tokenDetails.deployer)}
                  className="group p-1 rounded transition-colors"
                >
                  {copiedAddress === tokenDetails.deployer ? (
                    <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-gray-400 text-xs block mb-1">Token address</span>
            <div className="flex items-center justify-between">
              <span className="text-[#83E9FF] text-xs">
                {token.contract ? truncateAddress(token.contract) : "N/A"}
              </span>
              {token.contract && (
                <button 
                  onClick={() => copyToClipboard(token.contract!)}
                  className="group p-1 rounded transition-colors"
                >
                  {copiedAddress === token.contract ? (
                    <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              )}
            </div>
          </div>

          {tokenDetails?.deployTime && (
            <div>
              <span className="text-gray-400 text-xs block mb-1">Deploy time</span>
              <span className="text-white text-xs">
                {new Date(tokenDetails.deployTime).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

