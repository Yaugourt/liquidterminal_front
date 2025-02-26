import { Card } from "@/components/ui/card";
import { PerformanceHeader } from "./PerformanceHeader";
import { PerformanceGraph } from "./PerformanceGraph"; // À créer plus tard pour le graphique

export function PerformanceChart() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <PerformanceHeader totalValue="$6,571.28" />
      <div className="h-[240px] flex items-center justify-center text-[#FFFFFF99]">
        Graphique à venir
      </div>
    </Card>
  );
}
