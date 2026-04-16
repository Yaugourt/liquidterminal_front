"use client";

import { memo, useId } from "react";
import { motion } from "framer-motion";

export type ChartTabType = 'distribution' | 'unstaking';

interface ValidatorChartTabsProps {
  activeTab: ChartTabType;
  onTabChange: (tab: ChartTabType) => void;
}

/**
 * Aurora-styled pill tabs for the validator chart section.
 */
export const ValidatorChartTabs = memo(function ValidatorChartTabs({
  activeTab,
  onTabChange
}: ValidatorChartTabsProps) {
  const uid = useId().replace(/:/g, "");
  const tabs = [
    { key: 'distribution' as const, label: 'Distribution' },
    { key: 'unstaking' as const, label: 'Unstaking' }
  ];

  return (
    <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-1">
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="relative rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
          >
            {isActive && (
              <motion.span
                layoutId={`validator-tab-${uid}`}
                className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? "text-white" : "text-text-secondary hover:text-white"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
});
