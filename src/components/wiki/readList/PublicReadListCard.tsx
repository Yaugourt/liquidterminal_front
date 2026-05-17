"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy,
  CheckCircle,
  BookOpen,
  Globe,
  ChevronRight,
} from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { PublicReadList } from "@/services/wiki/readList/types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface PublicReadListCardProps {
  readList: PublicReadList;
  isSelected?: boolean;
  onSelect?: () => void;
  onCopy?: () => void;
}

export const PublicReadListCard = memo(function PublicReadListCard({
  readList,
  isSelected = false,
  onSelect,
  onCopy
}: PublicReadListCardProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCopying) return;
    setIsCopying(true);
    try {
      if (onCopy) await onCopy();
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } finally {
      setIsCopying(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(readList.updatedAt), { addSuffix: true });
  const initial = (readList.creator.name || "?").charAt(0).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`bg-brand-secondary/60 border rounded-2xl transition-colors duration-200 cursor-pointer group overflow-hidden ${isSelected
        ? 'border-brand-accent/40'
        : 'border-border-subtle hover:border-border-hover'
        }`}
      onClick={onSelect}
    >
      {/* Top accent bar */}
      <div className={`h-0.5 w-full transition-all duration-300 ${isSelected ? 'bg-brand-accent' : 'bg-transparent group-hover:bg-brand-accent/40'}`} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/20 transition-colors">
            <BookOpen className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-brand-accent transition-colors">
                {readList.name}
              </h3>
              <Globe className="w-3 h-3 text-brand-accent/60 flex-shrink-0" />
            </div>
            {readList.description ? (
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{readList.description}</p>
            ) : (
              <p className="text-xs text-text-muted mt-0.5 italic">No description</p>
            )}
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs flex-shrink-0">
            {initial}
          </div>
          <span className="text-xs text-text-secondary truncate">{readList.creator.name}</span>
          <span className="text-text-muted text-xs">·</span>
          <span className="text-xs text-text-muted">{timeAgo}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between py-2 border-t border-border-subtle/60">
          <span className="text-xs text-text-muted">
            <span className="text-text-primary font-semibold">{readList.itemsCount}</span> resources
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
            className="flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
          >
            View list
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          disabled={isCopying}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg transition-all"
          size="sm"
        >
          {isCopying ? (
            <>
              <InlineSpinner className="w-3.5 h-3.5 mr-2" />
              Copying...
            </>
          ) : hasCopied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-2" />
              Copy List
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
});
