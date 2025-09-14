import { supabase } from '@/integrations/supabase/client';

/**
 * Core API utilities pour AfricaSuite PMS
 * Couche d'abstraction unifiée pour toutes les interactions Supabase
 */

// Types de base pour les responses
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading?: boolean;
}

export interface ApiMultiResponse<T> {
  data: T[] | null;
  error: Error | null;
  loading?: boolean;
  count?: number;
}

// Helper pour gérer les erreurs Supabase
export function throwIfError<T>(data: T | null, error: any): T {
  if (error) {
    console.error("❌ Supabase error:", error);
    throw new Error(error.message || "Erreur base de données");
  }
  if (!data) {
    throw new Error("Aucune donnée reçue");
  }
  return data;
}

// Helper pour gérer les erreurs sans throw (pour queries optionnelles)
export function handleError<T>(data: T | null, error: any): { data: T | null; error: Error | null } {
  if (error) {
    console.error("❌ Supabase error (handled):", error);
    return { data: null, error: new Error(error.message || "Erreur base de données") };
  }
  return { data, error: null };
}

// Helper pour les RPC calls
export function callRPC(functionName: string, params: any = {}) {
  console.log(`🔄 RPC call: ${functionName}`, params);
  return supabase.rpc(functionName as any, params);
}

// Helper pour les queries de base
export function getTable(tableName: string) {
  return supabase.from(tableName as any);
}

// Utilitaires pour les opérations communes
export class ApiHelpers {
  static selectByOrg(tableName: string, orgId: string, columns = "*") {
    return getTable(tableName)
      .select(columns)
      .eq("org_id", orgId);
  }

  static insertWithOrg(tableName: string, orgId: string, data: any) {
    return getTable(tableName)
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  }

  static updateById(tableName: string, id: string, data: any) {
    return getTable(tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();
  }

  static deleteById(tableName: string, id: string) {
    return getTable(tableName)
      .delete()
      .eq("id", id);
  }
}

// Types pour les filtres communs
export interface DateFilter {
  start?: string;
  end?: string;
}

export interface PaginationFilter {
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  query?: string;
  fields?: string[];
}

// Utilitaires pour les filtres
export class FilterBuilder {
  static applyDateFilter(
    query: any, 
    filter: DateFilter, 
    dateColumn = "created_at"
  ) {
    if (filter.start) {
      query = query.gte(dateColumn, filter.start);
    }
    if (filter.end) {
      query = query.lte(dateColumn, filter.end);
    }
    return query;
  }

  static applyPagination(
    query: any,
    filter: PaginationFilter
  ) {
    const { page = 1, limit = 50 } = filter;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    return query.range(from, to);
  }

  static applySearch(
    query: any,
    filter: SearchFilter
  ) {
    if (!filter.query?.trim()) return query;
    
    const searchTerm = filter.query.trim();
    const fields = filter.fields || ["name", "label", "code"];
    
    // Construire la condition OR pour tous les champs
    const orConditions = fields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(",");
    
    return query.or(orConditions);
  }
}

// Constantes pour les statuts communs
export const CommonStatuses = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

// Constantes pour les types de room
export const RoomStatuses = {
  CLEAN: "clean",
  DIRTY: "dirty",
  INSPECTED: "inspected",
  MAINTENANCE: "maintenance",
  OUT_OF_ORDER: "out_of_order",
} as const;

// Constantes pour les statuts de réservation
export const ReservationStatuses = {
  CONFIRMED: "confirmed",
  PRESENT: "present",
  CANCELLED: "cancelled",
  OPTION: "option",
  NOSHOW: "noshow",
} as const;

// Helper pour logger les performances
export function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  console.log(`⏱️ Starting: ${operation}`);
  
  return fn().then((result) => {
    const duration = performance.now() - start;
    console.log(`✅ Completed: ${operation} (${duration.toFixed(2)}ms)`);
    return result;
  }).catch((error) => {
    const duration = performance.now() - start;
    console.error(`❌ Failed: ${operation} (${duration.toFixed(2)}ms)`, error);
    throw error;
  });
}