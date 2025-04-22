import { useState, useEffect } from 'react';

/**
 * Type pour la configuration de tri
 */
export type SortConfig<T> = {
  key: keyof T | null;
  direction: "asc" | "desc";
};

/**
 * Hook personnalisé pour gérer le tri des tableaux
 * @param data Les données à trier
 * @param defaultSortKey La clé par défaut pour le tri initial
 * @param defaultSortDirection La direction par défaut pour le tri initial
 * @returns Les données triées, la configuration de tri et la fonction pour trier
 */
export function useTableSort<T>(
  data: T[],
  defaultSortKey: keyof T,
  defaultSortDirection: "asc" | "desc" = "desc"
) {
  const [sortedData, setSortedData] = useState<T[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: defaultSortKey,
    direction: defaultSortDirection,
  });

  // Tri initial des données
  useEffect(() => {
    const initialSortedData = [...data].sort((a, b) => {
      const valueA = a[defaultSortKey];
      const valueB = b[defaultSortKey];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return defaultSortDirection === "asc" ? -1 : 1;
      if (valueB == null) return defaultSortDirection === "asc" ? 1 : -1;

      if (valueA < valueB) return defaultSortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return defaultSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setSortedData(initialSortedData);
  }, [data, defaultSortKey, defaultSortDirection]);

  /**
   * Fonction pour trier les données par une clé spécifique
   * @param key La clé à utiliser pour le tri
   */
  const sortData = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";

    // Si on clique sur la même colonne, on inverse la direction
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const newSortedData = [...sortedData].sort((a, b) => {
      // Vérification des valeurs nulles ou indéfinies
      const valueA = a[key];
      const valueB = b[key];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return direction === "asc" ? -1 : 1;
      if (valueB == null) return direction === "asc" ? 1 : -1;

      // Comparaison sécurisée des valeurs non nulles
      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(newSortedData);
    setSortConfig({ key, direction });
  };

  return {
    sortedData,
    sortConfig,
    sortData
  };
} 