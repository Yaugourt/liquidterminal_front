import { FormattedTransfer, TransferData, UseTransfersResult } from '../types';
import { fetchTransfers } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';

/**
 * Formate un objet de transfert pour l'affichage
 */
const formatTransfer = (transfer: TransferData): FormattedTransfer => {
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

  // Extraire le symbole du token (peut contenir une adresse après ":")
  // Vérifier si token existe avant de faire split
  const token = transfer.action.token ? transfer.action.token.split(':')[0] : 'Unknown';

  return {
    hash: transfer.hash,
    time: formattedTime,
    from: transfer.user,
    to: transfer.action.destination || 'Unknown',
    amount: transfer.action.amount || '0',
    token: token,
    blockNumber: transfer.block
  };
};

/**
 * Hook pour récupérer et formater les derniers transferts
 */
export const useTransfers = (): UseTransfersResult => {
  const { data, isLoading, error } = useDataFetching<FormattedTransfer[]>({
    fetchFn: async () => {
      const rawTransfers = await fetchTransfers();
      return rawTransfers.map(formatTransfer);
    },
    dependencies: [],
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    transfers: data,
    isLoading,
    error
  };
}; 