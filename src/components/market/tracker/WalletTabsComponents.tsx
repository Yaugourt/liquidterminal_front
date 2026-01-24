"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, PlusCircle, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddWalletButton } from "./AddWalletDialog";
import { useRouter } from "next/navigation";
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
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Wallet, WalletList } from "@/services/market/tracker/types";

// Props pour WalletListTabs
interface WalletListTabsProps {
  activeTab: "all-wallets" | number;
  userLists: WalletList[];
  onTabChange: (value: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: number, name: string, e: React.MouseEvent) => void;
}

// Props pour WalletContentTabs
interface WalletContentTabsProps {
  wallets: Wallet[];
  activeWalletId: number | null;
  onWalletChange: (value: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddWallet: () => void;
  onDeleteWallet: (id: number, name: string | undefined, e: React.MouseEvent) => void;
}

// Props pour SortableWalletTab
interface SortableWalletTabProps {
  wallet: Wallet;
  onDelete: (id: number, name: string | undefined, e: React.MouseEvent) => void;
}

// Composant pour les tabs des listes
export function WalletListTabs({
  activeTab,
  userLists,
  onTabChange,
  onCreateList,
  onDeleteList
}: WalletListTabsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-2 items-center justify-between flex-wrap">
      <div className="flex items-center gap-2">
        <Tabs
          value={activeTab?.toString() || "all-wallets"}
          onValueChange={onTabChange}
          className="w-auto"
        >
          <TabsList className="gap-3">
            {/* Tab "All Wallets" */}
            <TabsTrigger
              value="all-wallets"
              className="bg-zinc-800/50 data-[state=active]:bg-brand-secondary data-[state=active]:text-white data-[state=active]:border border-border-hover rounded-lg text-text-secondary font-medium hover:text-white transition-colors"
            >
              All Wallets
            </TabsTrigger>

            {/* Séparateur */}
            {userLists.length > 0 && (
              <div className="w-px h-6 bg-white/10 mx-2" />
            )}

            {/* Tabs des listes */}
            {userLists.filter(list => list?.id).map((list, index) => (
              <TabsTrigger
                key={`list-${list.id || index}`}
                value={(list.id || index).toString()}
                className="bg-zinc-800/50 data-[state=active]:bg-brand-secondary data-[state=active]:text-white data-[state=active]:border border-border-hover rounded-lg flex items-center group text-text-secondary hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white">{list.name || 'Unnamed List'}</span>
                    <span className="text-xs text-white">
                      Created: {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={(e) => onDeleteList(list.id, list.name, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="ml-2 p-1 rounded-full hover:bg-brand-gold/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-brand-gold" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete this list</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Boutons sur la même ligne que les tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => router.push('/market/tracker/public-lists')}
          variant="outline"
          className="border-border-hover interactive-secondary"
        >
          <Globe className="mr-2 h-4 w-4" />
          Browse Public Lists
        </Button>
        <Button
          onClick={onCreateList}
          className="bg-brand-accent hover:bg-[#6bd4f0] text-brand-tertiary font-medium"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </div>
    </div>
  );
}

// Composant pour les tabs des wallets (avec drag & drop)
export function WalletContentTabs({
  wallets,
  activeWalletId,
  onWalletChange,
  onDragEnd,
  onAddWallet,
  onDeleteWallet
}: WalletContentTabsProps) {
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

  return (
    <div className="flex gap-3 items-center">
      {/* Scrollable tabs container */}
      <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Tabs
          value={activeWalletId?.toString() || ""}
          onValueChange={onWalletChange}
          className="w-full"
        >
          <TabsList className="gap-3 inline-flex w-auto min-w-full">
            {wallets.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={wallets.map(wallet => wallet.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {wallets.map((wallet) => (
                    <SortableWalletTab
                      key={wallet.id}
                      wallet={wallet}
                      onDelete={onDeleteWallet}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-gray-400 px-4">
                No wallets added
              </div>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Info badge and action button */}
      <div className="flex items-center gap-2 shrink-0">
        {wallets.length > 1 && (
          <div className="hidden lg:flex items-center gap-1 text-xs text-text-muted bg-white/5 px-2 py-1 rounded border border-border-subtle">
            <GripVertical className="w-3 h-3" />
            <span>Drag to reorder</span>
          </div>
        )}
        <AddWalletButton onClick={onAddWallet} />
      </div>
    </div>
  );
}

// Composant pour un tab wallet sortable
export function SortableWalletTab({ wallet, onDelete }: SortableWalletTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wallet.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      value={wallet.id.toString()}
      className="bg-zinc-800/50 data-[state=active]:bg-brand-secondary data-[state=active]:text-white data-[state=active]:border border-border-hover rounded-lg flex items-center group text-text-secondary hover:text-white transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#FFFFFF0A] rounded"
        >
          <GripVertical className="w-3 h-3 text-[#FFFFFF80]" />
        </div>

        <div className="flex flex-col items-start">
          <span className="font-medium text-white">{wallet.name || 'Unnamed Wallet'}</span>
          <span className="text-xs text-white">
            Added: {new Date(wallet.addedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={(e) => onDelete(wallet.id, wallet.name, e)}
              className="ml-2 p-1 rounded-full hover:bg-brand-gold/20 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-brand-gold" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supprimer ce wallet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TabsTrigger>
  );
}
