import { FormattedTransfer, TransferData, UseTransfersResult, fetchTransfers } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

/**
 * Formate un objet de transfert pour l'affichage
 */
const formatTransfer = (transfer: TransferData): FormattedTransfer | null => {
  try {
    // Vérifier que les données minimales sont présentes
    if (!transfer || !transfer.action) {
      return null;
    }

    // Format de la date: "May 14, 07:04 PM"
    const date = new Date(transfer.time);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${month} ${day}, ${hours}:${minutes} ${ampm}`;

    // Déterminer le token en fonction du type de transfert
    let token = 'Unknown';
    if (transfer.action.type === 'usdClassTransfer' || transfer.action.type === 'usdSend') {
      token = 'USDC';
    } else if (transfer.action.token) {
      // Extraire le symbole du token (peut contenir une adresse après ":")
      // Vérifier que c'est bien une string avant de faire split
      if (typeof transfer.action.token === 'string') {
        token = transfer.action.token.split(':')[0];
      } else {
        token = String(transfer.action.token);
      }
    }

    return {
      hash: transfer.hash || 'Unknown',
      time: formattedTime,
      timestamp: transfer.time,
      from: transfer.user || 'Unknown',
      to: transfer.action.destination || 'Unknown',
      amount: transfer.action.amount || '0',
      token: token,
      blockNumber: transfer.block || 0
    };
  } catch (error) {
    return null;
  }
};

/**
 * Hook pour récupérer et formater les derniers transferts
 */
export const useTransfers = (): UseTransfersResult => {
  const { data, isLoading, error } = useDataFetching<FormattedTransfer[]>({
    fetchFn: async () => {
      const rawTransfers = await fetchTransfers();
      
      const formattedTransfers = rawTransfers
        .map(formatTransfer)
        .filter((transfer): transfer is FormattedTransfer => transfer !== null);
      
      // Filtrer les transactions USDC inférieures à 100 USDC
      const filtered = formattedTransfers.filter(transfer => {
        if (transfer.token === 'USDC') {
          const amount = parseFloat(transfer.amount);
          return amount >= 100;
        }
        return true; // Garder toutes les autres transactions non-USDC
      });
      
      return filtered;
    },
    dependencies: [],
    refreshInterval: 15000 // Rafraîchir toutes les 15 secondes
  });

  return {
    transfers: data,
    isLoading,
    error
  };
}; 