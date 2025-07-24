"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Check, Clock, Hash, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { BlockHeaderProps } from "@/components/types/explorer.types";
import Link from "next/link";
import { useDateFormat } from "@/store/date-format.store";
import { useNumberFormat } from "@/store/number-format.store";
import { formatDateTime } from "@/lib/dateFormatting";
import { formatNumber } from "@/lib/numberFormatting";

export function BlockHeader({ blockDetails }: BlockHeaderProps) {
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});
  const { format: dateFormat } = useDateFormat();
  const { format: numberFormat } = useNumberFormat();

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedValues((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedValues((prev) => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch((err) => {
        console.error("Erreur lors de la copie :", err);
      });
  }, []);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg text-white font-inter">Block <span className="text-[#F9E370]">{formatNumber(blockDetails.height, numberFormat, { maximumFractionDigits: 0 })}</span></h2>
          <button
            onClick={() => copyToClipboard(blockDetails.height.toString(), 'blockHeight')}
            className="group p-1 rounded transition-colors"
          >
            {copiedValues['blockHeight'] ? (
              <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        </div>
      </div>
      
      <Card className="bg-[#051728E5]/80 backdrop-blur-sm border-2 border-[#83E9FF4D] p-5 shadow-md hover:border-[#83E9FF40] transition-all duration-300 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-[#f9e370]" />
                <p className="text-white text-xs uppercase tracking-wide font-medium">Time</p>
              </div>
              <p className="text-white text-sm font-medium ml-6">
                {formatDateTime(blockDetails.blockTime, dateFormat)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash size={14} className="text-[#f9e370]" />
                <p className="text-white text-xs uppercase tracking-wide font-medium">Hash</p>
              </div>
              <div className="flex items-center gap-1.5 ml-6">
                <p className="text-white break-all text-sm font-medium overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent font-inter">
                  {blockDetails.hash}
                </p>
                <button
                  onClick={() => copyToClipboard(blockDetails.hash, "blockHash")}
                  className="group p-1 rounded transition-colors"
                >
                  {copiedValues["blockHash"] ? (
                    <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-[#f9e370]" />
                <p className="text-white text-xs uppercase tracking-wide font-medium">Proposer</p>
              </div>
              <div className="flex items-center gap-1.5 ml-6">
                <Link 
                  href={`/explorer/address/${blockDetails.proposer}`}
                  className="text-[#83E9FF] break-all text-sm font-medium overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent hover:text-[#83E9FF]/80 transition-colors font-inter"
                >
                  {blockDetails.proposer}
                </Link>
                <button
                  onClick={() => copyToClipboard(blockDetails.proposer, "proposer")}
                  className="group p-1 rounded transition-colors"
                >
                  {copiedValues["proposer"] ? (
                    <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-[#f9e370]" />
                <p className="text-white text-xs uppercase tracking-wide font-medium">Transactions</p>
              </div>
              <p className="text-white text-sm font-medium ml-6">
                {formatNumber(blockDetails.numTxs, numberFormat, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 