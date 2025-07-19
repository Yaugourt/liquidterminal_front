import { useState } from "react";
import { useReadListStore } from "@/store/use-read-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface AddToReadListModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    category: string;
    tags?: string[];
  };
}

export function AddToReadListModal({ isOpen, onClose, article }: AddToReadListModalProps) {
  const { readLists, addItemToReadList, createReadList } = useReadListStore();
  const [selectedReadListId, setSelectedReadListId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleAddToReadList = () => {
    if (selectedReadListId) {
      addItemToReadList(selectedReadListId, {
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        category: article.category,
        tags: article.tags,
      });
      onClose();
    }
  };

  const handleCreateAndAdd = () => {
    if (newListName.trim()) {
      const newReadList = createReadList({
        name: newListName.trim(),
        isPublic: false,
      });
      
      addItemToReadList(newReadList.id, {
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        category: article.category,
        tags: article.tags,
      });
      
      setNewListName("");
      setIsCreatingNew(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedReadListId(null);
    setIsCreatingNew(false);
    setNewListName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#051728] border-2 border-[#83E9FF4D] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Read List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Article preview */}
          <div className="p-3 bg-[#112941] rounded-lg border border-[#83E9FF4D]">
            <h3 className="font-medium text-sm text-white mb-1 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-xs text-[#FFFFFF80] line-clamp-2">
              {article.description}
            </p>
          </div>

          {readLists.length > 0 && !isCreatingNew && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Select a read list:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {readLists.map((readList) => (
                    <button
                      key={readList.id}
                      onClick={() => setSelectedReadListId(readList.id)}
                      className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedReadListId === readList.id
                          ? "bg-[#83E9FF1A] border-[#83E9FF] text-[#83E9FF]"
                          : "bg-[#112941] border-[#83E9FF4D] hover:border-[#83E9FF80] text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{readList.name}</div>
                          <div className="text-xs opacity-80">
                            {readList.items.length} items
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddToReadList}
                  disabled={!selectedReadListId}
                  className="flex-1 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
                >
                  Add to Selected List
                </Button>
                <Button
                  onClick={() => setIsCreatingNew(true)}
                  variant="outline"
                  className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF1A]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {(readLists.length === 0 || isCreatingNew) && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">
                {readLists.length === 0 ? "Create your first read list:" : "Create new read list:"}
              </h4>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter read list name..."
                className="w-full p-3 bg-[#112941] border border-[#83E9FF4D] rounded-lg text-white placeholder:text-[#FFFFFF80] focus:outline-none focus:border-[#83E9FF]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAndAdd}
                  disabled={!newListName.trim()}
                  className="flex-1 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
                >
                  Create & Add
                </Button>
                {readLists.length > 0 && (
                  <Button
                    onClick={() => setIsCreatingNew(false)}
                    variant="outline"
                    className="border-[#83E9FF4D] text-white hover:bg-[#83E9FF1A]"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 