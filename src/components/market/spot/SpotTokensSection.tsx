import { Card } from "@/components/ui/card";
import { SpotTokenTabs } from "./SpotTokenTabs";
import { TokenTable } from "./SpotTokenTable";

export function TokensSection() {
  return (
    <div>
      <SpotTokenTabs />
      <Card className="border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
        <TokenTable />
      </Card>
    </div>
  );
}
