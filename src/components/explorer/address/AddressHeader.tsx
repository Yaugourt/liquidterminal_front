"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";

interface AddressHeaderProps {
  address: string;
}

export function AddressHeader({ address }: AddressHeaderProps) {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Format address with ellipsis for better readability
  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="mb-6 bg-[#0A1F32]/70 backdrop-blur-sm border border-[#1E3851] p-4 rounded-xl shadow-sm hover:border-[#83E9FF20] transition-all">
      <span className="text-[#83E9FF80] text-xs tracking-wide font-medium uppercase mb-2 block">Address</span>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent py-1">
        <div className="hidden sm:block">
          <code className="text-[#83E9FF] text-xl font-medium font-serif">{address}</code>
        </div>
        <div className="sm:hidden">
          <code className="text-[#83E9FF] text-lg font-medium font-serif">{formatAddress(address)}</code>
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