import { NUMBER_FORMATS, NumberFormatType } from '@/store/number-format.store';

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

/**
 * Formatage USD compact pour charts et labels — `$1.23M`, `$45.6K`, `$182.00`.
 *
 * Source unique de vérité : remplace les ~10 réimplémentations locales de
 * `compactUsd` éparpillées dans `market/hip4`, `market/builders`, `labs/charts`.
 * Superset des variantes : gère B/M/K, les valeurs négatives, null/NaN.
 */
export function compactUsd(
  n: number | null | undefined,
  opts: { decimals?: number; fallback?: string } = {}
): string {
  const { decimals, fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(decimals ?? 2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(decimals ?? 2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(decimals ?? 1)}K`;
  return `${sign}$${abs.toFixed(decimals ?? 2)}`;
}

/**
 * USD plein avec séparateurs de milliers — `$1,234,567`.
 *
 * Pour les tooltips et totaux où la valeur exacte compte. Remplace les
 * `formatUsdFull`/`fmtUsdFull` locaux (FeesRevenuePanel, StablecoinsCard).
 */
export function fullUsd(n: number | null | undefined, opts: { fallback?: string } = {}): string {
  const { fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
}

/**
 * Compact HYPE amount — `1.23B` / `4.56M` / `7.8K` / `123`.
 *
 * Same shape as `compactUsd` but without the `$` prefix — HYPE is a unit
 * appended in the caller (`{compactHype(x)} HYPE`). Replaces the three local
 * redeclarations in `Hip3AuctionRow`, `UpcomingUnstaking`, `NetworkPulse`.
 */
export function compactHype(
  n: number | null | undefined,
  opts: { decimals?: number; fallback?: string } = {}
): string {
  const { decimals, fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals ?? 2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals ?? 1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals ?? 1)}K`;
  if (abs >= 100) return `${sign}${abs.toFixed(0)}`;
  return `${sign}${abs.toFixed(decimals ?? 2)}`;
}

/**
 * Compact integer count — `1.2M` / `4.5K` / `123`.
 *
 * For follower/holder/depositor counts: integers, no prefix, no decimals
 * below 1K. Distinct from `compactHype` (which keeps 2 decimals for small
 * fractional amounts) since counts are integers by nature.
 */
export function compactCount(
  n: number | null | undefined,
  opts: { fallback?: string } = {}
): string {
  const { fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${Math.round(abs)}`;
}

/**
 * Funding-rate display — signed percentage with 4 decimals (`+0.0125%` / `-0.0030%`).
 * Single source of truth: replaces the identical local copies in
 * PerpDexTable, PerpDexMarketsTable and the perpdex/[dex] detail page.
 */
export function formatFunding(funding: number | null | undefined): string {
  if (funding == null || !Number.isFinite(funding)) return '-';
  const percentage = funding * 100;
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
}