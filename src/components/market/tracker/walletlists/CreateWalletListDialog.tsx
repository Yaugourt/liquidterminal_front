"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Lock } from "lucide-react";
import { useWalletLists } from "@/store/use-wallet-lists";
import { toast } from "sonner";

interface CreateWalletListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWalletListDialog({ 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: CreateWalletListDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createList } = useWalletLists();

  const handleCreateList = async () => {
    if (!name.trim()) {
      toast.error("List name is required");
      return;
    }

    if (name.trim().length < 3) {
      toast.error("List name must be at least 3 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      await createList({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic: isPublic
      });
      
      // Clear form and close dialog
      setName("");
      setDescription("");
      setIsPublic(false);
      onOpenChange(false);
      
      toast.success(`List "${name.trim()}" created successfully`);
      onSuccess();
    } catch {
      toast.error('Failed to create wallet list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white">
        <DialogHeader>
          <DialogTitle>Create Wallet List</DialogTitle>
          <DialogDescription className="text-white">
            Create a new list to organize and track interesting wallets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-white">
              List Name (required)
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DeFi Whales, Interesting Traders..."
              className="bg-[#0C2237] border-[#83E9FF4D]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm text-white">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="bg-[#0C2237] border-[#83E9FF4D] min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0C2237] border border-[#83E9FF4D] rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Users size={18} className="text-[#4ADE80]" />
              ) : (
                <Lock size={18} className="text-[#F9E370]" />
              )}
              <div>
                <label className="text-sm font-medium text-white cursor-pointer">
                  {isPublic ? 'Public List' : 'Private List'}
                </label>
                <p className="text-xs text-gray-400">
                  {isPublic 
                    ? 'Anyone can view and copy this list'
                    : 'Only you can view this list'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#83E9FF4D] text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList}
            disabled={isLoading || !name.trim()}
            className="bg-[#F9E370E5] text-black hover:bg-[#F0D04E]/90 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
