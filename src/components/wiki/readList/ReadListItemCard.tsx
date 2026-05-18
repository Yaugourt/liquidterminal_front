"use client";

import { ExternalLink, Trash2, Check, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { ReadListItem } from "@/services/wiki";
import type { LinkPreview } from "@/services/wiki/linkPreview";
import { formatDistanceToNow } from "date-fns";

interface ReadListItemCardProps {
  item: ReadListItem;
  preview?: LinkPreview | null;
  onRemoveItem: (itemId: number) => void;
  onToggleRead: (itemId: number, isRead: boolean) => void;
}

export const ReadListItemCard = memo(function ReadListItemCard({ item, preview, onRemoveItem, onToggleRead }: ReadListItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isTogglingRead, setIsTogglingRead] = useState(false);

  const handleRemoveItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveItem(item.id);
  };

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTogglingRead(true);
    await onToggleRead(item.id, !item.isRead);
    setIsTogglingRead(false);
  };

  const handleCardClick = () => {
    if (item.resource?.url) {
      window.open(item.resource.url, '_blank');
    }
  };

  const timeAgo = item.addedAt
    ? formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })
    : null;

  const hasImage = item.resource?.url?.startsWith('http') && preview?.image;

  return (
    <Card
      className={`hover:border-border-default group cursor-pointer h-full flex flex-col ${item.isRead ? 'opacity-70' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-base to-surface flex-shrink-0" style={{ aspectRatio: '16/9' }}>
        {hasImage ? (
          <Image
            src={preview!.image!}
            alt={preview?.title || 'Preview'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : !imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
            <BookOpen className="w-10 h-10 text-brand/20" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-brand/20" />
          </div>
        )}

        {/* Read overlay */}
        <AnimatePresence>
          {item.isRead && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/50 flex items-center justify-center"
            >
              <div className="bg-emerald-500 rounded-full p-2.5 shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleRead}
            disabled={isTogglingRead}
            className={`p-1.5 rounded-lg backdrop-blur-sm border transition-all ${item.isRead
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-base/80 border-border-default text-gold hover:bg-gold/10 hover:border-gold/30'
              }`}
            title={item.isRead ? "Mark as unread" : "Mark as read"}
          >
            {isTogglingRead ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
              />
            ) : item.isRead ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRemoveItem}
            className="p-1.5 rounded-lg bg-base/80 border border-border-default text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 backdrop-blur-sm transition-all"
            title="Remove from list"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Status pill */}
        <div className="absolute bottom-2 left-2">
          <span className={`text-label px-2 py-1 rounded-md backdrop-blur-sm border ${item.isRead
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            : 'bg-gold/10 border-gold/20 text-gold'
            }`}>
            {item.isRead ? 'Read' : 'Unread'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Title */}
        <h3 className={`font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors leading-snug ${item.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
          {preview?.title || item.resource?.url || 'No title'}
        </h3>

        {/* Description */}
        {preview?.description && (
          <p className="text-xs text-text-tertiary line-clamp-2 flex-1">
            {preview.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border-subtle/60">
          <div className="flex items-center gap-1.5 text-text-tertiary text-xs min-w-0">
            {preview?.siteName && (
              <span className="text-xs bg-base border border-border-subtle text-text-secondary px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                {preview.siteName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary flex-shrink-0">
            <ExternalLink className="w-3 h-3 text-brand" />
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
});
