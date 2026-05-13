import { memo } from "react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { BarChart2, Clock, CalendarDays, Scale, Wallet } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { SpotGlobalStats } from "@/services/market/spot/types";
import { PerpGlobalStats } from "@/services/market/perp/types";
import { StatsPanel } from "@/components/common";

type GlobalStats = SpotGlobalStats | PerpGlobalStats;

// Type guards
function isSpotStats(stats: GlobalStats): stats is SpotGlobalStats {
  return 'totalSpotUSDC' in stats;
}

function isPerpStats(stats: GlobalStats): stats is PerpGlobalStats {
  return 'hlpTvl' in stats;
}

interface GlobalStatsCardProps {
  market: 'spot' | 'perp';
}

interface InlineStatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InlineStat({ icon, label, value }: InlineStatProps) {
  return (
    <div>
      <div className="text-text-secondary mb-1 flex items-center text-xs">
        <span className="mr-1.5">{icon}</span>
        {label}
      </div>
      <div className="text-white font-bold text-sm pl-5">{value}</div>
    </div>
  );
}

const usdFormat = { minimumFractionDigits: 0, maximumFractionDigits: 1, currency: '$', showCurrency: true } as const;

export const GlobalStatsCard = memo(function GlobalStatsCard({ market }: GlobalStatsCardProps) {
  const { stats: spotStats, isLoading: spotLoading, error: spotError } = useSpotGlobalStats();
  const { stats: perpStats, isLoading: perpLoading, error: perpError } = usePerpGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { format } = useNumberFormat();

  const stats = market === 'spot' ? spotStats : perpStats;
  const isLoading = (market === 'spot' ? spotLoading : perpLoading) || feesLoading;
  const error = market === 'spot' ? spotError : perpError;

  const items = market === 'spot'
    ? [
        {
          icon: <CalendarDays className="h-3.5 w-3.5 text-brand-accent" />,
          label: "Daily Fees",
          value: feesStats ? formatNumber(feesStats.dailySpotFees, format, usdFormat) : '$0',
        },
        {
          icon: <Clock className="h-3.5 w-3.5 text-brand-accent" />,
          label: "Hourly Fees",
          value: feesStats ? formatNumber(feesStats.hourlySpotFees, format, usdFormat) : '$0',
        },
        {
          icon: <Wallet className="h-3.5 w-3.5 text-brand-accent" />,
          label: "Total USDC",
          value: stats && isSpotStats(stats) ? formatNumber(stats.totalSpotUSDC, format, usdFormat) : '$0',
        },
        {
          icon: <BarChart2 className="h-3.5 w-3.5 text-brand-accent" />,
          label: "24h Volume",
          value: stats ? formatNumber(stats.totalVolume24h, format, usdFormat) : '$0',
        },
      ]
    : [
        {
          icon: <Scale className="h-3.5 w-3.5 text-brand-accent" />,
          label: "Open Interest",
          value: stats && isPerpStats(stats) ? formatNumber(stats.totalOpenInterest, format, usdFormat) : '$0',
        },
        {
          icon: <BarChart2 className="h-3.5 w-3.5 text-brand-accent" />,
          label: "24h Volume",
          value: stats ? formatNumber(stats.totalVolume24h, format, usdFormat) : '$0',
        },
        {
          icon: <Clock className="h-3.5 w-3.5 text-brand-accent" />,
          label: "Daily Fees",
          value: feesStats ? formatNumber(feesStats.dailyFees, format, usdFormat) : '$0',
        },
        {
          icon: <Wallet className="h-3.5 w-3.5 text-brand-accent" />,
          label: "HLP TVL",
          value: stats && isPerpStats(stats) ? formatNumber(stats.hlpTvl, format, usdFormat) : '$0',
        },
      ];

  return (
    <StatsPanel
      title="Global Stats"
      icon={<BarChart2 size={16} className="text-brand-gold" />}
      iconVariant="gold"
      isLoading={isLoading}
      error={error}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm content-center h-full">
        {items.map((item) => (
          <InlineStat key={item.label} {...item} />
        ))}
      </div>
    </StatsPanel>
  );
});
