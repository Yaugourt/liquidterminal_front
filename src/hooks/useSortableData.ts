"use client";

import { useState, useMemo } from 'react';
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
        // Vérifier si c'est un nombre sous forme de string (pour unrealizedPnl et funding)
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc'
            ? aNum - bNum
            : bNum - aNum;
        }
        
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