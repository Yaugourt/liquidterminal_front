import { Card } from "@/components/ui/card";
import { StatItem } from "./StatItem";

export function PortfolioStats() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <h3 className="text-white text-lg mb-6">Portfolio Statistics</h3>
      <div className="grid grid-cols-2 gap-y-6">
        <StatItem label="Total Balance:" value="$6,571.41" />
        <StatItem
          label="Portfolio Growth:"
          value="-14.09%"
          valueColor="text-[#FF5252]"
        />
        <StatItem label="USDC Balance:" value="$0.12" />
        <StatItem label="Other Tokens:" value="$6,571.28" />
      </div>
    </Card>
  );
}
