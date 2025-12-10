"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { showXpGainToast } from "@/components/xp";

import { walletAddMessages } from "@/lib/toast-messages";

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
  
  // Vérifier si l'utilisateur a atteint la limite de 25 wallets au total
  const hasReachedWalletLimit = wallets.length >= 25;

  
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
      const result = await addWallet(address, walletName, walletListId);
      
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
      
      // Show XP toast if XP was granted
      if (result?.xpGranted && result.xpGranted > 0) {
        showXpGainToast(result.xpGranted, "Wallet added");
      }
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // Les erreurs sont déjà gérées dans le store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-secondary border border-white/10 text-white rounded-2xl shadow-xl shadow-black/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            {walletListName ? `Add wallet to "${walletListName}"` : "Add a new wallet"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {hasReachedWalletLimit 
              ? `You have reached the limit of 25 wallets. Remove an existing wallet to add a new one.`
              : walletListName 
                ? `Enter a wallet address to add it directly to the "${walletListName}" list.`
                : `Enter your HyperLiquid wallet address and an optional name. (${wallets.length}/25 wallets)`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Wallet address (required)
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="bg-brand-dark border-white/5 text-white placeholder:text-zinc-500 rounded-lg font-mono focus:border-brand-accent/50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Wallet name (optional)
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Wallet"
              className="bg-brand-dark border-white/5 text-white placeholder:text-zinc-500 rounded-lg focus:border-brand-accent/50"
            />
          </div>

        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/5 text-white hover:bg-white/5 rounded-lg"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddWallet}
            disabled={isLoading || hasReachedWalletLimit}
            className="bg-[#F9E370] hover:bg-[#F9E370]/90 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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