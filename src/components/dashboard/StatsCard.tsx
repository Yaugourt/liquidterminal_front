import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card className=" w-[190px] bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm text-[#FFFFFF99] font-normal truncate">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <p className="text-lg text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
