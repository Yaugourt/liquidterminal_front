import { StatsCard } from "./StatsCard";

export function StatsGrid() {
  return (
    <div className="w-full px-4">
      <div className="grid grid-cols-2 gap-6">
        <StatsCard title="Block" value="652.365.195" />
        <StatsCard title="Block time" value="652.365.195" />
        <StatsCard title="Transactions" value="652.365.195" />
        <StatsCard title="User" value="652.365.195" />
      </div>
    </div>
  );
}
