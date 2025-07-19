"use client";

import { useState } from "react";
import { useReadListStore } from "@/store/use-read-list";
import { ReadListHeader } from "./ReadListHeader";
import { ReadListSidebar } from "./ReadListSidebar";
import { ReadListGrid } from "./ReadListGrid";
import { CreateReadListModal } from "./CreateReadListModal";
import { EmptyState } from "./EmptyState";

export function ReadListContent() {
  const { readLists, activeReadListId, getActiveReadList } = useReadListStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");

  const activeReadList = getActiveReadList();

  // Filter items based on search and status
  const filteredItems = activeReadList?.items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "read" && item.isRead) ||
                         (filterStatus === "unread" && !item.isRead);
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (readLists.length === 0) {
    return (
      <>
        <EmptyState onCreateReadList={() => setIsCreateModalOpen(true)} />
        <CreateReadListModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar with read lists */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <ReadListSidebar onCreateReadList={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {activeReadList ? (
          <>
            <ReadListHeader 
              readList={activeReadList}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
            <ReadListGrid items={filteredItems} readListId={activeReadList.id} />
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#FFFFFF80] text-lg">Select a read list to view its contents</p>
          </div>
        )}
      </div>

      <CreateReadListModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
} 