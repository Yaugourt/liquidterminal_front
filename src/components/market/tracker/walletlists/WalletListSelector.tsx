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
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <List className="w-4 h-4" />
          <span>List:</span>
        </div>
        
        <Select value={activeTab.toString()} onValueChange={onTabChange}>
          <SelectTrigger className="w-full sm:w-[320px] bg-[#0C2237] border-[#83E9FF4D] text-white">
            <div className="flex items-center gap-2 truncate">
              <List className="w-4 h-4 shrink-0 text-[#F9E370]" />
              <SelectValue>
                <span className="font-medium">{activeListInfo.name}</span>
                {activeListInfo.count !== null && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({activeListInfo.count} wallet{activeListInfo.count !== 1 ? "s" : ""})
                  </span>
                )}
              </SelectValue>
            </div>
          </SelectTrigger>
          
          <SelectContent className="bg-[#051728] border-[#83E9FF4D] text-white max-h-[400px]">
            {/* Search input */}
            {userLists.length > 5 && (
              <div className="p-2 sticky top-0 bg-[#051728] z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search lists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-[#0C2237] border-[#83E9FF4D] text-white h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* All Wallets */}
            <SelectItem
              value="all-wallets"
              className="focus:bg-[#83E9FF20] focus:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-[#F9E370]" />
                <span className="font-medium">All Wallets</span>
              </div>
            </SelectItem>

            {/* Separator */}
            {filteredLists.length > 0 && <SelectSeparator className="bg-[#83E9FF4D]" />}

            {/* User lists */}
            {filteredLists.length > 0 ? (
              filteredLists.map((list) => (
                <SelectItem
                  key={list.id}
                  value={list.id.toString()}
                  className="focus:bg-[#83E9FF20] focus:text-white cursor-pointer"
                >
                  <div className="flex flex-col gap-1 w-full py-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <List className="w-4 h-4 text-[#F9E370] shrink-0" />
                        <span className="font-medium truncate">{list.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 pl-6">
                      {list.itemsCount || 0} wallet{list.itemsCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : searchQuery ? (
              <div className="p-4 text-center text-sm text-gray-400">
                No lists found for &quot;{searchQuery}&quot;
              </div>
            ) : null}

            {/* Empty state */}
            {userLists.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">
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
                  className="h-9 w-9 shrink-0 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete list</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* List count badge */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[#83E9FF20] border border-[#83E9FF4D] rounded-lg text-xs text-[#83E9FF]">
          <span className="font-medium">{userLists.length}</span>
          <span className="text-gray-400">list{userLists.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={() => router.push("/market/tracker/public-lists")}
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none border-[#83E9FF4D] text-white hover:bg-[#83E9FF20]"
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Browse Public</span>
          <span className="sm:hidden">Public Lists</span>
        </Button>
        <Button
          onClick={onCreateList}
          size="sm"
          className="flex-1 sm:flex-none bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create List</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>
    </div>
  );
}

