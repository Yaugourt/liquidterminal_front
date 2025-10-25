"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { useWalletLists } from "@/store/use-wallet-lists";
import { walletActiveMessages } from "@/lib/toast-messages";
import { DeleteWalletDialog } from "../DeleteWalletDialog";
import { WalletListItemSelector } from "./WalletListItemSelector";
import { DragEndEvent } from '@dnd-kit/core';
import { exportWalletsToCSV } from "@/lib/csv-utils";
import { toast } from "sonner";

interface WalletListContentProps {
  listId: number;
  listName?: string;
  onAddWallet?: () => void;
  onImportCSV?: () => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function WalletListContent({ listId, listName, onAddWallet, onImportCSV }: WalletListContentProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const { setActiveWallet, userWallets } = useWallets();
  const { activeListId, activeListItems, loading, error, setActiveList, refreshUserLists, loadListItems } = useWalletLists();

  // Filtrer les items pour ne garder que ceux dont le wallet existe encore
  const validItems = activeListItems.filter(item => {
    if (!item.userWallet || !item.userWallet.Wallet) {
      return false;
    }
    
    // Vérifier si ce wallet existe encore dans userWallets
    const walletStillExists = userWallets.some(uw => 
      uw.walletId === item.userWallet.Wallet.id || 
      (uw.wallet && typeof uw.wallet === 'object' && 'id' in uw.wallet && uw.wallet.id === item.userWallet.Wallet.id)
    );
    
// Log supprimé
    
    return walletStillExists;
  });

  // Définir la liste active quand le composant se monte ou que listId change
  useEffect(() => {
    // Ne charger que si ce n'est pas déjà la liste active
    if (activeListId !== listId) {
      setActiveList(listId);
    }
  }, [listId, setActiveList, activeListId]);

  // Reset selection when changing lists
  useEffect(() => {
    setSelectedWalletId(null);
  }, [listId]);

  // Auto-sélectionner le premier wallet quand les items changent
  useEffect(() => {
    if (validItems.length > 0 && !selectedWalletId) {
      const firstWallet = validItems[0];
      if (firstWallet.userWallet?.Wallet?.id) {
        setSelectedWalletId(firstWallet.userWallet.Wallet.id);
        setActiveWallet(firstWallet.userWallet.Wallet.id);
        walletActiveMessages.success(firstWallet.userWallet.name || 'Unnamed Wallet');
      }
    }
  }, [validItems, selectedWalletId, setActiveWallet]);

  // Nettoyer le wallet actif si la liste active est vide
  useEffect(() => {
    if (activeListId === listId && validItems.length === 0) {
      setActiveWallet(null);
    }
  }, [activeListId, listId, validItems.length, setActiveWallet]);

  const handleDeleteClick = (walletId: number, walletName: string | null) => {
    setWalletToDelete({
      id: walletId,
      name: walletName || 'Unnamed Wallet'
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    // Le DeleteWalletDialog gère déjà la suppression avec removeWallet
    // On n'a rien à faire de plus, le wallet sera supprimé de partout
    setIsDeleteDialogOpen(false);
    setWalletToDelete(null);
    // Assurer la mise à jour immédiate de la liste active
    await refreshUserLists();
    await loadListItems(listId);
  };

  // Handle CSV export for list
  const handleExportList = () => {
    try {
      if (validItems.length === 0) {
        toast.error("No wallets to export");
        return;
      }

      const walletsToExport = validItems.map(item => ({
        address: item.userWallet?.Wallet?.address || "",
        name: item.userWallet?.name || undefined
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = listName 
        ? `${listName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`
        : `wallet_list_${listId}_${timestamp}.csv`;
      
      exportWalletsToCSV(walletsToExport, filename);
      
      toast.success(`Exported ${validItems.length} wallet${validItems.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error exporting list:', error);
      toast.error("Failed to export list");
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
        <Button onClick={() => setActiveList(listId)} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <WalletListItemSelector
        items={validItems}
        selectedWalletId={selectedWalletId}
        onWalletChange={(value) => {
          const walletId = parseInt(value, 10);
          setSelectedWalletId(walletId);
          setActiveWallet(walletId);
          const item = validItems.find(i => i.userWallet?.Wallet?.id === walletId);
          if (item) {
            walletActiveMessages.success(item.userWallet?.name || 'Unnamed Wallet');
          }
        }}
        onAddWallet={() => onAddWallet?.()}
        onDeleteWallet={handleDeleteClick}
        onImportCSV={onImportCSV}
        onExportCSV={handleExportList}
      />
      
      <DeleteWalletDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        walletToDelete={walletToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
