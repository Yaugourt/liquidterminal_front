import { HIP4_PRICES } from "@/lib/hip4/markets-static-data";
import { cn } from "@/lib/utils";
import { chartPalette } from "@/components/common";

export function Hip4PricesGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Object.entries(HIP4_PRICES).map(([ticker, val]) => {
        const pct = (val * 100).toFixed(1);
        const color = val >= 0.5 ? chartPalette.emeraldLight : chartPalette.roseSoft;
        return (
          <div
            key={ticker}
            className="rounded-lg border border-border-subtle bg-surface/40 p-3"
          >
            <div className="text-[11px] font-mono text-text-secondary mb-1">
              {ticker}
            </div>
            <div className="text-lg font-bold" style={{ color }}>
              {pct}%
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-surface/50 overflow-hidden">
              <div
                className={cn("h-full rounded-full")}
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
