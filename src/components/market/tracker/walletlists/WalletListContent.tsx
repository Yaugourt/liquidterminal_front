"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { getWalletListItems, removeWalletFromList } from "@/services/market/tracker/walletlist.service";
import { WalletListItem } from "@/services/market/tracker/types";
import { useWallets } from "@/store/use-wallets";
import { walletActiveMessages } from "@/lib/toast-messages";
import { AddWalletButton } from "../AddWalletDialog";

interface WalletListContentProps {
  listId: number;
  listName: string;
  onAddWallet?: () => void;
}

export function WalletListContent({ listId, listName, onAddWallet }: WalletListContentProps) {
  const [items, setItems] = useState<WalletListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  
  const { setActiveWallet } = useWallets();

  // Charger les items de la liste
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWalletListItems(listId);
      const walletItems = response.data || [];
      setItems(walletItems);
      
      // Sélectionner automatiquement le premier wallet de la liste
      if (walletItems.length > 0 && !selectedWalletId) {
        const firstWallet = walletItems[0];
        if (firstWallet.userWallet?.Wallet?.id) {
          setSelectedWalletId(firstWallet.userWallet.Wallet.id);
          setActiveWallet(firstWallet.userWallet.Wallet.id);
          walletActiveMessages.success(firstWallet.userWallet.name || 'Unnamed Wallet');
        }
      }
    } catch (err) {
      console.error('Error loading wallet list items:', err);
      setError('Failed to load wallet list items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [listId]);

  // Reset selection when changing lists
  useEffect(() => {
    setSelectedWalletId(null);
  }, [listId]);

  const handleRemoveWallet = async (item: WalletListItem) => {
    if (!window.confirm(`Remove wallet from "${listName}"?`)) {
      return;
    }

    try {
      await removeWalletFromList(item.id);
      toast.success('Wallet removed from list');
      loadItems(); // Recharger la liste
    } catch (err) {
      console.error('Error removing wallet from list:', err);
      toast.error('Failed to remove wallet from list');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-[#051728] border border-[#83E9FF4D] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Button onClick={loadItems} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 text-sm">No wallets in this list yet</p>
        <p className="text-gray-500 text-xs mt-1">Use the &quot;Add Wallet&quot; button to add wallets to this list</p>
      </div>
    );
  }

  const handleDeleteClick = (walletId: number, walletName: string | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Remove "${walletName || 'Unnamed Wallet'}" from "${listName}"?`)) {
      return;
    }
    
    const item = items.find(i => i.userWallet?.Wallet?.id === walletId);
    if (item) {
      handleRemoveWallet(item);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-2">
        <Tabs 
          value={selectedWalletId?.toString() || ""} 
          onValueChange={(value) => {
            const walletId = parseInt(value, 10);
            setSelectedWalletId(walletId);
            setActiveWallet(walletId);
            const item = items.find(i => i.userWallet?.Wallet?.id === walletId);
            if (item) {
              walletActiveMessages.success(item.userWallet?.name || 'Unnamed Wallet');
            }
          }}
          className="w-auto"
        >
          <TabsList className="gap-3">
            {items.length > 0 ? (
              items.map((item) => {
                const walletId = item.userWallet?.Wallet?.id;
                const walletName = item.userWallet?.name;
                const addedAt = item.userWallet?.addedAt;
                
                if (!walletId) return null;
                
                return (
                  <TabsTrigger 
                    key={item.id}
                    value={walletId.toString()}
                    className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg flex items-center group px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-white">{walletName || 'Unnamed Wallet'}</span>
                        <span className="text-xs text-white">
                          {addedAt ? `Added: ${new Date(addedAt).toLocaleDateString()}` : ''}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-gray-300 bg-gray-600/30 px-1 rounded">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={(e) => handleDeleteClick(walletId, walletName, e)}
                            className="ml-2 p-1 rounded-full hover:bg-[#f9e370]/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#f9e370]" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TabsTrigger>
                );
              })
            ) : (
              <div className="text-gray-400 px-4">
                No wallets in this list
              </div>
            )}
          </TabsList>
        </Tabs>
      </div>
      
      <AddWalletButton onClick={onAddWallet || (() => {})} />
    </div>
  );
}
