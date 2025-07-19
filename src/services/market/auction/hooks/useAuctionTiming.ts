import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAuctionTiming } from '../api';
import { UseAuctionTimingResult, AuctionState, AuctionTiming } from '../types';
import { useLatestAuctions } from './useAuctions';
import { useHypePrice } from '@/services/market/hype/hooks/useHypePrice';

// Prix de base selon la doc : descend toujours vers 500 HYPE
const BASE_PRICE = 500;

/**
 * Calcule le prix actuel en temps réel selon la formule Dutch Auction
 * Formule: price(t) = initial_price - ((initial_price - 500) * (t / 31h))
 */
const calculateCurrentPrice = (timing: AuctionTiming): number => {
  const { currentAuction } = timing;
  const now = Date.now();
  
  // Si pas d'auction active (temps ou currentGas null), retourner le prix de base
  if (now < currentAuction.startTime || 
      now > currentAuction.endTime || 
      currentAuction.currentGas === null) {
    return BASE_PRICE;
  }
  
  // Si on a currentGas de l'API, l'utiliser directement
  if (currentAuction.currentGas) {
    return parseFloat(currentAuction.currentGas);
  }
  
  const startGas = parseFloat(currentAuction.startGas);
  const totalDuration = currentAuction.endTime - currentAuction.startTime; // 31 heures en ms
  const elapsed = now - currentAuction.startTime;
  
  // Formule Dutch Auction : prix diminue linéairement vers 500 HYPE
  const progress = Math.min(elapsed / totalDuration, 1);
  const currentPrice = startGas - ((startGas - BASE_PRICE) * progress);
  
  return Math.max(currentPrice, BASE_PRICE);
};

/**
 * Formate le temps restant en format lisible
 */
const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return "0m";
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Calcule le pourcentage de progression de l'auction (31 heures)
 */
const calculateProgress = (timing: AuctionTiming): number => {
  const { currentAuction } = timing;
  const now = Date.now();
  
  if (now < currentAuction.startTime) return 0;
  if (now > currentAuction.endTime || currentAuction.currentGas === null) return 0;
  
  const totalDuration = currentAuction.endTime - currentAuction.startTime;
  const elapsed = now - currentAuction.startTime;
  
  return Math.min((elapsed / totalDuration) * 100, 100);
};

/**
 * Hook pour gérer l'état de l'auction en temps réel
 */
export const useAuctionTiming = (refreshInterval: number = 1000): UseAuctionTimingResult => {
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);

  // Récupérer les données d'auction timing
  const { data: timingData, isLoading: timingLoading, error: timingError, refetch } = useDataFetching<AuctionTiming>({
    fetchFn: fetchAuctionTiming,
    refreshInterval: 30000, // Refetch data every 30 seconds
    maxRetries: 3,
    dependencies: []
  });

  // Récupérer la dernière auction pour avoir le nom du token
  const { auctions: latestAuctions, isLoading: auctionsLoading } = useLatestAuctions(1, "HYPE");

  // Récupérer le prix HYPE en temps réel via WebSocket
  const { price: hypePrice } = useHypePrice();

  // Calculer l'état de l'auction en temps réel
  const auctionState = useMemo((): AuctionState => {
    if (!timingData) {
      return {
        isActive: false,
        timeRemaining: "0m",
        currentPrice: BASE_PRICE,
        currentPriceUSD: BASE_PRICE * (hypePrice || 0),
        progressPercentage: 0,
        lastAuctionPrice: BASE_PRICE,
        lastAuctionName: "N/A",
        nextAuctionStart: "N/A"
      };
    }

    const now = Date.now();
    const { currentAuction, nextAuction } = timingData;
    
    // Une auction est active seulement si elle est dans la période ET que currentGas n'est pas null
    const isActive = now >= currentAuction.startTime && 
                     now <= currentAuction.endTime && 
                     currentAuction.currentGas !== null;
    const timeRemaining = isActive 
      ? formatTimeRemaining(currentAuction.endTime - now)
      : "0m";
    
    // Calcul du prix en temps réel
    let currentPrice;
    if (isActive) {
      currentPrice = calculateCurrentPrice(timingData);
    } else {
      // Si inactive, afficher le prix de départ de la prochaine auction
      currentPrice = parseFloat(nextAuction.startGas);
    }
    const currentPriceUSD = currentPrice * (hypePrice || 0);
    const progressPercentage = calculateProgress(timingData);
    
    // Récupérer la vraie dernière auction
    const lastAuction = latestAuctions[0];
    const lastAuctionPrice = lastAuction ? parseFloat(lastAuction.deployGas) : 526; // Fallback à 526 comme tu l'as dit
    const lastAuctionName = lastAuction ? lastAuction.name : "MONEY";
    
    // Formater le temps jusqu'à la prochaine auction
    const nextAuctionStart = nextAuction.startTime > now 
      ? formatTimeRemaining(nextAuction.startTime - now)
      : "Starting soon";

    return {
      isActive,
      timeRemaining,
      currentPrice: Math.round(currentPrice * 100) / 100, // Plus de précision
      currentPriceUSD: Math.round(currentPriceUSD * 100) / 100,
      progressPercentage: Math.round(progressPercentage * 100) / 100, // Plus de précision
      lastAuctionPrice: Math.round(lastAuctionPrice),
      lastAuctionName,
      nextAuctionStart
    };
  }, [timingData, latestAuctions, hypePrice, realTimeUpdate]); // Include hypePrice and realTimeUpdate

  // Update real-time state every second
  useEffect(() => {
    if (!timingData) return;

    const interval = setInterval(() => {
      setRealTimeUpdate(prev => prev + 1);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [timingData, refreshInterval]);

  return {
    auctionState,
    isLoading: timingLoading || auctionsLoading,
    error: timingError,
    refetch
  };
}; 