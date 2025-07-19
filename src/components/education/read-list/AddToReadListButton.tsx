import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadListStore } from "@/store/use-read-list";
import { AddToReadListModal } from "./AddToReadListModal";

interface AddToReadListButtonProps {
  article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    category: string;
    tags?: string[];
  };
  className?: string;
}

export function AddToReadListButton({ article, className }: AddToReadListButtonProps) {
  const { isItemInAnyReadList, readLists } = useReadListStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isInReadList = isItemInAnyReadList(article.url);
  const hasReadLists = readLists.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasReadLists) {
      // TODO: Show create read list modal first
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        size="sm"
        variant="ghost"
        className={`p-2 h-auto ${
          isInReadList 
            ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' 
            : 'text-[#FFFFFF80] hover:text-[#83E9FF] hover:bg-[#83E9FF1A]'
        } ${className}`}
        title={isInReadList ? "Already in read list" : "Add to read list"}
      >
        {isInReadList ? (
          <Check className="w-4 h-4" />
        ) : (
          <BookmarkPlus className="w-4 h-4" />
        )}
      </Button>

      <AddToReadListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={article}
      />
    </>
  );
} 