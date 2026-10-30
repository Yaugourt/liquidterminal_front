import { useEffect, useMemo, useState } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpAuctionTiming } from '../api';
import { UseAuctionTimingResult, AuctionState, PerpAuctionTiming } from '../types';
import { useHypeLivePrice } from '@/services/market/hype/hooks/useHypePrice';
import { usePastAuctionsPerp } from '@/services/market/perpDex/hooks/usePastAuctionsPerp';

// Prix de base selon la doc : descend toujours vers 500 HYPE
const BASE_PRICE = 500;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Price of the running Dutch auction at `now`: it falls linearly from startGas
 * to 500 HYPE over the auction, so it is computed every second instead of
 * showing the last poll's currentGas, which froze for 30 s and then jumped
 * (checked on 2026-10-30 against Hyperliquid: 788.9545 predicted, 788.9543
 * read). Once the auction is settled (endGas set) its reported price is used.
 */
const calculateCurrentPrice = (timing: PerpAuctionTiming, now: number): number => {
  const { currentAuction } = timing;

  // No auction running (outside its window, or currentGas null): base price.
  if (now < currentAuction.startTime ||
      now > currentAuction.endTime ||
      currentAuction.currentGas === null) {
    return BASE_PRICE;
  }

  const startGas = parseFloat(currentAuction.startGas);
  const totalDuration = currentAuction.endTime - currentAuction.startTime; // 31 h
  if (currentAuction.endGas || !Number.isFinite(startGas) || totalDuration <= 0) {
    return parseFloat(currentAuction.currentGas);
  }

  const progress = Math.min((now - currentAuction.startTime) / totalDuration, 1);
  return Math.max(startGas - (startGas - BASE_PRICE) * progress, BASE_PRICE);
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
const calculateProgress = (timing: PerpAuctionTiming, now: number): number => {
  const { currentAuction } = timing;
  
  if (now < currentAuction.startTime) return 0;
  if (now > currentAuction.endTime || currentAuction.currentGas === null) return 0;
  
  const totalDuration = currentAuction.endTime - currentAuction.startTime;
  const elapsed = now - currentAuction.startTime;
  
  return Math.min((elapsed / totalDuration) * 100, 100);
};

/**
 * Hook pour gérer l'état de l'auction perp en temps réel
 */
export const usePerpAuctionTiming = (): UseAuctionTimingResult => {

  // Récupérer les données d'auction timing depuis Hyperliquid
  const { data: timingData, isLoading: timingLoading, isRefreshing, dataUpdatedAt, error: timingError, refetch } = useDataFetching<PerpAuctionTiming>({
    fetchFn: fetchPerpAuctionTiming,
    refreshInterval: 30000, // Refetch data every 30 seconds
    maxRetries: 3,
    dependencies: []
  });

  // Récupérer le prix HYPE en temps réel via WebSocket
  const hypePrice = useHypeLivePrice();

  // Past perp auctions — feeds the "last sold" stat under the live progress bar.
  const { auctions: pastPerpAuctions } = usePastAuctionsPerp();

  // The auction price falls every second and the countdowns tick with it.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Calculer l'état de l'auction en temps réel
  const auctionState = useMemo((): AuctionState => {
    if (!timingData) {
      return {
        isActive: false,
        timeRemaining: "0m",
        currentPrice: BASE_PRICE,
        currentPriceUSD: BASE_PRICE * (hypePrice || 0),
        progressPercentage: 0,
        startPrice: BASE_PRICE,
        floorPrice: BASE_PRICE,
        lastAuctionPrice: BASE_PRICE,
        lastAuctionName: "N/A",
        nextAuctionStart: "N/A",
        avg7dPrice: 0,
        deploys7d: 0,
        etaToLastSold: "—",
      };
    }

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
      currentPrice = calculateCurrentPrice(timingData, now);
    } else {
      // Si inactive, afficher le prix de départ de la prochaine auction
      currentPrice = parseFloat(nextAuction.startGas);
    }
    const currentPriceUSD = currentPrice * (hypePrice || 0);
    const progressPercentage = calculateProgress(timingData, now);
    
    // Last sold perp deploy — latest entry from Hypurrscan past auctions.
    const lastPerp = [...pastPerpAuctions].sort(
      (a, b) => b.time.getTime() - a.time.getTime(),
    )[0];
    const lastAuctionPrice =
      lastPerp && Number.isFinite(lastPerp.maxGas) ? (lastPerp.maxGas as number) : BASE_PRICE;
    const lastAuctionName = lastPerp ? lastPerp.symbol : "N/A";
    
    // Formater le temps jusqu'à la prochaine auction
    // Si l'auction actuelle est encore en période mais inactive (currentGas null),
    // la "prochaine" peut démarrer dès la fin de currentAuction
    let nextAuctionStart;
    if (!isActive && now < currentAuction.endTime) {
      // On est dans la période currentAuction mais elle est inactive
      // La prochaine peut démarrer à la fin de cette période
      nextAuctionStart = formatTimeRemaining(currentAuction.endTime - now);
    } else {
      // Sinon, utiliser nextAuction.startTime
      nextAuctionStart = nextAuction.startTime > now 
        ? formatTimeRemaining(nextAuction.startTime - now)
        : "Starting soon";
    }

    const startPrice = parseFloat(currentAuction.startGas);
    const floorPrice = currentAuction.endGas
      ? parseFloat(currentAuction.endGas)
      : BASE_PRICE;

    // 7d window aggregates from past perp deploys.
    const cutoff7d = now - SEVEN_DAYS_MS;
    const recent = pastPerpAuctions.filter(
      (a) => a.time.getTime() >= cutoff7d && Number.isFinite(a.maxGas) && (a.maxGas as number) > 0,
    );
    const deploys7d = recent.length;
    const avg7dPrice = deploys7d
      ? recent.reduce((sum, a) => sum + (a.maxGas as number), 0) / deploys7d
      : 0;

    let etaToLastSold = "—";
    if (isActive && currentPrice > lastAuctionPrice && startPrice > floorPrice) {
      const totalDuration = currentAuction.endTime - currentAuction.startTime;
      const decayPerMs = (startPrice - floorPrice) / totalDuration;
      const etaMs = (currentPrice - lastAuctionPrice) / decayPerMs;
      if (Number.isFinite(etaMs) && etaMs > 0) {
        etaToLastSold = formatTimeRemaining(etaMs);
      }
    } else if (isActive && currentPrice <= lastAuctionPrice) {
      etaToLastSold = "Now";
    }

    return {
      isActive,
      timeRemaining,
      currentPrice: Math.round(currentPrice * 100) / 100,
      currentPriceUSD: Math.round(currentPriceUSD * 100) / 100,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      startPrice: Number.isFinite(startPrice) ? Math.round(startPrice) : BASE_PRICE,
      floorPrice: Number.isFinite(floorPrice) ? Math.round(floorPrice) : BASE_PRICE,
      lastAuctionPrice: Math.round(lastAuctionPrice),
      lastAuctionName,
      nextAuctionStart,
      avg7dPrice: Math.round(avg7dPrice),
      deploys7d,
      etaToLastSold,
    };
  }, [timingData, hypePrice, pastPerpAuctions, now]);

  return {
    auctionState,
    isLoading: timingLoading,
    isRefreshing,
    dataUpdatedAt,
    error: timingError,
    refetch
  };
};

