import { memo, useState, useRef, useEffect } from "react";
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
        className="relative flex bg-brand-dark rounded-lg p-1 border border-border-subtle"
      >
        <div
          className="absolute top-1 bottom-1 bg-brand-accent rounded-md transition-all duration-300 ease-out"
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
            className={`relative z-10 px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${
              selectedPeriod === period ? 'text-brand-tertiary font-bold' : 'text-text-secondary hover:text-zinc-200'
            }`}
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
      <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
        {barCounts.map((count) => (
          <button
            key={count}
            onClick={() => setBarCount(count)}
            className={`px-2 py-1 text-xs font-medium transition-all rounded-md ${
              barCount === count
                ? 'bg-brand-accent text-brand-tertiary font-bold'
                : 'tab-inactive'
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
        <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all rounded-md ${
              chartType === 'line'
                ? 'bg-brand-accent text-brand-tertiary font-bold'
                : 'tab-inactive'
            }`}
          >
            <TrendingUp size={12} />
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all rounded-md ${
              chartType === 'bar'
                ? 'bg-brand-accent text-brand-tertiary font-bold'
                : 'tab-inactive'
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
    <div className="w-full h-full flex flex-col">
      <div className="p-4">
        {/* Header with tabs */}
        <div className="flex items-center justify-between mb-4">
          <ValidatorChartTabs 
            activeTab={activeChart} 
            onTabChange={setActiveChart} 
          />
          <ChartControls />
        </div>

        {/* Chart Container */}
        <div style={{ height: chartHeight }} className="relative">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}); 