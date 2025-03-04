import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export function PerformanceChart() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <LineChart size={18} className="text-[#83E9FF]" />
          Performance
        </CardTitle>
        <div className="text-right">
          <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
          <p className="text-white text-xl">$6,571.28</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-[#FFFFFF99] mt-2">
          Chart coming soon
        </div>
      </CardContent>
    </Card>
  );
}
