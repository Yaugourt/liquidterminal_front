"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { useAuthContext } from "@/contexts/auth.context";

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
  const [error, setError] = useState<string | null>(null);
  
  const { removeWallet } = useWallets();
  const { privyUser } = useAuthContext();

  const handleConfirmDelete = async () => {
    if (walletToDelete) {
      try {
        setIsLoading(true);
        setError(null);
        await removeWallet(walletToDelete.id);
        onOpenChange(false);
        
        // Notify parent component of success
        if (onSuccess) {
          onSuccess();
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
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