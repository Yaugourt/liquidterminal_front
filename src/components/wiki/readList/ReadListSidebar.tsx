import { Plus, BookOpen, Trash2, GripVertical, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReadList } from "@/services/wiki";
import { motion, AnimatePresence } from "framer-motion";
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

const ReadListSkeleton = () => (
  <div className="p-3 rounded-lg animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 bg-white/5 rounded mt-0.5 flex-shrink-0"></div>
      <div className="w-4 h-4 bg-white/5 rounded mt-0.5 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/5 rounded w-3/4"></div>
        <div className="h-2.5 bg-white/5 rounded w-1/2"></div>
        <div className="h-1.5 bg-white/5 rounded w-full mt-2"></div>
      </div>
    </div>
  </div>
);

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
  };

  const readCount = 0;
  const total = list.itemsCount || 0;
  const progress = total > 0 ? (readCount / total) * 100 : 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      onClick={() => onSelect(list.id)}
      className={`p-3 rounded-lg cursor-pointer transition-colors group ${isActive
        ? "bg-brand-accent/10 border border-brand-accent/25"
        : "hover:bg-white/[0.03] border border-transparent hover:border-border-subtle"
        } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-white/5 rounded mt-0.5 flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className={`w-3.5 h-3.5 ${isActive ? "text-brand-accent/60" : "text-text-muted/50"}`} />
          </div>

          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isActive ? "bg-brand-accent/20" : "bg-white/5 group-hover:bg-brand-accent/10"}`}>
            <BookOpen className={`w-3.5 h-3.5 ${isActive ? "text-brand-accent" : "text-text-muted"}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`font-medium text-sm truncate ${isActive ? "text-brand-accent" : "text-text-primary"}`}>
                {list.name}
              </h3>
              {list.isPublic && (
                <Globe className={`w-3 h-3 flex-shrink-0 ${isActive ? "text-brand-accent/70" : "text-text-muted"}`} />
              )}
            </div>

            {list.description && (
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{list.description}</p>
            )}

            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-text-muted">{total} items</span>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-2">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-accent/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(list.id);
          }}
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg ml-1 flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && onReorderLists) {
      const oldIndex = readLists?.findIndex(list => list.id === active.id) ?? -1;
      const newIndex = readLists?.findIndex(list => list.id === over?.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1 && readLists) {
        const newOrder = arrayMove(readLists, oldIndex, newIndex);
        onReorderLists(newOrder.map(list => list.id));
      }
    }
  };

  const totalItems = readLists?.reduce((acc, l) => acc + (l.itemsCount || 0), 0) ?? 0;

  return (
    <Card>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border-subtle bg-gradient-to-r from-brand-accent/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-text-primary font-semibold text-sm">Read Lists</h2>
              {readLists && readLists.length > 0 && (
                <span className="text-label bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-md">
                  {readLists.length}
                </span>
              )}
            </div>
            {totalItems > 0 && (
              <p className="text-xs text-text-muted mt-0.5">{totalItems} total resources</p>
            )}
          </div>
          <Button
            onClick={onCreateList}
            size="sm"
            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg h-8 w-8 p-0"
            disabled={loading}
            title="Create new list"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="flex items-center gap-1 text-label text-text-muted mt-2">
          <GripVertical className="w-3 h-3" />
          Drag to reorder
        </p>
      </div>

      {/* List */}
      <div className="p-2 space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-subtle">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <ReadListSkeleton key={i} />)
          ) : !readLists || readLists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-accent" />
              </div>
              <p className="text-text-muted text-sm font-medium">No read lists yet</p>
              <p className="text-text-muted text-xs mt-1 opacity-70">Click + to create your first list</p>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={readLists.map(list => list.id)}
                strategy={verticalListSortingStrategy}
              >
                {readLists.filter(list => list.id && !isNaN(list.id)).map((list) => (
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
        </AnimatePresence>
      </div>
    </Card>
  );
}
