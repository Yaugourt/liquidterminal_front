import { Plus, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReadList, ReadListItem } from "@/services/wiki";
import { useState, useEffect, useMemo } from "react";
import { ReadListItemCard } from "./ReadListItemCard";
import { useLinkPreviewsBatch } from "@/services/wiki/linkPreview/hooks/hooks";

interface ReadListContentProps {
  activeList?: ReadList;
  items?: ReadListItem[];
  itemsLoading: boolean;
  onRemoveItem: (itemId: number) => void;
  onToggleRead: (itemId: number, isRead: boolean) => void;
  onCreateList: () => void;
  isMounted?: boolean;
}

// Skeleton component for loading state
const ReadListItemSkeleton = () => (
  <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-0 overflow-hidden h-full animate-pulse">
    <div className="w-full h-40 bg-white/5 flex-shrink-0"></div>
    <div className="p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 bg-white/5 rounded w-20"></div>
        <div className="w-3 h-3 bg-white/5 rounded"></div>
      </div>
      <div className="h-4 bg-white/5 rounded w-full"></div>
      <div className="h-3 bg-white/5 rounded w-3/4"></div>
      <div className="h-3 bg-white/5 rounded w-1/2"></div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 bg-white/5 rounded w-24"></div>
        <div className="h-3 bg-white/5 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export function ReadListContent({
  activeList,
  items,
  itemsLoading,
  onRemoveItem,
  onToggleRead,
  onCreateList,
  isMounted = false,
}: ReadListContentProps) {
  const [enrichedItems, setEnrichedItems] = useState<ReadListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract URLs for batch preview loading
  const urls = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map(item => item.resource?.url)
      .filter((url): url is string => !!url && url.startsWith('http'));
  }, [items]);

  // Load link previews in batch
  const { getPreview } = useLinkPreviewsBatch(urls);
  


  // Utiliser directement les items avec leurs ressources
  useEffect(() => {
    if (items && Array.isArray(items)) {
      setEnrichedItems(items);
    } else {
      setEnrichedItems([]);
    }
  }, [items]);

  // Filtrer les items selon le tab actif et la recherche
  const getFilteredItems = () => {
    let filtered = enrichedItems;
    
    // Filtre par statut de lecture
    switch (activeTab) {
      case "read":
        filtered = filtered.filter(item => item.isRead);
        break;
      case "unread":
        filtered = filtered.filter(item => !item.isRead);
        break;
      default:
        // "all" - pas de filtre
        break;
    }
    
    // Filtre par recherche
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.resource?.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Calculer les statistiques
  const totalItems = enrichedItems.length;
  const readItems = enrichedItems.filter(item => item.isRead).length;
  const unreadItems = totalItems - readItems;

  // Adopter l'approche wallet : pas de rendu si pas monté
  if (!isMounted) {
    return null;
  }

  if (!activeList) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#83e9ff]/10 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#83E9FF]" />
        </div>
        <h3 className="text-white font-semibold mb-2">No read list selected</h3>
        <p className="text-zinc-400">Create a read list to get started</p>
        <Button
          onClick={onCreateList}
          className="mt-4 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Read List
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="space-y-4 p-4 border-b border-white/5">
        {/* Header info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">{activeList.name}</h1>
            {activeList.description && (
              <p className="text-zinc-400 mt-1 text-sm">{activeList.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="text-zinc-400"><span className="text-white font-medium">{totalItems}</span> total</span>
              <span className="text-zinc-400"><span className="text-emerald-400 font-medium">{readItems}</span> read</span>
              <span className="text-zinc-400"><span className="text-[#F9E370] font-medium">{unreadItems}</span> unread</span>
              {activeList.isPublic && (
                <span className="bg-[#83E9FF]/10 text-[#83E9FF] px-2 py-0.5 rounded-md text-[10px] font-medium">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="pl-10 bg-[#0A0D12] border-white/5 text-white rounded-lg placeholder:text-zinc-500 focus:border-[#83E9FF]/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "read", label: "Read" }
              ].map((filter, index) => (
                <Button
                  key={`${filter.key}-${index}`}
                  onClick={() => setActiveTab(filter.key as "all" | "read" | "unread")}
                  size="sm"
                  variant="ghost"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === filter.key
                      ? "bg-[#83E9FF] text-[#051728] shadow-sm font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-auto p-6">
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ReadListItemSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ReadListItemCard
                key={`item-${item.id}`}
                item={item}
                preview={getPreview(item.resource?.url || '')}
                onRemoveItem={onRemoveItem}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#83e9ff]/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#83E9FF]" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">No items found</h3>
            <p className="text-zinc-400">
              {items && items.length > 0 
                ? "No items match your current filters" 
                : "Add resources to your read list to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 