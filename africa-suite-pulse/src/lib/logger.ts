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
  
  // Store original console methods to prevent circular calls
  private originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  
  /**
   * Safely stringify objects, handling large objects and circular references
   */
  private safeStringify(obj: any): string {
    if (!obj) return '';
    
    try {
      // Handle large objects by limiting depth and size
      const stringified = JSON.stringify(obj, null, 2);
      
      // Prevent strings that are too large (JS limit is ~268MB, but we limit to 1MB)
      if (stringified.length > 1024 * 1024) {
        return '[Object too large to display]';
      }
      
      return stringified;
    } catch (error) {
      // Handle circular references and other JSON.stringify errors
      try {
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            // Simple circular reference detection
            if (JSON.stringify(value).length > 10000) {
              return '[Complex object]';
            }
          }
          return value;
        });
      } catch {
        return '[Unable to serialize object]';
      }
    }
  }
  
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const safeContext = this.safeStringify(context);
      this.originalConsole.log(`🐛 [DEBUG] ${message}`, safeContext);
    }
  }
  
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const safeContext = this.safeStringify(context);
      this.originalConsole.info(`ℹ️ [INFO] ${message}`, safeContext);
    }
  }
  
  warn(message: string, context?: LogContext) {
    const safeContext = this.safeStringify(context);
    this.originalConsole.warn(`⚠️ [WARN] ${message}`, safeContext);
  }
  
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : error;
    
    const safeErrorInfo = this.safeStringify(errorInfo);
    const safeContext = this.safeStringify(context);
    
    this.originalConsole.error(`❌ [ERROR] ${message}`, {
      error: safeErrorInfo,
      context: safeContext,
      timestamp: new Date().toISOString()
    });
  }
  
  // Logs sécurisés pour les opérations critiques (toujours affichés)
  security(message: string, context?: LogContext) {
    const safeContext = this.safeStringify(context);
    this.originalConsole.warn(`🔒 [SECURITY] ${message}`, {
      context: safeContext,
      timestamp: new Date().toISOString()
    });
  }
  
  // Logs d'audit pour traçabilité (toujours affichés)
  audit(action: string, context?: LogContext) {
    const safeContext = this.safeStringify(context);
    this.originalConsole.info(`📋 [AUDIT] ${action}`, {
      context: safeContext,
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