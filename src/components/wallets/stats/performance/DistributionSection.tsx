import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useWallets } from "@/store/use-wallets";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/numberFormatting';

// Couleurs pour le camembert
const COLORS = [
  '#83E9FF', // Bleu principal
  '#4ADE80', // Vert
  '#F9E370', // Jaune
  '#FF5757', // Rouge
  '#A78BFA', // Violet
  '#FB7185', // Rose
  '#34D399', // Vert émeraude
  '#FBBF24', // Orange
  '#60A5FA', // Bleu clair
  '#F472B6', // Rose vif
];

interface AssetDistribution {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export function DistributionSection() {
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  const { spotBalances, isLoading: balancesLoading } = useWalletsBalances(activeWallet?.address || '');
  const { data: spotMarketTokens, isLoading: tokensLoading } = useSpotTokens({ limit: 100 });
  const { format } = useNumberFormat();

  const isLoading = balancesLoading || tokensLoading;

  // Calculer la distribution des assets
  const distributionData = useMemo((): AssetDistribution[] => {
    if (!spotBalances || !spotMarketTokens || spotBalances.length === 0) {
      return [];
    }

    // Calculer la valeur de chaque asset
    const assetValues = spotBalances.map((balance) => {
      const normalizedCoin = balance.coin.toLowerCase();
      
      // Stablecoins ont toujours un prix de $1
      const stablecoins = ['usdc', 'usdt', 'dai', 'busd', 'tusd'];
      const isStablecoin = stablecoins.includes(normalizedCoin);
      
      let price = 0;
      if (isStablecoin) {
        price = 1;
      } else {
        const marketToken = spotMarketTokens.find(t => t.name.toLowerCase() === normalizedCoin);
        price = marketToken ? marketToken.price : 0;
      }
      
      const value = parseFloat(balance.total) * price;
      
      return {
        name: balance.coin.toUpperCase(),
        value,
        balance: parseFloat(balance.total)
      };
    }).filter(asset => asset.value > 0); // Filtrer les assets sans valeur

    // Calculer le total
    const totalValue = assetValues.reduce((sum, asset) => sum + asset.value, 0);
    
    if (totalValue === 0) return [];

    // Trier par valeur décroissante et prendre les 10 premiers
    const sortedAssets = assetValues
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Calculer les pourcentages et assigner les couleurs
    return sortedAssets.map((asset, index) => ({
      name: asset.name,
      value: asset.value,
      percentage: (asset.value / totalValue) * 100,
      color: COLORS[index % COLORS.length]
    }));
  }, [spotBalances, spotMarketTokens]);

  const formatCurrency = (value: number) => {
    return formatAssetValue(value, format);
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 p-4 pt-12">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      </div>
    );
  }

  if (distributionData.length === 0) {
    return (
      <div className="absolute inset-0 p-4 pt-12">
        <div className="flex justify-center items-center h-full">
          <p className="text-[#FFFFFF80]">Aucun asset spot disponible</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] p-3 rounded-md shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-white font-medium">{data.name}</span>
          </div>
          <div className="text-[#83E9FF] text-sm font-medium">
            {data.percentage.toFixed(1)}%
          </div>
          <div className="text-[#FFFFFF80] text-xs">
            {formatCurrency(data.value)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute inset-0 p-4 pt-12">
      <div className="flex h-full">
        {/* Camembert à gauche */}
        <div className="flex-1 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Liste des assets à droite - optimisée sans scroll */}
        <div className="flex-1 pl-4">
          <div className="h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2 max-h-full">
              {distributionData.map((asset, index) => (
                <div key={asset.name} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#FFFFFF0A] transition-colors">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-medium truncate">
                        {asset.name}
                      </span>
                      <span className="text-white text-xs font-medium ml-1">
                        {asset.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[#FFFFFF80] text-xs truncate">
                      {formatCurrency(asset.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 