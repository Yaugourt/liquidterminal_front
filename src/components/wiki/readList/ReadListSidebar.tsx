import { Plus, BookOpen, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReadList } from "@/services/wiki";
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
      <div className="w-4 h-4 bg-white/5 rounded mt-0.5"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4"></div>
        <div className="h-3 bg-white/5 rounded w-1/2"></div>
        <div className="h-3 bg-white/5 rounded w-1/4"></div>
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
      className={`p-3 rounded-xl cursor-pointer transition-all group ${
        isActive
          ? "bg-brand-accent/10 border border-brand-accent/20"
          : "hover:bg-white/[0.02] border border-transparent"
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded"
          >
            <GripVertical className={`w-4 h-4 mt-0.5 ${
              isActive ? "text-brand-accent" : "text-text-muted"
            }`} />
          </div>
          
          <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            isActive ? "text-brand-accent" : "text-text-muted"
          }`} />
          
          <div className="min-w-0 flex-1">
            <h3 className={`font-medium text-sm truncate ${
              isActive ? "text-brand-accent" : "text-white"
            }`}>
              {list.name}
            </h3>
            {list.description && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">
                {list.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
              <span>{list.itemsCount || 0} items</span>
              {list.isPublic && (
                <span className="bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded text-label">
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
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg"
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
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 p-4 h-fit">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-sm">Read Lists</h2>
          <div className="flex items-center gap-1 text-label text-text-muted">
            <GripVertical className="w-3 h-3" />
            <span>Drag to reorder</span>
          </div>
        </div>
        <Button
          onClick={onCreateList}
          size="sm"
          className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 3 }).map((_, index) => (
            <ReadListSkeleton key={index} />
          ))
        ) : readLists?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-brand-accent/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-brand-accent" />
            </div>
            <p className="text-text-muted text-sm">No read lists yet</p>
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
    </div>
  );
} 