"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isDeleting = false
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-brand-secondary border border-border-hover rounded-2xl shadow-xl shadow-black/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <AlertDialogTitle className="text-white text-xl font-bold">
              Delete Project
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-text-secondary">
            Are you sure you want to delete <span className="font-semibold text-white">{projectName}</span>?
            <br />
            <br />
            This action cannot be undone. All data associated with this project will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-transparent border-border-subtle text-text-secondary hover:bg-white/5 hover:text-white rounded-lg"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-rose-500 text-white hover:bg-rose-600 rounded-lg"
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

