import { Card } from "@/components/ui/card";
import { TokenTable } from "@/components/market/TokenTable";
import { SectionTitle } from "../SectionTitle";

export function AssetsSection() {
  return (
    <div>
      <SectionTitle>Assets</SectionTitle>
      <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
        <TokenTable tokens={[]} loading={false} />
      </Card>
    </div>
  );
}
