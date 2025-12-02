"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  User, 
  Calendar, 
  FileText,
  CheckCircle,
  Loader2
} from "lucide-react";
import { PublicReadList } from "@/services/wiki/readList/types";
import { formatDistanceToNow } from "date-fns";

interface PublicReadListCardProps {
  readList: PublicReadList;
  isSelected?: boolean;
  onSelect?: () => void;
  onCopy?: () => void;
}

export function PublicReadListCard({ 
  readList, 
  isSelected = false, 
  onSelect, 
  onCopy 
}: PublicReadListCardProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopying) return;
    
    setIsCopying(true);
    try {
      if (onCopy) {
        await onCopy();
      }
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } finally {
      setIsCopying(false);
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div 
      className={`bg-[#151A25]/60 backdrop-blur-md border rounded-2xl transition-all duration-200 cursor-pointer group shadow-xl shadow-black/20 ${
        isSelected 
          ? 'border-[#83E9FF]/50' 
          : 'border-white/5 hover:border-white/10'
      }`}
      onClick={handleSelect}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-[#83E9FF] transition-colors">
              {readList.name}
            </h3>
            {readList.description && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                {readList.description}
              </p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className="ml-2 bg-[#F9E370]/10 text-[#F9E370] border-none text-xs"
          >
            {readList.itemsCount} items
          </Badge>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Creator Info */}
        <div className="flex items-center text-sm text-zinc-300 mb-3">
          <User className="w-4 h-4 mr-2 text-zinc-500" />
          <span className="truncate">{readList.creator.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 py-2 border-t border-white/5">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(readList.updatedAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            <span>{readList.itemsCount} resources</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            disabled={isCopying}
            className="flex-1 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg transition-colors"
            size="sm"
          >
            {isCopying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Copying...
              </>
            ) : hasCopied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy List
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 