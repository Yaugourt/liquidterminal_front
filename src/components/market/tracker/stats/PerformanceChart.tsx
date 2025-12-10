"use client";

import { useState } from "react";
import { 
  PerformanceSection, 
  DistributionSection, 
  PerformanceTabButtons, 
  type PerformanceTab 
} from "./performance";

export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('performance');

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden relative">
      <PerformanceTabButtons 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {activeTab === 'performance' && <PerformanceSection />}
      {activeTab === 'distribution' && <DistributionSection />}
    </div>
  );
}
