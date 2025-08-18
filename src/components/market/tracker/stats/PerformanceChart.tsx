"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  PerformanceSection, 
  DistributionSection, 
  PerformanceTabButtons, 
  type PerformanceTab 
} from "./performance";

export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('performance');

  return (
    <Card className="w-full h-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <PerformanceTabButtons 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {activeTab === 'performance' && <PerformanceSection />}
      {activeTab === 'distribution' && <DistributionSection />}
    </Card>
  );
}
