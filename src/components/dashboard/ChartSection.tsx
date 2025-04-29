import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TradingViewChart } from "@/components/TradingViewChart";
import { ChartSectionProps } from "@/components/types/dashboard.types";

export function ChartSection({ chartHeight }: ChartSectionProps) {
  return (
    <div className="w-full lg:flex-1">
      {/* Boutons de filtre du graphique */}
      <div className="flex justify-end gap-2 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
        <Button
          variant="ghost"
          size="sm"
          className="text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
        >
          All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
        >
          Strict
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
        >
          Auction
        </Button>
      </div>

      {/* Graphique */}
      <Card className="h-[250px] sm:h-[300px] lg:h-[350px] relative bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
        <div className="absolute top-2 sm:top-4 left-3 sm:left-6 z-10">
          <h3 className="text-xs sm:text-sm text-[#FFFFFF99]">
            Last auction price and auction evolution
          </h3>
        </div>

        <div className="absolute inset-0">
          <TradingViewChart
            symbol="ETHUSDT"
            theme="dark"
            height={chartHeight}
            containerId="tradingview_chart_2"
          />
        </div>
      </Card>
    </div>
  );
} 