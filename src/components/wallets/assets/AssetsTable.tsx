"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
export interface Holding {
  coin: string;
  token: string;
  total: string;
  entryNtl: string;
}

export interface HoldingDisplay extends Holding {
  id: string;
  totalValue: number;
  price: number;
}

type SortConfig = {
  key: keyof HoldingDisplay | null;
  direction: "asc" | "desc";
};

interface AssetsTableProps {
  holdings: Holding[];
  loading: boolean;
}

// Composant pour l'en-tête de colonne triable
const SortableColumnHeader = ({ 
  label, 
  sortKey, 
  onSort, 
  className = "" 
}: { 
  label: string; 
  sortKey: keyof HoldingDisplay; 
  onSort: (key: keyof HoldingDisplay) => void;
  className?: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => onSort(sortKey)}
    className={`text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ${className}`}
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

// Composant pour l'état de chargement ou vide
const TableLoadingOrEmpty = ({ 
  colSpan, 
  isLoading, 
  isEmpty = false 
}: { 
  colSpan: number; 
  isLoading: boolean;
  isEmpty?: boolean;
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        {isLoading ? (
          <>
            <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
            <p className="text-white text-lg">Chargement...</p>
          </>
        ) : isEmpty ? (
          <>
            <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
            <p className="text-white text-lg">Aucun asset trouvé</p>
            <p className="text-[#FFFFFF80] text-sm mt-2">Ajoutez un wallet ou vérifiez plus tard</p>
          </>
        ) : null}
      </div>
    </TableCell>
  </TableRow>
);

// Composant pour l'en-tête du tableau
const TableHeaderComponent = ({ 
  onSort 
}: { 
  onSort: (key: keyof HoldingDisplay) => void;
}) => (
  <TableHeader>
    <TableRow className="border-none bg-[#051728]">
      <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent pl-4 w-[30%]">
        <SortableColumnHeader 
          label="Token" 
          sortKey="coin" 
          onSort={onSort} 
        />
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent w-[25%]">
        <SortableColumnHeader 
          label="Prix" 
          sortKey="price" 
          onSort={onSort}
          className="ml-auto justify-end w-full" 
        />
      </TableHead>
      <TableHead className="text-center text-[#FFFFFF99] font-normal py-2 bg-transparent w-[20%]">
        <SortableColumnHeader 
          label="Total" 
          sortKey="total" 
          onSort={onSort}
          className="mx-auto justify-center w-full" 
        />
      </TableHead>
      <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent pr-4 w-[25%]">
        <SortableColumnHeader 
          label="Valeur" 
          sortKey="totalValue" 
          onSort={onSort}
          className="ml-auto" 
        />
      </TableHead>
    </TableRow>
  </TableHeader>
);

export function AssetsTable({ holdings, loading }: AssetsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "desc",
  });
  const [isClient, setIsClient] = useState(false);

  // Effet pour marquer que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convertir les holdings en format d'affichage (mémorisé)
  const displayHoldings = useMemo(() => 
    holdings.map((holding) => ({
      id: `${holding.coin}-${holding.token}`,
      ...holding,
      totalValue: parseFloat(holding.entryNtl),
      price: parseFloat(holding.entryNtl) / parseFloat(holding.total) // Calcul du prix unitaire
    })),
  [holdings]);

  // Trier les données (fonction mémorisée)
  const sortData = useCallback((key: keyof HoldingDisplay) => {
    setSortConfig(prevConfig => {
      let direction: "asc" | "desc" = "asc";
      if (prevConfig.key === key && prevConfig.direction === "asc") {
        direction = "desc";
      }
      return { key, direction };
    });
  }, []);

  // Appliquer le tri (mémorisé)
  const sortedHoldings = useMemo(() => {
    if (!sortConfig.key) return displayHoldings;
    
    return [...displayHoldings].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [displayHoldings, sortConfig]);

  // Formater les nombres (fonctions mémorisées)
  const formatCurrency = useCallback((value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }, []);

  const formatNumber = useCallback((value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(numValue);
  }, []);

  // Afficher un état de chargement initial côté serveur et client avant l'hydratation
  if (!isClient) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={true} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher l'état de chargement côté client
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={true} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher l'état vide côté client
  if (sortedHoldings.length === 0) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={false} isEmpty={true} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher les données côté client
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeaderComponent onSort={sortData} />
        <TableBody className="bg-[#051728CC]">
          {sortedHoldings.map((holding) => (
            <TableRow
              key={holding.id}
              className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors"
            >
              <TableCell className="py-4 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm md:text-base">{holding.coin}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base">
                {formatCurrency(holding.price)}
              </TableCell>
              <TableCell className="text-center text-white text-sm md:text-base">
                {formatNumber(holding.total)}
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base pr-4">
                {formatCurrency(holding.totalValue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 