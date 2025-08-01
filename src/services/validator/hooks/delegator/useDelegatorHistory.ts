import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchDelegatorHistory } from '../../delegator';
import { UseDelegatorHistoryResult, FormattedDelegatorHistoryItem } from '../../types/delegator';
import { useValidators } from '../validator/useValidators';
import { useMemo, useCallback } from 'react';

/**
 * Hook pour récupérer l'historique des délégations d'un utilisateur
 * @param address L'adresse de l'utilisateur
 * @returns L'historique des délégations, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useDelegatorHistory = (address: string): UseDelegatorHistoryResult => {
  const { 
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch
  } = useDataFetching<FormattedDelegatorHistoryItem[]>({
    fetchFn: async () => {
      if (!address) {
        // Warning: No address provided for delegator history
        return [];
      }

      try {
        const response = await fetchDelegatorHistory({
          type: 'delegatorHistory',
          user: address
        });

        // Vérifier que la réponse est un tableau
        if (!Array.isArray(response)) {
          // Warning: Invalid response format for delegator history
          return [];
        }

        // Formater les données pour l'affichage
        return response
          .filter(item => {
            // Vérifier que l'item a une structure valide
            return item && 
                   item.delta && 
                   item.delta.delegate && 
                   typeof item.delta.delegate.isUndelegate === 'boolean' &&
                   item.delta.delegate.amount &&
                   item.delta.delegate.validator;
          })
          .map(item => ({
            time: new Date(item.time).toLocaleString(),
            timestamp: item.time,
            hash: item.hash,
            type: (item.delta.delegate.isUndelegate ? 'Undelegate' : 'Delegate') as 'Delegate' | 'Undelegate',
            amount: parseFloat(item.delta.delegate.amount),
            validator: item.delta.delegate.validator
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Trier par timestamp décroissant
      } catch (err: unknown) {
        // Silent error handling
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delegator history';
        throw new Error(errorMessage);
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  // Hook pour récupérer les informations des validators
  const { 
    validators, 
    isLoading: validatorsLoading, 
    error: validatorsError 
  } = useValidators();

  // Fonction pour obtenir le nom du validator à partir de son adresse
  const getValidatorName = useCallback((validatorAddress: string) => {
    const validator = validators.find(v => 
      v.validator?.toLowerCase() === validatorAddress.toLowerCase()
    );
    return validator?.name || `${validatorAddress.slice(0, 8)}...${validatorAddress.slice(-6)}`;
  }, [validators]);

  // Enrichir l'historique avec les noms des validators
  const enrichedHistory = useMemo(() => {
    if (!historyData) return [];
    
    return historyData.map(item => ({
      ...item,
      validatorName: getValidatorName(item.validator)
    }));
  }, [historyData, getValidatorName]);

  // États de chargement et d'erreur combinés
  const isLoading = historyLoading || validatorsLoading;
  const error = historyError || validatorsError;

  return {
    history: enrichedHistory,
    isLoading,
    error,
    refetch
  };
}; 