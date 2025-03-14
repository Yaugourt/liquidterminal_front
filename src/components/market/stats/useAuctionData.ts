import { useState, useEffect, useRef, useCallback } from "react";
import { AuctionHistory, AuctionInfo } from "@/services/markets/types";
import {
    fetchAuctionHistory,
    fetchCurrentAuction,
    fetchAuctionState,
    formatTimeRemaining,
    calculateAuctionProgress
} from "@/services/markets/queries";

interface AuctionDataState {
    auctionInfo: AuctionInfo | null;
    lastAuction: AuctionHistory | null;
    currentPrice: number | null;
    displayPrice: string;
    progress: number;
    loading: boolean;
    timeUntilStart: string;
    isUpcoming: boolean;
    isActive: boolean;
    isPurchased: boolean;
    nextAuctionPrice: string;
    nextAuctionTime: string;
}

interface AuctionDataRef {
    initialGas: number;
    currentGas: number;
    endGas: number;
    startTime: number;
    endTime: number;
    fetchTime: number;
    apiGas: number;
    rateOfChange: number;
}

const INITIAL_STATE: AuctionDataState = {
    auctionInfo: null,
    lastAuction: null,
    currentPrice: null,
    displayPrice: "0.00",
    progress: 0,
    loading: true,
    timeUntilStart: "",
    isUpcoming: false,
    isActive: false,
    isPurchased: false,
    nextAuctionPrice: "0.00",
    nextAuctionTime: "",
};

export function useAuctionData() {
    const [state, setState] = useState<AuctionDataState>(INITIAL_STATE);

    // References for intervals and auction data
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const auctionDataRef = useRef<AuctionDataRef | null>(null);
    const lastFetchTimeRef = useRef<number>(0);
    const isInitialLoadRef = useRef(true);

    // Fonction utilitaire pour calculer le temps restant
    const calculateRemainingTime = useCallback((targetTime: number): string => {
        const now = Date.now();
        const secondsRemaining = Math.max(0, Math.floor((targetTime - now) / 1000));
        return formatTimeRemaining(secondsRemaining);
    }, []);

    // Fonction utilitaire pour nettoyer les intervalles
    const clearIntervals = useCallback(() => {
        if (priceIntervalRef.current) {
            clearInterval(priceIntervalRef.current);
            priceIntervalRef.current = null;
        }
        if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }
    }, []);

    // Fonction pour mettre à jour les informations de la prochaine enchère
    const updateNextAuctionInfo = useCallback((nextAuction: {
        startGas: string;
        startTime: number;
    }, stateUpdates: Partial<AuctionDataState>, now: number) => {
        if (!nextAuction) return stateUpdates;
        
        const nextAuctionStartGas = parseFloat(nextAuction.startGas);
        
        // Calculer le temps jusqu'à la prochaine enchère
        if (nextAuction.startTime > now) {
            stateUpdates.nextAuctionPrice = nextAuctionStartGas.toFixed(2);
            stateUpdates.nextAuctionTime = calculateRemainingTime(nextAuction.startTime);
            
            // Si aucune enchère n'est en cours, utiliser le temps jusqu'à la prochaine enchère
            if (!stateUpdates.isActive) {
                stateUpdates.timeUntilStart = calculateRemainingTime(nextAuction.startTime);
            }
        }
        
        return stateUpdates;
    }, [calculateRemainingTime]);

    // Fetch auction data
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                // Mettre l'état de chargement à true uniquement lors du chargement initial
                if (isInitialLoadRef.current) {
                    setState(prev => ({ ...prev, loading: true }));
                }

                // Get current auction information
                const auctionData = await fetchCurrentAuction();
                
                // Get current auction state (to get currentGas)
                const auctionState = await fetchAuctionState();

                // Timestamp actuel
                const now = Date.now();

                // Préparer les mises à jour d'état
                const stateUpdates: Partial<AuctionDataState> = {
                    auctionInfo: auctionData,
                    isActive: false,
                    isUpcoming: false
                };

                // Mettre à jour les informations de la prochaine enchère
                if (auctionData?.nextAuction) {
                    updateNextAuctionInfo(auctionData.nextAuction, stateUpdates, now);
                }

                // Get last auction
                const auctionHistory = await fetchAuctionHistory();

                // Sort by descending timestamp and take the first (most recent)
                if (auctionHistory && auctionHistory.length > 0) {
                    const sortedAuctions = [...auctionHistory].sort((a, b) => b.time - a.time);
                    const lastAuction = sortedAuctions[0];
                    stateUpdates.lastAuction = lastAuction;

                    const lastAuctionTime = lastAuction.time;
                    
                    // Si l'enchère a été complétée dans les 31 dernières heures (temps d'une enchère)
                    const thirtyOneHoursInMs = 31 * 60 * 60 * 1000;
                    
                    if (auctionData?.currentAuction) {
                        // Vérifier si la dernière enchère a été achetée pendant l'enchère actuelle
                        const isPurchased = lastAuctionTime > auctionData.currentAuction.startTime && 
                                           (now - lastAuctionTime) < thirtyOneHoursInMs;
                        
                        if (isPurchased) {
                            stateUpdates.isPurchased = true;
                            stateUpdates.isActive = false;
                            stateUpdates.currentPrice = null;
                            
                            // Si l'enchère actuelle est terminée, utiliser le temps jusqu'à la prochaine enchère
                            if (now > auctionData.currentAuction.endTime && auctionData.nextAuction) {
                                stateUpdates.timeUntilStart = calculateRemainingTime(auctionData.nextAuction.startTime);
                            } else {
                                stateUpdates.timeUntilStart = calculateRemainingTime(auctionData.currentAuction.endTime);
                            }
                        }
                    }
                }

                // Si l'enchère n'a pas été achetée, continuer avec la logique existante
                if (auctionState?.gasAuction?.currentGas && auctionData?.currentAuction && !stateUpdates.isPurchased) {
                    const { currentAuction } = auctionData;

                    // Check if auction is ongoing
                    if (now >= currentAuction.startTime && now < currentAuction.endTime) {
                        const initialGasValue = parseFloat(currentAuction.startGas);
                        const currentGasValue = parseFloat(auctionState.gasAuction.currentGas);
                        const endGasValue = parseFloat(currentAuction.endGas || "0");
                        
                        // Calculer le taux de changement basé sur la valeur actuelle de l'API
                        const totalDuration = currentAuction.endTime - currentAuction.startTime;
                        const timeElapsed = now - currentAuction.startTime;
                        const timeRemaining = totalDuration - timeElapsed;
                        
                        // Calculer le taux de changement en fonction de la valeur API et du temps restant
                        const remainingGasChange = currentGasValue - endGasValue;
                        const rateOfChange = timeRemaining > 0 ? remainingGasChange / timeRemaining : 0;

                        // Store data for continuous calculation
                        auctionDataRef.current = {
                            initialGas: initialGasValue,
                            currentGas: currentGasValue,
                            endGas: endGasValue,
                            startTime: currentAuction.startTime,
                            endTime: currentAuction.endTime,
                            fetchTime: now,
                            apiGas: currentGasValue,
                            rateOfChange: rateOfChange
                        };
                        
                        // Enregistrer le temps de la dernière mise à jour
                        lastFetchTimeRef.current = now;

                        // Set initial price and progress
                        stateUpdates.currentPrice = currentGasValue;
                        stateUpdates.displayPrice = currentGasValue.toFixed(2);
                        stateUpdates.isActive = true;
                        stateUpdates.isUpcoming = false;
                        stateUpdates.progress = calculateAuctionProgress(
                            initialGasValue,
                            currentGasValue,
                            endGasValue
                        );
                    } else if (now > currentAuction.endTime && auctionData.nextAuction) {
                        // Si l'enchère est terminée, afficher les informations de la prochaine enchère
                        stateUpdates.isActive = false;
                        stateUpdates.isUpcoming = false;
                        stateUpdates.currentPrice = null;
                        stateUpdates.timeUntilStart = calculateRemainingTime(auctionData.nextAuction.startTime);
                        stateUpdates.isPurchased = true;
                    } else if (now < currentAuction.startTime) {
                        // Enchère à venir
                        stateUpdates.isActive = false;
                        stateUpdates.isUpcoming = true;
                        stateUpdates.currentPrice = parseFloat(currentAuction.startGas);
                        stateUpdates.displayPrice = parseFloat(currentAuction.startGas).toFixed(2);
                        stateUpdates.timeUntilStart = calculateRemainingTime(currentAuction.startTime);
                    }
                } else if (auctionData?.nextAuction && !stateUpdates.isPurchased) {
                    // Si aucune enchère n'est en cours mais qu'une prochaine est prévue
                    stateUpdates.isActive = false;
                    stateUpdates.isUpcoming = false;
                    stateUpdates.currentPrice = null;
                    stateUpdates.timeUntilStart = calculateRemainingTime(auctionData.nextAuction.startTime);
                    stateUpdates.isPurchased = true;
                }

                // Appliquer toutes les mises à jour d'état en une seule fois
                setState(prev => ({ ...prev, ...stateUpdates }));
            } catch (error) {
                console.error("Error retrieving auction data:", error);
            } finally {
                if (isInitialLoadRef.current) {
                    setState(prev => ({ ...prev, loading: false }));
                    isInitialLoadRef.current = false;
                }
            }
        };

        fetchAuctionData();

        // Fetch data every 30 seconds to reduce visible refreshes
        const refreshInterval = setInterval(fetchAuctionData, 30000);
        return () => clearInterval(refreshInterval);
    }, [calculateRemainingTime, updateNextAuctionInfo]);

    // Clean up intervals when component unmounts
    useEffect(() => {
        return clearIntervals;
    }, [clearIntervals]);

    // Calculate price and determine auction state
    useEffect(() => {
        // Nettoyer les intervalles existants
        clearIntervals();

        if (!state.auctionInfo) return;

        const now = Date.now();
        const { currentAuction, nextAuction } = state.auctionInfo;

        // Check if data is valid
        if (!currentAuction && !nextAuction) {
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: false,
                currentPrice: null
            }));
            return;
        }

        if (currentAuction && now >= currentAuction.startTime && now < currentAuction.endTime) {
            // Auction is ongoing
            setState(prev => ({
                ...prev,
                isActive: true,
                isUpcoming: false
            }));

            // Update price based on time elapsed since last API fetch
            const updatePriceAndProgress = () => {
                const now = Date.now();

                // If we have stored auction data
                if (auctionDataRef.current) {
                    const { initialGas, endGas, apiGas, rateOfChange, endTime } = auctionDataRef.current;
                    const timeSinceLastFetch = now - lastFetchTimeRef.current;
                    
                    // Calculer le nouveau prix
                    const gasDrop = rateOfChange * timeSinceLastFetch;
                    const newGasValue = Math.max(endGas, apiGas - gasDrop);

                    // Update price and progress in a single setState call
                    setState(prev => ({
                        ...prev,
                        currentPrice: newGasValue,
                        displayPrice: newGasValue.toFixed(2),
                        progress: calculateAuctionProgress(initialGas, newGasValue, endGas)
                    }));

                    // Check if auction is complete
                    if (now >= endTime) {
                        window.location.reload();
                    }
                }
            };

            // Update price very frequently for smooth animation
            priceIntervalRef.current = setInterval(updatePriceAndProgress, 50);
            updatePriceAndProgress(); // Execute immediately

            // Update remaining time
            const updateTimeRemaining = () => {
                const timeRemaining = calculateRemainingTime(currentAuction.endTime);
                setState(prev => ({ ...prev, timeUntilStart: timeRemaining }));
                
                // Si le temps est écoulé, recharger la page
                if (Date.now() >= currentAuction.endTime) {
                    window.location.reload();
                }
            };

            // Update remaining time every second
            timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
            updateTimeRemaining(); // Execute immediately

        } else if (currentAuction && now < currentAuction.startTime) {
            // Upcoming auction
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: true,
                currentPrice: parseFloat(currentAuction.startGas),
                displayPrice: parseFloat(currentAuction.startGas).toFixed(2)
            }));

            // Update time until start
            const updateTimeUntilStart = () => {
                const timeUntilStart = calculateRemainingTime(currentAuction.startTime);
                setState(prev => ({ ...prev, timeUntilStart }));
                
                // Si l'enchère a commencé, recharger la page
                if (Date.now() >= currentAuction.startTime) {
                    setState(prev => ({ ...prev, isUpcoming: false }));
                    clearIntervals();
                    window.location.reload();
                }
            };

            timeIntervalRef.current = setInterval(updateTimeUntilStart, 1000);
            updateTimeUntilStart();
        } else {
            // Auction ended or no active auction
            // Vérifier si nous avons des informations sur la prochaine enchère
            if (nextAuction) {
                const nextAuctionStartTime = nextAuction.startTime;
                const nextAuctionStartGas = parseFloat(nextAuction.startGas).toFixed(2);
                
                // Calculer le temps restant jusqu'à la prochaine enchère
                const updateNextAuctionTime = () => {
                    const formattedTime = calculateRemainingTime(nextAuctionStartTime);
                    
                    setState(prev => ({ 
                        ...prev, 
                        nextAuctionTime: formattedTime,
                        nextAuctionPrice: nextAuctionStartGas,
                        timeUntilStart: formattedTime, // Mettre à jour timeUntilStart également
                        isActive: false,
                        isUpcoming: false,
                        isPurchased: true, // Marquer comme acheté pour afficher les informations de la prochaine enchère
                        currentPrice: null,
                        displayPrice: "0.00"
                    }));
                    
                    // Si la prochaine enchère a commencé, recharger la page
                    if (Date.now() >= nextAuctionStartTime) {
                        window.location.reload();
                    }
                };
                
                // Mettre à jour le temps restant chaque seconde
                timeIntervalRef.current = setInterval(updateNextAuctionTime, 1000);
                updateNextAuctionTime(); // Exécuter immédiatement
            } else {
                setState(prev => ({
                    ...prev,
                    isActive: false,
                    isUpcoming: false,
                    currentPrice: null,
                    displayPrice: "0.00"
                }));
            }
        }
    }, [state.auctionInfo, calculateRemainingTime, clearIntervals]);

    return state;
} 