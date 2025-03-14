import { useEffect, useState, useRef, useCallback } from "react";
import { useWallets } from "@/store/use-wallets";
import { Wallet } from "@/services/wallets/types";

export function useWalletData() {
  const { wallets, activeWalletId, getActiveWallet, updateWalletInfo } = useWallets();
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(getActiveWallet());
  const isUpdatingRef = useRef(false);
  
  // Fonction mémorisée pour rafraîchir manuellement les données du wallet actif
  const refreshActiveWallet = useCallback(async () => {
    if (!activeWalletId || isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    try {
      await updateWalletInfo(activeWalletId);
      setActiveWallet(getActiveWallet());
    } catch (error) {
      console.error("Failed to refresh wallet:", error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [activeWalletId, updateWalletInfo, getActiveWallet]);
  
  useEffect(() => {
    // Éviter les mises à jour multiples
    if (isUpdatingRef.current) return;
    
    // Mettre à jour les informations du wallet actif au chargement et quand activeWalletId change
    if (activeWalletId) {
      // Mettre à jour immédiatement l'état local avec les données actuelles
      setActiveWallet(getActiveWallet());
      
      // Marquer que la mise à jour est en cours
      isUpdatingRef.current = true;
      
      // Puis récupérer les données fraîches depuis l'API
      updateWalletInfo(activeWalletId).then(() => {
        // Mettre à jour l'état local avec les nouvelles données
        setActiveWallet(getActiveWallet());
        // Réinitialiser le flag de mise à jour
        isUpdatingRef.current = false;
      }).catch(() => {
        // En cas d'erreur, réinitialiser également le flag
        isUpdatingRef.current = false;
      });
    } else {
      setActiveWallet(undefined);
    }
  }, [activeWalletId, updateWalletInfo, getActiveWallet]);

  return {
    wallets,
    activeWallet,
    hasWallets: wallets.length > 0,
    refreshActiveWallet,
    isUpdating: isUpdatingRef.current
  };
} 