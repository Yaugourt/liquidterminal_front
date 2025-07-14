import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ValidatorChartSectionProps {
  chartHeight?: number;
}

/**
 * Section affichant les graphiques des validateurs avec tabs
 */
export const ValidatorChartSection = memo(function ValidatorChartSection({ 
  chartHeight = 180 
}: ValidatorChartSectionProps) {
  const [activeChart, setActiveChart] = useState<'staking' | 'distribution'>('staking');

  const tabs = [
    { key: 'staking' as const, label: 'Staking History' },
    { key: 'distribution' as const, label: 'Stake Distribution' }
  ];

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="p-3">
        {/* Header avec titre et tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#f9e370]" />
            <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">VALIDATOR ANALYTICS</h3>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveChart(tab.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeChart === tab.key
                    ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                    : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div style={{ height: chartHeight }} className="relative">
          {activeChart === 'staking' ? (
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 text-white/40" />
                <p>Staking History Chart</p>
                <p className="text-xs text-white/40 mt-1">Coming soon...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 text-white/40" />
                <p>Stake Distribution Chart</p>
                <p className="text-xs text-white/40 mt-1">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}); 