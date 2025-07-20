import { Plus, BookOpen, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReadList } from "@/services/education";

interface ReadListSidebarProps {
  readLists?: ReadList[];
  activeReadListId: number | null;
  onSelectList: (id: number) => void;
  onCreateList: () => void;
  onDeleteList: (id: number) => void;
}

export function ReadListSidebar({
  readLists,
  activeReadListId,
  onSelectList,
  onCreateList,
  onDeleteList,
}: ReadListSidebarProps) {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Read Lists</h2>
        <Button
          onClick={onCreateList}
          size="sm"
          className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {readLists?.map((list) => (
          <div
            key={list.id}
            onClick={() => onSelectList(list.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
              activeReadListId === list.id
                ? "bg-[#83E9FF1A] border border-[#83E9FF4D]"
                : "hover:bg-[#FFFFFF0A]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  activeReadListId === list.id ? "text-[#83E9FF]" : "text-[#FFFFFF80]"
                }`} />
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium text-sm truncate ${
                    activeReadListId === list.id ? "text-[#83E9FF]" : "text-white"
                  }`}>
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-xs text-[#FFFFFF80] mt-1 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#FFFFFF80]">
                    <span>{list.itemsCount || 0} items</span>
                    {list.isPublic && (
                      <span className="bg-[#83E9FF1A] text-[#83E9FF] px-1.5 py-0.5 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(list.id);
                }}
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