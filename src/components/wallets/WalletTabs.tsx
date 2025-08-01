"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, GripVertical } from "lucide-react";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { AddWalletDialog, AddWalletButton } from "./AddWalletDialog";
import { DeleteWalletDialog } from "./DeleteWalletDialog";
import { walletReorderMessages, walletActiveMessages, walletEmptyMessages, handleWalletApiError } from "@/lib/wallet-toast-messages";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isDeleteWalletOpen, setIsDeleteWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const { 
    wallets,
    activeWalletId, 
    error: storeError,
    initialize, 
    setActiveWallet,
    reorderWallets,
    reloadWallets,
  } = useWallets();
  const { privyUser } = useAuthContext();
  const { getAccessToken } = usePrivy();

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

  // Fetch wallets when privyUser changes
  useEffect(() => {
    const fetchWallets = async () => {
      if (privyUser?.id) {
        try {
          const username = privyUser.twitter?.username || privyUser.farcaster?.username || privyUser.github?.username;
          if (!username) {
            throw new Error("No username available");
          }

          const token = await getAccessToken();
          if (!token) {
            throw new Error("No access token available");
          }

          await initialize({
            privyUserId: privyUser.id,
            username,
            privyToken: token
          });
        } catch (err) {
          // Error handled silently
          handleWalletApiError(err);
        }
      }
    };

    fetchWallets();
  }, [privyUser?.id, privyUser?.twitter?.username, privyUser?.farcaster?.username, privyUser?.github?.username, initialize, getAccessToken]);

  // Log when wallets change
  useEffect(() => {
    // Show empty state message if no wallets
    if (wallets.length === 0) {
      walletEmptyMessages.noWallets();
    }
  }, [wallets]); // walletEmptyMessages is stable, no need to include it

  // Log when global error changes
  useEffect(() => {
    if (storeError) {
      // Error handled silently
    }
  }, [storeError]);

  const handleDeleteClick = (id: number, walletName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de sélectionner l'onglet
    setWalletToDelete({ id, name: walletName || "Sans nom" });
    setIsDeleteWalletOpen(true);
  };

  const handleWalletActionSuccess = async () => {
    // Attendre un peu pour laisser l'API se synchroniser
    await new Promise(resolve => setTimeout(resolve, 500));
    await reloadWallets();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = wallets.findIndex(wallet => wallet.id === active.id);
      const newIndex = wallets.findIndex(wallet => wallet.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        try {
          const newOrder = arrayMove(wallets, oldIndex, newIndex);
          const newOrderIds = newOrder.map(wallet => wallet.id);
          reorderWallets(newOrderIds);
          walletReorderMessages.success();
        } catch {
          walletReorderMessages.error();
        }
      }
    }
  };

  // Convertir l'ID actif en chaîne pour Radix UI
  const activeTabValue = activeWalletId?.toString() || "";
  
  // Gérer le changement d'onglet en convertissant la chaîne en nombre
  const handleTabChange = (value: string) => {
    try {
      const walletId = parseInt(value, 10);
      setActiveWallet(walletId);
      const wallet = wallets.find(w => w.id === walletId);
      if (wallet) {
        walletActiveMessages.success(wallet.name || 'Unnamed Wallet');
      }
    } catch {
      walletActiveMessages.error();
    }
  };

  // Sortable wallet tab component
  function SortableWalletTab({ wallet }: { wallet: { id: number; name?: string; addedAt: Date } }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: wallet.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TabsTrigger 
        ref={setNodeRef}
        style={style}
        value={wallet.id.toString()}
        className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg flex items-center group"
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
            <span className="font-medium text-white">{wallet.name || 'Unnamed Wallet'}</span>
            <span className="text-xs text-white">
              Added: {new Date(wallet.addedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={(e) => handleDeleteClick(wallet.id, wallet.name, e)}
                className="ml-2 p-1 rounded-full hover:bg-[#f9e370]/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-[#f9e370]" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Supprimer ce wallet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsTrigger>
    );
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <Tabs 
            value={activeTabValue} 
            onValueChange={handleTabChange}
            className="w-auto"
          >
            <TabsList className="gap-3">
              {wallets.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={wallets.map(wallet => wallet.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {wallets.map((wallet) => (
                      <SortableWalletTab key={wallet.id} wallet={wallet} />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-gray-400 px-4">
                  No wallets added
                </div>
              )}
            </TabsList>
          </Tabs>
          
          {wallets.length > 1 && (
            <div className="flex items-center gap-1 text-xs text-[#FFFFFF60]">
              <GripVertical className="w-3 h-3" />
              <span>Drag to reorder</span>
            </div>
          )}
        </div>
        
        <AddWalletButton onClick={() => setIsAddWalletOpen(true)} />
      </div>

      {/* Dialogs */}
      <AddWalletDialog 
        isOpen={isAddWalletOpen} 
        onOpenChange={setIsAddWalletOpen}
        onSuccess={handleWalletActionSuccess}
      />

      <DeleteWalletDialog
        isOpen={isDeleteWalletOpen}
        onOpenChange={setIsDeleteWalletOpen}
        walletToDelete={walletToDelete}
        onSuccess={handleWalletActionSuccess}
      />
    </>
  );
}
