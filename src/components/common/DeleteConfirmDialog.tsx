"use client";

import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading, e.g. "Delete Wallet" */
  title: string;
  /** Warning body — ReactNode so callers can bold the target name */
  description: React.ReactNode;
  /** Destructive button label (default "Delete") */
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Canonical destructive-action confirmation dialog (DESIGN_SYSTEM §7.e).
 * Dialog + danger warning row + Cancel / Delete footer with loading state.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-text-secondary">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center gap-3 text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{description}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-border-default text-text-primary hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-danger text-white hover:bg-danger/90"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
