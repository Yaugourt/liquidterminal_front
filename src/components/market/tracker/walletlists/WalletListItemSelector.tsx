"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Wallet, Trash2, FileUp, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WalletListItem } from "@/services/market/tracker/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WalletListItemSelectorProps {
  items: WalletListItem[];
  selectedWalletId: number | null;
  onWalletChange: (value: string) => void;
  onAddWallet: () => void;
  onDeleteWallet: (walletId: number, walletName: string | null) => void;
  onBulkDelete: (walletIds: number[]) => Promise<void>;
  onImportCSV?: () => void;
  onExportCSV?: () => void;
}

export function WalletListItemSelector({
  items,
  selectedWalletId,
  onWalletChange,
  onAddWallet,
  onDeleteWallet,
  onBulkDelete,
  onImportCSV,
  onExportCSV,
}: WalletListItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.userWallet?.name?.toLowerCase().includes(query) ||
        item.userWallet?.Wallet?.address?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Get active wallet info
  const activeItem = useMemo(() => {
    return items.find((item) => item.userWallet?.Wallet?.id === selectedWalletId);
  }, [selectedWalletId, items]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Selection handlers
  const toggleWalletSelection = (walletId: number) => {
    setSelectedWalletIds((prev) => {
      const next = new Set(prev);
      if (next.has(walletId)) {
        next.delete(walletId);
      } else {
        next.add(walletId);
      }
      return next;
    });
  };

  const handleBulkDeleteClick = () => {
    if (selectedWalletIds.size === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await onBulkDelete(Array.from(selectedWalletIds));
      setSelectedWalletIds(new Set());
    } catch {
      // Error handled by onBulkDelete
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, item: WalletListItem) => {
    e.stopPropagation();
    if (item.userWallet?.Wallet?.id) {
      onDeleteWallet(
        item.userWallet.Wallet.id,
        item.userWallet.name || null
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Select Wallet Dropdown */}
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Wallet className="w-4 h-4" />
              <span>Wallet:</span>
            </div>

            <Select
              value={selectedWalletId?.toString() || ""}
              onValueChange={onWalletChange}
            >
              <SelectTrigger className="w-full sm:w-[400px] bg-[#151A25]/60 border-white/10 text-white focus:ring-0 focus:ring-offset-0">
                <div className="flex items-center gap-2 truncate">
                  <Wallet className="w-4 h-4 shrink-0 text-[#F9E370]" />
                  <SelectValue>
                    {activeItem?.userWallet ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {activeItem.userWallet.name || "Unnamed Wallet"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({formatAddress(activeItem.userWallet.Wallet?.address || "")})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Select a wallet...</span>
                    )}
                  </SelectValue>
                </div>
              </SelectTrigger>

              <SelectContent className="bg-[#151A25] border-white/10 text-white max-h-[400px]">
                {/* Search input */}
                {items.length > 5 && (
                  <div className="p-2 sticky top-0 bg-[#151A25] z-10 border-b border-white/10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search wallets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-zinc-800/50 border-white/10 text-white h-8 focus-visible:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}

                {/* Wallets with Checkboxes */}
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    if (!item.userWallet?.Wallet) return null;

                    return (
                      <div key={item.id} className="relative group">
                        <div className="flex items-center gap-2 px-2 hover:bg-white/5 transition-colors">
                          {/* Checkbox */}
                          <Checkbox
                            checked={selectedWalletIds.has(item.userWallet.Wallet.id)}
                            onCheckedChange={() => toggleWalletSelection(item.userWallet!.Wallet!.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="border-brand-accent data-[state=checked]:bg-brand-accent"
                          />

                          {/* Wallet Item */}
                          <SelectItem
                            value={item.userWallet.Wallet.id.toString()}
                            className="flex-1 focus:bg-transparent cursor-pointer border-none pr-10"
                          >
                            <div className="flex flex-col gap-1 w-full py-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Wallet className="w-4 h-4 text-[#F9E370] shrink-0" />
                                  <span className="font-medium truncate">
                                    {item.userWallet.name || "Unnamed Wallet"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 shrink-0">
                                  {new Date(item.userWallet.addedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <code className="text-xs text-gray-400 pl-6">
                                {item.userWallet.Wallet.address}
                              </code>
                              {item.notes && (
                                <p className="text-xs text-gray-500 italic pl-6">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </SelectItem>

                          {/* Delete button on hover */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => handleDelete(e, item)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove from list</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })
                ) : searchQuery ? (
                  <div className="p-4 text-center text-sm text-gray-400">
                    No wallets found for &quot;{searchQuery}&quot;
                  </div>
                ) : null}

                {/* Empty state */}
                {items.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-400">
                    No wallets in this list yet
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Wallet count badge */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-brand-accent">
              <span className="font-medium">{items.length}</span>
              <span className="text-gray-400">wallet{items.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Delete Selected Button (appears when selection > 0) */}
          {selectedWalletIds.size > 0 && (
            <Button
              onClick={handleBulkDeleteClick}
              size="sm"
              variant="destructive"
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Delete Selected ({selectedWalletIds.size})</span>
              <span className="sm:hidden">Delete ({selectedWalletIds.size})</span>
            </Button>
          )}

          {/* Export CSV button */}
          {onExportCSV && items.length > 0 && (
            <Button
              onClick={onExportCSV}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          )}

          {/* Import CSV button */}
          {onImportCSV && (
            <Button
              onClick={onImportCSV}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
            >
              <FileUp className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
          )}

          {/* Add wallet button */}
          <Button
            onClick={onAddWallet}
            size="sm"
            className="w-full sm:w-auto bg-[#F9E370E5] hover:bg-[#F0D04E]/90 text-black font-medium"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Wallet</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#151A25] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Multiple Wallets</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedWalletIds.size} wallet
              {selectedWalletIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete {selectedWalletIds.size} Wallet{selectedWalletIds.size !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
