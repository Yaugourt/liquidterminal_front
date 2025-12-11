export const COLORS = {
  positive: "#4ADE80",
  negative: "#F87171",
  neutral: "#FFFFFF",
  primary: "#83E9FF",
  textSecondary: "#FFFFFF99",
  border: "rgba(255, 255, 255, 0.05)",
  background: "#0B0E14",
} as const;

export const STYLES = {
  table: {
    container: "overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
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