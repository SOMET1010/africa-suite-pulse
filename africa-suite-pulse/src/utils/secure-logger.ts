/**
 * AUDIT DE SÉCURITÉ CRITIQUE - Système de Logging Sécurisé
 * Remplace tous les console.log par un système sécurisé
 */

import { logger } from '@/lib/logger';

// Remplacement sécurisé pour console.log
export const secureLog = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, data);
    }
  },
  
  info: (message: string, data?: any) => {
    logger.info(message, data);
  },
  
  warn: (message: string, data?: any) => {
    logger.warn(message, data);
  },
  
  error: (message: string, error?: Error, data?: any) => {
    logger.error(message, error, data);
  },
  
  // Pour les opérations sensibles
  audit: (action: string, data?: any) => {
    logger.audit(action, data);
  },
  
  // Pour les événements de sécurité
  security: (event: string, data?: any) => {
    logger.security(event, data);
  }
};

// Migration helper - remplace progressivement les console.log
export const migrateConsoleLog = (message: string, data?: any) => {
  secureLog.debug(message, data);
};

// Utilitaire pour tracker les performances
export const trackPerformance = (operation: string, startTime: number, data?: any) => {
  const duration = Date.now() - startTime;
  secureLog.debug(`[PERF] ${operation}`, { duration, ...data });
};

// Export par défaut
export default secureLog;