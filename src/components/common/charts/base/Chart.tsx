"use client";

import { BaseChartProps } from "../types/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

  return (
    <ResponsiveContainer width={width} height={height}>
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
        <Tooltip 
          content={(props: any) => {
            if (children?.tooltip && props.payload) {
              return children.tooltip({
                active: props.active,
                payload: props.payload.map((item: any) => ({
                  value: item.value ?? item.payload.value,
                  payload: item.payload
                })),
                label: props.label
              });
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          {...lineProps}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 