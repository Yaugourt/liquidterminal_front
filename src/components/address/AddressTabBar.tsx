"use client";

import { PillTabs } from "@/components/ui/pill-tabs";
import type { AddressTabDefinition } from "./address-tabs.config";

interface AddressTabBarProps {
  tabs: AddressTabDefinition[];
  activeTab: string;
  onChange: (tabId: string) => void;
  /** Stick the bar below the app header on scroll. Defaults to true. */
  sticky?: boolean;
}

/**
 * Unified tab bar used for all address-analytics routes.
 * Wraps the shared `PillTabs` with icons + optional sticky behaviour.
 */
export function AddressTabBar({
  tabs,
  activeTab,
  onChange,
  sticky = true,
}: AddressTabBarProps) {
  const options = tabs.map((tab) => {
    const Icon = tab.icon;
    return {
      value: tab.id,
      label: (
        <span className="flex items-center gap-1.5">
          <Icon size={13} className="opacity-80" />
          {tab.label}
        </span>
      ),
    };
  });

  return (
    <div
      className={
        sticky
          ? "sticky top-16 z-20 -mx-2 px-2 py-2 backdrop-blur-md bg-base/70 rounded-lg"
          : "py-1"
      }
    >
      <PillTabs
        tabs={options}
        activeTab={activeTab}
        onTabChange={onChange}
        className="border border-border-subtle"
      />
    </div>
  );
}
