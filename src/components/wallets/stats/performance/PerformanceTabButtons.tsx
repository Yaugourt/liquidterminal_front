type PerformanceTab = 'performance' | 'distribution';

interface PerformanceTabButtonsProps {
  activeTab: PerformanceTab;
  onTabChange: (tab: PerformanceTab) => void;
}

export function PerformanceTabButtons({ activeTab, onTabChange }: PerformanceTabButtonsProps) {
  const tabs: { key: PerformanceTab; label: string }[] = [
    { key: 'performance', label: 'Performance' },
    { key: 'distribution', label: 'Distribution' }
  ];

  return (
    <div className="absolute top-2 left-3 sm:left-6 z-10">
      <div className="flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { PerformanceTab }; 