import { Card } from "@/components/ui/card";
import { SpotTokenTabs } from "./SpotTokenTabs";
import { TokenTable } from "./SpotTokenTable";

export function TokensSection() {
  return (
    <div>
      <SpotTokenTabs />
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Card className="bg-[#051728]/60 backdrop-blur-md border border-[#83E9FF20] shadow-lg hover:border-[#83E9FF30] transition-all duration-300 overflow-hidden rounded-xl min-w-[800px]">
          <TokenTable />
        </Card>
      </div>
    </div>
  );
}
