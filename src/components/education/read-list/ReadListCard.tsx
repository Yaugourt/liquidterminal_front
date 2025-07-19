import { useState } from "react";
import { ExternalLink, Trash2, Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReadListStore } from "@/store/use-read-list";
import { ReadListItem } from "@/types/read-list.types";

interface ReadListCardProps {
  item: ReadListItem;
  readListId: string;
}

export function ReadListCard({ item, readListId }: ReadListCardProps) {
  const { removeItemFromReadList, markItemAsRead } = useReadListStore();
  const [imageError, setImageError] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Remove this article from your read list?")) {
      removeItemFromReadList(readListId, item.id);
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markItemAsRead(readListId, item.id, !item.isRead);
  };

  const handleCardClick = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className={`bg-[#051728] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-all cursor-pointer group overflow-hidden ${
        item.isRead ? 'opacity-75' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Image */}
      {item.image && !imageError ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {item.isRead && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-[#112941] flex items-center justify-center relative">
          <ExternalLink className="w-8 h-8 text-[#FFFFFF40]" />
          {item.isRead && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-[#83E9FF] bg-[#83E9FF1A] px-2 py-1 rounded">
            {item.category}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleToggleRead}
              size="sm"
              variant="ghost"
              className={`p-1 h-auto ${
                item.isRead 
                  ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' 
                  : 'text-[#FFFFFF80] hover:text-green-400 hover:bg-green-400/10'
              }`}
              title={item.isRead ? "Mark as unread" : "Mark as read"}
            >
              {item.isRead ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </Button>
            <Button
              onClick={handleRemove}
              size="sm"
              variant="ghost"
              className="p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
              title="Remove from read list"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${
          item.isRead ? 'text-[#FFFFFF80]' : 'text-white'
        }`}>
          {item.title}
        </h3>

        <p className="text-xs text-[#FFFFFF80] line-clamp-3 mb-3">
          {item.description}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-[#FFFFFF60] bg-[#FFFFFF0A] px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-[#FFFFFF60]">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-[#FFFFFF60]">
          Added {new Date(item.addedAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
} 