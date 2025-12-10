"use client";

import { useState } from "react";
import { PerformanceSection } from "./performance/PerformanceSection";
import { DistributionSection } from "./performance/DistributionSection";
// type PerformanceTab is locally used or was in index.ts? 
// It was in PerformanceTabButtons.tsx which is deleted. I should define it locally.

type PerformanceTab = 'performance' | 'distribution';

export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('performance');

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden relative">

      {/* Tab Buttons Inlined */}
      <div className="absolute top-3 left-4 z-10">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'distribution', label: 'Distribution' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "performance" | "distribution")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'performance' && <PerformanceSection />}
      {activeTab === 'distribution' && <DistributionSection />}
    </div>
  );
}
