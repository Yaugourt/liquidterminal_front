"use client";

import { BaseChartProps, ChartDataPoint } from "../types/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { ContentType } from 'recharts/types/component/Tooltip';

// Type helper for tooltip content
type TooltipPayload = Payload<ValueType, NameType>;

export function Chart({
  data,
  isLoading,
  error,
  height = "100%",
  width = "100%",
  formatValue = (value) => value.toString(),
  formatTime = (time: string | number) => new Date(time).toLocaleString(),
  xAxisProps = {},
  yAxisProps = {},
  gridProps = {},
  lineProps = {},
  children
}: BaseChartProps) {
  if (data.length === 0) return children?.empty || null;
  if (isLoading) return children?.loading || null;
  if (error) return children?.error || null;

  // Cast dimensions to expected types
  const responsiveWidth = typeof width === 'number' ? width : (width === "100%" ? "100%" as const : undefined);
  const responsiveHeight = typeof height === 'number' ? height : (height === "100%" ? "100%" as const : undefined);

  const tooltipContent: ContentType<ValueType, NameType> = ({ active, payload, label }) => {
    if (children?.tooltip && payload) {
      return children.tooltip({
        active,
        payload: payload.map((item: TooltipPayload) => ({
          value: typeof item.value === 'number' ? item.value : 0,
          payload: item.payload as ChartDataPoint
        })),
        label
      });
    }
    return null;
  };

  return (
    <ResponsiveContainer width={responsiveWidth} height={responsiveHeight}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" {...gridProps} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTime}
          {...xAxisProps}
        />
        <YAxis
          tickFormatter={formatValue}
          {...yAxisProps}
        />
        <Tooltip content={tooltipContent} />
        <Line
          type="monotone"
          dataKey="value"
          {...lineProps}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}