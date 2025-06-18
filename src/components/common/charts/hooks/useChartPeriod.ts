import { useState, useCallback } from 'react';
import { ChartPeriod } from '../types/chart';

interface ChartPeriodConfig {
  defaultPeriod?: ChartPeriod;
  availablePeriods?: ChartPeriod[];
}

const DEFAULT_PERIODS: ChartPeriod[] = ['24h', '7d', '30d', '90d', '1y'];

export function useChartPeriod(config: ChartPeriodConfig = {}) {
  const {
    defaultPeriod = '24h',
    availablePeriods = DEFAULT_PERIODS
  } = config;

  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(defaultPeriod);

  const handlePeriodChange = useCallback((period: ChartPeriod) => {
    setSelectedPeriod(period);
  }, []);

  const getPeriodLabel = useCallback((period: ChartPeriod): string => {
    switch (period) {
      case '24h':
        return '24h';
      case '7d':
        return '7d';
      case '30d':
        return '30d';
      case '90d':
        return '90d';
      case '1y':
        return '1y';
      default:
        return period;
    }
  }, []);

  const getPeriodInMilliseconds = useCallback((period: ChartPeriod): number => {
    const DAY = 24 * 60 * 60 * 1000;
    switch (period) {
      case '24h':
        return DAY;
      case '7d':
        return 7 * DAY;
      case '30d':
        return 30 * DAY;
      case '90d':
        return 90 * DAY;
      case '1y':
        return 365 * DAY;
      default:
        return DAY;
    }
  }, []);

  return {
    selectedPeriod,
    availablePeriods,
    handlePeriodChange,
    getPeriodLabel,
    getPeriodInMilliseconds
  };
} 