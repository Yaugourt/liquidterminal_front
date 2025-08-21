"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addWallet } from "@/services/market/tracker/api";
import { useWallets } from "@/store/use-wallets";

interface AddWalletToListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listId: number;
  listName: string;
  onSuccess?: () => void;
}

export function AddWalletToListDialog({ 
  isOpen, 
  onOpenChange, 
  listId, 
  listName, 
  onSuccess 
}: AddWalletToListDialogProps) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { reloadWallets } = useWallets();

  const handleAddWallet = async () => {
    if (!address.trim()) {
      toast.error("Wallet address is required");
      return;
    }

    setIsLoading(true);

    try {
      const walletAddress = address.trim();
      const walletName = name.trim() || undefined;
      
      // NOUVEAU: Utiliser la nouvelle API unifiée qui gère tout en une seule requête
      const response = await addWallet(walletAddress, walletName, listId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to add wallet to list");
      }

      // Recharger les wallets dans le store Zustand
      await reloadWallets();

      // Clear form and close dialog
      setAddress("");
      setName("");
      onOpenChange(false);

      // Show success toast
      toast.success(`Wallet "${walletName || walletAddress}" added to "${listName}"`);

      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding wallet to list:', err);
      toast.error("Failed to add wallet to list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
        <DialogHeader>
          <DialogTitle>Add wallet to &quot;{listName}&quot;</DialogTitle>
          <DialogDescription className="text-white">
            Enter a wallet address to add it directly to this list.
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
              className="bg-[#0C2237] border-[#83E9FF4D] text-white"
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
              className="bg-[#0C2237] border-[#83E9FF4D] text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF20]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddWallet}
            disabled={isLoading}
            className="bg-[#83E9FF] text-[#051728] hover:bg-[#6bd4f0] font-medium"
          >
            {isLoading ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
