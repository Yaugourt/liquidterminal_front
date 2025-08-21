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
import { CreateWalletListDialog } from "./walletlists/CreateWalletListDialog";

import { WalletListContent } from "./walletlists/WalletListContent";
import { useWalletLists } from "@/store/use-wallet-lists";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletReorderMessages, walletActiveMessages, walletEmptyMessages, handleWalletApiError } from "@/lib/toast-messages";
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
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"all-wallets" | number>("all-wallets"); // "all-wallets" ou ID de liste
  const [listContentKey, setListContentKey] = useState(0); // Pour forcer le rechargement du contenu
  
  const { 
    wallets,
    activeWalletId, 
    error: storeError,
    initialize, 
    setActiveWallet,
    reorderWallets,
  } = useWallets();
  
  const { userLists, loadUserLists } = useWalletLists();
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
    try {
      // Forcer un rechargement complet depuis le serveur
      await new Promise(resolve => setTimeout(resolve, 200));
      await initialize({
        privyUserId: privyUser!.id,
        username: privyUser!.twitter?.username || privyUser!.farcaster?.username || privyUser!.github?.username || '',
        privyToken: await getAccessToken() || ''
      });
      // Si on est sur un onglet de liste, forcer le rechargement du contenu
      if (activeTab !== "all-wallets") {
        setListContentKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error reloading wallets:', error);
      // Forcer un rechargement de la page en cas d'erreur
      window.location.reload();
    }
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

  // Charger les listes au montage
  useEffect(() => {
    if (privyUser?.id) {
      loadUserLists({ limit: 20 });
    }
  }, [privyUser?.id, loadUserLists]);

  // Debug temporaire
  console.log('WalletTabs userLists:', userLists?.map(l => ({ id: l?.id, name: l?.name })));

  // Gérer le changement d'onglet
  const handleTabChange = (value: string) => {
    if (value === "all-wallets") {
      setActiveTab("all-wallets");
    } else {
      // C'est un ID de liste
      const listId = parseInt(value, 10);
      setActiveTab(listId);
      // Force le rechargement du contenu de la liste pour déclencher la sélection automatique
      setListContentKey(prev => prev + 1);
    }
  };

  // Gérer le succès de création de liste
  const handleCreateListSuccess = () => {
    setIsCreateListOpen(false);
    loadUserLists({ limit: 20 }); // Recharger les listes
  };



  // Obtenir les infos de la liste active
  const getActiveListInfo = () => {
    if (typeof activeTab === "number") {
      const list = userLists.find(l => l.id === activeTab);
      return list ? { id: list.id, name: list.name } : null;
    }
    return null;
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
            value={activeTab.toString()} 
            onValueChange={handleTabChange}
            className="w-auto"
          >
            <TabsList className="gap-3">
              {/* Tab "All Wallets" */}
              <TabsTrigger 
                value="all-wallets"
                className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg text-white font-medium"
              >
                All Wallets
              </TabsTrigger>
              
              {/* Tabs des listes */}
              {userLists.filter(list => list?.id).map((list, index) => (
                <TabsTrigger 
                  key={`list-${list.id || index}`}
                  value={(list.id || index).toString()}
                  className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg text-white font-medium"
                >
                  {list.name || 'Unnamed List'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Bouton Create List sur la même ligne que les tabs */}
          <Button 
            onClick={() => setIsCreateListOpen(true)}
            className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Create List
          </Button>
        </div>
      </div>
      
      {/* Affichage conditionnel selon l'onglet actif */}
      {activeTab === "all-wallets" && (
        <div className="mt-4">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <Tabs 
                value={activeWalletId?.toString() || ""} 
                onValueChange={(value) => {
                  const walletId = parseInt(value, 10);
                  setActiveWallet(walletId);
                  const wallet = wallets.find(w => w.id === walletId);
                  if (wallet) {
                    walletActiveMessages.success(wallet.name || 'Unnamed Wallet');
                  }
                }}
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
        </div>
      )}
      
      {activeTab !== "all-wallets" && (
        <div className="mt-4">
          {getActiveListInfo() && (
            <WalletListContent 
              key={`list-${getActiveListInfo()!.id}-${listContentKey}`}
              listId={getActiveListInfo()!.id}
              listName={getActiveListInfo()!.name}
              onAddWallet={() => setIsAddWalletOpen(true)}
            />
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddWalletDialog 
        isOpen={isAddWalletOpen} 
        onOpenChange={setIsAddWalletOpen}
        onSuccess={handleWalletActionSuccess}
        walletListId={activeTab !== "all-wallets" ? Number(activeTab) : undefined}
        walletListName={activeTab !== "all-wallets" ? getActiveListInfo()?.name : undefined}
      />

      <DeleteWalletDialog
        isOpen={isDeleteWalletOpen}
        onOpenChange={setIsDeleteWalletOpen}
        walletToDelete={walletToDelete}
        onSuccess={handleWalletActionSuccess}
      />

      <CreateWalletListDialog
        isOpen={isCreateListOpen}
        onOpenChange={setIsCreateListOpen}
        onSuccess={handleCreateListSuccess}
      />


    </>
  );
}
