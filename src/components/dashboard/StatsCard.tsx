interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="p-2 lg:p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="flex flex-col gap-4">
        <h3 className="text-xs lg:text-[16px] text-[#FFFFFF99] truncate">
          {title}
        </h3>
        <p className="text-sm lg:text-xl text-white">{value}</p>
      </div>
    </div>
  );
}
