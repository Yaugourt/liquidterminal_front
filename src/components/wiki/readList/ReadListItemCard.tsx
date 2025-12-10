"use client";

import { ExternalLink, Trash2, Check, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import type { ReadListItem } from "@/services/wiki";
import type { LinkPreview } from "@/services/wiki/linkPreview";

interface ReadListItemCardProps {
  item: ReadListItem;
  preview?: LinkPreview | null;
  onRemoveItem: (itemId: number) => void;
  onToggleRead: (itemId: number, isRead: boolean) => void;
}

export function ReadListItemCard({ item, preview, onRemoveItem, onToggleRead }: ReadListItemCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleRemoveItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveItem(item.id);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleRead(item.id, !item.isRead);
  };

  const handleCardClick = () => {
    if (item.resource?.url) {
      window.open(item.resource.url, '_blank');
    }
  };

  return (
    <div 
      className={`bg-brand-secondary/60 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all shadow-xl shadow-black/20 group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col ${
        item.isRead ? 'opacity-75' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="p-0 flex flex-col h-full">
        {/* Image section */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-brand-dark to-brand-secondary flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          {item.resource?.url && item.resource.url.startsWith('http') && preview?.image ? (
            <Image
              src={preview.image}
              alt={preview.title || 'Preview'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : !imageError ? (
            <Image
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMEEwRDEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzgzRTlGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=="
              alt={item.resource?.url || 'Resource'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-brand-accent opacity-20">
                <BookOpen size={32} />
              </div>
            </div>
          )}
          
          {/* Read status overlay */}
          {item.isRead && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-emerald-500 rounded-full p-2">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-dark/90 backdrop-blur-sm rounded-lg p-1 z-10 border border-white/10">
            <Button
              onClick={handleToggleRead}
              size="sm"
              variant="ghost"
              className={`p-1.5 h-auto rounded-md ${
                item.isRead 
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10' 
                  : 'text-[#F9E370] hover:text-emerald-400 hover:bg-emerald-400/10'
              }`}
              title={item.isRead ? "Mark as unread" : "Mark as read"}
            >
              {item.isRead ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </Button>
            <Button
              onClick={handleRemoveItem}
              size="sm"
              variant="ghost"
              className="p-1.5 h-auto rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
              title="Remove from read list"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="secondary" 
              className="bg-brand-accent/10 text-brand-accent border-none text-[10px]"
            >
              Resource #{item.resourceId}
            </Badge>
            <ExternalLink size={12} className="text-brand-accent mt-0.5 flex-shrink-0" />
          </div>

          <h3 className={`font-medium text-sm mb-2 line-clamp-2 group-hover:text-brand-accent transition-colors flex-1 ${
            item.isRead ? 'text-zinc-400' : 'text-white'
          }`}>
            {preview?.title ? (
              <a 
                href={item.resource?.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {preview.title.length > 53 ? `${preview.title.substring(0, 53)}...` : preview.title}
              </a>
            ) : item.resource?.url ? (
              <a 
                href={item.resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {item.resource.url.length > 53 ? `${item.resource.url.substring(0, 53)}...` : item.resource.url}
              </a>
            ) : (
              'No URL'
            )}
          </h3>

          <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
            {preview?.description || 'No description available'}
          </p>

          {item.notes && !item.notes.startsWith('Added from') && (
            <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
              {item.notes}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/5">
            <div className="text-[10px] text-zinc-500">
              Added {new Date(item.addedAt).toLocaleDateString()}
            </div>
            <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              item.isRead 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-[#F9E370]/10 text-[#F9E370]'
            }`}>
              {item.isRead ? 'Read' : 'Unread'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 