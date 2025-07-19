import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReadList } from "@/types/read-list.types";

interface ReadListHeaderProps {
  readList: ReadList;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: "all" | "read" | "unread";
  onFilterChange: (status: "all" | "read" | "unread") => void;
}

export function ReadListHeader({
  readList,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: ReadListHeaderProps) {
  const totalItems = readList.items.length;
  const readItems = readList.items.filter(item => item.isRead).length;
  const unreadItems = totalItems - readItems;

  return (
    <div className="mb-6 space-y-4">
      {/* Header info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">{readList.name}</h1>
          {readList.description && (
            <p className="text-[#FFFFFF80] mt-1">{readList.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-[#FFFFFF80]">
            <span>{totalItems} total</span>
            <span>{readItems} read</span>
            <span>{unreadItems} unread</span>
            {readList.isPublic && (
              <span className="bg-[#83E9FF1A] text-[#83E9FF] px-2 py-1 rounded-md text-xs">
                Public
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF80] w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles..."
            className="pl-10 bg-[#112941] border-[#83E9FF4D] text-white placeholder:text-[#FFFFFF80]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#FFFFFF80]" />
          <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "read", label: "Read" }
            ].map((filter) => (
              <Button
                key={filter.key}
                onClick={() => onFilterChange(filter.key as any)}
                size="sm"
                variant="ghost"
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  filterStatus === filter.key
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
  );
} 