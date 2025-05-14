import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, BarChart3, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Types pour les données
interface Holder {
  address: string;
  balance: string;
  percentage: number;
  transactions: number;
}

interface HolderChartData {
  name: string;
  value: number;
  transactions: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
        <p className="text-[#FFFFFF99] text-xs">{`${payload[0].name}`}</p>
        <p className="text-[#83E9FF] font-medium">
          {`${payload[0].value.toFixed(2)}%`}
        </p>
        {payload[0].payload.transactions && (
          <p className="text-[#FFFFFF99] text-xs">
            {`Transactions: ${payload[0].payload.transactions}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

type ChartType = "pie" | "bar";

export function TopHoldersCharts() {
  const [isLoading, setIsLoading] = useState(true);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [chartType, setChartType] = useState<ChartType>("pie");
  const [chartData, setChartData] = useState<HolderChartData[]>([]);

  // Couleurs pour le graphique
  const COLORS = ['#83E9FF', '#2DCCFF', '#1692AD', '#0B5C70', '#05333F'];

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      const holdersData = [
        {
          address: "0x8945cAb1eBF1b0Ec2d63697f27c0E2A2F6092910",
          balance: "134,568,927.53",
          percentage: 12.4,
          transactions: 1432
        },
        {
          address: "0xCd3B766CcDd6Ae4f2982b3b642C82f4C3073365F",
          balance: "87,345,123.78",
          percentage: 8.1,
          transactions: 947 
        },
        {
          address: "0xa7E2f1c28Ce49A24E1CC814a949580C2C2529C10",
          balance: "56,471,892.12",
          percentage: 5.2,
          transactions: 658
        },
        {
          address: "0x22e718C22e3EB733e628a5F953546026C8F3E368",
          balance: "43,218,764.35",
          percentage: 4.0,
          transactions: 521
        },
        {
          address: "0xF01b78D27684AD5F50699a59187D1Be4352E59Ce",
          balance: "28,974,351.67",
          percentage: 2.7,
          transactions: 346
        },
      ];
      
      setHolders(holdersData);
      
      // Préparer les données pour les graphiques
      const chartData = holdersData.map(holder => ({
        name: truncateAddress(holder.address),
        value: holder.percentage,
        transactions: holder.transactions
      }));
      
      setChartData(chartData);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fonction pour tronquer les adresses
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculer le total du reste des holders
  const totalHoldersPercentage = holders.reduce((total, holder) => total + holder.percentage, 0);
  const remainingPercentage = 100 - totalHoldersPercentage;

  // Données complètes pour le graphique avec "Others"
  const completeChartData = [...chartData];
  if (remainingPercentage > 0) {
    completeChartData.push({
      name: "Others",
      value: remainingPercentage,
      transactions: 0
    });
  }

  return (
    <Card className="bg-[#051728E5] rounded-xl border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#83E9FF33]">
        <div className="flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-[#83E9FF]" />
          <h3 className="text-white text-lg font-medium">Top Holders</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartType("pie")}
            className={`text-white px-3 py-1 text-xs ${
              chartType === "pie"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            <PieChart className="w-4 h-4 mr-1" />
            Pie
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartType("bar")}
            className={`text-white px-3 py-1 text-xs ${
              chartType === "bar"
                ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Bar
          </Button>
          <Badge variant="outline" className="bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]">
            <div className="flex items-center">
              <span className="mr-1 text-xs">●</span>
              Connected
            </div>
          </Badge>
        </div>
      </div>

      <div className="p-4 h-[280px] md:h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1692AD]"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <RechartPieChart>
                <Pie
                  data={completeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {completeChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => (
                    <span className="text-white text-xs">{value}</span>
                  )}
                />
              </RechartPieChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
                <XAxis 
                  dataKey="name" 
                  stroke="#FFFFFF99"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#FFFFFF99"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#83E9FF" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
} 