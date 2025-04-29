"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Données temporaires
const mockTotalValue = 150000;

export function PerformanceChart() {
  const [totalValue] = useState(mockTotalValue);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour formater les valeurs monétaires (mémorisée)
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <LineChart size={18} className="text-[#83E9FF]" />
          Performance
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
            <p className="text-white text-xl">{formatCurrency(totalValue)}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-[#FFFFFF99] mt-2">
          Chart coming soon
        </div>
      </CardContent>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      )}
    </Card>
  );
}
