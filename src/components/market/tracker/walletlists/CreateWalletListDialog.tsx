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

import { toast } from "sonner";
import { useWalletLists } from "@/store/use-wallet-lists";

interface CreateWalletListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (listData: { name: string; description?: string; isPublic?: boolean }) => void;
}

export function CreateWalletListDialog({ 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: CreateWalletListDialogProps) {
  const { userLists } = useWalletLists();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    
    const listData = {
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic: isPublic
    };

    try {
      // Clear form and close dialog first
      setName("");
      setDescription("");
      setIsPublic(false);
      onOpenChange(false);
      
      toast.success(`List "${listData.name}" created successfully`);
      
      // Pass data to parent for creation and selection
      onSuccess(listData);
    } catch {
      toast.error('Failed to create wallet list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151A25] border border-white/10 text-white rounded-2xl shadow-xl shadow-black/20">
        <DialogHeader>
          <DialogTitle className="text-white">Create Wallet List</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new list to organize and track interesting wallets ({userLists.length} list{userLists.length !== 1 ? 's' : ''})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              List Name (required)
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DeFi Whales, Interesting Traders..."
              className="bg-[#0A0D12] border-white/5 text-white placeholder:text-zinc-500 rounded-lg focus:border-[#83E9FF]/50"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="bg-[#0A0D12] border-white/5 text-white placeholder:text-zinc-500 min-h-[80px] rounded-lg focus:border-[#83E9FF]/50"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0A0D12] border border-white/5 rounded-xl hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPublic ? 'bg-emerald-500/10' : 'bg-[#F9E370]/10'}`}>
                {isPublic ? (
                  <Users size={20} className="text-emerald-400" />
                ) : (
                  <Lock size={20} className="text-[#F9E370]" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-white cursor-pointer block">
                  {isPublic ? '🌐 Public List' : '🔒 Private List'}
                </label>
                <p className="text-xs text-zinc-500 mt-0.5">
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
              className="data-[state=checked]:bg-emerald-400 data-[state=unchecked]:bg-zinc-600"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/5 text-white hover:bg-white/5 rounded-lg"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList}
            disabled={isLoading || !name.trim()}
            className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
