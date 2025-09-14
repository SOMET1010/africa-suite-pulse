/**
 * AUDIT DE SÉCURITÉ CRITIQUE - Phase 2
 * Gestion d'Erreurs Robuste - Remplacement des .single() dangereux
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type DatabaseResult<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

export type DatabaseResults<T> = {
  data: T[];
  error: string | null;
  success: boolean;
  count?: number;
};

/**
 * Wrapper sécurisé pour les requêtes single qui peuvent échouer
 */
export async function safeSingle<T>(
  query: any,
  context: string = 'unknown'
): Promise<DatabaseResult<T>> {
  try {
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      logger.error(`Database error in ${context}`, error, { query: query.toString() });
      return {
        data: null,
        error: `Erreur base de données: ${error.message}`,
        success: false
      };
    }
    
    if (!data) {
      logger.debug(`No data found in ${context}`, { query: query.toString() });
      return {
        data: null,
        error: null,
        success: true
      };
    }
    
    return {
      data,
      error: null,
      success: true
    };
  } catch (err: any) {
    logger.error(`Unexpected error in ${context}`, err, { query: query.toString() });
    return {
      data: null,
      error: `Erreur inattendue: ${err.message}`,
      success: false
    };
  }
}

/**
 * Wrapper sécurisé pour les requêtes select multiples
 */
export async function safeSelect<T>(
  query: any,
  context: string = 'unknown'
): Promise<DatabaseResults<T>> {
  try {
    const { data, error, count } = await query;
    
    if (error) {
      logger.error(`Database error in ${context}`, error, { query: query.toString() });
      return {
        data: [],
        error: `Erreur base de données: ${error.message}`,
        success: false
      };
    }
    
    return {
      data: data || [],
      error: null,
      success: true,
      count
    };
  } catch (err: any) {
    logger.error(`Unexpected error in ${context}`, err, { query: query.toString() });
    return {
      data: [],
      error: `Erreur inattendue: ${err.message}`,
      success: false
    };
  }
}

/**
 * Wrapper sécurisé pour les mutations (insert, update, delete)
 */
export async function safeMutation<T>(
  query: any,
  context: string = 'unknown',
  expectSingleResult = true
): Promise<DatabaseResult<T> | DatabaseResults<T>> {
  try {
    const { data, error } = expectSingleResult 
      ? await query.select().maybeSingle()
      : await query.select();
    
    if (error) {
      logger.error(`Mutation error in ${context}`, error, { query: query.toString() });
      return {
        data: expectSingleResult ? null : [],
        error: `Erreur de mutation: ${error.message}`,
        success: false
      } as any;
    }
    
    if (expectSingleResult) {
      return {
        data,
        error: null,
        success: true
      };
    } else {
      return {
        data: data || [],
        error: null,
        success: true
      };
    }
  } catch (err: any) {
    logger.error(`Unexpected mutation error in ${context}`, err, { query: query.toString() });
    return {
      data: expectSingleResult ? null : [],
      error: `Erreur inattendue: ${err.message}`,
      success: false
    } as any;
  }
}

/**
 * Utilitaire pour valider les données avant insertion/mise à jour
 */
export function validateData<T>(
  data: T,
  requiredFields: (keyof T)[],
  context: string = 'unknown'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Champ requis manquant: ${String(field)}`);
    }
  });
  
  if (errors.length > 0) {
    logger.warn(`Validation failed in ${context}`, { errors, data });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper pour les requêtes avec retry automatique
 */
export async function retryQuery<T>(
  queryFn: () => Promise<DatabaseResult<T>>,
  maxRetries: number = 3,
  context: string = 'unknown'
): Promise<DatabaseResult<T>> {
  let lastError: string | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();
      
      if (result.success || attempt === maxRetries) {
        return result;
      }
      
      lastError = result.error;
      logger.debug(`Retry attempt ${attempt} failed in ${context}`, { error: result.error });
      
      // Attendre avant le prochain essai (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      
    } catch (err: any) {
      lastError = err.message;
      if (attempt === maxRetries) {
        break;
      }
    }
  }
  
  logger.error(`All retry attempts failed in ${context}`, new Error(lastError || 'Unknown error'));
  return {
    data: null,
    error: lastError || 'Toutes les tentatives ont échoué',
    success: false
  };
}