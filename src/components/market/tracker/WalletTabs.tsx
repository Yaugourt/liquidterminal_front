"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@/store/use-wallets";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { AddWalletDialog } from "./AddWalletDialog";
import { DeleteWalletDialog } from "./DeleteWalletDialog";
import { CreateWalletListDialog } from "./walletlists/CreateWalletListDialog";
import { DeleteWalletListDialog } from "./walletlists/DeleteWalletListDialog";
import { WalletListContent } from "./walletlists/WalletListContent";
import { useWalletLists } from "@/store/use-wallet-lists";
import { walletReorderMessages, walletActiveMessages, walletEmptyMessages, handleWalletApiError } from "@/lib/toast-messages";
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { WalletListTabs, WalletContentTabs } from "./WalletTabsComponents";

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isDeleteWalletOpen, setIsDeleteWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [isDeleteListOpen, setIsDeleteListOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: number; name: string } | null>(null);

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
  
  const { userLists, loadUserLists, createList, setActiveList, refreshUserLists, loadListItems, activeListItems } = useWalletLists();
  

  const { privyUser } = useAuthContext();
  const { getAccessToken } = usePrivy();

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

  const handleDeleteListClick = (id: number, listName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de sélectionner l'onglet
    e.preventDefault(); // Empêcher complètement le comportement par défaut
    setListToDelete({ id, name: listName });
    setIsDeleteListOpen(true);
  };

  const handleWalletActionSuccess = async () => {
    try {
      // Recharger les wallets
      await initialize({
        privyUserId: privyUser!.id,
        username: privyUser!.twitter?.username || privyUser!.farcaster?.username || privyUser!.github?.username || '',
        privyToken: await getAccessToken() || ''
      });

      // Rafraîchir les listes et les items de la liste active si besoin
      await refreshUserLists();
      if (typeof activeTab === 'number') {
        await loadListItems(activeTab);
      }
    } catch (error) {
      console.error('Error reloading wallets:', error);
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

  const handleListDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Pour les listes, on utilise les IDs des items de la liste
      const currentListItems = activeListItems || [];
      const oldIndex = currentListItems.findIndex((item: { id: number }) => item.id === active.id);
      const newIndex = currentListItems.findIndex((item: { id: number }) => item.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        try {
   
          walletReorderMessages.success();
        } catch {
          walletReorderMessages.error();
        }
      }
    }
  };

  // Charger les listes au montage
  // Charger les listes au montage et quand on change d'onglet
  useEffect(() => {
    if (privyUser?.id) {
      loadUserLists({ limit: 20 }); // Load lists on mount
    }
  }, [privyUser?.id, loadUserLists]);

  // Pas besoin de recharger à chaque changement d'onglet - le store gère la sync



  // Gérer le changement d'onglet
  const handleTabChange = (value: string) => {
    if (value === "all-wallets") {
      setActiveTab("all-wallets");
      // Quand on revient sur all-wallets, ne pas forcer tout de suite; laisser la sélection user
    } else {
      // C'est un ID de liste
      const listId = parseInt(value, 10);
      setActiveTab(listId);
      
      // Définir la liste active dans le store
      setActiveList(listId);
      
      // Force le rechargement du contenu de la liste pour déclencher la sélection automatique
      setListContentKey(prev => prev + 1);
      // Ne pas faire de setActiveWallet ici pour éviter les boucles; géré dans WalletListContent
    }
  };

  // Gérer le succès de création de liste
  const handleCreateListSuccess = async (listData: { name: string; description?: string; isPublic?: boolean }) => {
    try {
      const newList = await createList(listData);
      if (newList) {
        // Rafraîchir pour s'assurer que les tabs obtiennent l'état le plus récent
        await refreshUserLists();
        // Garder l'onglet actuel actif, ne pas changer vers la nouvelle liste
        setIsCreateListOpen(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleListActionSuccess = async () => {
    try {
      // Recharger les listes après suppression
      await loadUserLists({ limit: 20 });
      // Toujours revenir à "All Wallets" après suppression d'une liste
      setActiveTab("all-wallets");
    } catch (error) {
      console.error('Error reloading lists:', error);
    }
  };

  // Obtenir les infos de la liste active
  const getActiveListInfo = () => {
    if (typeof activeTab === "number") {
      const list = userLists.find(l => l.id === activeTab);
      return list ? { id: list.id, name: list.name } : null;
    }
    return null;
  };



  return (
    <>
      <WalletListTabs
        activeTab={activeTab}
        userLists={userLists}
        onTabChange={handleTabChange}
        onCreateList={() => setIsCreateListOpen(true)}
        onDeleteList={handleDeleteListClick}
      />
      
      {/* Affichage conditionnel selon l'onglet actif */}
      {activeTab === "all-wallets" && (
        <div className="mt-4">
          {/* Séparateur entre les tabs des listes et les tabs des wallets */}
          <div className="w-full h-px bg-[#83E9FF4D] mb-4" />
          <WalletContentTabs
            wallets={wallets}
            activeWalletId={activeWalletId}
            onWalletChange={(value) => {
              const walletId = parseInt(value, 10);
              setActiveWallet(walletId);
              const wallet = wallets.find(w => w.id === walletId);
              if (wallet) {
                walletActiveMessages.success(wallet.name || 'Unnamed Wallet');
              }
            }}
            onDragEnd={handleDragEnd}
            onAddWallet={() => setIsAddWalletOpen(true)}
            onDeleteWallet={handleDeleteClick}
          />
        </div>
      )}
      
      {activeTab !== "all-wallets" && (
        <div className="mt-4">
          {/* Séparateur entre les tabs des listes et les tabs des wallets */}
          <div className="w-full h-px bg-[#83E9FF4D] mb-4" />
          {getActiveListInfo() && (
            <WalletListContent 
              key={`list-${getActiveListInfo()!.id}-${listContentKey}`}
              listId={getActiveListInfo()!.id}
              onAddWallet={() => setIsAddWalletOpen(true)}
              onDragEnd={handleListDragEnd}
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

      <DeleteWalletListDialog
        isOpen={isDeleteListOpen}
        onOpenChange={setIsDeleteListOpen}
        listToDelete={listToDelete}
        onSuccess={handleListActionSuccess}
      />

    </>
  );
}
