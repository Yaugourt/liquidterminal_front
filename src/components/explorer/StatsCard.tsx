import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card className="p-6 bg-[#051728E5] w-full border border-[#83E9FF4D] rounded-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-[#FFFFFF99]">
          {title}
        </h3>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </Card>
  );
}
