"use client";

import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/common";
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
    <DeleteConfirmDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Delete Wallet"
      description={
        <>
          This action is irreversible. The wallet{" "}
          <span className="font-semibold">&quot;{walletToDelete?.name}&quot;</span> will be
          permanently deleted.
        </>
      }
      isLoading={isLoading}
      onConfirm={handleConfirmDelete}
    />
  );
}
