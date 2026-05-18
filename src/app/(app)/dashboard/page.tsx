"use client";

import { PageHeader } from "@/components/common";
import { HeroPulse } from "@/components/dashboard/HeroPulse";
import { SpotModule } from "@/components/dashboard/modules/SpotModule";
import { PerpModule } from "@/components/dashboard/modules/PerpModule";
import { PerpDexModule } from "@/components/dashboard/modules/PerpDexModule";
import { BuildersModule } from "@/components/dashboard/modules/BuildersModule";
import { ExplorerModule } from "@/components/dashboard/modules/ExplorerModule";
import { EcosystemModule } from "@/components/dashboard/modules/EcosystemModule";
import { WikiModule } from "@/components/dashboard/modules/WikiModule";

/**
 * Dashboard — vue d'ensemble de Liquid Terminal.
 *
 * Un en-tête (HeroPulse) + une grille de modules : un module = le résumé
 * d'une zone de l'app (KPI phares + mini-aperçu + lien vers la page).
 */
export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — every corner of Liquid Terminal at a glance."
      />

      {/* En-tête — volume écosystème + KPI globaux */}
      <HeroPulse />

      {/* Modules — un résumé par zone de l'app */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <SpotModule />
        <PerpModule />
        <PerpDexModule />
        <BuildersModule />
        <ExplorerModule />
        <EcosystemModule />
        <WikiModule />
      </div>
    </div>
  );
}
