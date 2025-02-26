import { StatsCard } from "./StatsCard";

export function StatsGrid() {
  const stats = [
    { title: "Block", value: "652.365.195" },
    { title: "Block time", value: "652.365.195" },
    { title: "Transactions", value: "652.365.195" },
    { title: "User", value: "652.365.195" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
