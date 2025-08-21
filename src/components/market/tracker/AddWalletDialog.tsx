"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";

import { walletAddMessages, handleWalletApiError } from "@/lib/toast-messages";

interface AddWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  walletListId?: number;
  walletListName?: string;
}

export function AddWalletDialog({ isOpen, onOpenChange, onSuccess, walletListId, walletListName }: AddWalletDialogProps) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { addWallet, wallets } = useWallets();
  
  // Vérifier si l'utilisateur a atteint la limite de 5 wallets
  const hasReachedWalletLimit = wallets.length >= 5;

  
  const handleAddWallet = async () => {
    if (!address) {
      walletAddMessages.validation.emptyAddress();
      return;
    }
    
    // Vérifier la limite de wallets avant d'ajouter
    if (hasReachedWalletLimit) {
      walletAddMessages.validation.walletLimitExceeded();
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ensure name is not undefined
      const walletName = name.trim() || undefined;
      
      // NOUVEAU: pas besoin de privyUserId, et support pour walletListId
      await addWallet(address, walletName, walletListId);
      
      // Clear form and close dialog
      setAddress("");
      setName("");
      onOpenChange(false);
      
      // Show success toast
      if (walletListName) {
        walletAddMessages.success(`Wallet "${walletName || address}" added to "${walletListName}"`);
      } else {
        walletAddMessages.success(walletName || 'Nouveau wallet');
      }
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      // Vérifier si c'est une erreur de limite de wallets
      if (err instanceof Error && err.message.includes('WALLET_LIMIT_EXCEEDED')) {
        walletAddMessages.validation.walletLimitExceeded();
      } else {
        // Handle other specific error cases with toast
        handleWalletApiError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
        <DialogHeader>
          <DialogTitle>
            {walletListName ? `Add wallet to "${walletListName}"` : "Add a new wallet"}
          </DialogTitle>
          <DialogDescription className="text-white">
            {hasReachedWalletLimit 
              ? `You have reached the limit of 5 wallets. Remove an existing wallet to add a new one.`
              : walletListName 
                ? `Enter a wallet address to add it directly to the "${walletListName}" list.`
                : `Enter your HyperLiquid wallet address and an optional name. (${wallets.length}/5 wallets)`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm text-white">
              Wallet address (required)
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
            <label htmlFor="name" className="text-sm text-white">
              Wallet name (optional)
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Wallet"
              className="bg-[#0C2237] border-[#83E9FF4D]"
            />
          </div>

        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#83E9FF4D] text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddWallet}
            disabled={isLoading || hasReachedWalletLimit}
            className="bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? "Adding..." 
              : hasReachedWalletLimit 
                ? "Limit reached (5/5)" 
                : walletListName 
                  ? "Add to List" 
                  : "Add"
            }
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
      <PlusCircle className="mr-2 h-4 w-4" /> Add a wallet
    </Button>
  );
} 