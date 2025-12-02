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
import { PlusCircle, Search, Wallet, FileUp, Download, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet as WalletType } from "@/services/market/tracker/types";
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

interface WalletSelectorProps {
  wallets: WalletType[];
  activeWalletId: number | null;
  onWalletChange: (value: string) => void;
  onAddWallet: () => void;
  onDeleteWallet: (walletId: number, walletName: string | null) => void;
  onBulkDelete: (walletIds: number[]) => Promise<void>;
  onImportCSV?: () => void;
  onExportCSV?: () => void;
}

export function WalletSelector({
  wallets,
  activeWalletId,
  onWalletChange,
  onAddWallet,
  onDeleteWallet,
  onBulkDelete,
  onImportCSV,
  onExportCSV,
}: WalletSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter wallets based on search
  const filteredWallets = useMemo(() => {
    if (!searchQuery.trim()) return wallets;
    const query = searchQuery.toLowerCase();
    return wallets.filter(
      (wallet) =>
        wallet.name?.toLowerCase().includes(query) ||
        wallet.address?.toLowerCase().includes(query)
    );
  }, [wallets, searchQuery]);

  // Get active wallet info
  const activeWallet = useMemo(() => {
    return wallets.find((w) => w.id === activeWalletId);
  }, [activeWalletId, wallets]);

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

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Select Wallet Dropdown */}
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Wallet className="w-4 h-4" />
              <span>Wallet:</span>
            </div>

            <Select
              value={activeWalletId?.toString() || ""}
              onValueChange={onWalletChange}
            >
              <SelectTrigger className="w-full sm:w-[400px] bg-[#0A0D12] border-white/5 text-white rounded-lg hover:border-white/10 transition-all">
                <div className="flex items-center gap-2 truncate">
                  <Wallet className="w-4 h-4 shrink-0 text-[#83E9FF]" />
                  <SelectValue>
                    {activeWallet ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activeWallet.name || "Unnamed Wallet"}</span>
                        <span className="text-xs text-zinc-500">
                          ({formatAddress(activeWallet.address)})
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500">Select a wallet...</span>
                    )}
                  </SelectValue>
                </div>
              </SelectTrigger>

              <SelectContent className="bg-[#151A25] border-white/10 text-white max-h-[400px] rounded-xl shadow-xl shadow-black/20">
                {/* Search input */}
                {wallets.length > 5 && (
                  <div className="p-2 sticky top-0 bg-[#151A25] z-10 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        placeholder="Search wallets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-[#0A0D12] border-white/5 text-white h-8 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}

                {/* Wallets with Checkboxes */}
                {filteredWallets.length > 0 ? (
                  filteredWallets.map((wallet) => (
                    <div key={wallet.id} className="relative group">
                      <div className="flex items-center gap-2 px-2 hover:bg-white/5 transition-colors rounded-lg">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedWalletIds.has(wallet.id)}
                          onCheckedChange={() => toggleWalletSelection(wallet.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-white/20 data-[state=checked]:bg-[#83E9FF] data-[state=checked]:border-[#83E9FF]"
                        />
                        
                        {/* Wallet Item */}
                        <SelectItem
                          value={wallet.id.toString()}
                          className="flex-1 focus:bg-transparent cursor-pointer border-none pr-10"
                        >
                          <div className="flex flex-col gap-1 w-full py-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Wallet className="w-4 h-4 text-[#83E9FF] shrink-0" />
                                <span className="font-medium truncate">
                                  {wallet.name || "Unnamed Wallet"}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-600 shrink-0">
                                {new Date(wallet.addedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <code className="text-xs text-zinc-500 pl-6 font-mono">
                              {wallet.address}
                            </code>
                          </div>
                        </SelectItem>

                        {/* Delete button on hover */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteWallet(wallet.id, wallet.name || null);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete wallet</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No wallets found for &quot;{searchQuery}&quot;
                  </div>
                ) : null}

                {/* Empty state */}
                {wallets.length === 0 && (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No wallets yet. Add your first one!
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Wallet count badge */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[#83E9FF]/10 border border-white/5 rounded-lg text-xs text-[#83E9FF]">
              <span className="font-medium">{wallets.length}</span>
              <span className="text-zinc-500">wallet{wallets.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Delete Selected Button (appears when selection > 0) */}
          {selectedWalletIds.size > 0 && (
            <Button
              onClick={handleBulkDeleteClick}
              size="sm"
              variant="destructive"
              className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 rounded-lg"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Delete Selected ({selectedWalletIds.size})</span>
              <span className="sm:hidden">Delete ({selectedWalletIds.size})</span>
            </Button>
          )}

          {/* Export CSV button */}
          {onExportCSV && wallets.length > 0 && (
            <Button
              onClick={onExportCSV}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-white/5 text-white hover:bg-white/5 rounded-lg"
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
              className="w-full sm:w-auto border-white/5 text-white hover:bg-white/5 rounded-lg"
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
            className="w-full sm:w-auto bg-[#F9E370] hover:bg-[#F9E370]/90 text-black font-semibold rounded-lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Wallet</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#151A25] border-white/10 rounded-2xl shadow-xl shadow-black/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Multiple Wallets</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete {selectedWalletIds.size} wallet
              {selectedWalletIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/5 text-white hover:bg-white/5 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
            >
              Delete {selectedWalletIds.size} Wallet{selectedWalletIds.size !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
