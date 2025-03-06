import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card className="p-4 bg-[#051728E5] max-w-[100%] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
      <div className="flex flex-col ">
        <h3 className="text-sm text-[#FFFFFF99] overflow-hidden text-ellipsis ">
          {title}
        </h3>
        <p className="text-white text-lg mt-2 overflow-hidden">{value}</p>
      </div>
    </Card>
  );
}
