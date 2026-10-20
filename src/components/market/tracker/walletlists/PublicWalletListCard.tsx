"use client";

import { memo } from "react";

import { WalletList } from "@/services/market/tracker/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardHead } from "@/components/common";
import { Eye, Calendar, Wallet } from "lucide-react";
import { timeAgo } from "@/lib/formatters/dateFormatting";

interface PublicWalletListCardProps {
  list: WalletList;
  onPreview: (list: WalletList) => void;
}

export const PublicWalletListCard = memo(function PublicWalletListCard({ list, onPreview }: PublicWalletListCardProps) {
  const createdAgo = timeAgo(list.createdAt);

  return (
    <Card className="flex flex-col">
      <CardHead title={<span title={list.name}>{list.name}</span>} />

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {list.description && (
          <p className="text-[12.5px] leading-relaxed text-text-secondary line-clamp-3">
            {list.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <Wallet size={13} aria-hidden />
            <span className="mono text-text-primary">{list.itemsCount || 0}</span>
            <span>wallet{list.itemsCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar size={13} aria-hidden />
            <span>{createdAgo}</span>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-1.5 border-t border-border-subtle pt-3 text-[11px] text-text-tertiary">
          <span>By</span>
          <span className="text-text-primary">
            {list.creator?.name || 'Anonymous'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex gap-2">
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
