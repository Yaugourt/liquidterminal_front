"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";
import { AddressHeaderProps } from "@/components/types/explorer.types";
import { useGlobalAliases } from "@/services/explorer";

export function AddressHeader({ address }: AddressHeaderProps) {
  const [showCopied, setShowCopied] = useState(false);
  const { getAlias, isLoading: aliasLoading } = useGlobalAliases();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Récupérer l'alias de l'adresse
  const alias = getAlias(address);

  // Format address with ellipsis for better readability
  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="mb-3 p-2">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[#FFFFFF] text-xs tracking-wide font-medium uppercase">Address</span>
        {alias && !aliasLoading && (
          <div className="flex items-center gap-2">
            <span className="text-[#83E9FF33] text-xs">•</span>
            <span className="text-[#f9e370] text-xs font-medium bg-[#f9e370]/10 px-2 py-0.5 rounded-md border border-[#f9e370]/20">
              {alias}
            </span>
          </div>
        )}
        {aliasLoading && (
          <div className="flex items-center gap-2">
            <span className="text-[#83E9FF33] text-xs">•</span>
            <div className="h-4 w-20 bg-[#83E9FF]/20 rounded-md animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <div className="hidden sm:block">
                      <code className="text-[#83E9FF] text-base font-medium font-inter">{address}</code>
        </div>
        <div className="sm:hidden">
                      <code className="text-[#83E9FF] text-sm font-medium font-inter">{formatAddress(address)}</code>
        </div>
        <TooltipProvider>
          <Tooltip open={showCopied}>
            <TooltipTrigger asChild>
              <button
                className="p-1.5 hover:bg-[#1E3851] rounded-lg transition-all flex-shrink-0"
                onClick={copyToClipboard}
                title="Copy address to clipboard"
              >
                <Copy size={16} className="text-[#83E9FF]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#051728] border border-[#83E9FF] text-white">
              <p className="text-xs font-medium px-1">Copied!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 