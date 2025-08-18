import { memo, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { ChartPeriod } from "@/components/common/charts/types/chart";
import { ValidatorChartTabs, ChartTabType } from "./ValidatorChartTabs";
import { HoldersDistributionChart } from "./HoldersDistributionChart";
import { UnstakingScheduleChart } from "./UnstakingScheduleChart";
import { StakingLineChart } from "./StakingLineChart";

interface ValidatorChartSectionProps {
  chartHeight?: number;
}

/**
 * Section affichant les graphiques des validateurs avec tabs
 */
export const ValidatorChartSection = memo(function ValidatorChartSection({ 
  chartHeight = 250 
}: ValidatorChartSectionProps) {
  const [activeChart, setActiveChart] = useState<ChartTabType>('distribution');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('7d');
  const [barCount, setBarCount] = useState<number>(10);

  const renderChart = () => {
    switch (activeChart) {
      case 'distribution':
        return <HoldersDistributionChart height={chartHeight} />;
      case 'unstaking':
        return chartType === 'bar' ? 
          <UnstakingScheduleChart height={chartHeight} barCount={barCount} /> : 
          <StakingLineChart height={chartHeight} period={selectedPeriod} />;
      default:
        return null;
    }
  };

  const AnimatedPeriodSelector = ({ 
    selectedPeriod, 
    onPeriodChange, 
    availablePeriods 
  }: { 
    selectedPeriod: ChartPeriod; 
    onPeriodChange: (period: ChartPeriod) => void; 
    availablePeriods: ChartPeriod[]; 
  }) => {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    useEffect(() => {
      const selectedButton = buttonRefs.current[selectedPeriod];
      if (selectedButton && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = selectedButton.getBoundingClientRect();
        
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        });
      }
    }, [selectedPeriod]);

    return (
      <div 
        ref={containerRef}
        className="relative flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]"
      >
        <div
          className="absolute top-1 bottom-1 bg-[#83E9FF] rounded-sm transition-all duration-300 ease-out opacity-80"
          style={{
            left: indicatorStyle.left + 2,
            width: indicatorStyle.width - 4,
          }}
        />
        {availablePeriods.map((period) => (
          <button
            key={period}
            ref={(el) => { 
              buttonRefs.current[period] = el; 
            }}
            onClick={() => onPeriodChange(period)}
            className="relative z-10 px-2 py-1 text-xs font-medium text-white transition-colors duration-200 whitespace-nowrap hover:text-[#83E9FF]"
          >
            {period === '1y' ? 'All Time' : period}
          </button>
        ))}
      </div>
    );
  };

  const BarCountSelector = () => {
    const barCounts = [7, 10, 15, 30, 60, 90];
    
    return (
      <div className="relative flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]">
        {barCounts.map((count) => (
          <button
            key={count}
            onClick={() => setBarCount(count)}
            className={`px-2 py-1 text-xs font-medium transition-colors rounded-sm ${
              barCount === count
                ? 'bg-[#83E9FF] text-[#051728]'
                : 'text-white hover:text-[#83E9FF]'
            }`}
          >
            {count}
          </button>
        ))}
      </div>
    );
  };

  const ChartControls = () => {
    if (activeChart !== 'unstaking') return null;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors rounded-sm ${
              chartType === 'line'
                ? 'bg-[#83E9FF] text-[#051728]'
                : 'text-white hover:text-[#83E9FF]'
            }`}
          >
            <TrendingUp size={12} />
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors rounded-sm ${
              chartType === 'bar'
                ? 'bg-[#83E9FF] text-[#051728]'
                : 'text-white hover:text-[#83E9FF]'
            }`}
          >
            <BarChart3 size={12} />
            Bar
          </button>
        </div>
        
        {chartType === 'line' && (
          <AnimatedPeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            availablePeriods={['7d', '30d', '90d', '1y']}
          />
        )}
        
        {chartType === 'bar' && (
          <BarCountSelector />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-none bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="p-2">
        {/* Header avec tabs alignés */}
        <div className="flex items-center justify-between mb-1 pl-2">
          <ValidatorChartTabs 
            activeTab={activeChart} 
            onTabChange={setActiveChart} 
          />
          <ChartControls />
        </div>

        {/* Chart Container */}
        <div style={{ height: chartHeight }} className="relative -mx-1">
          {renderChart()}
        </div>
      </div>
    </Card>
  );
}); 