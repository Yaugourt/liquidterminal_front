"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function WalletTabs() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isDeleteWalletOpen, setIsDeleteWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{ id: string; name: string } | null>(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { wallets, activeWalletId, addWallet, setActiveWallet, removeWallet } = useWallets();

  const handleAddWallet = async () => {
    if (!address) {
      setError("Address is required");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await addWallet(address, name || undefined);
      setAddress("");
      setName("");
      setIsAddWalletOpen(false);
    } catch (err: unknown) {
      setError("Failed to add wallet. Please check the address and try again.");
      console.error("Error adding wallet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, walletName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de sélectionner l'onglet
    setWalletToDelete({ id, name: walletName || "Sans nom" });
    setIsDeleteWalletOpen(true);
  };

  const handleConfirmDelete = () => {
    if (walletToDelete) {
      removeWallet(walletToDelete.id);
      setIsDeleteWalletOpen(false);
      setWalletToDelete(null);
    }
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Tabs 
          value={activeWalletId || undefined} 
          onValueChange={setActiveWallet}
          className="w-auto"
        >
          <TabsList className="gap-3">
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <TabsTrigger 
                  key={wallet.id} 
                  value={wallet.id}
                  className="bg-[#1692ADB2] data-[state=active]:bg-[#051728CC] data-[state=active]:text-white data-[state=active]:border-[1px] border-[#83E9FF4D] rounded-lg flex items-center"
                >
                  <span>{wallet.name}</span>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
