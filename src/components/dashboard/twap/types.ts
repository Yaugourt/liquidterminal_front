export interface TwapTableData {
  id: string;
  type: 'Buy' | 'Sell';
  value: number; // Total value in USD
  token: string; // e.g., "USOL", "HYPE"
  amount: string; // e.g., "1900"
  user: string;
  progression: number; // Percentage (0-100)
  time: number;
  hash: string;
  duration: number; // Duration in minutes
  reduceOnly: boolean;
  ended?: string | null;
  error?: string | null;
}

export interface TwapTabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableTokens: string[];
}

export interface TwapTableProps {
  twaps: TwapTableData[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  showPagination: boolean;
} 