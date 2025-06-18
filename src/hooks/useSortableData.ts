"use client";

import { useState, useEffect, useMemo } from 'react';
import { SortKey } from '@/components/wallets/assets';
import { SortableHolding } from '@/components/types/wallet.types';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

export function useSortableData<T extends SortableHolding>(
  items: T[],
  config: SortConfig = { key: null, direction: 'desc' }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(config);

  // Mettre à jour la configuration de tri quand config change
  useEffect(() => {
    setSortConfig(config);
  }, [config.key]);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !items) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;

      // Gestion des valeurs nulles ou undefined
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      // Tri selon le type de données
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Pour les booléens
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc'
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      return 0;
    });
  }, [items, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // Si même clé, inverser la direction
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // Nouvelle clé, commencer par desc
      return { key, direction: 'desc' };
    });
  };

  return {
    items: sortedItems,
    sortConfig,
    requestSort
  };
} 