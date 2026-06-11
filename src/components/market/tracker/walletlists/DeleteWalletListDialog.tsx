"use client";

import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/common";
import { useWalletLists } from "@/store/use-wallet-lists";
import { toast } from "sonner";

interface DeleteWalletListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listToDelete: { id: number; name: string } | null;
  onSuccess?: () => void;
}

export function DeleteWalletListDialog({
  isOpen,
  onOpenChange,
  listToDelete,
  onSuccess
}: DeleteWalletListDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { deleteList } = useWalletLists();

  const handleConfirmDelete = async () => {
    if (listToDelete) {
      try {
        setIsLoading(true);
        await deleteList(listToDelete.id);
        onOpenChange(false);

        // Show success toast
        toast.success(`List "${listToDelete.name}" deleted successfully!`);

        // Notify parent component of success
        if (onSuccess) {
          onSuccess();
        }
      } catch {
        toast.error('Failed to delete wallet list');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DeleteConfirmDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Delete Wallet List"
      description={
        <>
          This action is irreversible. The list{" "}
          <span className="font-semibold">&quot;{listToDelete?.name}&quot;</span> and all its
          contents will be permanently deleted.
        </>
      }
      isLoading={isLoading}
      onConfirm={handleConfirmDelete}
    />
  );
}
