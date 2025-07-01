"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth.context";
import { usePrivy } from "@privy-io/react-auth";
import { AddWalletDialog, AddWalletButton } from "./AddWalletDialog";
import { DeleteWalletDialog } from "./DeleteWalletDialog";

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isDeleteWalletOpen, setIsDeleteWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    wallets,
    activeWalletId, 
    loading: storeLoading,
    error: storeError,
    initialize, 
    setActiveWallet,
  } = useWallets();
  const { privyUser } = useAuthContext();
  const { getAccessToken } = usePrivy();

  // Fetch wallets when privyUser changes
  useEffect(() => {
    const fetchWallets = async () => {
      if (privyUser?.id) {
        try {
          setIsLoading(true);
          setError(null);

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
          console.error("Error fetching wallets:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch wallets. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchWallets();
  }, [privyUser?.id, initialize, getAccessToken]);

  // Log when wallets change
  useEffect(() => {
    // Wallets updated
  }, [wallets]);

  // Log when global error changes
  useEffect(() => {
    if (storeError) {
      console.error("Error in wallet store:", storeError);
      setError(storeError);
    }
  }, [storeError]);

  const handleDeleteClick = (id: number, walletName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de sélectionner l'onglet
    setWalletToDelete({ id, name: walletName || "Sans nom" });
    setIsDeleteWalletOpen(true);
  };

  const handleWalletActionSuccess = async () => {
    // Reload wallets after successful add/delete
    if (privyUser?.id) {
      const username = privyUser.twitter?.username || privyUser.farcaster?.username || privyUser.github?.username;
      const token = await getAccessToken();
      
      if (username && token) {
        await initialize({
          privyUserId: privyUser.id,
          username,
          privyToken: token
        });
      }
    }
  };

  // Convertir l'ID actif en chaîne pour Radix UI
  const activeTabValue = activeWalletId?.toString() || "";
  
  // Gérer le changement d'onglet en convertissant la chaîne en nombre
  const handleTabChange = (value: string) => {
    setActiveWallet(parseInt(value, 10));
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Tabs 
          value={activeTabValue} 
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList className="gap-3">
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <TabsTrigger 
                  key={wallet.id} 
                  value={wallet.id.toString()}
                  className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg flex items-center group"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{wallet.name || 'Unnamed Wallet'}</span>
                    <span className="text-xs text-gray-400">
                      Added: {new Date(wallet.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={(e) => handleDeleteClick(wallet.id, wallet.name, e)}
                          className="ml-2 p-1 rounded-full hover:bg-[#FF5252]/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#FF5252]" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Supprimer ce wallet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
              ))
            ) : (
              <div className="text-gray-400 px-4">Aucun wallet ajouté</div>
            )}
          </TabsList>
        </Tabs>
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
