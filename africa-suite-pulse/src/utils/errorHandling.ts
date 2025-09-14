/**
 * 🎯 Utilities pour la gestion d'erreurs TypeScript strict
 * 
 * Helpers pour traiter les erreurs unknown de manière type-safe
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Erreur inconnue';
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<T extends PropertyKey>(
  obj: unknown,
  key: T
): obj is Record<T, unknown> {
  return isObject(obj) && key in obj;
}

export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  console.error(`[${context || 'Error'}]`, message, error);
}