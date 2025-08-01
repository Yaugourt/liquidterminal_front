"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";

import { walletDeleteMessages, handleWalletApiError } from "@/lib/wallet-toast-messages";

interface DeleteWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  walletToDelete: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export function DeleteWalletDialog({ 
  isOpen, 
  onOpenChange, 
  walletToDelete,
  onSuccess 
}: DeleteWalletDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { removeWallet } = useWallets();

  const handleConfirmDelete = async () => {
    if (walletToDelete) {
      try {
        setIsLoading(true);
        await removeWallet(walletToDelete.id);
        onOpenChange(false);
        
        // Show success toast
        walletDeleteMessages.success(walletToDelete.name);
        
        // Notify parent component of success
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: unknown) {
        handleWalletApiError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
        <DialogHeader>
          <DialogTitle>Supprimer le wallet</DialogTitle>
          <DialogDescription className="text-white">
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
            onClick={() => onOpenChange(false)}
            className="border-[#83E9FF4D] text-white"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-[#FF5252] text-white hover:bg-[#FF5252]/90"
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 