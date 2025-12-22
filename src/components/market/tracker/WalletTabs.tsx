"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWallets } from "@/store/use-wallets";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { AddWalletDialog } from "./AddWalletDialog";
import { DeleteWalletDialog } from "./DeleteWalletDialog";
import { CreateWalletListDialog } from "./walletlists/CreateWalletListDialog";
import { DeleteWalletListDialog } from "./walletlists/DeleteWalletListDialog";
import { WalletListContent } from "./walletlists/WalletListContent";
import { WalletListSelector } from "./walletlists/WalletListSelector";
import { UnifiedWalletSelector, WalletItem } from "./walletlists/UnifiedWalletSelector";
import { useWalletLists } from "@/store/use-wallet-lists";
import { walletReorderMessages, walletActiveMessages, walletEmptyMessages, handleWalletApiError } from "@/lib/toast-messages";
import { DragEndEvent } from '@dnd-kit/core';
import { exportWalletsToCSV } from "@/lib/csv-utils";
import { toast } from "sonner";
import { showXpGainToast } from "@/components/xp";

// Lazy load heavy CSV import dialog - only loaded when user clicks Import
const ImportWalletsCSVDialog = dynamic(
  () => import("./ImportWalletsCSVDialog").then(mod => ({ default: mod.ImportWalletsCSVDialog })),
  { ssr: false }
);

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);
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
    bulkAddWallets,
    bulkDeleteWallets,
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
    } catch {
      // Error handled silently
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

        // Afficher le toast XP si XP accordé
        if (newList.xpGranted && newList.xpGranted > 0) {
          showXpGainToast(newList.xpGranted, "Wallet list created");
        }
      }
    } catch {
      // Error handled silently
    }
  };

  const handleListActionSuccess = async () => {
    try {
      // Recharger les listes après suppression
      await loadUserLists({ limit: 20 });
      // Toujours revenir à "All Wallets" après suppression d'une liste
      setActiveTab("all-wallets");
    } catch {
      // Error handled silently
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

  // Handle CSV import
  const handleImportCSV = async (walletsToImport: Array<{ address: string; name?: string }>) => {
    try {
      const listId = activeTab !== "all-wallets" ? Number(activeTab) : undefined;
      await bulkAddWallets(walletsToImport, listId);
      await handleWalletActionSuccess();
    } catch {
      // Error handled by bulkAddWallets
    }
  };

  // Handle CSV export for "All Wallets"
  const handleExportAllWallets = () => {
    try {
      if (wallets.length === 0) {
        toast.error("No wallets to export");
        return;
      }

      const walletsToExport = wallets.map(w => ({
        address: w.address,
        name: w.name || undefined
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      exportWalletsToCSV(walletsToExport, `all_wallets_${timestamp}.csv`);

      toast.success(`Exported ${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error("Failed to export wallets");
    }
  };

  // Handle individual wallet delete
  const handleDeleteWalletClick = (walletId: number, walletName: string | null) => {
    setWalletToDelete({ id: walletId, name: walletName || 'Unnamed Wallet' });
    setIsDeleteWalletOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = async (walletIds: number[]) => {
    try {
      await bulkDeleteWallets(walletIds);
      await handleWalletActionSuccess();
    } catch {
      // Error already handled by store
    }
  };



  return (
    <>
      <WalletListSelector
        activeTab={activeTab}
        userLists={userLists}
        onTabChange={handleTabChange}
        onCreateList={() => setIsCreateListOpen(true)}
        onDeleteList={handleDeleteListClick}
      />

      {/* Affichage conditionnel selon l'onglet actif */}
      {activeTab === "all-wallets" && (
        <div className="mt-4">
          {/* Separator between list tabs and wallet tabs */}
          <div className="w-full h-px bg-white/5 mb-4" />
          <UnifiedWalletSelector
            items={wallets.map((w): WalletItem => ({
              id: w.id,
              name: w.name,
              address: w.address,
              addedAt: w.addedAt,
            }))}
            selectedId={activeWalletId}
            onWalletChange={(value) => {
              const walletId = parseInt(value, 10);
              setActiveWallet(walletId);
              const wallet = wallets.find(w => w.id === walletId);
              if (wallet) {
                walletActiveMessages.success(wallet.name || 'Unnamed Wallet');
              }
            }}
            onAddWallet={() => setIsAddWalletOpen(true)}
            onDeleteWallet={handleDeleteWalletClick}
            onBulkDelete={handleBulkDelete}
            onImportCSV={() => setIsImportCSVOpen(true)}
            onExportCSV={handleExportAllWallets}
          />
        </div>
      )}

      {activeTab !== "all-wallets" && (
        <div className="mt-4">
          {/* Separator between list tabs and wallet tabs */}
          <div className="w-full h-px bg-white/5 mb-4" />
          {getActiveListInfo() && (
            <WalletListContent
              key={`list-${getActiveListInfo()!.id}-${listContentKey}`}
              listId={getActiveListInfo()!.id}
              listName={getActiveListInfo()!.name}
              onAddWallet={() => setIsAddWalletOpen(true)}
              onBulkDelete={handleBulkDelete}
              onImportCSV={() => setIsImportCSVOpen(true)}
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

      <ImportWalletsCSVDialog
        isOpen={isImportCSVOpen}
        onOpenChange={setIsImportCSVOpen}
        onImport={handleImportCSV}
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
