import { Plus, BookOpen, Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReadList } from "@/services/education";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ReadListSidebarProps {
  readLists?: ReadList[];
  activeReadListId: number | null;
  onSelectList: (id: number) => void;
  onCreateList: () => void;
  onDeleteList: (id: number) => void;
  onReorderLists?: (newOrder: number[]) => void;
  loading?: boolean;
}

// Skeleton component for read list items
const ReadListSkeleton = () => (
  <div className="p-3 rounded-lg animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 bg-[#112941] rounded mt-0.5"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#112941] rounded w-3/4"></div>
        <div className="h-3 bg-[#112941] rounded w-1/2"></div>
        <div className="h-3 bg-[#112941] rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// Sortable read list item component
function SortableReadListItem({ 
  list, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  list: ReadList; 
  isActive: boolean; 
  onSelect: (id: number) => void; 
  onDelete: (id: number) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(list.id)}
      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
        isActive
          ? "bg-[#83E9FF1A] border border-[#83E9FF4D]"
          : "hover:bg-[#FFFFFF0A]"
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#FFFFFF0A] rounded"
          >
            <GripVertical className={`w-4 h-4 mt-0.5 ${
              isActive ? "text-[#83E9FF]" : "text-[#FFFFFF80]"
            }`} />
          </div>
          
          <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            isActive ? "text-[#83E9FF]" : "text-[#FFFFFF80]"
          }`} />
          
          <div className="min-w-0 flex-1">
            <h3 className={`font-medium text-sm truncate ${
              isActive ? "text-[#83E9FF]" : "text-white"
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
            onDelete(list.id);
          }}
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function ReadListSidebar({
  readLists,
  activeReadListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onReorderLists,
  loading = false,
}: ReadListSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderLists) {
      const oldIndex = readLists?.findIndex(list => list.id === active.id) ?? -1;
      const newIndex = readLists?.findIndex(list => list.id === over?.id) ?? -1;
      
      if (oldIndex !== -1 && newIndex !== -1 && readLists) {
        const newOrder = arrayMove(readLists, oldIndex, newIndex);
        const newOrderIds = newOrder.map(list => list.id);
        onReorderLists(newOrderIds);
      }
    }
  };

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">Read Lists</h2>
          <div className="flex items-center gap-1 text-xs text-[#FFFFFF60]">
            <GripVertical className="w-3 h-3" />
            <span>Drag to reorder</span>
          </div>
        </div>
        <Button
          onClick={onCreateList}
          size="sm"
          className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-medium"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 3 }).map((_, index) => (
            <ReadListSkeleton key={index} />
          ))
        ) : readLists?.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-[#FFFFFF40] mx-auto mb-2" />
            <p className="text-[#FFFFFF80] text-sm">No read lists yet</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={readLists?.map(list => list.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              {readLists?.filter(list => list.id && !isNaN(list.id)).map((list) => (
                <SortableReadListItem
                  key={`sortable-${list.id}`}
                  list={list}
                  isActive={activeReadListId === list.id}
                  onSelect={onSelectList}
                  onDelete={onDeleteList}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </Card>
  );
} 