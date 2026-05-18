"use client";

import { PillTabs } from "@/components/ui/pill-tabs";
import { type Timeframe, TIMEFRAME_LABEL } from "@/lib/timeframe";

interface TimeframeTabsProps {
  /** Sous-ensemble de timeframes proposés (chaque page choisit le sien). */
  options: Timeframe[];
  /** Timeframe actif. */
  value: Timeframe;
  onChange: (value: Timeframe) => void;
  className?: string;
}

/**
 * `<TimeframeTabs>` — sélecteur de période V4, bâti sur `PillTabs`.
 * Source unique : remplace les sélecteurs 1h/24h/7d/30d réimplémentés.
 */
export function TimeframeTabs({ options, value, onChange, className }: TimeframeTabsProps) {
  return (
    <PillTabs
      tabs={options.map((tf) => ({ value: tf, label: TIMEFRAME_LABEL[tf] }))}
      activeTab={value}
      onTabChange={(v) => onChange(v as Timeframe)}
      className={className}
    />
  );
}
