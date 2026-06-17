"use client";

import { memo, useMemo } from "react";
import { PillTabs } from "@/components/ui/pill-tabs";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

/**
 * Status filter for the public-goods listings — built on the V4 `<PillTabs>`
 * primitive (boxed track + animated brand indicator), aligned with the
 * `/ecosystem/project` CategoryTabs. Each tab shows its count in `.mono`.
 */
export const StatusTabs = memo(function StatusTabs({
  activeTab,
  onTabChange,
  counts = { all: 0, approved: 0, pending: 0, rejected: 0 },
}: StatusTabsProps) {
  const tabs = useMemo(
    () =>
      [
        { id: "all", label: "All Projects", count: counts.all },
        { id: "approved", label: "Approved", count: counts.approved },
        { id: "pending", label: "Pending Review", count: counts.pending },
        { id: "rejected", label: "Rejected", count: counts.rejected },
      ].map((tab) => ({
        value: tab.id,
        label: (
          <span className="inline-flex items-center gap-1.5">
            {tab.label}
            {tab.count > 0 && (
              <span className="mono opacity-60">{tab.count}</span>
            )}
          </span>
        ),
      })),
    [counts]
  );

  return (
    <PillTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
});
