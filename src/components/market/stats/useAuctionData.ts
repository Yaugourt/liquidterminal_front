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
    });

    // Références pour les intervalles et les données d'enchère
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const auctionDataRef = useRef<AuctionDataRef | null>(null);

    // Récupérer les données d'enchères
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true }));

                // Récupérer les informations sur l'enchère actuelle
                const auctionData = await fetchCurrentAuction();
                console.log("Auction data:", auctionData);
                setState(prev => ({ ...prev, auctionInfo: auctionData }));

                // Récupérer l'état actuel de l'enchère (pour obtenir currentGas)
                const auctionState = await fetchAuctionState();
                console.log("Auction state:", auctionState);

                // Si nous avons currentGas et que l'enchère est en cours, stocker les données pour le calcul
                if (auctionState?.gasAuction?.currentGas && auctionData?.currentAuction) {
                    const now = Date.now();
                    const { currentAuction } = auctionData;

                    // Vérifier si l'enchère est en cours
                    if (now >= currentAuction.startTime && now < currentAuction.endTime) {
                        const initialGasValue = parseFloat(currentAuction.startGas);
                        const currentGasValue = parseFloat(auctionState.gasAuction.currentGas);
                        const endGasValue = parseFloat(currentAuction.endGas || "0");

                        // Stocker les données pour le calcul continu
                        auctionDataRef.current = {
                            initialGas: initialGasValue,
                            currentGas: currentGasValue,
                            endGas: endGasValue,
                            startTime: currentAuction.startTime,
                            endTime: currentAuction.endTime,
                            fetchTime: now
                        };

                        // Définir le prix initial
                        setState(prev => ({
                            ...prev,
                            currentPrice: currentGasValue,
                            displayPrice: currentGasValue.toFixed(2),
                            isActive: true,
                            isUpcoming: false
                        }));

                        // Calculer la progression initiale
                        const progressPercentage = calculateAuctionProgress(
                            initialGasValue,
                            currentGasValue,
                            endGasValue
                        );
                        setState(prev => ({ ...prev, progress: progressPercentage }));
                    }
                }

                // Récupérer la dernière enchère
                const auctionHistory = await fetchAuctionHistory();

                // Trier par timestamp décroissant et prendre la première (la plus récente)
                if (auctionHistory && auctionHistory.length > 0) {
                    const sortedAuctions = [...auctionHistory].sort((a, b) => b.time - a.time);
                    setState(prev => ({ ...prev, lastAuction: sortedAuctions[0] }));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données d'enchères:", error);
            } finally {
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchAuctionData();

        // Rafraîchir les données toutes les minutes pour s'assurer qu'elles sont à jour
        const refreshInterval = setInterval(fetchAuctionData, 60000);
        return () => clearInterval(refreshInterval);
    }, []);

    // Nettoyer les intervalles lors du démontage du composant
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

    // Calculer le prix et déterminer l'état de l'enchère
    useEffect(() => {
        // Nettoyer les intervalles existants
        if (priceIntervalRef.current) {
            clearInterval(priceIntervalRef.current);
            priceIntervalRef.current = null;
        }
        if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }

        if (!state.auctionInfo) return;

        const now = Date.now(); // Timestamp actuel en millisecondes
        const { currentAuction, nextAuction } = state.auctionInfo;

        // Vérifier si les données sont valides
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
            // L'enchère est en cours
            setState(prev => ({
                ...prev,
                isActive: true,
                isUpcoming: false
            }));

            // Mettre à jour le prix en fonction du temps écoulé depuis la récupération des données
            const updatePriceAndProgress = () => {
                const now = Date.now();

                // Si nous avons les données d'enchère stockées
                if (auctionDataRef.current) {
                    const { initialGas, endGas, startTime, endTime } = auctionDataRef.current;

                    // Calculer le nouveau prix en fonction du temps écoulé
                    const newGasValue = calculateAuctionPrice(
                        initialGas,
                        endGas,
                        startTime,
                        endTime,
                        now
                    );

                    // Mettre à jour le prix et la progression
                    setState(prev => ({
                        ...prev,
                        currentPrice: newGasValue,
                        displayPrice: newGasValue.toFixed(2)
                    }));

                    // Calculer la progression
                    const progressPercentage = calculateAuctionProgress(
                        initialGas,
                        newGasValue,
                        endGas
                    );
                    setState(prev => ({ ...prev, progress: progressPercentage }));

                    // Vérifier si l'enchère est terminée
                    if (now >= endTime) {
                        window.location.reload();
                    }
                }
            };

            // Mettre à jour le prix très fréquemment pour une animation fluide
            priceIntervalRef.current = setInterval(updatePriceAndProgress, 100);
            updatePriceAndProgress(); // Exécuter immédiatement

            // Mettre à jour le temps restant
            const updateTimeRemaining = () => {
                const now = Date.now();
                const timeRemaining = Math.floor((currentAuction.endTime - now) / 1000);
                if (timeRemaining <= 0) {
                    window.location.reload();
                }
            };

            // Mettre à jour le temps restant toutes les secondes
            timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
            updateTimeRemaining(); // Exécuter immédiatement

        } else if (now < currentAuction.startTime) {
            // L'enchère n'a pas encore commencé
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: true
            }));

            // Afficher le prix de départ
            const startGasValue = parseFloat(currentAuction.startGas);
            setState(prev => ({
                ...prev,
                currentPrice: startGasValue,
                displayPrice: startGasValue.toFixed(2)
            }));

            // Calculer le temps restant avant le début
            const timeRemaining = Math.floor((currentAuction.startTime - now) / 1000);
            setState(prev => ({
                ...prev,
                timeUntilStart: formatTimeRemaining(timeRemaining)
            }));

            // Mettre à jour le temps restant plus fréquemment (toutes les secondes)
            timeIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeRemaining = Math.floor((currentAuction.startTime - now) / 1000);
                setState(prev => ({
                    ...prev,
                    timeUntilStart: formatTimeRemaining(timeRemaining)
                }));

                // Si l'enchère a commencé, recharger la page
                if (timeRemaining <= 0) {
                    window.location.reload();
                }
            }, 1000); // Mise à jour toutes les secondes

        } else if (nextAuction && now < nextAuction.startTime) {
            // L'enchère actuelle est terminée, mais il y a une prochaine enchère
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: true
            }));

            // Afficher le prix de départ de la prochaine enchère
            const startGasValue = parseFloat(nextAuction.startGas || "0");
            const priceValue = startGasValue > 0 ? startGasValue : null;
            setState(prev => ({
                ...prev,
                currentPrice: priceValue,
                displayPrice: priceValue ? priceValue.toFixed(2) : "0.00"
            }));

            // Calculer le temps restant avant la prochaine enchère
            const timeRemaining = Math.floor((nextAuction.startTime - now) / 1000);
            setState(prev => ({
                ...prev,
                timeUntilStart: formatTimeRemaining(timeRemaining)
            }));

            // Mettre à jour le temps restant plus fréquemment (toutes les secondes)
            timeIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeRemaining = Math.floor((nextAuction.startTime - now) / 1000);
                setState(prev => ({
                    ...prev,
                    timeUntilStart: formatTimeRemaining(timeRemaining)
                }));
            }, 1000); // Mise à jour toutes les secondes

        } else {
            // Aucune enchère en cours ou prévue
            setState(prev => ({
                ...prev,
                isActive: false,
                isUpcoming: false,
                currentPrice: null,
                displayPrice: "0.00"
            }));
        }

        // Nettoyer les intervalles lors du démontage ou de la mise à jour
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