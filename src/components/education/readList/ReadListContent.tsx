import { Plus, BookOpen, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReadList, ReadListItem } from "@/services/education";
import { useState, useEffect } from "react";
import { ReadListItemCard } from "./ReadListItemCard";

interface ReadListContentProps {
  activeList?: ReadList;
  items?: ReadListItem[];
  itemsLoading: boolean;
  onRemoveItem: (itemId: number) => void;
  onToggleRead: (itemId: number, isRead: boolean) => void;
  onCreateList: () => void;
}

export function ReadListContent({
  activeList,
  items,
  itemsLoading,
  onRemoveItem,
  onToggleRead,
  onCreateList,
}: ReadListContentProps) {
  const [enrichedItems, setEnrichedItems] = useState<ReadListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Enrichir les items avec les détails des ressources manquantes
  useEffect(() => {
    if (items && Array.isArray(items)) {
      const itemsWithResources = items.map(item => {
        // Si l'item a déjà les détails de la ressource, on le garde
        if (item.resource && item.resource.url) {
          return item;
        }
        
        // Sinon, on crée un objet ressource basique avec l'URL
        return {
          ...item,
          resource: {
            id: item.resourceId,
            url: `https://example.com/resource/${item.resourceId}`, // URL temporaire
            createdAt: new Date(),
            creator: {
              id: 0,
              name: null,
              email: null
            }
          }
        };
      });
      
      setEnrichedItems(itemsWithResources);
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

  if (!activeList) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-[#FFFFFF40] mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">No read list selected</h3>
        <p className="text-[#FFFFFF80]">Create a read list to get started</p>
        <Button
          onClick={onCreateList}
          className="mt-4 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Read List
        </Button>
      </div>
    );
  }

  // Debug: afficher les items (à supprimer plus tard)
  // console.log('ReadListContent - Items:', items);
  // console.log('ReadListContent - Enriched items:', enrichedItems);
  
  // Utiliser les items enrichis directement (sans filtrage)
  // const filteredItems = enrichedItems;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className=" space-y-4 p-4">
        {/* Header info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">{activeList.name}</h1>
            {activeList.description && (
              <p className="text-[#FFFFFF80] mt-1">{activeList.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-[#f9e370]">
              <span>{totalItems} total</span>
              <span>{readItems} read</span>
              <span>{unreadItems} unread</span>
              {activeList.isPublic && (
                <span className="bg-[#83E9FF1A] text-[#83E9FF] px-2 py-1 rounded-md text-xs">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF80] w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="pl-10 bg-[#112941] border-[#83E9FF4D] text-white placeholder:text-[#FFFFFF80]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5">
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
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === filter.key
                      ? "bg-[#83E9FF] text-[#051728] shadow-sm"
                      : "text-white hover:text-white hover:bg-[#FFFFFF0A]"
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
      <div className="flex-1 overflow-auto p-8">
        {itemsLoading ? (
          <div className="text-center text-[#FFFFFF80] py-16 text-lg">Loading items...</div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ReadListItemCard
                key={item.id}
                item={item}
                onRemoveItem={onRemoveItem}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 text-[#FFFFFF40] mx-auto mb-6" />
            <h3 className="text-white text-xl font-semibold mb-3">No items found</h3>
            <p className="text-[#FFFFFF80] text-lg mb-6">
              Add resources to your read list to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 