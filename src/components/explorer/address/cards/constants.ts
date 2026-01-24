import { Period } from "@/components/types/explorer.types";

export const PERIODS: Period[] = [
    { key: 'allTime', label: 'All Time' },
    { key: 'day', label: '24H' },
    { key: 'week', label: '7D' },
    { key: 'month', label: '30D' },
];

// Card a maintenant le style glass par défaut, on garde juste les classes spécifiques
export const CARD_BASE_CLASSES = "p-3"; 