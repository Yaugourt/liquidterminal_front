import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export function StatItem({
  label,
  value,
  valueColor = "text-white",
  icon,
}: StatItemProps) {
  return (
    <div className="group">
      <div className="flex items-center gap-2">
        {icon && <div className="text-[#83E9FF99] group-hover:text-[#83E9FF]">{icon}</div>}
        <p className="text-[#FFFFFF99] text-sm mb-1 group-hover:text-white transition-colors">{label}</p>
      </div>
      <p className={cn("text-xl font-medium transition-colors", valueColor)}>{value}</p>
    </div>
  );
}
