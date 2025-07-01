"use client";

import { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { useAuthContext } from "@/contexts/auth.context";

interface AddWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddWalletDialog({ isOpen, onOpenChange, onSuccess }: AddWalletDialogProps) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addWallet } = useWallets();
  const { privyUser } = useAuthContext();
  
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
      
      // Ajouter le wallet
      const result = await addWallet(address, walletName, privyUser.id);
      
      if (!result) {
        throw new Error("Failed to add wallet");
      }
      
      // Clear form and close dialog
      setAddress("");
      setName("");
      onOpenChange(false);
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
  );
}

export function AddWalletButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="default" 
      className="ml-auto bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90"
      onClick={onClick}
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un wallet
    </Button>
  );
} 