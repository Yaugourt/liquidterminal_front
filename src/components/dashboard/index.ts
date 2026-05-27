/**
 * dashboard/ barrel — primitives & cartes du Dashboard V4.
 *
 * Voir DESIGN_SYSTEM.md §7 (OverviewModule) et §12 (inventaire des cartes).
 */

// Primitives
export { SectionHead } from "./SectionHead";
export { Sparkline } from "./Sparkline";
export {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  ModuleRow,
  ModuleSubhead,
  type ModuleColumn,
  type ModuleRowStat,
} from "@/components/common";

// Cartes V4
export { PulseBar } from "./PulseBar";
export { MoversCard } from "./MoversCard";
export { AuctionsPanel } from "./AuctionsPanel";
export { LiquidationsPanel } from "./LiquidationsPanel";
export { TwapPanel } from "./TwapPanel";
export { Hip3MarketsPanel } from "./Hip3MarketsPanel";
export { Hip4OutcomesCard } from "./Hip4OutcomesCard";
export { StablecoinsCard } from "./StablecoinsCard";
export { BuildersConcentrationCard } from "./BuildersConcentrationCard";

// Leaderboard modules
export { VaultsModule } from "./modules/VaultsModule";
export { ValidatorsModule } from "./modules/ValidatorsModule";
export { BuildersModule } from "./modules/BuildersModule";

// Chart V4 (multi-séries dual-axis)
export { ChartSection } from "./chart/ChartSection";
export { MultiSeriesAreaChart } from "./chart/MultiSeriesAreaChart";

// Sous-paquets utilisés hors dashboard
export * from "./twap";
