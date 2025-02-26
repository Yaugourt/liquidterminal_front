import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MarketStatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function MarketStatsCard({ title, children, className }: MarketStatsCardProps) {
  return (
    <Card className={cn("p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]", className)}>
      <h3 className="text-white text-base font-medium mb-4">{title}</h3>
      {children}
    </Card>
  );
}
