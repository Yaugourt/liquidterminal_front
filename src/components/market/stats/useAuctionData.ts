import { useState, useEffect, useRef } from "react";
import { AuctionHistory, AuctionInfo } from "@/api/markets/types";
import {
    fetchAuctionHistory,
    fetchCurrentAuction,
    fetchAuctionState,
    formatTimeRemaining,
    calculateAuctionPrice,
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

    // Fetch auction data
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true }));

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

                            // Store data for continuous calculation
                            auctionDataRef.current = {
                                initialGas: initialGasValue,
                                currentGas: currentGasValue,
                                endGas: endGasValue,
                                startTime: currentAuction.startTime,
                                endTime: currentAuction.endTime,
                                fetchTime: now
                            };

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
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchAuctionData();

        // Refresh data every minute to ensure it's up to date
        const refreshInterval = setInterval(fetchAuctionData, 60000);
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
        const { currentAuction, nextAuction } = state.auctionInfo;

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

            // Update price based on time elapsed since data retrieval
            const updatePriceAndProgress = () => {
                const now = Date.now();

                // If we have stored auction data
                if (auctionDataRef.current) {
                    const { initialGas, endGas, startTime, endTime } = auctionDataRef.current;

                    // Calculate new price based on elapsed time
                    const newGasValue = calculateAuctionPrice(
                        initialGas,
                        endGas,
                        startTime,
                        endTime,
                        now
                    );

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
            priceIntervalRef.current = setInterval(updatePriceAndProgress, 20);
            updatePriceAndProgress(); // Execute immediately

            // Update remaining time
            const updateTimeRemaining = () => {
                const now = Date.now();
                const timeRemaining = Math.floor((currentAuction.endTime - now) / 1000);
                if (timeRemaining <= 0) {
                    window.location.reload();
                }
            };

            // Update remaining time every second
            timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
            updateTimeRemaining(); // Execute immediately

        } else if (now < currentAuction.startTime) {
            // Auction hasn't started yet
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

            // Calculate time remaining before start
            const timeRemaining = Math.floor((currentAuction.startTime - now) / 1000);
            setState(prev => ({
                ...prev,
                timeUntilStart: formatTimeRemaining(timeRemaining)
            }));

            // Update remaining time more frequently (every second)
            timeIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeRemaining = Math.floor((currentAuction.startTime - now) / 1000);
                setState(prev => ({
                    ...prev,
                    timeUntilStart: formatTimeRemaining(timeRemaining)
                }));

                // If auction has started, reload the page
                if (timeRemaining <= 0) {
                    window.location.reload();
                }
            }, 1000); // Update every second

        } else if (nextAuction && now < nextAuction.startTime) {
            // Current auction is complete, but there's a next auction
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: true
            }));

            // Display starting price of next auction
            const startGasValue = parseFloat(nextAuction.startGas || "0");
            const priceValue = startGasValue > 0 ? startGasValue : null;
            setState(prev => ({
                ...prev,
                currentPrice: priceValue,
                displayPrice: priceValue ? priceValue.toFixed(2) : "0.00"
            }));

            // Calculate time remaining before next auction
            const timeRemaining = Math.floor((nextAuction.startTime - now) / 1000);
            setState(prev => ({
                ...prev,
                timeUntilStart: formatTimeRemaining(timeRemaining)
            }));

            // Update remaining time more frequently (every second)
            timeIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeRemaining = Math.floor((nextAuction.startTime - now) / 1000);
                setState(prev => ({
                    ...prev,
                    timeUntilStart: formatTimeRemaining(timeRemaining)
                }));
            }, 1000); // Update every second

        } else {
            // No ongoing or scheduled auction
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: false,
                currentPrice: null,
                displayPrice: "0.00"
            }));
        }

        // Clean up intervals on unmount or update
        return () => {
            if (priceIntervalRef.current) {
                clearInterval(priceIntervalRef.current);
                priceIntervalRef.current = null;
            }
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
                timeIntervalRef.current = null;
            }
        };
    }, [state.auctionInfo]);

    return state;
} 