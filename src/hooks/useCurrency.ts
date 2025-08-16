/**
 * 🪙 Hook pour la gestion centralisée des devises
 * 
 * Utilise les paramètres de l'organisation pour fournir
 * des fonctions de formatage consistantes dans toute l'app.
 */

import { useOrganizationSettings } from './useOrganizationSettings';
import { formatCurrency as formatCurrencyCore, formatSubscriptionPrice as formatSubscriptionPriceCore, formatCurrencyCompact, formatNumber, parseCurrency, getCurrencyConfig } from '@/lib/currency';

export function useCurrency() {
  const { organizationSettings } = useOrganizationSettings();
  
  const currencyCode = organizationSettings.currency_code || 'XOF';
  const currencySymbol = organizationSettings.currency_symbol || 'F CFA';
  
  /**
   * Formate un montant avec la devise de l'organisation
   */
  const formatCurrency = (
    amount: number,
    options?: {
      showSymbol?: boolean;
      compact?: boolean;
      decimals?: number;
    }
  ) => {
    return formatCurrencyCore(amount, currencyCode, options);
  };

  /**
   * Formate un prix d'abonnement avec la période
   */
  const formatSubscriptionPrice = (
    amount: number,
    cycle: 'monthly' | 'yearly'
  ) => {
    return formatSubscriptionPriceCore(amount, currencyCode, cycle);
  };

  /**
   * Formate de manière compacte
   */
  const formatCompact = (amount: number) => {
    return formatCurrencyCompact(amount, currencyCode);
  };

  /**
   * Formate sans symbole
   */
  const formatAmount = (amount: number) => {
    return formatNumber(amount, currencyCode);
  };

  /**
   * Parse une valeur depuis une chaîne
   */
  const parseAmount = (value: string) => {
    return parseCurrency(value, currencyCode);
  };

  return {
    currencyCode,
    currencySymbol,
    formatCurrency,
    formatSubscriptionPrice,
    formatCompact,
    formatAmount,
    parseAmount,
    config: getCurrencyConfig(currencyCode),
  };
}