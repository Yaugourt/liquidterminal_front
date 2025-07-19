import { useState } from "react";
import { useReadListStore } from "@/store/use-read-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateReadListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateReadListModal({ isOpen, onClose }: CreateReadListModalProps) {
  const { createReadList } = useReadListStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      createReadList({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setIsPublic(false);
      onClose();
    } catch (error) {
      console.error("Failed to create read list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setIsPublic(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Read List</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-white text-sm font-medium">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter read list name..."
              className="bg-[#112941] border-[#83E9FF4D] text-white placeholder:text-[#FFFFFF80]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-white text-sm font-medium">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your read list..."
              className="w-full p-3 bg-[#112941] border border-[#83E9FF4D] text-white placeholder:text-[#FFFFFF80] resize-none rounded-md focus:outline-none focus:border-[#83E9FF]"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-[#83E9FF] bg-[#112941] border-[#83E9FF4D] rounded focus:ring-[#83E9FF]"
            />
            <label htmlFor="public" className="text-white text-sm">Make public</label>
          </div>
        </form>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF1A]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 