
export type ChartPeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'allTime';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  [key: string]: unknown;
}

export interface ChartProps {
  data: ChartDataPoint[];
  period: ChartPeriod;
  isLoading?: boolean;
  error?: Error | null;
  height?: number;
  width?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
}

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string | number;
}

// Types for Recharts props
interface XAxisProps {
  dataKey?: string;
  tickFormatter?: (value: unknown) => string;
  [key: string]: unknown;
}

interface YAxisProps {
  tickFormatter?: (value: number) => string;
  [key: string]: unknown;
}

interface GridProps {
  strokeDasharray?: string;
  [key: string]: unknown;
}

interface LineProps {
  type?: "monotone" | "linear" | "step" | "stepBefore" | "stepAfter" | "basis" | "basisOpen" | "basisClosed" | "natural" | "monotoneX" | "monotoneY" | "monotoneX" | "monotoneY";
  dataKey?: string;
  [key: string]: unknown;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
  height?: string | number;
  width?: string | number;
  formatValue?: (value: number) => string;
  formatTime?: (time: string | number) => string;
  xAxisProps?: XAxisProps;
  yAxisProps?: YAxisProps;
  gridProps?: GridProps;
  lineProps?: LineProps;
  children?: {
    loading?: React.ReactNode;
    empty?: React.ReactNode;
    error?: React.ReactNode;
    tooltip?: (props: TooltipProps) => React.ReactNode;
  };
}

export interface BaseTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    [key: string]: unknown;
  }>;
  label?: string | number;
  formatValue?: (value: number) => string;
  formatTime?: (time: number | string) => string;
}

export interface BasePeriodProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
  options?: ChartPeriod[];
  className?: string;
} 