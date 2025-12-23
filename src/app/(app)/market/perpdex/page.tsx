import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  Hip3InfoCard
} from "@/components/market/perpDex";

export default function PerpDexsPage() {
  return (
    <>
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <PerpDexStatsCard />
        <TopPerpDexsCard />
        <Hip3InfoCard />
      </div>

      {/* DEX Table */}
      <div>
        <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
          All Builder DEXs
        </h2>
        <PerpDexTable />
      </div>
    </>
  );
}
