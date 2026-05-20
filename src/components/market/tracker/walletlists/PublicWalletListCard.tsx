"use client";

import { memo } from "react";

import { WalletList } from "@/services/market/tracker/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Calendar, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PublicWalletListCardProps {
  list: WalletList;
  onPreview: (list: WalletList) => void;
}

export const PublicWalletListCard = memo(function PublicWalletListCard({ list, onPreview }: PublicWalletListCardProps) {
  const createdDate = new Date(list.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <Card className="rounded-2xl hover:border-border-default transition-all duration-200 group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-text-primary text-lg line-clamp-2 group-hover:text-brand transition-colors">
            {list.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full shrink-0">
            <Users size={12} />
            <span>Public</span>
          </div>
        </div>

        {list.description && (
          <CardDescription className="text-text-secondary text-sm line-clamp-3">
            {list.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Wallet size={14} className="text-brand" />
            <span className="text-text-primary font-medium">{list.itemsCount || 0}</span>
            <span>wallet{list.itemsCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-1.5 text-text-secondary">
            <Calendar size={14} className="text-gold" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 text-sm text-text-secondary pt-2 border-t border-border-subtle">
          <span>By</span>
          <span className="text-text-primary font-medium">
            {list.creator?.name || 'Anonymous'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onPreview(list)}
            className="flex-1 bg-brand hover:bg-brand text-brand-text-on font-medium"
          >
            <Eye className="mr-2 h-4 w-4" />
            View & Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

