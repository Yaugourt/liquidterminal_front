type OrderSubTab = 'open' | 'twap';

interface OrderTabButtonsProps {
  activeSubTab: OrderSubTab;
  onSubTabChange: (subTab: OrderSubTab) => void;
}

export function OrderTabButtons({ activeSubTab, onSubTabChange }: OrderTabButtonsProps) {
  const tabs: { key: OrderSubTab; label: string }[] = [
    { key: 'open', label: 'Open Orders' },
    { key: 'twap', label: 'TWAP Orders' }
  ];

  return (
    <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onSubTabChange(tab.key)}
          className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
            activeSubTab === tab.key
              ? 'bg-brand-accent text-brand-tertiary shadow-sm'
              : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 