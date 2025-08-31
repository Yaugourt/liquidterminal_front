"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Imports supprimés car on utilise le DeleteWalletDialog existant
import { useWallets } from "@/store/use-wallets";
import { useWalletLists } from "@/store/use-wallet-lists";
import { walletActiveMessages } from "@/lib/toast-messages";
import { AddWalletButton } from "../AddWalletDialog";
import { DeleteWalletDialog } from "../DeleteWalletDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WalletListItem } from "@/services/market/tracker/types";

interface WalletListContentProps {
  listId: number;
  onAddWallet?: () => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

// Composant pour un tab wallet de liste sortable
function SortableWalletListItemTab({ 
  item, 
  onDelete 
}: { 
  item: WalletListItem; 
  onDelete: (walletId: number, walletName: string | null, e?: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!item.userWallet || !item.userWallet.Wallet) {
    return null;
  }

  const walletId = item.userWallet.Wallet.id;
  const walletName = item.userWallet.name;
  const addedAt = item.userWallet.addedAt;

  if (!walletId) return null;

  return (
    <TabsTrigger 
      ref={setNodeRef}
      style={style}
      value={walletId.toString()}
      className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg flex items-center group px-3 py-2"
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#FFFFFF0A] rounded"
        >
          <GripVertical className="w-3 h-3 text-[#FFFFFF80]" />
        </div>
        
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
              onClick={(e) => onDelete(walletId, walletName || null, e)}
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
}

export function WalletListContent({ listId, onAddWallet, onDragEnd }: WalletListContentProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const { setActiveWallet, userWallets } = useWallets();
  const { activeListId, activeListItems, loading, error, setActiveList, refreshUserLists, loadListItems } = useWalletLists();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDeleteClick = (walletId: number, walletName: string | null, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
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

  if (validItems.length === 0) {
    return (
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <div className="text-gray-400 px-4">
            No wallets in this list yet
          </div>
        </div>
        <AddWalletButton onClick={onAddWallet || (() => {})} />
      </div>
    );
  }

// Fonction supprimée car remplacée par handleDeleteClick ci-dessus

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-2">
        <Tabs 
          value={selectedWalletId?.toString() || ""} 
          onValueChange={(value) => {
            const walletId = parseInt(value, 10);
            setSelectedWalletId(walletId);
            setActiveWallet(walletId);
            const item = validItems.find(i => i.userWallet?.Wallet?.id === walletId);
            if (item) {
              walletActiveMessages.success(item.userWallet?.name || 'Unnamed Wallet');
            }
          }}
          className="w-auto"
        >
          <TabsList className="gap-3">
            {validItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={validItems.map(item => item.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {validItems.map((item) => (
                    <SortableWalletListItemTab 
                      key={item.id} 
                      item={item} 
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-gray-400 px-4">
                No wallets in this list
              </div>
            )}
          </TabsList>
        </Tabs>
        
        {validItems.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-[#FFFFFF60]">
            <GripVertical className="w-3 h-3" />
            <span>Drag to reorder</span>
          </div>
        )}
      </div>
      
      <AddWalletButton onClick={onAddWallet || (() => {})} />
      
      <DeleteWalletDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        walletToDelete={walletToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
