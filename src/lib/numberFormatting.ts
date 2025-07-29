import { NUMBER_FORMATS, NumberFormatType } from '@/store/number-format.store';

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

  // Fonction helper pour formater le nombre sans arrondi
  const formatNum = (num: number): string => {
    const factor = Math.pow(10, decimals);
    const truncated = Math.floor(num * factor) / factor;
    const fixed = truncated.toFixed(decimals);
    return forceDecimals ? fixed : fixed.replace(/\.?0+$/, '');
  };

  if (value >= 1e9) {
    return `${prefix}${formatNum(value / 1e9)} B`;
  }
  
  if (value >= 1e6) {
    return `${prefix}${formatNum(value / 1e6)} M`;
  }
  
  if (value >= 1e3) {
    return `${prefix}${formatNum(value / 1e3)} K`;
  }
  
  return `${prefix}${formatNum(value)}${suffix ? ' ' + suffix : ''}`;
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

export function formatFullNumberWithCurrency(value: number | undefined | null, options: { currency?: string } = {}): string {
  const { currency = '$' } = options;
  
  // Gérer les cas où value est undefined ou null
  if (value === undefined || value === null) {
    return currency + '0';
  }
  
  // Formater le nombre complet avec séparateur de milliers
  return currency + value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Formate un nombre selon le format sélectionné
 * @param value Nombre à formater
 * @param format Type de format à utiliser
 * @param options Options de formatage
 * @returns Chaîne formatée selon le format choisi
 */
export function formatNumber(
  value: number,
  format: NumberFormatType,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
    showCurrency?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    currency,
    showCurrency = false
  } = options;

  const formatConfig = NUMBER_FORMATS[format];
  
  // Règle: Si le nombre dépasse 1 million, enlever toutes les décimales
  const finalMaximumFractionDigits = Math.abs(value) >= 1_000_000 ? 0 : maximumFractionDigits;
  // Formatter le nombre complet avec séparateur de milliers
  const parts = Math.abs(value).toFixed(finalMaximumFractionDigits).split('.');
  
  // Ajouter les séparateurs de milliers
  if (formatConfig.thousandsSeparator) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, formatConfig.thousandsSeparator);
  }
  
  // Assembler le nombre avec le séparateur décimal approprié
  let formattedNumber = parts.join(formatConfig.decimalSeparator);
  
  // Ajouter le signe négatif si nécessaire
  if (value < 0) {
    formattedNumber = '-' + formattedNumber;
  }
  
  // Ajouter la devise si demandé
  if (showCurrency && currency) {
    formattedNumber = `${currency}${formattedNumber}`;
  }
  
  return formattedNumber;
}

/**
 * Options communes pour le formatage des valeurs numériques
 */
export interface ValueFormattingOptions {
  prefix?: string;
  suffix?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  format?: NumberFormatType;
  showCurrency?: boolean;
}

/**
 * Formate une valeur numérique avec des suffixes K, M selon des règles spécifiques
 */
export function formatMetricValue(
  value: number | string,
  options: ValueFormattingOptions = {}
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const {
    prefix = '',
    suffix = '',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    format = 'standard' as NumberFormatType,
    showCurrency = false
  } = options;

  if (isNaN(numValue)) return '0';

  const formatOptions = {
    minimumFractionDigits,
    maximumFractionDigits,
    showCurrency
  };

  if (numValue >= 1000000000) {
    return `${prefix}${formatNumber(numValue / 1000000000, format, formatOptions)}${suffix} B`;
  }
  if (numValue >= 1000000) {
    return `${prefix}${formatNumber(numValue / 1000000, format, formatOptions)}${suffix} M`;
  }
  if (numValue >= 1000) {
    return `${prefix}${formatNumber(numValue / 1000, format, formatOptions)}${suffix} K`;
  }
  return `${prefix}${formatNumber(numValue, format, formatOptions)}${suffix}`;
}

/**
 * Formate un prix avec un nombre adaptatif de décimales
 * @param price Prix à formater
 * @param format Format de nombre à utiliser
 * @param options Options supplémentaires
 * @returns Prix formaté avec le bon nombre de décimales
 */
export function formatPrice(
  price: number,
  format: NumberFormatType,
  options: {
    showCurrency?: boolean;
    currency?: string;
  } = {}
): string {
  const { showCurrency = true, currency = '$' } = options;
  
  if (isNaN(price) || price === 0) {
    return showCurrency ? `${currency}0.00` : '0.00';
  }

  // Déterminer le nombre de décimales selon la valeur
  let maximumFractionDigits = 2; // Défaut pour les prix >= 0.01
  let minimumFractionDigits = 2;

  if (price < 0.01) {
    // Pour les très petits prix, montrer jusqu'à 6 décimales significatives
    if (price < 0.000001) {
      maximumFractionDigits = 8;
      minimumFractionDigits = 8;
    } else if (price < 0.0001) {
      maximumFractionDigits = 6;
      minimumFractionDigits = 6;
    } else if (price < 0.001) {
      maximumFractionDigits = 5;
      minimumFractionDigits = 5;
    } else {
      maximumFractionDigits = 4;
      minimumFractionDigits = 4;
    }
  } else if (price >= 1000) {
    // Pour les gros prix, pas de décimales
    maximumFractionDigits = 0;
    minimumFractionDigits = 0;
  }

  const formattedNumber = formatNumber(price, format, {
    minimumFractionDigits,
    maximumFractionDigits,
    currency: showCurrency ? currency : undefined,
    showCurrency
  });

  return formattedNumber;
}

/**
 * Formate une valeur de Gas
 */
export function formatGasValue(value: string | number, format: NumberFormatType): string {
  return formatMetricValue(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    format
  });
}

/**
 * Formate une valeur de Stake
 */
export function formatStakeValue(value: number, format: NumberFormatType): string {
  return formatMetricValue(value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    format
  });
}

/**
 * Formate une valeur de TVL (Total Value Locked)
 */
export function formatTVLValue(value: number, format: NumberFormatType): string {
  return formatMetricValue(value, {
    prefix: '$',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    format,
    showCurrency: value < 1000 // Affiche le symbole $ uniquement pour les petites valeurs
  });
}

/**
 * Formate une valeur d'APR (Annual Percentage Rate)
 */
export function formatAPRValue(value: number, format: NumberFormatType): string {
  const formattedValue = formatNumber(value, format, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formattedValue}%`;
}

/**
 * Formate un montant de token avec une précision adaptative
 * @param amount Montant à formater
 * @param token Symbole du token
 * @param format Format de nombre à utiliser
 * @returns Montant formaté avec le symbole du token
 */
export function formatTokenAmount(
  amount: string | number,
  token: string,
  format: NumberFormatType
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Si le nombre est entier, pas de décimales
  if (Number.isInteger(numericAmount)) {
    return `${formatNumber(numericAmount, format)} ${token}`;
  }
  
  // Pour les très petits nombres (< 0.00001), on garde plus de précision
  if (numericAmount < 0.00001) {
    return `${formatNumber(numericAmount, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    })} ${token}`;
  }
  
  // Pour les autres nombres, on limite à 4 décimales maximum
  return `${formatNumber(numericAmount, format, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  })} ${token}`;
}

/**
 * Formate une valeur monétaire pour l'affichage des assets
 */
export function formatAssetValue(value: number, format: NumberFormatType): string {
  return formatNumber(value, format, {
    currency: '$',
    showCurrency: true,
    minimumFractionDigits: Math.abs(value) < 0.01 ? 4 : 2,
    maximumFractionDigits: Math.abs(value) < 0.01 ? 4 : 2
  });
}

/**
 * Formate une quantité de token pour l'affichage des assets
 */
export function formatAssetTokenAmount(value: number, format: NumberFormatType): string {
  return formatNumber(value, format, {
    minimumFractionDigits: Math.abs(value) >= 1 ? 2 : Math.abs(value) >= 0.1 ? 3 : 4,
    maximumFractionDigits: Math.abs(value) >= 1 ? 2 : Math.abs(value) >= 0.1 ? 3 : 4
  });
}

/**
 * Formate un pourcentage pour l'affichage des assets
 */
export function formatAssetPercent(value: number, format: NumberFormatType): string {
  const sign = value >= 0 ? '+' : '-';
  return sign + formatNumber(Math.abs(value), format, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + '%';
} 