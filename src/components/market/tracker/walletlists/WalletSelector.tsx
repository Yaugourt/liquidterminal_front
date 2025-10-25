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
import { PlusCircle, Search, Wallet, FileUp, Download } from "lucide-react";
import { Wallet as WalletType } from "@/services/market/tracker/types";

interface WalletSelectorProps {
  wallets: WalletType[];
  activeWalletId: number | null;
  onWalletChange: (value: string) => void;
  onAddWallet: () => void;
  onImportCSV?: () => void;
  onExportCSV?: () => void;
}

export function WalletSelector({
  wallets,
  activeWalletId,
  onWalletChange,
  onAddWallet,
  onImportCSV,
  onExportCSV,
}: WalletSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Select Wallet Dropdown */}
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Wallet className="w-4 h-4" />
          <span>Wallet:</span>
        </div>

        <Select
          value={activeWalletId?.toString() || ""}
          onValueChange={onWalletChange}
        >
          <SelectTrigger className="w-full sm:w-[400px] bg-[#0C2237] border-[#83E9FF4D] text-white">
            <div className="flex items-center gap-2 truncate">
              <Wallet className="w-4 h-4 shrink-0 text-[#F9E370]" />
              <SelectValue>
                {activeWallet ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activeWallet.name || "Unnamed Wallet"}</span>
                    <span className="text-xs text-gray-400">
                      ({formatAddress(activeWallet.address)})
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
            {wallets.length > 5 && (
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
            {filteredWallets.length > 0 ? (
              filteredWallets.map((wallet) => (
                <SelectItem
                  key={wallet.id}
                  value={wallet.id.toString()}
                  className="focus:bg-[#83E9FF20] focus:text-white cursor-pointer"
                >
                  <div className="flex flex-col gap-1 w-full py-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Wallet className="w-4 h-4 text-[#F9E370] shrink-0" />
                        <span className="font-medium truncate">
                          {wallet.name || "Unnamed Wallet"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(wallet.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <code className="text-xs text-gray-400 pl-6">
                      {wallet.address}
                    </code>
                  </div>
                </SelectItem>
              ))
            ) : searchQuery ? (
              <div className="p-4 text-center text-sm text-gray-400">
                No wallets found for &quot;{searchQuery}&quot;
              </div>
            ) : null}

            {/* Empty state */}
            {wallets.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">
                No wallets yet. Add your first one!
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Wallet count badge */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[#83E9FF20] border border-[#83E9FF4D] rounded-lg text-xs text-[#83E9FF]">
          <span className="font-medium">{wallets.length}</span>
          <span className="text-gray-400">wallet{wallets.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Export CSV button */}
      {onExportCSV && wallets.length > 0 && (
        <Button
          onClick={onExportCSV}
          size="sm"
          variant="outline"
          className="w-full sm:w-auto border-[#83E9FF4D] text-white hover:bg-[#83E9FF20]"
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
          className="w-full sm:w-auto border-[#83E9FF4D] text-white hover:bg-[#83E9FF20]"
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
  );
}

