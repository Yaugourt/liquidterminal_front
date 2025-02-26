interface StatItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function StatItem({
  label,
  value,
  valueColor = "text-white",
}: StatItemProps) {
  return (
    <div>
      <p className="text-[#FFFFFF99] text-sm mb-1">{label}</p>
      <p className={`${valueColor} text-xl`}>{value}</p>
    </div>
  );
}
