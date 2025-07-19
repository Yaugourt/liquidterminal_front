
export type ChartPeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'allTime';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  [key: string]: any;
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
    value: any;
    payload: ChartDataPoint;
  }>;
  label?: string | number;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
  height?: string | number;
  width?: string | number;
  formatValue?: (value: number) => string;
  formatTime?: (time: string | number) => string;
  xAxisProps?: any;
  yAxisProps?: any;
  gridProps?: any;
  lineProps?: any;
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
    [key: string]: any;
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