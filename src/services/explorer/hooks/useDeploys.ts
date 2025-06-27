import { FormattedDeploy, DeployData, UseDeploysResult, fetchDeploys } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

/**
 * Formate un objet de déploiement pour l'affichage
 */
const formatDeploy = (deploy: DeployData): FormattedDeploy => {
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

  // Déterminer le type d'action
  let action = deploy.action.type;
  if (action === 'spotDeploy' && deploy.action.registerToken2?.spec) {
    const spec = deploy.action.registerToken2.spec;
    if (spec.name) {
      action = `Token: ${spec.name}`;
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
  const { data, isLoading, error } = useDataFetching<FormattedDeploy[]>({
    fetchFn: async () => {
      const rawDeploys = await fetchDeploys();
      return rawDeploys
        .filter(deploy => deploy.error === null) // Filtrer les déploiements sans erreur
        .map(formatDeploy);
    },
    dependencies: [],
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    deploys: data,
    isLoading,
    error
  };
}; 