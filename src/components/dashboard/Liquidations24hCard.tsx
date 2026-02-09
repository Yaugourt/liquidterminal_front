"use client";

import { Card } from "@/components/ui/card";
import { useLiquidations24h } from "@/services/dashboard";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign 
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface Liquidations24hCardProps {
  className?: string;
}

/**
 * Card compacte affichant les statistiques de liquidation des dernières 24h
 */
export function Liquidations24hCard({ className }: Liquidations24hCardProps) {
  const { stats, isLoading, error } = useLiquidations24h(30000);
  const { format } = useNumberFormat();

  // Calculer le ratio Long/Short basé sur les counts
  const totalCount = stats.longCount + stats.shortCount;
  const longPercent = totalCount > 0 ? (stats.longCount / totalCount) * 100 : 50;

  if (error) {
    return (
      <Card className={`p-4 text-center text-rose-400 text-sm ${className || ''}`}>
        Error loading liquidations
      </Card>
    );
  }

  return (
    <Card className={`p-4 flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <Zap size={16} className="text-rose-400" />
        </div>
        <h3 className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
          Liquidations 24h
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      ) : (
        <>
          {/* Volume total */}
          <div className="flex items-baseline gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-rose-400" />
            <span className="text-xl max-sm:text-lg text-white font-bold tracking-tight">
              ${formatNumber(stats.totalVolume, format, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-text-muted">
              ({stats.liquidationsCount.toLocaleString()} liqs)
            </span>
          </div>

          {/* Stats supplémentaires */}
          <div className="flex items-center justify-between text-xs mb-3">
            <div>
              <span className="text-text-muted">Top Token</span>
              <p className="text-white font-medium">{stats.topToken}</p>
            </div>
            <div className="text-right">
              <span className="text-text-muted">Fees</span>
              <p className="text-brand-gold font-medium">
                ${formatNumber(stats.totalFees, format, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Spacer pour pousser la barre en bas */}
          <div className="flex-1 min-h-2" />

          {/* Barre de progression Long/Short */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-2 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${longPercent}%` }}
                />
              </div>
            </div>
            
            {/* Labels Long/Short */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{longPercent.toFixed(0)}% Long</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-rose-400 font-medium">{(100 - longPercent).toFixed(0)}% Short</span>
                <TrendingDown className="h-3 w-3 text-rose-400" />
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
