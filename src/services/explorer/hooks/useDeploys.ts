import { FormattedDeploy, DeployData, UseDeploysResult, fetchDeploys } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useAuctions } from '@/services/market/auction/hooks/useAuctions';
import { useMemo } from 'react';

/**
 * Formate un objet de déploiement pour l'affichage
 */
const formatDeploy = (deploy: DeployData, auctionsData: any[]): FormattedDeploy => {
  // Format de la date: "May 14, 07:04 PM"
  const date = new Date(deploy.time);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedTime = `${month} ${day}, ${hours}:${minutes} ${ampm}`;

  // Fonction pour trouver le nom du token par son index
  const findTokenName = (tokenIndex: number): string => {
    const auction = auctionsData.find(auction => auction.index === tokenIndex);
    return auction?.name || `Token ${tokenIndex}`;
  };

  // Déterminer le type d'action avec les nouvelles conditions
  let action = deploy.action.type;
  
  if (deploy.action.type === 'spotDeploy') {
    // Utiliser une approche plus robuste pour accéder aux propriétés
    const actionAny = deploy.action as any;
    
    // Condition 1: UserGenesis avec userAndWei
    if (actionAny.userGenesis?.userAndWei) {
      const tokenIndex = actionAny.userGenesis.token;
      const tokenName = findTokenName(tokenIndex);
      action = `Airdrop ${tokenName}`;
    }
    // Condition 2: Genesis avec maxSupply
    else if (actionAny.genesis?.maxSupply) {
      const tokenIndex = actionAny.genesis.token;
      const tokenName = findTokenName(tokenIndex);
      action = `Genesis ${tokenName}`;
    }
    // Condition 3: RegisterSpot
    else if (actionAny.registerSpot?.tokens) {
      const tokenIndex = actionAny.registerSpot.tokens[0]; // Premier token
      const tokenName = findTokenName(tokenIndex);
      action = `RegisterSpot ${tokenName}`;
    }
    // Condition existante pour registerToken2
    else if (deploy.action.registerToken2?.spec) {
      const spec = deploy.action.registerToken2.spec;
      if (spec.name) {
        action = `Token: ${spec.name}`;
      }
    }
  }

  return {
    hash: deploy.hash,
    time: formattedTime,
    timestamp: deploy.time,
    user: deploy.user,
    action: action,
    blockNumber: deploy.block,
    status: deploy.error ? 'error' : 'success',
    errorMessage: deploy.error || undefined
  };
};

/**
 * Hook pour récupérer et formater les derniers déploiements
 */
export const useDeploys = (): UseDeploysResult => {
  // Récupérer les données d'auctions pour obtenir les noms des tokens
  const { auctions } = useAuctions({
    limit: 10000, // Limite élevée pour avoir tous les tokens
    currency: "ALL"
  });

  // Stabiliser les dépendances avec useMemo pour éviter les boucles infinies
  const stableAuctions = useMemo(() => auctions, [auctions]);

  const { data, isLoading, error } = useDataFetching<FormattedDeploy[]>({
    fetchFn: async () => {
      const rawDeploys = await fetchDeploys();
      return rawDeploys
        .filter(deploy => deploy.error === null) // Filtrer les déploiements sans erreur
        .map(deploy => formatDeploy(deploy, stableAuctions));
    },
    dependencies: [stableAuctions], // Utiliser la version stable
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    deploys: data,
    isLoading,
    error
  };
}; 