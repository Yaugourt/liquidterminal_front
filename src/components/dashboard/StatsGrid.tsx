import { StatsCard } from "./StatsCard";

export function StatsGrid() {
  const stats = [
    { title: "24h spot volume", value: "652.195" },
    { title: "24h spot tokens", value: "652.195" },
    { title: "24h spot marketcap", value: "652.195" },
    { title: "total spot tokens", value: "652.195" },
    { title: "24h spot volume", value: "652.195" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 lg:gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
