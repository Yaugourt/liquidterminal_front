"use client";

import { memo, useState, useId } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { ChartPeriod } from "@/components/common";
import { PeriodSelector } from "@/components/common";
import { ValidatorChartTabs, ChartTabType } from "./ValidatorChartTabs";
import { HoldersDistributionChart } from "./HoldersDistributionChart";
import { UnstakingScheduleChart } from "./UnstakingScheduleChart";
import { StakingLineChart } from "./StakingLineChart";

interface ValidatorChartSectionProps {
  chartHeight?: number;
}

/**
 * Aurora-styled section displaying validator charts with tabs and controls.
 */
export const ValidatorChartSection = memo(function ValidatorChartSection({
  chartHeight = 250
}: ValidatorChartSectionProps) {
  const [activeChart, setActiveChart] = useState<ChartTabType>('distribution');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('7d');
  const [barCount, setBarCount] = useState<number>(10);
  const uid = useId().replace(/:/g, "");

  const renderChart = () => {
    switch (activeChart) {
      case 'distribution':
        return <HoldersDistributionChart height={chartHeight} />;
      case 'unstaking':
        return chartType === 'bar'
          ? <UnstakingScheduleChart height={chartHeight} barCount={barCount} />
          : <StakingLineChart height={chartHeight} period={selectedPeriod} />;
      default:
        return null;
    }
  };

  // Aurora pill for the Line/Bar chart-type toggle
  const ChartTypeToggle = () => (
    <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
      {(['line', 'bar'] as const).map((type) => {
        const isActive = chartType === type;
        return (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className="relative flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
          >
            {isActive && (
              <motion.span
                layoutId={`validator-type-${uid}`}
                className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1 capitalize ${
                isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {type === 'line' ? <TrendingUp size={12} /> : <BarChart3 size={12} />}
              {type}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Aurora pill for "next N days" bar-count selector
  const BarCountSelector = () => {
    const barCounts = [7, 10, 15, 30, 60, 90];
    return (
      <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
        {barCounts.map((count) => {
          const isActive = barCount === count;
          return (
            <button
              key={count}
              onClick={() => setBarCount(count)}
              className="relative rounded-lg px-2 py-1 text-[11px] font-semibold tabular-nums min-w-[24px]"
            >
              {isActive && (
                <motion.span
                  layoutId={`validator-barcount-${uid}`}
                  className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const ChartControls = () => {
    if (activeChart !== 'unstaking') return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <ChartTypeToggle />

        {chartType === 'line' && (
          <PeriodSelector
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
            options={['7d', '30d', '90d', '1y'] as const}
            labels={{ '1y': 'All Time' } as Partial<Record<ChartPeriod, string>>}
            variant="aurora"
          />
        )}

        {chartType === 'bar' && <BarCountSelector />}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Ambient glow — cyan-leaning to stay coherent with validator staking accent */}
      {/* Decorative corner halos — pinned to the edges (no negative inset) so they
          don't inflate the container's scrollWidth and trip the render gate. */}
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative z-10 p-4">
        {/* Header with tabs + context-sensitive controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              <span className="h-1 w-1 rounded-full bg-brand" />
              Validators
            </div>
            <ValidatorChartTabs
              activeTab={activeChart}
              onTabChange={setActiveChart}
            />
          </div>
          <ChartControls />
        </div>

        {/* Chart container */}
        <div style={{ height: chartHeight }} className="relative">
          {renderChart()}
        </div>
      </div>
    </div>
  );
});
