import { Card } from "@/components/ui/card";
import { TradingViewChart } from "@/components/TradingViewChart";
import { useTrendingValidators } from "@/services/dashboard/hooks/useTrendingValidators";
import { useLatestAuctions } from "@/services/dashboard/hooks/useLatestAuctions";
import { TabSectionProps } from "@/components/types/dashboard.types";
import { TabButtons } from "./TabButtons";
import { ValidatorsTable, AuctionsTable, VaultTable } from "./DataTablesContent";

export function TabSection({
  activeTab,
  setActiveTab,
  chartHeight,
}: TabSectionProps) {
  const { validators, isLoading: validatorsLoading, error: validatorsError } = useTrendingValidators('stake');
  const { auctions, isLoading: auctionsLoading, error: auctionsError } = useLatestAuctions(5);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:gap-4">
        <div className="w-full lg:w-[400px] mb-4 lg:mb-0">
          <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "stacking" && (
            <ValidatorsTable
              validators={validators}
              isLoading={validatorsLoading}
              error={validatorsError}
            />
          )}

          {activeTab === "auction" && (
            <AuctionsTable
              auctions={auctions}
              isLoading={auctionsLoading}
              error={auctionsError}
            />
          )}

          {activeTab === "vault" && (
            <VaultTable
              vaults={[]}
              isLoading={false}
              error={null}
            />
          )}
        </div>

        <div className="w-full lg:flex-1">
          <Card className="h-[250px] sm:h-[300px] lg:h-[350px] bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
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
      </div>
    </div>
  );
}
