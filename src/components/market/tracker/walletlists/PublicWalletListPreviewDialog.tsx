"use client";

import { useState, useEffect } from "react";
import { WalletList } from "@/services/market/tracker/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Loader2,
  Users,
  Calendar,
  Wallet,
  Download,
  ClipboardCopy
} from "lucide-react";
import { toast } from "sonner";
import { getWalletListById } from "@/services/market/tracker/walletlist.service";
import { useWalletLists } from "@/store/use-wallet-lists";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface PublicWalletListPreviewDialogProps {
  list: WalletList | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicWalletListPreviewDialog({
  list,
  isOpen,
  onOpenChange,
}: PublicWalletListPreviewDialogProps) {
  const [fullList, setFullList] = useState<WalletList | null>(null);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const { copyList } = useWalletLists();
  const router = useRouter();

  // Load full list details when dialog opens
  useEffect(() => {
    if (isOpen && list?.id) {
      loadFullList(list.id);
    }
  }, [isOpen, list?.id]);

  const loadFullList = async (id: number) => {
    try {
      setLoading(true);
      const data = await getWalletListById(id);
      setFullList(data);
    } catch {
      toast.error('Failed to load list details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyList = async () => {
    if (!list?.id) return;

    try {
      setCopying(true);
      await copyList(list.id);
      toast.success(`List "${list.name}" copied to your lists!`);
      onOpenChange(false);

      // Redirect to tracker page
      setTimeout(() => {
        router.push('/market/tracker');
      }, 1000);
    } catch {
      toast.error('Failed to copy list');
    } finally {
      setCopying(false);
    }
  };

  const handleCopyAddresses = async () => {
    if (!fullList?.items) return;

    const addresses = fullList.items
      .map(item => item.userWallet?.Wallet?.address)
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(addresses);
      toast.success(`Copied ${fullList.items.length} addresses to clipboard`);
    } catch {
      toast.error('Failed to copy addresses');
    }
  };

  const handleExportCSV = () => {
    if (!fullList?.items) return;

    const rows = [
      'Address,Name,Notes',
      ...fullList.items.map(item => {
        const addr = item.userWallet?.Wallet?.address || '';
        const name = (item.userWallet?.name || '').replace(/,/g, ';');
        const notes = (item.notes || '').replace(/,/g, ';');
        return `${addr},${name},${notes}`;
      })
    ];

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullList.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  if (!list) return null;

  const createdDate = new Date(list.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-dialog text-white max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl">{list.name}</DialogTitle>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-[#4ADE80]">
                  <Users size={14} />
                  <span>Public</span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary">
                  <Calendar size={14} />
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>
          </div>

          {list.description && (
            <DialogDescription className="text-text-secondary pt-2">
              {list.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 p-3 bg-black/20 border border-border-hover rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#83E9FF]" />
              <span className="text-white font-medium">{list.itemsCount || 0}</span>
              <span className="text-text-secondary text-sm">
                wallet{list.itemsCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-text-secondary text-sm">
              By <span className="text-white font-medium">{list.creator?.name || 'Anonymous'}</span>
            </div>
          </div>

          {/* Wallets list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
            </div>
          ) : fullList?.items && fullList.items.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-secondary">Wallets in this list:</h3>
              <div className="h-[300px] border border-border-hover rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="p-3 space-y-2">
                  {fullList.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2 bg-zinc-800/30 border border-border-subtle rounded-lg hover:border-[#83E9FF]/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#83E9FF]/20 text-[#83E9FF] text-xs font-medium shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {item.userWallet?.name && (
                            <span className="text-white font-medium text-sm">
                              {item.userWallet.name}
                            </span>
                          )}
                        </div>
                        <code className="text-xs text-text-secondary block break-all">
                          {item.userWallet?.Wallet?.address}
                        </code>
                        {item.notes && (
                          <p className="text-xs text-text-muted italic">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No wallets in this list
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              onClick={handleCopyAddresses}
              disabled={!fullList?.items?.length}
              className="border-border-hover text-white hover:bg-white/5"
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy Addresses
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!fullList?.items?.length}
              className="border-border-hover text-white hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border-hover text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCopyList}
              disabled={copying}
              className="bg-brand-accent hover:bg-[#6bd4f0] text-brand-tertiary font-medium"
            >
              {copying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to My Lists
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

