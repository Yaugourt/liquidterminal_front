import { FormattedDeploy, DeployData, UseDeploysResult, fetchDeploys } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useAuctions } from '@/services/market/auction/hooks/useAuctions';
import { useMemo } from 'react';

// Types pour les auctions
interface AuctionData {
  index: number;
  name: string;
}

// Types pour les actions de déploiement
interface SpotDeployAction {
  userGenesis?: {
    userAndWei?: unknown;
    token: number;
  };
  genesis?: {
    maxSupply?: unknown;
    token: number;
  };
  registerSpot?: {
    tokens: number[];
  };
  registerToken2?: {
    spec: {
      name?: string;
    };
  };
  type: string;
}

/**
 * Formate un objet de déploiement pour l'affichage
 */
const formatDeploy = (deploy: DeployData, auctionsData: AuctionData[]): FormattedDeploy => {
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
    const actionAny = deploy.action as SpotDeployAction;
    
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
  // Auctions are used only to resolve `tokenIndex → name` when formatting.
  // They must NOT be a dependency of the deploy fetch: `useAuctions` returns
  // a brand-new `[]` reference on every render while loading, which would
  // re-trigger `useDataFetching` on each render and blow up React with
  // "Maximum update depth exceeded". We fetch the raw deploys with stable
  // deps, then format them in a memo gated on the actual array contents.
  const { auctions } = useAuctions({
    limit: 10000,
    currency: "ALL",
  });

  const { data: rawDeploys, isLoading, error } = useDataFetching<DeployData[]>({
    fetchFn: fetchDeploys,
    dependencies: [],
    refreshInterval: 15000,
  });

  const deploys = useMemo<FormattedDeploy[] | null>(() => {
    if (!rawDeploys) return null;
    return rawDeploys
      .filter((d) => d.error === null)
      .map((d) => formatDeploy(d, auctions));
    // `auctions.length` is the right granularity here — the array identity
    // churns even when contents are stable, but the length only changes when
    // the upstream fetch actually returns new data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawDeploys, auctions.length]);

  return {
    deploys,
    isLoading,
    error,
  };
}; 