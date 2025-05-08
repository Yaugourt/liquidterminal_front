import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/components/types/dashboard.types";

export function StatsCard({ title, value, change, isLoading }: StatsCardProps) {
  return (
    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <h3 className="text-xs sm:text-sm text-[#FFFFFF99] mb-2">{title}</h3>
      {isLoading ? (
        <div className="h-8 bg-[#1692AD] animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className=" sm:text-l text-white">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
