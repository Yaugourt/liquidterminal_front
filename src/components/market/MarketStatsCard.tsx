import { Card } from "@/components/ui/card";

interface MarketStatsCardProps {
  title: string;
  children: React.ReactNode;
}

export function MarketStatsCard({ title, children }: MarketStatsCardProps) {
  return (
    <Card className="bg-[#051728] border border-[#83E9FF26] rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-white text-base font-medium mb-4">{title}</h3>
        {children}
      </div>
    </Card>
  );
}
