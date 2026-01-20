"use client";

import { useState, useMemo, memo, useCallback } from "react";
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

// Interface unifiée pour les items wallet
export interface WalletItem {
    id: number;
    name: string | null;
    address: string;
    addedAt: string | Date;
    notes?: string;
}

interface UnifiedWalletSelectorProps {
    items: WalletItem[];
    selectedId: number | null;
    onWalletChange: (value: string) => void;
    onAddWallet: () => void;
    onDeleteWallet: (walletId: number, walletName: string | null) => void;
    onBulkDelete: (walletIds: number[]) => Promise<void>;
    onImportCSV?: () => void;
    onExportCSV?: () => void;
    emptyMessage?: string;
}

export const UnifiedWalletSelector = memo(function UnifiedWalletSelector({
    items,
    selectedId,
    onWalletChange,
    onAddWallet,
    onDeleteWallet,
    onBulkDelete,
    onImportCSV,
    onExportCSV,
    emptyMessage = "No wallets yet. Add your first one!",
}: UnifiedWalletSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedWalletIds, setSelectedWalletIds] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(
            (item) =>
                item.name?.toLowerCase().includes(query) ||
                item.address?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    // Get active wallet info
    const activeItem = useMemo(() => {
        return items.find((item) => item.id === selectedId);
    }, [selectedId, items]);

    // Format address for display
    const formatAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
    };

    // Selection handlers
    const toggleWalletSelection = useCallback((walletId: number) => {
        setSelectedWalletIds((prev) => {
            const next = new Set(prev);
            if (next.has(walletId)) {
                next.delete(walletId);
            } else {
                next.add(walletId);
            }
            return next;
        });
    }, []);

    const handleBulkDeleteClick = useCallback(() => {
        if (selectedWalletIds.size === 0) return;
        setIsDeleteDialogOpen(true);
    }, [selectedWalletIds.size]);

    const handleConfirmBulkDelete = useCallback(async () => {
        try {
            await onBulkDelete(Array.from(selectedWalletIds));
            setSelectedWalletIds(new Set());
        } catch {
            // Error handled by onBulkDelete
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }, [onBulkDelete, selectedWalletIds]);

    return (
        <>
            <div className="flex flex-col gap-3">
                {/* Main Controls Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Select Wallet Dropdown */}
                    <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Wallet className="w-4 h-4" />
                            <span>Wallet:</span>
                        </div>

                        <Select
                            value={selectedId?.toString() || ""}
                            onValueChange={onWalletChange}
                        >
                            <SelectTrigger className="w-full sm:w-[400px] bg-brand-dark border-border-subtle text-white rounded-lg hover:border-border-hover transition-all">
                                <div className="flex items-center gap-2 truncate">
                                    <Wallet className="w-4 h-4 shrink-0 text-brand-accent" />
                                    <SelectValue>
                                        {activeItem ? (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{activeItem.name || "Unnamed Wallet"}</span>
                                                <span className="text-xs text-text-muted">
                                                    ({formatAddress(activeItem.address)})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted">Select a wallet...</span>
                                        )}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>

                            <SelectContent className="bg-brand-secondary border-border-hover text-white max-h-[400px] rounded-xl shadow-xl shadow-black/20">
                                {/* Search input */}
                                {items.length > 5 && (
                                    <div className="p-2 sticky top-0 bg-brand-secondary z-10 border-b border-border-subtle">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                            <Input
                                                placeholder="Search wallets..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 bg-brand-dark border-border-subtle text-white h-8 rounded-lg"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Wallets with Checkboxes */}
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <div className="flex items-center gap-2 px-2 hover-subtle rounded-lg">
                                                {/* Checkbox */}
                                                <Checkbox
                                                    checked={selectedWalletIds.has(item.id)}
                                                    onCheckedChange={() => toggleWalletSelection(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="border-white/20 data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent"
                                                />

                                                {/* Wallet Item */}
                                                <SelectItem
                                                    value={item.id.toString()}
                                                    className="flex-1 focus:bg-transparent cursor-pointer border-none pr-10"
                                                >
                                                    <div className="flex flex-col gap-1 w-full py-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Wallet className="w-4 h-4 text-brand-accent shrink-0" />
                                                                <span className="font-medium truncate">
                                                                    {item.name || "Unnamed Wallet"}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-text-muted shrink-0">
                                                                {new Date(item.addedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <code className="text-xs text-text-muted pl-6 font-mono">
                                                            {item.address}
                                                        </code>
                                                        {item.notes && (
                                                            <p className="text-xs text-text-muted italic pl-6">
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteWallet(item.id, item.name);
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
                                    <div className="p-4 text-center text-sm text-text-muted">
                                        No wallets found for &quot;{searchQuery}&quot;
                                    </div>
                                ) : null}

                                {/* Empty state */}
                                {items.length === 0 && (
                                    <div className="p-4 text-center text-sm text-text-muted">
                                        {emptyMessage}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>

                        {/* Wallet count badge */}
                        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-brand-accent/10 border border-border-subtle rounded-lg text-xs text-brand-accent">
                            <span className="font-medium">{items.length}</span>
                            <span className="text-text-muted">wallet{items.length !== 1 ? "s" : ""}</span>
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
                    {onExportCSV && items.length > 0 && (
                        <Button
                            onClick={onExportCSV}
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto border-border-subtle text-white hover:text-white hover:bg-white/5 rounded-lg"
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
                            className="w-full sm:w-auto border-border-subtle text-white hover:text-white hover:bg-white/5 rounded-lg"
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
                <AlertDialogContent className="bg-brand-secondary border-border-hover rounded-2xl shadow-xl shadow-black/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Multiple Wallets</AlertDialogTitle>
                        <AlertDialogDescription className="text-text-secondary">
                            Are you sure you want to delete {selectedWalletIds.size} wallet
                            {selectedWalletIds.size !== 1 ? "s" : ""}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border-subtle text-white hover:bg-white/5 rounded-lg">
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
});

UnifiedWalletSelector.displayName = 'UnifiedWalletSelector';
