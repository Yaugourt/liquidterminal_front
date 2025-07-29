import { useMemo } from 'react';
import {  ChartDataPoint } from '../types/chart';

interface ChartDataConfig<T> {
  data: T[];
  getValue: (item: T) => number;
  getTimestamp: (item: T) => number | string;
  additionalData?: (item: T) => Record<string, unknown>;
}

export function useChartData<T>({
  data,
  getValue,
  getTimestamp,
  additionalData
}: ChartDataConfig<T>) {
  const processedData = useMemo(() => {
    if (!data?.length) return [];

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => {
      const timestampA = new Date(getTimestamp(a)).getTime();
      const timestampB = new Date(getTimestamp(b)).getTime();
      return timestampA - timestampB;
    });

    // Process data points
    return sortedData.map((item): ChartDataPoint => {
      const basePoint = {
        timestamp: new Date(getTimestamp(item)).getTime(),
        value: getValue(item)
      };

      if (additionalData) {
        return {
          ...basePoint,
          ...additionalData(item)
        };
      }

      return basePoint;
    });
  }, [data, getValue, getTimestamp, additionalData]);

  const latestValue = useMemo(() => {
    if (!processedData.length) return 0;
    return processedData[processedData.length - 1].value;
  }, [processedData]);

  const percentageChange = useMemo(() => {
    if (processedData.length < 2) return 0;
    
    const firstValue = processedData[0].value;
    const lastValue = processedData[processedData.length - 1].value;
    
    if (firstValue === 0) return 0;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [processedData]);

  const minValue = useMemo(() => {
    if (!processedData.length) return 0;
    return Math.min(...processedData.map(d => d.value));
  }, [processedData]);

  const maxValue = useMemo(() => {
    if (!processedData.length) return 0;
    return Math.max(...processedData.map(d => d.value));
  }, [processedData]);

  return {
    data: processedData,
    latestValue,
    percentageChange,
    minValue,
    maxValue
  };
} 