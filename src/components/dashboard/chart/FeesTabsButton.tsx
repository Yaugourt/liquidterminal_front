"use client";

interface FeesTabsButtonProps {
  selectedFeeType: "all" | "spot";
  onFeeTypeChange: (feeType: "all" | "spot") => void;
}

export const FeesTabsButton = ({ selectedFeeType, onFeeTypeChange }: FeesTabsButtonProps) => {
  const tabs: { key: "all" | "spot"; label: string }[] = [
    { key: 'all', label: 'total_fees' },
    { key: 'spot', label: 'total_spot_fees' }
  ];

  return (
    <div className="flex justify-start items-center">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onFeeTypeChange(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedFeeType === tab.key
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
}; 