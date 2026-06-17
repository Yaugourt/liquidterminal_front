"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader } from "@/components/common";
import { ProjectsGrid } from "@/components/ecosystem/project";

export default function L1ProjectPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTitle("Ecosystem Projects");
  }, [setTitle]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ecosystem"
        description="Projects building on HyperLiquid — browse, filter by category, and discover what's shipping."
      />
      <ProjectsGrid
        activeTab={activeTab}
        currentPage={currentPage}
        onTabChange={handleTabChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
