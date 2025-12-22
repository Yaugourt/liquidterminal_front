import { Period } from "@/components/types/explorer.types";

export const PERIODS: Period[] = [
    { key: 'allTime', label: 'All Time' },
    { key: 'day', label: '24H' },
    { key: 'week', label: '7D' },
    { key: 'month', label: '30D' },
];

export const CARD_BASE_CLASSES = "p-3 bg-[#151A25]/60 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20 rounded-xl overflow-hidden"; 