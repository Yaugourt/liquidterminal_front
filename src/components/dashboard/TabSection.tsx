import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradingViewChart } from "@/components/TradingViewChart";

interface TabSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chartHeight: number;
}

export function TabSection({
  activeTab,
  setActiveTab,
  chartHeight,
}: TabSectionProps) {
  return (
    <div className="space-y-4">
      {/* Tabs principaux */}

      <div className="flex flex-col lg:flex-row lg:gap-4">
        {/* Groupe des boutons du bas et du tableau */}
        <div className="w-full lg:w-[400px] mb-4 lg:mb-0">
          {/* Boutons du bas */}
          <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
            <Button
              onClick={() => setActiveTab("vault")}
              variant="ghost"
              size="sm"
              className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
                activeTab === "vault"
                  ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
                  : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
              }`}
            >
              Vault
            </Button>
            <Button
              onClick={() => setActiveTab("stacking")}
              variant="ghost"
              size="sm"
              className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
                activeTab === "stacking"
                  ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
                  : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
              }`}
            >
              Staking
            </Button>
            <Button
              onClick={() => setActiveTab("auction")}
              variant="ghost"
              size="sm"
              className={`text-white px-4 sm:px-6 py-1 text-xs whitespace-nowrap ${
                activeTab === "auction"
                  ? "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
                  : "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
              }`}
            >
              Auction
            </Button>
          </div>

          {/* Tableau */}
          <Card className="h-[250px] sm:h-[300px] lg:h-[350px] bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
              <Table className="border-separate border-spacing-0 min-w-[300px]">
                <TableHeader>
                  <TableRow className="bg-[#051728E5] hover:bg-[#0B2437]">
                    <TableHead className="border-b-[1px] border-[#83E9FF4D] text-left p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                      Name
                    </TableHead>
                    <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                      APR
                    </TableHead>
                    <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                      TVL
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-white">
                  <TableRow className="bg-[#051728E5] border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                    <TableCell className="p-2 sm:p-3 text-xs sm:text-sm">HLP</TableCell>
                    <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                      19,15%
                    </TableCell>
                    <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                      $487 589 159
                    </TableCell>
                  </TableRow>
                  {/* Autres lignes */}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Section du graphique avec boutons */}
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
      </div>
    </div>
  );
}
