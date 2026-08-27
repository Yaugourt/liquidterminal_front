"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
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
import { useSidebarUi, type SidebarNavMode } from "@/store/use-sidebar-ui";
import { defaultNavigationGroups, getDefaultSidebarPreferences, getGroupId, getItemId } from "@/lib/sidebar-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CustomizeSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** One bar of a layout preview: family header (open or shut) vs nav item. */
type PreviewRow = "head-open" | "head" | "item";

/**
 * The three layouts, each with a schematic of what the rail looks like — the
 * behaviour is hard to name but obvious to see, so the preview does the
 * explaining and the copy only confirms it.
 */
const NAV_MODES: { id: SidebarNavMode; label: string; hint: string; rows: PreviewRow[] }[] = [
  {
    id: "collapsible",
    label: "Collapsible",
    hint: "Fold families in and out. Several can stay open.",
    rows: ["head-open", "item", "item", "head-open", "item", "head"],
  },
  {
    id: "focus",
    label: "Focus",
    hint: "One family open at a time, the others fold away.",
    rows: ["head-open", "item", "item", "head", "head", "head"],
  },
  {
    id: "expanded",
    label: "Expanded",
    hint: "Everything visible at once, nothing to unfold.",
    rows: ["head-open", "item", "item", "head-open", "item", "item"],
  },
];

function NavModePicker() {
  const { navMode, setNavMode } = useSidebarUi();

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-text-primary font-medium text-sm">Menu layout</h3>
        <p className="text-text-tertiary text-xs mt-0.5">How the families behave in the expanded sidebar</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {NAV_MODES.map((mode) => {
          const isSelected = navMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setNavMode(mode.id)}
              aria-pressed={isSelected}
              className={cn(
                // flex-col, else the button quirk centres its content vertically
                // and the previews stop lining up when a hint wraps differently.
                "flex flex-col text-left rounded-lg border p-3 transition-colors",
                isSelected
                  ? "border-brand bg-brand/5"
                  : "border-border-default bg-base hover:border-border-default hover:bg-surface-2"
              )}
            >
              <div className="rounded border border-border-subtle bg-base p-2 space-y-[3px]">
                {mode.rows.map((row, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-[3px] rounded-full transition-colors",
                      row === "item"
                        ? "ml-2.5 w-[58%] bg-text-tertiary/40"
                        : row === "head-open"
                          ? cn("w-[80%]", isSelected ? "bg-brand" : "bg-text-secondary")
                          : "w-[80%] bg-text-tertiary/50"
                    )}
                  />
                ))}
              </div>
              <div className={cn("text-xs font-medium mt-2", isSelected ? "text-brand" : "text-text-primary")}>
                {mode.label}
              </div>
              <div className="text-[11px] text-text-tertiary leading-snug mt-0.5">{mode.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
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
      className="bg-base border border-border-default focus:border-brand/50 outline-none transition-colors rounded-lg p-3 space-y-2"
    >
      {/* Group header */}
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-text-tertiary" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-text-primary font-medium text-sm">{displayName}</span>
          <Switch
            checked={group.visible}
            onCheckedChange={() => onToggleGroup(group.id)}
            className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-2"
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
                <span className="text-text-secondary text-xs">{navItem.name}</span>
                <Switch
                  checked={item.visible}
                  onCheckedChange={() => onToggleItem(group.id, item.id)}
                  className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-2 scale-75"
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
  const { setNavMode } = useSidebarUi();
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
    // The layout lives in the UI store, so the reset has to cover it too —
    // otherwise "default" would leave the sidebar in a mode the user picked.
    setNavMode("collapsible");
    toast.success("Sidebar reset to default");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden bg-transparent border-0 shadow-none">
        <Card className="rounded-lg flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="p-6 border-b border-border-subtle flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold text-text-primary">Customize Sidebar</DialogTitle>
              <DialogDescription className="text-sm text-text-secondary mt-1">
                Pick a layout, then choose what shows up and in which order
              </DialogDescription>
            </div>
            {/* Close button is handled by DialogContent's defaulting close button or we can keep this custom one if we hide the default */}
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <NavModePicker />

            <div className="space-y-2">
              <div>
                <h3 className="text-text-primary font-medium text-sm">Sections</h3>
                <p className="text-text-tertiary text-xs mt-0.5">Toggle visibility and drag to reorder</p>
              </div>
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
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-border-subtle">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border-default text-text-primary hover:bg-surface-2 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={onClose}
              className="bg-gold text-brand-text-on hover:bg-gold/90"
            >
              Done
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

