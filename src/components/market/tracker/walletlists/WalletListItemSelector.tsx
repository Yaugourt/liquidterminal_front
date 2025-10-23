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
import { PlusCircle, Search, Wallet, Trash2 } from "lucide-react";
import { WalletListItem } from "@/services/market/tracker/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WalletListItemSelectorProps {
  items: WalletListItem[];
  selectedWalletId: number | null;
  onWalletChange: (value: string) => void;
  onAddWallet: () => void;
  onDeleteWallet: (walletId: number, walletName: string | null) => void;
}

export function WalletListItemSelector({
  items,
  selectedWalletId,
  onWalletChange,
  onAddWallet,
  onDeleteWallet,
}: WalletListItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
          <SelectTrigger className="w-full sm:w-[400px] bg-[#0C2237] border-[#83E9FF4D] text-white">
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

          <SelectContent className="bg-[#051728] border-[#83E9FF4D] text-white max-h-[400px]">
            {/* Search input */}
            {items.length > 5 && (
              <div className="p-2 sticky top-0 bg-[#051728] z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search wallets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-[#0C2237] border-[#83E9FF4D] text-white h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Wallets */}
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                if (!item.userWallet?.Wallet) return null;
                
                return (
                  <div key={item.id} className="relative group">
                    <SelectItem
                      value={item.userWallet.Wallet.id.toString()}
                      className="focus:bg-[#83E9FF20] focus:text-white cursor-pointer pr-10"
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
                    
                    {/* Delete button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleDelete(e, item)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#f9e370]/20 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#f9e370]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[#83E9FF20] border border-[#83E9FF4D] rounded-lg text-xs text-[#83E9FF]">
          <span className="font-medium">{items.length}</span>
          <span className="text-gray-400">wallet{items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

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
  );
}

