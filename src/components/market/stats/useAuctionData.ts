import { useState, useEffect, useRef } from "react";
import { AuctionHistory, AuctionInfo } from "@/api/markets/types";
import {
    fetchAuctionHistory,
    fetchCurrentAuction,
    fetchAuctionState,
    formatTimeRemaining,
    calculateAuctionProgress
} from "@/api/markets/queries";

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
}

interface AuctionDataRef {
    initialGas: number;
    currentGas: number;
    endGas: number;
    startTime: number;
    endTime: number;
    fetchTime: number;
    apiGas: number; // Valeur actuelle de l'API
    rateOfChange: number; // Taux de changement recalculé selon l'API
}

export function useAuctionData() {
    const [state, setState] = useState<AuctionDataState>({
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
    });

    // References for intervals and auction data
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const auctionDataRef = useRef<AuctionDataRef | null>(null);
    const lastFetchTimeRef = useRef<number>(0);
    // Variable pour suivre s'il s'agit du chargement initial
    const isInitialLoadRef = useRef(true);

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
                console.log("Auction data:", auctionData);
                setState(prev => ({ ...prev, auctionInfo: auctionData }));

                // Get current auction state (to get currentGas)
                const auctionState = await fetchAuctionState();
                console.log("Auction state:", auctionState);

                // Si nous avons des informations sur la prochaine enchère, stockons son prix
                if (auctionData?.nextAuction) {
                    const nextAuctionStartGas = parseFloat(auctionData.nextAuction.startGas);
                    setState(prev => ({
                        ...prev,
                        nextAuctionPrice: nextAuctionStartGas.toFixed(2)
                    }));
                }

                // Get last auction
                const auctionHistory = await fetchAuctionHistory();

                // Sort by descending timestamp and take the first (most recent)
                if (auctionHistory && auctionHistory.length > 0) {
                    const sortedAuctions = [...auctionHistory].sort((a, b) => b.time - a.time);
                    const lastAuction = sortedAuctions[0];
                    setState(prev => ({ ...prev, lastAuction }));

                    // Vérifier si une enchère a été récemment achetée en comparant les timestamps
                    const now = Date.now();
                    const lastAuctionTime = lastAuction.time;
                    
                    // Si l'enchère a été complétée dans les 31 dernières heures (temps d'une enchère)
                    const thirtyOneHoursInMs = 31 * 60 * 60 * 1000;
                    
                    if (auctionData?.currentAuction) {
                        // Vérifier si la dernière enchère a été achetée pendant l'enchère actuelle
                        // (c'est-à-dire après le début mais avant la fin de l'enchère actuelle)
                        const isPurchased = lastAuctionTime > auctionData.currentAuction.startTime && 
                                           (now - lastAuctionTime) < thirtyOneHoursInMs;
                        
                        if (isPurchased) {
                            console.log("Enchère achetée détectée!");
                            setState(prev => ({ 
                                ...prev, 
                                isPurchased,
                                isActive: false,  // L'enchère n'est plus active puisqu'elle a été achetée
                                currentPrice: null // Pas de prix actuel
                            }));
                            
                            // Calculer le temps restant avant la prochaine enchère
                            // (comme si l'enchère actuelle allait jusqu'à sa fin normale)
                            const timeRemaining = Math.max(0, Math.floor((auctionData.currentAuction.endTime - now) / 1000));
                            const formattedTime = formatTimeRemaining(timeRemaining);
                            setState(prev => ({ ...prev, timeUntilStart: formattedTime }));
                        }
                    }
                }

                // Si l'enchère n'a pas été achetée, continuer avec la logique existante
                if (auctionState?.gasAuction?.currentGas && auctionData?.currentAuction) {
                    // Vérifier si une enchère achetée a déjà été détectée
                    const isPurchasedAlready = state.isPurchased; 
                    
                    if (!isPurchasedAlready) {
                        const now = Date.now();
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
                                apiGas: currentGasValue,  // Stocker la valeur API actuelle
                                rateOfChange: rateOfChange  // Taux de changement basé sur l'API
                            };
                            
                            // Enregistrer le temps de la dernière mise à jour
                            lastFetchTimeRef.current = now;

                            // Set initial price
                            setState(prev => ({
                                ...prev,
                                currentPrice: currentGasValue,
                                displayPrice: currentGasValue.toFixed(2),
                                isActive: true,
                                isUpcoming: false
                            }));

                            // Calculate initial progress
                            const progressPercentage = calculateAuctionProgress(
                                initialGasValue,
                                currentGasValue,
                                endGasValue
                            );
                            setState(prev => ({ ...prev, progress: progressPercentage }));
                        }
                    }
                }
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

        // Fetch data every 30 seconds instead of 15 seconds to reduce visible refreshes
        const refreshInterval = setInterval(fetchAuctionData, 30000);
        return () => clearInterval(refreshInterval);
    }, []);

    // Clean up intervals when component unmounts
    useEffect(() => {
        return () => {
            if (priceIntervalRef.current) {
                clearInterval(priceIntervalRef.current);
            }
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, []);

    // Calculate price and determine auction state
    useEffect(() => {
        // Clean existing intervals
        if (priceIntervalRef.current) {
            clearInterval(priceIntervalRef.current);
            priceIntervalRef.current = null;
        }
        if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }

        if (!state.auctionInfo) return;

        const now = Date.now(); // Current timestamp in milliseconds
        const { currentAuction } = state.auctionInfo;

        // Check if data is valid
        if (!currentAuction) {
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: false,
                currentPrice: null
            }));
            return;
        }

        if (now >= currentAuction.startTime && now < currentAuction.endTime) {
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
                    
                    // Calculer le nouveau prix basé sur le taux de changement actuel et le temps écoulé depuis la dernière API fetch
                    // Cette méthode est plus précise car elle utilise le taux de changement calculé à partir des données API réelles
                    const gasDrop = rateOfChange * timeSinceLastFetch;
                    const newGasValue = Math.max(endGas, apiGas - gasDrop);

                    // Update price and progress
                    setState(prev => ({
                        ...prev,
                        currentPrice: newGasValue,
                        displayPrice: newGasValue.toFixed(2)
                    }));

                    // Calculate progress
                    const progressPercentage = calculateAuctionProgress(
                        initialGas,
                        newGasValue,
                        endGas
                    );
                    setState(prev => ({ ...prev, progress: progressPercentage }));

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
                const now = Date.now();
                const timeRemaining = Math.floor((currentAuction.endTime - now) / 1000);
                if (timeRemaining <= 0) {
                    window.location.reload();
                }
                const formattedTime = formatTimeRemaining(timeRemaining);
                setState(prev => ({ ...prev, timeUntilStart: formattedTime }));
            };

            // Update remaining time every second
            timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
            updateTimeRemaining(); // Execute immediately

        } else if (now < currentAuction.startTime) {
            // Upcoming auction
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: true
            }));

            // Display starting price
            const startGasValue = parseFloat(currentAuction.startGas);
            setState(prev => ({
                ...prev,
                currentPrice: startGasValue,
                displayPrice: startGasValue.toFixed(2)
            }));

            // Update time until start
            const updateTimeUntilStart = () => {
                const now = Date.now();
                if (currentAuction.startTime > now) {
                    const secondsUntilStart = Math.floor((currentAuction.startTime - now) / 1000);
                    const formattedTime = formatTimeRemaining(secondsUntilStart);
                    setState(prev => ({ ...prev, timeUntilStart: formattedTime }));
                } else {
                    // Start time reached, refetch data
                    setState(prev => ({ ...prev, isUpcoming: false }));
                    clearInterval(timeIntervalRef.current as NodeJS.Timeout);
                    window.location.reload();
                }
            };

            timeIntervalRef.current = setInterval(updateTimeUntilStart, 1000);
            updateTimeUntilStart();
        } else {
            // Auction ended
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: false,
                currentPrice: null,
                displayPrice: "0.00"
            }));
        }
    }, [state.auctionInfo]);

    return state;
} 