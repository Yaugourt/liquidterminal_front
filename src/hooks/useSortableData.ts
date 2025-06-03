"use client";

import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export function useSortableData<T extends Record<string, any>>(
  items: T[],
  config: SortConfig<T> = { key: null, direction: 'desc' }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(config);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;

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

      // Pour les dates (vérifier si c'est un timestamp valide)
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortConfig.direction === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }

      return 0;
    });
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
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