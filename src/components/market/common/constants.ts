export const COLORS = {
  positive: "#4ADE80",
  negative: "#F87171",
  neutral: "#FFFFFF",
  primary: "#83E9FF",
  textSecondary: "#FFFFFF99",
  border: "#FFFFFF1A",
  background: "#051728",
} as const;

export const STYLES = {
  table: {
    container: "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent",
    row: "border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer",
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