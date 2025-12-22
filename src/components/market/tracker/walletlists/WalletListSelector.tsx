"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Globe, PlusCircle, List, Search, Trash2 } from "lucide-react";
import { WalletList } from "@/services/market/tracker/types";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletListSelectorProps {
  activeTab: "all-wallets" | number;
  userLists: WalletList[];
  onTabChange: (value: string) => void;
  onCreateList: () => void;
  onDeleteList?: (id: number, listName: string, e: React.MouseEvent) => void;
}

export function WalletListSelector({
  activeTab,
  userLists,
  onTabChange,
  onCreateList,
  onDeleteList,
}: WalletListSelectorProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter lists based on search
  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return userLists;
    const query = searchQuery.toLowerCase();
    return userLists.filter(
      (list) =>
        list.name?.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query)
    );
  }, [userLists, searchQuery]);

  // Get active list info
  const activeListInfo = useMemo(() => {
    if (activeTab === "all-wallets") {
      return { name: "All Wallets", count: null };
    }
    const list = userLists.find((l) => l.id === activeTab);
    return list
      ? { name: list.name, count: list.itemsCount }
      : { name: "Unknown List", count: 0 };
  }, [activeTab, userLists]);

  // Get active list for delete button
  const activeList = useMemo(() => {
    if (activeTab === "all-wallets") return null;
    return userLists.find((l) => l.id === activeTab);
  }, [activeTab, userLists]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    if (activeList && onDeleteList) {
      onDeleteList(activeList.id, activeList.name, e);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      {/* Select List Dropdown */}
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <List className="w-4 h-4" />
          <span>List:</span>
        </div>

        <Select value={activeTab.toString()} onValueChange={onTabChange}>
          <SelectTrigger className="w-full sm:w-[320px] bg-brand-dark border-border-subtle text-white rounded-lg hover:border-border-hover transition-all">
            <div className="flex items-center gap-2 truncate">
              <List className="w-4 h-4 shrink-0 text-brand-accent" />
              <SelectValue>
                <span className="font-medium">{activeListInfo.name}</span>
                {activeListInfo.count !== null && (
                  <span className="text-xs text-text-muted ml-2">
                    ({activeListInfo.count} wallet{activeListInfo.count !== 1 ? "s" : ""})
                  </span>
                )}
              </SelectValue>
            </div>
          </SelectTrigger>

          <SelectContent className="bg-brand-secondary border-border-hover text-white max-h-[400px] rounded-xl shadow-xl shadow-black/20">
            {/* Search input */}
            {userLists.length > 5 && (
              <div className="p-2 sticky top-0 bg-brand-secondary z-10 border-b border-border-subtle">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    placeholder="Search lists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-brand-dark border-border-subtle text-white h-8 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* All Wallets */}
            <SelectItem
              value="all-wallets"
              className="focus:bg-white/5 focus:text-white cursor-pointer rounded-lg"
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-brand-accent" />
                <span className="font-medium">All Wallets</span>
              </div>
            </SelectItem>

            {/* Separator */}
            {filteredLists.length > 0 && <SelectSeparator className="bg-white/5" />}

            {/* User lists */}
            {filteredLists.length > 0 ? (
              filteredLists.map((list) => (
                <SelectItem
                  key={list.id}
                  value={list.id.toString()}
                  className="focus:bg-white/5 focus:text-white cursor-pointer rounded-lg"
                >
                  <div className="flex flex-col gap-1 w-full py-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <List className="w-4 h-4 text-brand-accent shrink-0" />
                        <span className="font-medium truncate">{list.name}</span>
                      </div>
                      <span className="text-xs text-text-muted shrink-0">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted pl-6">
                      {list.itemsCount || 0} wallet{list.itemsCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : searchQuery ? (
              <div className="p-4 text-center text-sm text-text-muted">
                No lists found for &quot;{searchQuery}&quot;
              </div>
            ) : null}

            {/* Empty state */}
            {userLists.length === 0 && (
              <div className="p-4 text-center text-sm text-text-muted">
                No lists yet. Create your first one!
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Delete List Button - only visible when a list is selected */}
        {activeList && onDeleteList && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-9 w-9 shrink-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete list</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* List count badge */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-brand-accent/10 border border-border-subtle rounded-lg text-xs text-brand-accent">
          <span className="font-medium">{userLists.length}</span>
          <span className="text-text-muted">list{userLists.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={() => router.push("/market/tracker/public-lists")}
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none border-border-subtle text-white hover:text-white hover:bg-white/5 rounded-lg"
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Browse Public</span>
          <span className="sm:hidden">Public Lists</span>
        </Button>
        <Button
          onClick={onCreateList}
          size="sm"
          className="flex-1 sm:flex-none bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create List</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>
    </div>
  );
}

