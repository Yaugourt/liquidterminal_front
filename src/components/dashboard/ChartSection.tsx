import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartSectionProps } from "@/components/types/dashboard.types";
import { useLatestAuctions } from "@/services/dashboard/hooks/useLatestAuctions";
import { useHLBridge } from "@/services/dashboard/hooks/useHLBridge";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type FilterType = "auction" | "strict" | "bridge";
type PeriodType = "7d" | "30d" | "90d" | "auction";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string | number;
  dataType: "gas" | "bridge" | "fees";
}

const formatValue = (value: number) => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  return value.toFixed(2);
};

const CustomTooltip = ({ active, payload, label, dataType }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
        <p className="text-[#FFFFFF99] text-xs">
          {new Date(Number(label)).toLocaleDateString()}
        </p>
        <p className="text-[#83E9FF] font-medium">
          {dataType === "gas" 
            ? `${payload[0].value.toFixed(2)} Gas`
            : dataType === "bridge"
            ? `$${formatValue(payload[0].value)}`
            : `$${formatValue(payload[0].value)} Fees`
          }
        </p>
      </div>
    );
  }
  return null;
};

export function ChartSection({ chartHeight }: ChartSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("auction");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("auction");
  const { auctions, isLoading: auctionsLoading } = useLatestAuctions(200);
  const { bridgeData, isLoading: bridgeLoading } = useHLBridge();

  const getDateLimit = () => {
    if (selectedPeriod === "auction") return 0;
    
    const now = Date.now();
    switch (selectedPeriod) {
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return now - 90 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const getChartData = () => {
    const dateLimit = getDateLimit();
    
    if (selectedFilter === "bridge" && bridgeData?.chainTvls?.Arbitrum?.tvl) {
      return bridgeData.chainTvls.Arbitrum.tvl
        .filter(item => item.date * 1000 >= dateLimit)
        .map(item => ({
          time: item.date * 1000,
          value: item.totalLiquidityUSD
        }))
        .sort((a, b) => a.time - b.time);
    }

    return auctions
      .filter(auction => auction?.time >= dateLimit)
      .map(auction => ({
        time: auction.time,
        value: parseFloat(auction.deployGas || "0")
      }))
      .sort((a, b) => a.time - b.time);
  };

  const isLoading = selectedFilter === "bridge" 
    ? bridgeLoading 
    : selectedFilter === "strict"
    ? auctionsLoading
    : auctionsLoading;

  const chartData = getChartData();

  return (
    <div className="w-full lg:flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilter("auction")}
            className={`text-white px-3 sm:px-4 py-1 text-xs whitespace-nowrap ${
              selectedFilter === "auction"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            Auction
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilter("strict")}
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
              selectedFilter === "strict"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            Fees
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilter("bridge")}
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
              selectedFilter === "bridge"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            HL Bridge
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPeriod("7d")}
            className={`text-white px-3 sm:px-4 py-1 text-xs whitespace-nowrap ${
              selectedPeriod === "7d"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            7D
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPeriod("30d")}
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
              selectedPeriod === "30d"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            30D
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPeriod("90d")}
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
              selectedPeriod === "90d"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            90D
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPeriod("auction")}
            className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
              selectedPeriod === "auction"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            All time
          </Button>
        </div>
      </div>

      <Card className="h-[250px] sm:h-[300px] lg:h-[350px] relative bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
        <div className="absolute top-2 sm:top-4 left-3 sm:left-6 z-10">
          <h2 className="text-sm sm:text-base text-white font-medium">
            {selectedFilter === "bridge" 
              ? "Hyperliquid Bridge TVL Evolution"
              : selectedFilter === "strict"
              ? "Fees Evolution"
              : "Last auction price and auction evolution"
            }
          </h2>
        </div>

        <div className="absolute inset-0 p-4 pt-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1692AD]"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    if (selectedPeriod === "7d") {
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    if (selectedPeriod === "auction") {
                      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
                    }
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }}
                  stroke="#FFFFFF99"
                  fontSize={12}
                />
                <YAxis
                  stroke="#FFFFFF99"
                  fontSize={12}
                  tickFormatter={(value) => 
                    selectedFilter === "bridge"
                      ? `$${formatValue(value)}`
                      : selectedFilter === "strict"
                      ? `$${formatValue(value)}`
                      : value.toFixed(0)
                  }
                  domain={['dataMin', 'dataMax']}
                  padding={{ top: 20, bottom: 20 }}
                />
                <Tooltip content={<CustomTooltip dataType={
                  selectedFilter === "bridge" 
                    ? "bridge" 
                    : selectedFilter === "strict"
                    ? "fees"
                    : "gas"
                } />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={
                    selectedFilter === "bridge" 
                      ? "#2DCCFF" 
                      : selectedFilter === "strict"
                      ? "#83E9FF"
                      : "#FFEB3B"
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
} 