"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Wallet List</DialogTitle>
          <DialogDescription className="text-white">
            Are you sure you want to delete this wallet list?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center gap-3 text-[#FF5252]">
          <AlertCircle className="h-5 w-5" />
          <p>This action is irreversible. The list &quot;{listToDelete?.name}&quot; and all its contents will be permanently deleted.</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border-hover text-white hover:bg-white/5"
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
