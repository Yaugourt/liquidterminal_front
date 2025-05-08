/**
 * Formate un nombre sans décimales avec des suffixes pour les grands nombres
 * @param num Nombre à formater
 * @param locale Locale à utiliser pour le formatage (par défaut 'fr-FR')
 * @returns Chaîne formatée (ex: "7B", "5M", "3K", "42")
 */
export function formatNumberWithoutDecimals(num: number, locale = 'fr-FR'): string {
    // Gérer les cas spéciaux
    if (num === 0) return '0';
    if (!num || isNaN(num)) return '0';
    
    // Utiliser des constantes pour les seuils
    const BILLION = 1_000_000_000;
    const MILLION = 1_000_000;
    const THOUSAND = 1_000;
    
    if (num >= BILLION) {
        return `${Math.floor(num / BILLION)} B`;
    } else if (num >= MILLION) {
        return `${Math.floor(num / MILLION)} M`;
    } else if (num >= THOUSAND) {
        return `${Math.floor(num / THOUSAND)} K`;
    } else {
        return Math.floor(num).toLocaleString(locale);
    }
}

/**
 * Formate le temps restant en jours, heures, minutes et secondes
 * @param seconds Nombre de secondes restantes
 * @returns Chaîne formatée (ex: "2j 5h", "3h 45m", "2m 30s", "15s")
 */
export function formatTimeRemaining(seconds: number): string {
    // Gérer les cas spéciaux
    if (seconds <= 0) return "Commence bientôt";

    // Utiliser des constantes pour les conversions de temps
    const SECONDS_PER_DAY = 86400;
    const SECONDS_PER_HOUR = 3600;
    const SECONDS_PER_MINUTE = 60;

    const days = Math.floor(seconds / SECONDS_PER_DAY);
    const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const secs = Math.floor(seconds % SECONDS_PER_MINUTE);

    // Utiliser un tableau pour stocker les parties du temps
    const parts = [];
    
    if (days > 0) {
        parts.push(`${days}j`);
        parts.push(`${hours}h`);
        return parts.join(' ');
    } 
    
    if (hours > 0) {
        parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        return parts.join(' ');
    } 
    
    if (minutes > 0) {
        parts.push(`${minutes}m`);
        parts.push(`${secs}s`);
        return parts.join(' ');
    }
    
    return `${secs}s`;
}

/**
 * Calcule le pourcentage de progression d'une enchère
 * @param initialGas Prix initial de l'enchère
 * @param currentGas Prix actuel de l'enchère
 * @param endGas Prix final de l'enchère
 * @returns Pourcentage de progression (0-100)
 */
export function calculateAuctionProgress(
    initialGas: number,
    currentGas: number,
    endGas: number
): number {
    // Éviter la division par zéro
    if (initialGas === endGas) return 100;
    
    // Calculer le pourcentage de progression
    const totalDrop = initialGas - endGas;
    const currentDrop = initialGas - currentGas;
    const progress = (currentDrop / totalDrop) * 100;
    
    // Limiter le pourcentage entre 0 et 100
    return Math.max(0, Math.min(100, progress));
}

/**
 * Formate un timestamp en date lisible
 * @param timestamp Timestamp en secondes
 * @returns Date formatée au format français
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Tronque une adresse pour l'affichage
 * @param address Adresse à tronquer
 * @returns Adresse tronquée (ex: 0x1234...5678)
 */
export const truncateAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function formatLargeNumber(value: number, options: { 
  prefix?: string, 
  decimals?: number,
  forceDecimals?: boolean,
  suffix?: string 
} = {}): string {
  const { 
    prefix = '', 
    decimals = 2,
    forceDecimals = false,
    suffix = ''
  } = options;

  // Fonction helper pour formater le nombre
  const formatNum = (num: number): string => {
    const fixed = num.toFixed(decimals);
    return forceDecimals ? fixed : fixed.replace(/\.?0+$/, '');
  };

  // Ajouter un espace après le préfixe s'il existe
  const prefixWithSpace = prefix ? prefix + ' ' : '';

  if (value >= 1e9) {
    return `${prefixWithSpace}${formatNum(value / 1e9)}${suffix}B`;
  }
  
  if (value >= 1e6) {
    const formatted = formatNum(value / 1e6);
    // Si on a des décimales, pas d'espace avant le M
    return formatted.includes('.') 
      ? `${prefixWithSpace}${formatted}${suffix}M`
      : `${prefixWithSpace}${formatted} ${suffix}M`;
  }
  
  if (value >= 1e3) {
    return `${prefixWithSpace}${formatNum(value / 1e3)} ${suffix}K`;
  }
  
  return `${prefixWithSpace}${formatNum(value)}${suffix}`;
}

export function formatFullNumber(value: number | undefined | null, options: { prefix?: string } = {}): string {
  const { prefix = '' } = options;
  
  // Gérer les cas où value est undefined ou null
  if (value === undefined || value === null) {
    return prefix ? `${prefix} 0` : '0';
  }
  
  // Ajouter des espaces tous les 3 chiffres
  const parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Ajouter un espace après le préfixe s'il existe
  const prefixWithSpace = prefix ? prefix + ' ' : '';
  
  return `${prefixWithSpace}${parts.join('.')}`;
} 