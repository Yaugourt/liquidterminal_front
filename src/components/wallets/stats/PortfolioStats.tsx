import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatItem } from "./StatItem";
import { CreditCard, TrendingDown, Wallet2, Coins } from "lucide-react";

export function PortfolioStats() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
      <CardHeader>
        <CardTitle className="text-white text-lg">Portfolio Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-6">
          <StatItem 
            label="Total Balance:" 
            value="$6,571.41"
            icon={<Wallet2 size={18} />}
          />
          <StatItem
            label="Portfolio Growth:"
            value="-14.09%"
            valueColor="text-[#FF5252]"
            icon={<TrendingDown size={18} />}
          />
          <StatItem 
            label="USDC Balance:" 
            value="$0.12"
            icon={<CreditCard size={18} />}
          />
          <StatItem 
            label="Other Tokens:" 
            value="$6,571.28"
            icon={<Coins size={18} />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
