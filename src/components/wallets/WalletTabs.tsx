"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth.context";

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isDeleteWalletOpen, setIsDeleteWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: number; name: string } | null>(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    wallets, 
    
    activeWalletId, 
    loading: storeLoading,
    error: storeError,
    initialize, 
    addWallet, 
    setActiveWallet, 
    removeWallet, 

  } = useWallets();
  const { user, privyUser } = useAuthContext();

  // Fetch wallets when privyUser changes
  useEffect(() => {
    const fetchWallets = async () => {
      if (privyUser?.id) {
        try {
          console.log("Fetching wallets for user:", privyUser.id);
          setIsLoading(true);
          setError(null);
          await initialize(privyUser.id);
          console.log("Wallets fetched successfully:", wallets);
        } catch (err) {
          console.error("Error fetching wallets:", err);
          setError("Failed to fetch wallets. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("No privyUser.id available, skipping wallet fetch");
      }
    };

    fetchWallets();
  }, [privyUser?.id, initialize]);

  // Log when wallets change
  useEffect(() => {
    console.log("Wallets updated:", wallets);
  }, [wallets]);

  // Log when global error changes
  useEffect(() => {
    if (storeError) {
      console.error("Error in wallet store:", storeError);
      setError(storeError);
    }
  }, [storeError]);

  const handleAddWallet = async () => {
    if (!address || !privyUser?.id) {
      setError("Please enter a wallet address");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Ensure name is not undefined
      const walletName = name.trim() || undefined;
      console.log("Adding wallet with name:", walletName);
      
      // Ajouter le wallet
      const result = await addWallet(address, walletName, privyUser.id);
      
      if (!result) {
        throw new Error("Failed to add wallet");
      }
      
      // Clear form and close dialog
      setAddress("");
      setName("");
      setIsAddWalletOpen(false);
      
      // Forcer un rechargement des wallets
      if (privyUser?.id) {
        await initialize(privyUser.id);
      }
    } catch (err: any) {
      console.error("Error adding wallet:", err);
      
      // Handle specific error cases
      if (err.response) {
        switch (err.response.status) {
          case 409:
            setError("Ce wallet est déjà associé à votre compte.");
            break;
          case 400:
            setError("Adresse de wallet invalide.");
            break;
          default:
            setError(err.message || "Une erreur est survenue lors de l'ajout du wallet.");
        }
      } else {
        setError(err.message || "Une erreur est survenue lors de l'ajout du wallet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number, walletName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de sélectionner l'onglet
    setWalletToDelete({ id, name: walletName || "Sans nom" });
    setIsDeleteWalletOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (walletToDelete) {
      try {
        setIsLoading(true);
        setError(null);
        await removeWallet(walletToDelete.id);
        setIsDeleteWalletOpen(false);
        setWalletToDelete(null);
        
        // Forcer un rechargement des wallets
        if (privyUser?.id) {
          await initialize(privyUser.id);
        }
      } catch (err: any) {
        console.error("Error deleting wallet:", err);
        
        // Handle specific error cases
        if (err.response) {
          switch (err.response.status) {
            case 404:
              setError("Wallet not found.");
              break;
            case 403:
              setError("You don't have permission to delete this wallet.");
              break;
            default:
              setError(err.message || "An error occurred while deleting the wallet.");
          }
        } else {
          setError(err.message || "An error occurred while deleting the wallet.");
        }
      } finally {
        setIsLoading(false);
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
        <Button 
          variant="default" 
          className="ml-auto bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90"
          onClick={() => setIsAddWalletOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un wallet
        </Button>
      </div>

      <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
        <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau wallet</DialogTitle>
            <DialogDescription className="text-[#FFFFFF99]">
              Entrez l'adresse de votre wallet Ethereum et un nom optionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm text-[#FFFFFF99]">
                Adresse du wallet (obligatoire)
              </label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="bg-[#0C2237] border-[#83E9FF4D]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-[#FFFFFF99]">
                Nom du wallet (facultatif)
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon Wallet"
                className="bg-[#0C2237] border-[#83E9FF4D]"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddWalletOpen(false)}
              className="border-[#83E9FF4D] text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleAddWallet}
              disabled={isLoading}
              className="bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90"
            >
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteWalletOpen} onOpenChange={setIsDeleteWalletOpen}>
        <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
          <DialogHeader>
            <DialogTitle>Supprimer le wallet</DialogTitle>
            <DialogDescription className="text-[#FFFFFF99]">
              Êtes-vous sûr de vouloir supprimer ce wallet ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3 text-[#FF5252]">
            <AlertCircle className="h-5 w-5" />
            <p>Cette action est irréversible. Le wallet &quot;{walletToDelete?.name}&quot; sera supprimé définitivement.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteWalletOpen(false)}
              className="border-[#83E9FF4D] text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-[#FF5252] text-white hover:bg-[#FF5252]/90"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
