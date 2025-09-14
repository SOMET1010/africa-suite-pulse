/**
 * 🌍 Système de formatage de devises centralisé - AfricaSuite PMS
 * 
 * Utilise les paramètres de l'organisation pour formater correctement
 * les montants selon la devise configurée.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  position: 'before' | 'after';
  decimals: number;
}

// Configuration des devises supportées
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  XOF: {
    code: 'XOF',
    symbol: 'F CFA',
    locale: 'fr-FR',
    position: 'after',
    decimals: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'fr-FR',
    position: 'after',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    position: 'before',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    position: 'before',
    decimals: 2,
  },
  MAD: {
    code: 'MAD',
    symbol: 'DH',
    locale: 'ar-MA',
    position: 'after',
    decimals: 2,
  },
  TND: {
    code: 'TND',
    symbol: 'DT',
    locale: 'ar-TN',
    position: 'after',
    decimals: 3,
  },
};

/**
 * Formate un montant selon la configuration de devise
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'XOF',
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
    decimals?: number;
  }
): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.XOF;
  const { showSymbol = true, compact = false, decimals } = options || {};
  
  const finalDecimals = decimals ?? config.decimals;
  
  try {
    // Format avec Intl.NumberFormat pour la localisation automatique
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? config.code : undefined,
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals,
      notation: compact ? 'compact' : 'standard',
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback en cas d'erreur
    console.warn(`Erreur de formatage pour ${currencyCode}:`, error);
    const formattedNumber = amount.toLocaleString(config.locale, {
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals,
    });
    
    if (!showSymbol) return formattedNumber;
    
    return config.position === 'before' 
      ? `${config.symbol} ${formattedNumber}`
      : `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Formate un montant de manière compacte (1k, 1M, etc.)
 */
export function formatCurrencyCompact(amount: number, currencyCode: string = 'XOF'): string {
  return formatCurrency(amount, currencyCode, { compact: true });
}

/**
 * Formate un montant sans symbole de devise
 */
export function formatNumber(amount: number, currencyCode: string = 'XOF'): string {
  return formatCurrency(amount, currencyCode, { showSymbol: false });
}

/**
 * Parse un montant depuis une chaîne formatée
 */
export function parseCurrency(value: string, currencyCode: string = 'XOF'): number {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.XOF;
  
  // Supprime tous les caractères non numériques sauf le point et la virgule
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  
  // Remplace la virgule par un point pour le parsing
  const normalizedValue = cleanValue.replace(',', '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Obtient la configuration d'une devise
 */
export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.XOF;
}

/**
 * Liste toutes les devises supportées
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCY_CONFIGS);
}

/**
 * Formate un prix avec indication de la période (mensuel/annuel)
 */
export function formatSubscriptionPrice(
  amount: number,
  currencyCode: string,
  cycle: 'monthly' | 'yearly'
): string {
  const formattedAmount = formatCurrency(amount, currencyCode);
  const period = cycle === 'yearly' ? '/an' : '/mois';
  return `${formattedAmount}${period}`;
}