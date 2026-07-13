"use client";

import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth.context";
import { useReadLists } from "@/store/use-readlists";
import { readListMessages, handleReadListApiError } from "@/lib/toast-messages";
import { trackResourceSaved } from "@/lib/analytics";
import { AddToReadListModal } from "../AddToReadListModal";

interface SaveToListButtonProps {
  resourceId: number;
  resourceTitle: string;
  /** Read-list count including this resource (gold badge when > 0). */
  savesCount?: number;
  /** "icon": bare star (table/row). "chip": star + count pill. */
  variant?: "icon" | "chip";
  className?: string;
}

/**
 * Persistent one-click "save to read list" gesture on every article surface
 * (never hover-only, per the touch-device rule). This is the action that
 * actually creates savesCount. Signed-out users are prompted to log in.
 */
export function SaveToListButton({
  resourceId,
  resourceTitle,
  savesCount = 0,
  variant = "icon",
  className,
}: SaveToListButtonProps) {
  const { authenticated, login } = useAuthContext();
  const { readLists, addItemToReadList } = useReadLists();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openPicker = (e: React.MouseEvent) => {
    stop(e);
    if (!authenticated) {
      login();
      return;
    }
    setSearch("");
    setOpen(true);
  };

  const handleAddToList = useCallback(
    async (readListId: number) => {
      try {
        setIsAdding(true);
        setAddingToListId(readListId);
        const list = readLists.find((l) => l.id === readListId);
        await addItemToReadList(readListId, { resourceId });
        setOpen(false);
        setSearch("");
        trackResourceSaved();
        readListMessages.success.addedToList(list?.name || "Read List");
      } catch (error) {
        handleReadListApiError(error);
      } finally {
        setIsAdding(false);
        setAddingToListId(null);
      }
    },
    [readLists, addItemToReadList, resourceId]
  );

  const saved = savesCount > 0;

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        title="Save to a read list"
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-md transition-colors",
          variant === "chip"
            ? "border border-border-subtle bg-surface-2 px-1.5 py-0.5"
            : "p-1",
          saved ? "text-gold" : "text-text-tertiary hover:text-brand",
          className
        )}
      >
        <Star className={cn("h-3.5 w-3.5", saved && "fill-gold")} />
        {variant === "chip" && saved && (
          <span className="mono text-[10.5px] font-medium">{savesCount}</span>
        )}
      </button>

      <AddToReadListModal
        open={open && authenticated}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setSearch("");
          }
        }}
        resourceLabel={resourceTitle}
        readLists={readLists}
        search={search}
        onSearchChange={setSearch}
        onAddToList={handleAddToList}
        isAdding={isAdding}
        addingToListId={addingToListId}
        onCancel={() => {
          setOpen(false);
          setSearch("");
        }}
      />
    </>
  );
}
