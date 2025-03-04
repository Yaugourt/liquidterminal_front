import { Card, CardContent } from "@/components/ui/card";
import { TokenTable } from "@/components/market/TokenTable";
import { SectionTitle } from "../SectionTitle";
import { Database } from "lucide-react";

export function AssetsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Assets</SectionTitle>
        <div className="flex items-center text-[#FFFFFF99] text-sm">
          <Database size={16} className="mr-2" />
          Total assets: 5
        </div>
      </div>
      <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
        <CardContent className="p-0">
          <TokenTable tokens={[]} loading={false} />
        </CardContent>
      </Card>
    </div>
  );
}
