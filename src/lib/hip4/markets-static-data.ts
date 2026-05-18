/** Sample HyperCore asset rows + price map (from legacy public/hip4/markets.js). */
export const HIP4_ASSETS = [
  { coin: "#90", outcome: 9, outcomeName: "100m dash", side: 0, sideName: "Hypurr", mid: 0.674 },
  { coin: "#91", outcome: 9, outcomeName: "100m dash", side: 1, sideName: "Usain Bolt", mid: 0.326 },
  { coin: "#100", outcome: 10, outcomeName: "Akami", side: 0, sideName: "Yes", mid: 0.468 },
  { coin: "#101", outcome: 10, outcomeName: "Akami", side: 1, sideName: "No", mid: 0.532 },
  { coin: "#110", outcome: 11, outcomeName: "Canned Tuna", side: 0, sideName: "Yes", mid: 0.648 },
  { coin: "#111", outcome: 11, outcomeName: "Canned Tuna", side: 1, sideName: "No", mid: 0.352 },
  { coin: "#120", outcome: 12, outcomeName: "Otoro", side: 0, sideName: "Yes", mid: 0.351 },
  { coin: "#121", outcome: 12, outcomeName: "Otoro", side: 1, sideName: "No", mid: 0.649 },
  { coin: "#19520", outcome: 1952, outcomeName: "BTC>68k", side: 0, sideName: "Yes", mid: 0.7 },
  { coin: "#19521", outcome: 1952, outcomeName: "BTC>68k", side: 1, sideName: "No", mid: 0.3 },
] as const;

export const HIP4_PRICES: Record<string, number> = {
  "#90": 0.6615,
  "#91": 0.3385,
  "#100": 0.46848,
  "#101": 0.53152,
  "#110": 0.64841,
  "#111": 0.35159,
  "#120": 0.350625,
  "#121": 0.649375,
  "#130": 0.5,
  "#131": 0.5,
  "#19520": 0.75,
  "#19521": 0.25,
  "#20000": 0.5,
  "#20001": 0.5,
};

export function sideBadgeClass(name: string) {
  if (name === "Yes") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
  if (name === "No") return "bg-red-500/15 text-red-300 border-red-500/25";
  return "bg-brand/10 text-brand border-brand/20";
}
