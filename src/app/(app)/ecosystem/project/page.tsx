"use client";

import { useState } from "react";
import { ProjectsGrid } from "@/components/ecosystem/project";

export default function L1ProjectPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ProjectsGrid
      activeTab={activeTab}
      currentPage={currentPage}
      onTabChange={handleTabChange}
      onPageChange={handlePageChange}
    />
  );
}