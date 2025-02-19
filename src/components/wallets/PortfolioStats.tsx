import { Card } from "@/components/ui/card";

export function PortfolioStats() {
  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6">
      <h3 className="text-white text-lg mb-6">Portfolio Statistics</h3>
      <div className="grid grid-cols-2 gap-y-6">
        <div>
          <p className="text-[#FFFFFF99] text-sm mb-1">Total Balance:</p>
          <p className="text-white text-xl">$6,571.41</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-sm mb-1">Portfolio Growth:</p>
          <p className="text-[#FF5252] text-xl">-14.09%</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-sm mb-1">USDC Balance:</p>
          <p className="text-white text-xl">$0.12</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-sm mb-1">Other Tokens:</p>
          <p className="text-white text-xl">$6,571.28</p>
        </div>
      </div>
    </Card>
  );
}
