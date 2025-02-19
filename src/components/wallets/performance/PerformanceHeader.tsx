interface PerformanceHeaderProps {
  totalValue: string;
}

export function PerformanceHeader({ totalValue }: PerformanceHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-white text-lg">Performance</h3>
      <div className="text-right">
        <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
        <p className="text-white text-xl">{totalValue}</p>
      </div>
    </div>
  );
}
