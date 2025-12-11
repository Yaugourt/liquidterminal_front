"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, GripVertical, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSidebarPreferences, type SidebarGroupPreference } from "@/store/use-sidebar-preferences";
import { defaultNavigationGroups, getDefaultSidebarPreferences, getGroupId, getItemId } from "@/lib/sidebar-config";
import { toast } from "sonner";

interface CustomizeSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SortableGroupItemProps {
  group: SidebarGroupPreference;
  groupName: string | null;
  onToggleGroup: (groupId: string) => void;
  onToggleItem: (groupId: string, itemId: string) => void;
}

function SortableGroupItem({ group, groupName, onToggleGroup, onToggleItem }: SortableGroupItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Find the actual navigation group
  const navGroup = defaultNavigationGroups.find(g => getGroupId(g.groupName) === group.id);
  const displayName = groupName || "Home";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-input p-3 space-y-2 border-white/10 bg-black/20"
    >
      {/* Group header */}
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-white font-medium text-sm">{displayName}</span>
          <Switch
            checked={group.visible}
            onCheckedChange={() => onToggleGroup(group.id)}
            className="data-[state=checked]:bg-brand-accent data-[state=unchecked]:bg-[#64748B]"
          />
        </div>
      </div>

      {/* Items */}
      {group.visible && navGroup && (
        <div className="ml-6 space-y-1">
          {group.items.map(item => {
            const navItem = navGroup.items.find(ni => getItemId(ni.name, ni.href) === item.id);
            if (!navItem) return null;

            return (
              <div key={item.id} className="flex items-center justify-between py-1">
                <span className="text-gray-300 text-xs">{navItem.name}</span>
                <Switch
                  checked={item.visible}
                  onCheckedChange={() => onToggleItem(group.id, item.id)}
                  className="data-[state=checked]:bg-brand-accent data-[state=unchecked]:bg-[#64748B] scale-75"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CustomizeSidebarModal({ isOpen, onClose }: CustomizeSidebarModalProps) {
  const { preferences, updateGroupVisibility, updateItemVisibility, reorderGroups, resetToDefault } = useSidebarPreferences();
  const [localGroups, setLocalGroups] = useState<SidebarGroupPreference[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load preferences into local state
  useEffect(() => {
    if (preferences) {
      setLocalGroups([...preferences.groups].sort((a, b) => a.order - b.order));
    }
  }, [preferences]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localGroups.findIndex(g => g.id === active.id);
      const newIndex = localGroups.findIndex(g => g.id === over.id);

      const newOrder = arrayMove(localGroups, oldIndex, newIndex);
      setLocalGroups(newOrder);

      // Update preferences in store
      const groupIds = newOrder.map(g => g.id);
      reorderGroups(groupIds);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    updateGroupVisibility(groupId, !localGroups.find(g => g.id === groupId)?.visible);
  };

  const handleToggleItem = (groupId: string, itemId: string) => {
    const group = localGroups.find(g => g.id === groupId);
    const item = group?.items.find(i => i.id === itemId);
    if (item) {
      updateItemVisibility(groupId, itemId, !item.visible);
    }
  };

  const handleReset = () => {
    const defaultPrefs = getDefaultSidebarPreferences();
    resetToDefault(defaultPrefs);
    toast.success("Sidebar reset to default");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="glass-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Customize Sidebar</h2>
            <p className="text-sm text-gray-400 mt-1">
              Toggle visibility and drag to reorder sections
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localGroups.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {localGroups.map(group => {
                  const navGroup = defaultNavigationGroups.find(g => getGroupId(g.groupName) === group.id);
                  return (
                    <SortableGroupItem
                      key={group.id}
                      group={group}
                      groupName={navGroup?.groupName || null}
                      onToggleGroup={handleToggleGroup}
                      onToggleItem={handleToggleItem}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/5">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-white/10 text-white hover:bg-white/10 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          <Button
            onClick={onClose}
            className="bg-brand-gold text-black hover:bg-brand-gold/90"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

