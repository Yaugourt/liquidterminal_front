import { Card } from "@/components/ui/card";

export function PerformanceChart() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-white text-lg">Performance</h3>
        <div className="text-right">
          <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
          <p className="text-white text-xl">$6,571.28</p>
        </div>
      </div>
      <div className="h-[240px] flex items-center justify-center text-[#FFFFFF99]">
        Graphique à venir
      </div>
    </Card>
  );
}
