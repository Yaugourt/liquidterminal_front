"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Trash2, Check, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import type { ReadListItem } from "@/services/education";
import type { LinkPreview } from "@/services/education/linkPreview";

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
    <Card 
      className={`bg-[#051728E5] border border-[#83E9FF4D] hover:border-[#83E9FF80] transition-all shadow-sm hover:shadow-lg group overflow-hidden rounded-lg cursor-pointer h-full flex flex-col ${
        item.isRead ? 'opacity-75' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image section */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#112941] to-[#1a3a5a] flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          {item.resource?.url && item.resource.url.startsWith('http') && preview?.image ? (
            <Image
              src={preview.image}
              alt={preview.title || 'Preview'}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : !imageError ? (
            <Image
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTEyOTQxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzgzRTlGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=="
              alt={item.resource?.url || 'Resource'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-[#83E9FF] opacity-20">
                <BookOpen size={32} />
              </div>
            </div>
          )}
          
          {/* Read status overlay */}
          {item.isRead && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-[#051728CC] rounded p-1 z-10">
            <Button
              onClick={handleToggleRead}
              size="sm"
              variant="ghost"
              className={`p-2 h-auto ${
                item.isRead 
                  ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' 
                  : 'text-[#f9e370] hover:text-green-400 hover:bg-green-400/10'
              }`}
              title={item.isRead ? "Mark as unread" : "Mark as read"}
            >
              {item.isRead ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleRemoveItem}
              size="sm"
              variant="ghost"
              className="p-2 h-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
              title="Remove from read list"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content section */}
        <div className="p-3 space-y-2 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="secondary" 
              className="bg-[#83E9FF1A] text-[#83E9FF] border-none text-xs"
            >
              Resource #{item.resourceId}
            </Badge>
            <ExternalLink size={12} className="text-[#F9E370] mt-0.5 flex-shrink-0" />
          </div>

          <h3 className={`font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#F9E370] transition-colors flex-1 ${
            item.isRead ? 'text-[#FFFFFF80]' : 'text-white'
          }`}>
            {preview?.title ? (
              <a 
                href={item.resource?.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#F9E370] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {preview.title.length > 53 ? `${preview.title.substring(0, 53)}...` : preview.title}
              </a>
            ) : item.resource?.url ? (
              <a 
                href={item.resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#83E9FF] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {item.resource.url.length > 53 ? `${item.resource.url.substring(0, 53)}...` : item.resource.url}
              </a>
            ) : (
              'No URL'
            )}
          </h3>

          <p className="text-xs text-[#FFFFFF80] line-clamp-2 mb-2">
            {preview?.description || 'No description available'}
          </p>

          {item.notes && !item.notes.startsWith('Added from') && (
            <p className="text-xs text-[#FFFFFF80] line-clamp-2 mb-2">
              {item.notes}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 mt-auto">
            <div className="text-xs text-[#FFFFFF60] space-y-0.5">
              <div>Added {new Date(item.addedAt).toLocaleDateString()}</div>
           
            </div>
            <div className="text-xs text-[#f9e370]">
              {item.isRead ? 'Read' : 'Unread'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 