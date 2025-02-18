import { Card } from "@/components/ui/card";
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
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("vault")}
          className={`px-4 py-2 text-white rounded-md ${
            activeTab === "vault"
              ? "bg-[#26A69A]"
              : "bg-[#051728] hover:bg-[#0B2437]"
          }`}
        >
          Vault
        </button>
        <button
          onClick={() => setActiveTab("stacking")}
          className={`px-4 py-2 text-white rounded-md ${
            activeTab === "stacking"
              ? "bg-[#26A69A]"
              : "bg-[#051728] hover:bg-[#0B2437]"
          }`}
        >
          Stacking
        </button>
        <button
          onClick={() => setActiveTab("auction")}
          className={`px-4 py-2 text-white rounded-md ${
            activeTab === "auction"
              ? "bg-[#26A69A]"
              : "bg-[#051728] hover:bg-[#0B2437]"
          }`}
        >
          Auction
        </button>
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Table à gauche */}
        <Card className="lg:w-[400px] bg-[#051728E5] border border-[#83E9FF26] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="bg-[#0B2437] hover:bg-[#0B2437]">
                <TableHead className="text-left p-4 text-sm font-normal text-[#FFFFFF99]">
                  {activeTab === "vault" && "Name"}
                  {activeTab === "stacking" && "Staking Pool"}
                  {activeTab === "auction" && "Auction ID"}
                </TableHead>
                <TableHead className="text-right p-4 text-sm font-normal text-[#FFFFFF99]">
                  {activeTab === "vault" && "Price"}
                  {activeTab === "stacking" && "APR"}
                  {activeTab === "auction" && "Current Bid"}
                </TableHead>
                <TableHead className="text-right p-4 text-sm font-normal text-[#FFFFFF99]">
                  {activeTab === "vault" && "Variation"}
                  {activeTab === "stacking" && "TVL"}
                  {activeTab === "auction" && "Time Left"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {/* Contenu dynamique selon l'onglet actif */}
            </TableBody>
          </Table>
        </Card>

        {/* Graphique à droite */}
        <Card className="mt-4 lg:mt-0 lg:flex-1 h-[300px] lg:h-[350px] relative bg-[#051728E5] border border-[#83E9FF26] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <div className="absolute top-2 right-4 z-10 flex gap-2">
            <button className="px-4 py-1 text-sm text-white bg-[#051728] rounded-md">
              All
            </button>
            <button className="px-4 py-1 text-sm text-white bg-[#26A69A] rounded-md">
              Strict
            </button>
            <button className="px-4 py-1 text-sm text-white bg-[#051728] rounded-md">
              Auction
            </button>
          </div>

          <div className="absolute top-4 left-6 z-10">
            <h3 className="text-xs lg:text-sm text-[#FFFFFF99]">
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
  );
}
