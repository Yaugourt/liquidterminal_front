import { chartColors, chartPalette } from "@/components/common";

export const COLORS = {
  positive: chartPalette.emeraldLight,
  negative: "rgb(248 113 113)", // tailwind rose-400 equivalent
  neutral: "rgb(255 255 255)",
  primary: chartPalette.accent,
  textSecondary: "rgb(255 255 255 / 0.6)",
  border: "rgba(255, 255, 255, 0.05)",
  background: chartColors.labelBg, // = brand-main #0B0E14
} as const;

export const STYLES = {
  table: {
    container: "overflow-x-auto scrollbar-brand",
    row: "border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer",
    cell: {
      base: "py-2",
      first: "pl-4",
      last: "pr-4",
    },
  },
  button: {
    base: "font-normal hover:text-white p-0 flex items-center",
    sortable: "ml-auto justify-end w-full",
  },
} as const; 