"use client";

import { FeesChartSection } from "./FeesChartSection";

interface FeesChartDemoProps {
  chartHeight?: number;
}

/**
 * Composant de démonstration pour la chart des fees
 * Utilise le hook useFeesHistory avec la logique de sélection du dernier snapshot par jour
 */
export const FeesChartDemo = ({ chartHeight = 320 }: FeesChartDemoProps) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Fees Chart Demo</h3>
        <p className="text-sm text-[#FFFFFF80]">
          Cette chart affiche l'historique des fees avec deux sous-tabs : "All" (total_fees) et "Spot" (total_spot_fees).
          <br />
          Pour chaque jour, le système sélectionne automatiquement le snapshot le plus proche de minuit.
        </p>
      </div>
      
      <FeesChartSection chartHeight={chartHeight} />
    </div>
  );
}; 