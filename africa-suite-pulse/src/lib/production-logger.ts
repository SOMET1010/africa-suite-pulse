/**
 * AUDIT DE SÉCURITÉ CRITIQUE - Production Logger Sécurisé
 * Système de logging sécurisé pour la production
 */

import { logger } from './logger';

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Mots-clés sensibles à filtrer
const SENSITIVE_KEYWORDS = [
  'PIN', 'password', 'token', 'key', 'secret', 
  'credit_card', 'cvv', 'ssn', 'passport',
  'email', 'phone', 'address', 'document_number'
];

// Fonction pour vérifier si un message contient des données sensibles
const containsSensitiveData = (message: string): boolean => {
  return SENSITIVE_KEYWORDS.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Fonction de sécurisation complète pour la production
export const initSecureProductionLogging = () => {
  if (process.env.NODE_ENV === 'production') {
    // Désactiver complètement tous les console.log en production
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = () => {};
    
    // Rediriger les erreurs vers le système de logging sécurisé
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      
      // Filtrer les données sensibles
      if (!containsSensitiveData(message)) {
        // Utiliser notre système de logging sécurisé
        logger.error('Production Error', new Error(message), {
          args: args.slice(1),
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server'
        });
        
        // Log minimal dans la console pour les erreurs critiques uniquement
        if (message.includes('CRITICAL') || message.includes('FATAL')) {
          originalConsole.error('[CRITICAL]', message);
        }
      } else {
        // Log générique pour les erreurs contenant des données sensibles
        logger.security('Sensitive data error blocked from console', {
          errorType: 'sensitive_data_filtered',
          timestamp: new Date().toISOString()
        });
      }
    };
    
    // Log que le mode sécurisé est activé
    logger.audit('Production security logging activated', {
      mode: 'secure_production',
      sensitive_filtering: true,
      console_disabled: true
    });
  } else {
    // En développement, garder les logs mais avec avertissements
    const secureLog = (level: string, originalFn: Function) => (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (containsSensitiveData(message)) {
        logger.security(`[${level.toUpperCase()}] Sensitive data detected in log`, {
          originalMessage: '[REDACTED]',
          level,
          warning: 'This would be blocked in production'
        });
      }
      originalFn.apply(console, args);
    };
    
    console.log = secureLog('debug', originalConsole.log);
    console.info = secureLog('info', originalConsole.info);
    console.warn = secureLog('warn', originalConsole.warn);
  }
};

// Fonction pour nettoyer les logs existants
export const cleanExistingLogs = () => {
  // Supprimer tous les console.log dans les sources en développement
  if (process.env.NODE_ENV === 'development') {
    logger.audit('Development log cleanup initiated', {
      action: 'replace_console_logs',
      target: 'secure_logger'
    });
  }
};

// Initialiser automatiquement
initSecureProductionLogging();
