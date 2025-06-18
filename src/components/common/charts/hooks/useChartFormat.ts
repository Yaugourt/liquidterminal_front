import { useCallback } from 'react';
import { useNumberFormat } from '@/store/number-format.store';
import { ChartPeriod } from '../types/chart';

interface FormatOptions {
  currency?: string;
  showCurrency?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function useChartFormat() {
  const { format } = useNumberFormat();

  const formatValue = useCallback((value: number, options: FormatOptions = {}) => {
    const {
      currency = 'USD',
      showCurrency = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2
    } = options;

    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('en-US', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  }, [format]);

  const formatTime = useCallback((timestamp: number | string, period?: ChartPeriod) => {
    const date = new Date(timestamp);

    switch (period) {
      case '24h':
        return date.toLocaleTimeString([], { 
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case '7d':
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric'
        });
      
      case '30d':
      case '90d':
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric'
        });
      
      case '1y':
        return date.toLocaleDateString([], {
          month: 'short',
          year: 'numeric'
        });
      
      default:
        return date.toLocaleString();
    }
  }, []);

  const formatPercent = useCallback((value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }, []);

  return {
    formatValue,
    formatTime,
    formatPercent
  };
} 