/**
 * Système de logging sécurisé pour AfricaSuite PMS
 * Évite les logs sensibles en production
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  user?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`🐛 [DEBUG] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    }
  }
  
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`ℹ️ [INFO] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    }
  }
  
  warn(message: string, context?: LogContext) {
    console.warn(`⚠️ [WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '');
  }
  
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : error;
    
    console.error(`❌ [ERROR] ${message}`, {
      error: errorInfo,
      context,
      timestamp: new Date().toISOString()
    });
  }
  
  // Logs sécurisés pour les opérations critiques (toujours affichés)
  security(message: string, context?: LogContext) {
    console.warn(`🔒 [SECURITY] ${message}`, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }
  
  // Logs d'audit pour traçabilité (toujours affichés)
  audit(action: string, context?: LogContext) {
    console.info(`📋 [AUDIT] ${action}`, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }
}

export const logger = new Logger();

// Utilitaires pour migration progressive
export const logDebug = (message: string, context?: any) => logger.debug(message, context);
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logError = (message: string, error?: any, context?: any) => logger.error(message, error, context);
export const logSecurity = (message: string, context?: any) => logger.security(message, context);
export const logAudit = (action: string, context?: any) => logger.audit(action, context);