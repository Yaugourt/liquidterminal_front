import { StatsCard } from "./StatsCard";
import { useEffect, useState, useCallback } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/numberFormatting";
import { ExplorerStat } from "@/components/types/explorer.types";
import { useExplorerStore } from "@/services/explorer";
import { Loader2 } from "lucide-react";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplorerStat[]>([]);
  const { format } = useNumberFormat();
  const { currentBlockHeight, connectBlocks, disconnectBlocks } = useExplorerStore();

  useEffect(() => {
    connectBlocks(); // Connecter seulement les blocks, pas les transactions
    return () => disconnectBlocks();
  }, [connectBlocks, disconnectBlocks]);

  // Fonction pour formater les nombres selon le format sélectionné
  const formatValue = useCallback((value: number, type: string) => {
    if (type === "users") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    if (type === "hypeStaked") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }
    if (type === "vaultsTvl") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
        currency: '$',
        showCurrency: true
      });
    }
    return formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [format]);

  useEffect(() => {
    if (currentBlockHeight > 0) {
      setStats([
        {
          title: "Blocks",
          type: "block",
          value: formatValue(currentBlockHeight, "blocks"),
        },
        {
          title: "Block Time",
          type: "blockTime",
          value: "0.07s",
        },
        {
          title: "Max TPS",
          type: "transactions",
          value: "200,000",
        },
        {
          title: "Users",
          type: "users",
          value: "N/A", // Pas d'appel API
        },
        {
          title: "HYPE Staked",
          type: "hypeStaked",
          value: "N/A", // Pas d'appel API
        },
        {
          title: "Vaults TVL",
          type: "vaultsTvl",
          value: "N/A", // Pas d'appel API
        },
      ]);
      setIsLoading(false);
    }
  }, [currentBlockHeight, formatValue]);

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-[#051728] border border-[#83E9FF4D] rounded-lg p-3 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-[#83E9FF4D] animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
