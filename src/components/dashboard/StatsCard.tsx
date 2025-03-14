import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card className="w-full p-3 sm:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal mb-1">
          {title}
        </p>
        <p className="text-[#83E9FF] text-base sm:text-lg md:text-xl font-medium text-center">
          {value}
        </p>
      </div>
    </Card>
  );
}
