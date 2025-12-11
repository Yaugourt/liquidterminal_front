"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";

import { walletDeleteMessages, handleWalletApiError } from "@/lib/toast-messages";

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
      <DialogContent className="bg-[#151A25]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle>Delete Wallet</DialogTitle>
          <DialogDescription className="text-white">
            Are you sure you want to delete this wallet?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center gap-3 text-[#FF5252]">
          <AlertCircle className="h-5 w-5" />
          <p>This action is irreversible. The wallet &quot;{walletToDelete?.name}&quot; will be permanently deleted.</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-[#FF5252] text-white hover:bg-[#FF5252]/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 