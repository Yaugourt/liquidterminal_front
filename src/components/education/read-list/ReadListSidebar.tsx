import { Plus, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReadListStore } from "@/store/use-read-list";
import { ReadList } from "@/types/read-list.types";

interface ReadListSidebarProps {
  onCreateReadList: () => void;
}

export function ReadListSidebar({ onCreateReadList }: ReadListSidebarProps) {
  const { 
    readLists, 
    activeReadListId, 
    setActiveReadList, 
    deleteReadList 
  } = useReadListStore();

  const handleDeleteReadList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this read list?")) {
      deleteReadList(id);
    }
  };

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Read Lists</h2>
        <Button
          onClick={onCreateReadList}
          size="sm"
          className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {readLists.map((readList) => (
          <div
            key={readList.id}
            onClick={() => setActiveReadList(readList.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
              activeReadListId === readList.id
                ? "bg-[#83E9FF1A] border border-[#83E9FF4D]"
                : "hover:bg-[#FFFFFF0A]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  activeReadListId === readList.id ? "text-[#83E9FF]" : "text-[#FFFFFF80]"
                }`} />
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium text-sm truncate ${
                    activeReadListId === readList.id ? "text-[#83E9FF]" : "text-white"
                  }`}>
                    {readList.name}
                  </h3>
                  {readList.description && (
                    <p className="text-xs text-[#FFFFFF80] mt-1 line-clamp-2">
                      {readList.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#FFFFFF80]">
                    <span>{readList.items.length} items</span>
                    {readList.isPublic && (
                      <span className="bg-[#83E9FF1A] text-[#83E9FF] px-1.5 py-0.5 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => handleDeleteReadList(readList.id, e)}
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 