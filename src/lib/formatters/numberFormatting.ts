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
    // num * factor can land just under the integer (4.35 * 100 = 434.99999999999994):
    // snap the float noise before truncating so 4350 stays "4.35 K", not "4.34 K"
    const truncated = Math.floor(Number((num * factor).toFixed(6))) / factor;
    const fixed = truncated.toFixed(decimals);
    return forceDecimals ? fixed : fixed.replace(/\.?0+$/, '');
  };

  // Units work on the magnitude; the sign goes in front of the prefix ("-$5 K"),
  // and is dropped when the truncated value is zero.
  const abs = Math.abs(value);
  const sign = (text: string) => (value < 0 && text !== '0' && Number(text) !== 0 ? '-' : '');

  if (abs >= 1e9) {
    const text = formatNum(abs / 1e9);
    return `${sign(text)}${prefix}${text} B`;
  }
  
  if (abs >= 1e6) {
    const text = formatNum(abs / 1e6);
    return `${sign(text)}${prefix}${text} M`;
  }
  
  if (abs >= 1e3) {
    const text = formatNum(abs / 1e3);
    return `${sign(text)}${prefix}${text} K`;
  }
  
  const text = formatNum(abs);
  return `${sign(text)}${prefix}${text}${suffix ? ' ' + suffix : ''}`;
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
  const fixed = Math.abs(value).toFixed(finalMaximumFractionDigits);
  const parts = fixed.split('.');
  
  // Ajouter les séparateurs de milliers
  if (formatConfig.thousandsSeparator) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, formatConfig.thousandsSeparator);
  }
  
  // Assembler le nombre avec le séparateur décimal approprié
  let formattedNumber = parts.join(formatConfig.decimalSeparator);
  
  // Ajouter le signe négatif si nécessaire (pas de "-0.00" quand l'arrondi vaut zéro)
  if (value < 0 && Number(fixed) !== 0) {
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

  // Unit by raw value, then carry to the next unit when the rounded scaled
  // value reaches 1000 (999,999.9 -> "1.00 M", never "1,000.00 K").
  const units = [
    { div: 1, label: '' },
    { div: 1e3, label: ' K' },
    { div: 1e6, label: ' M' },
    { div: 1e9, label: ' B' }
  ];
  let i = numValue >= 1e9 ? 3 : numValue >= 1e6 ? 2 : numValue >= 1e3 ? 1 : 0;
  while (i < units.length - 1 && numValue > 0 && Number((numValue / units[i].div).toFixed(maximumFractionDigits)) >= 1000) i++;
  const unit = units[i];
  return `${prefix}${formatNumber(numValue / unit.div, format, formatOptions)}${suffix}${unit.label}`;
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
  // A negative that rounds to 0 stays "+0%", never "-0%"
  const sign = value >= 0 || Math.round(-value) === 0 ? '+' : '-';
  return sign + formatNumber(Math.abs(value), format, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + '%';
}

/** One step of a compact scale: values from `min` up, divided by `div`, printed with `dp` decimals. */
interface CompactUnit {
  min: number;
  div: number;
  suffix: string;
  dp: number;
}

/**
 * Picks the unit from the raw value, then carries to the next unit while the
 * rounded scaled value reaches 1000 (999,960 -> `1.00M`, never `1000.0K`).
 * `abs` must be finite and >= 0; `units` ascending, the first one is the base.
 * The sign is left to the caller, which drops it when `value` rounds to zero.
 */
function compactParts(abs: number, units: CompactUnit[]): { value: string; suffix: string } {
  let i = 0;
  while (i + 1 < units.length && abs >= units[i + 1].min) i++;
  while (i + 1 < units.length && Number((abs / units[i].div).toFixed(units[i].dp)) >= 1000) i++;
  const unit = units[i];
  return { value: (abs / unit.div).toFixed(unit.dp), suffix: unit.suffix };
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
  const { value, suffix } = compactParts(Math.abs(n), [
    { min: 0, div: 1, suffix: '', dp: decimals ?? 2 },
    { min: 1e3, div: 1e3, suffix: 'K', dp: decimals ?? 1 },
    { min: 1e6, div: 1e6, suffix: 'M', dp: decimals ?? 2 },
    { min: 1e9, div: 1e9, suffix: 'B', dp: decimals ?? 2 },
  ]);
  const sign = n < 0 && Number(value) !== 0 ? '-' : '';
  return `${sign}$${value}${suffix}`;
}

/**
 * `compactUsd` avec signe explicite — `+$1.23M` / `-$45.6K` / `+$0.00`.
 *
 * Pour les deltas et PnL où le `+` porte l'information. Remplace les
 * `signedUsd` locaux (TraderPnlCard, SmartMoney*, …).
 */
export function signedCompactUsd(
  n: number | null | undefined,
  opts: { decimals?: number; fallback?: string } = {}
): string {
  const { fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  return `${n < 0 ? '-' : '+'}${compactUsd(Math.abs(n), opts)}`;
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
  const abs = Math.abs(n);
  const { value, suffix } = compactParts(abs, [
    { min: 0, div: 1, suffix: '', dp: abs >= 100 ? 0 : decimals ?? 2 },
    { min: 1e3, div: 1e3, suffix: 'K', dp: decimals ?? 1 },
    { min: 1e6, div: 1e6, suffix: 'M', dp: decimals ?? 1 },
    { min: 1e9, div: 1e9, suffix: 'B', dp: decimals ?? 2 },
  ]);
  const sign = n < 0 && Number(value) !== 0 ? '-' : '';
  return `${sign}${value}${suffix}`;
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
  const { value, suffix } = compactParts(Math.abs(n), [
    { min: 0, div: 1, suffix: '', dp: 0 },
    { min: 1e3, div: 1e3, suffix: 'K', dp: 1 },
    { min: 1e6, div: 1e6, suffix: 'M', dp: 2 },
  ]);
  const sign = n < 0 && Number(value) !== 0 ? '-' : '';
  return `${sign}${value}${suffix}`;
}

/**
 * Funding-rate display — signed percentage with 4 decimals (`+0.0125%` / `-0.0030%`).
 * Single source of truth: replaces the identical local copies in
 * PerpDexTable, PerpDexMarketsTable and the perpdex/[dex] detail page.
 */
export function formatFunding(funding: number | null | undefined): string {
  if (funding == null || !Number.isFinite(funding)) return '-';
  const percentage = funding * 100;
  const text = Math.abs(percentage).toFixed(4);
  // A negative that rounds to 0.0000 stays unsigned-positive, never "-0.0000%"
  return `${percentage >= 0 || Number(text) === 0 ? '+' : '-'}${text}%`;
}

/**
 * Percentage display — `12.3%`, or `+12.3%` / `-4.0%` with `signed`.
 *
 * Single source of truth: replaces the local `pct` / `fmtPct` / `signedPct`
 * helpers. `n` is a ratio by default (`0.123` → `12.3%`); pass
 * `from: 'percent'` when the value is already in percent units
 * (`12.3` → `12.3%`). `signed` prefixes `+` on zero and positive values, like
 * `signedCompactUsd`; negatives always carry `-`.
 */
export function formatPct(
  n: number | null | undefined,
  opts: { decimals?: number; signed?: boolean; from?: 'ratio' | 'percent'; fallback?: string } = {}
): string {
  const { decimals = 1, signed = false, from = 'ratio', fallback = '—' } = opts;
  if (n == null || !Number.isFinite(n)) return fallback;
  const value = from === 'ratio' ? n * 100 : n;
  const fixed = Math.abs(value).toFixed(decimals);
  const text = `${fixed}%`;
  if (value < 0 && Number(fixed) !== 0) return `-${text}`;
  return signed ? `+${text}` : text;
}
