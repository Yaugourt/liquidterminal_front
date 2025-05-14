"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Check, Clock, Hash, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { BlockDetails } from "@/services/explorer/types";

interface BlockHeaderProps {
  blockDetails: BlockDetails;
  onAddressClick: (address: string) => void;
}

export function BlockHeader({ blockDetails, onAddressClick }: BlockHeaderProps) {
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});

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
      <div className="mb-6 bg-[#0A1F32]/70 backdrop-blur-sm border border-[#1E3851] p-4 rounded-xl shadow-sm hover:border-[#83E9FF20] transition-all">
        <div className="flex items-center gap-3">
          <h2 className="text-xl text-white font-serif">Block <span className="text-[#F9E370]">{blockDetails.height}</span></h2>
          <button 
            className="p-1.5 hover:bg-[#1E3851] rounded-lg transition-all flex-shrink-0"
            onClick={() => copyToClipboard(blockDetails.height.toString(), 'blockHeight')}
          >
            <Copy size={16} className="text-[#83E9FF]" />
          </button>
        </div>
      </div>
      
      <Card className="bg-[#051728E5]/80 backdrop-blur-sm border-2 border-[#83E9FF4D] p-5 shadow-md hover:border-[#83E9FF40] transition-all duration-300 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-[#83E9FF80]" />
                <p className="text-[#FFFFFF99] text-xs uppercase tracking-wide font-medium">Time:</p>
              </div>
              <p className="text-white text-sm font-medium">
                {format(blockDetails.blockTime, "dd/MM/yyyy HH:mm:ss")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash size={14} className="text-[#83E9FF80]" />
                <p className="text-[#FFFFFF99] text-xs uppercase tracking-wide font-medium">Hash:</p>
              </div>
              <div className="flex items-center group">
                <p className="text-[#83E9FF] break-all text-sm font-medium mr-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
                  {blockDetails.hash}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 text-[#83E9FF] opacity-60 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          copyToClipboard(blockDetails.hash, "blockHash")
                        }
                      >
                        {copiedValues["blockHash"] ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#051728] border border-[#83E9FF] text-white">
                      <p className="text-xs px-1">
                        {copiedValues["blockHash"]
                          ? "Hash copié !"
                          : "Copier le hash"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-[#83E9FF80]" />
                <p className="text-[#FFFFFF99] text-xs uppercase tracking-wide font-medium">Proposer:</p>
              </div>
              <div className="flex items-center group">
                <p
                  className="text-[#83E9FF] break-all text-sm font-medium mr-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent hover:text-[#83E9FF]/80 cursor-pointer transition-colors"
                  onClick={() => onAddressClick(blockDetails.proposer)}
                >
                  {blockDetails.proposer}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 text-[#83E9FF] opacity-60 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          copyToClipboard(blockDetails.proposer, "proposer")
                        }
                      >
                        {copiedValues["proposer"] ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#051728] border border-[#83E9FF] text-white">
                      <p className="text-xs px-1">
                        {copiedValues["proposer"]
                          ? "Adresse copiée !"
                          : "Copier l'adresse"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-[#83E9FF80]" />
                <p className="text-[#FFFFFF99] text-xs uppercase tracking-wide font-medium">Transactions:</p>
              </div>
              <p className="text-white text-sm font-medium">
                {blockDetails.numTxs}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 