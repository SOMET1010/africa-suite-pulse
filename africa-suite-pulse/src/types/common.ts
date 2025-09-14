/**
 * 🎯 Types communs pour TypeScript Strict
 * 
 * Définit les types de base réutilisables dans toute l'application
 * pour améliorer la sécurité de type et réduire l'usage de `any`.
 */

// Types de base
export type StringOrNumber = string | number;
export type ID = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

// Types pour les APIs
export interface ApiError {
  message: string;
  code?: string;
  details?: JSONObject;
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Types pour les événements
export interface BaseEvent {
  type: string;
  timestamp: string;
  source?: string;
}

export interface UserEvent extends BaseEvent {
  userId: string;
  orgId: string;
}

// Types pour les formulaires
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T = JSONObject> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Types pour les handlers d'événements
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;
export type ClickHandler = EventHandler<React.MouseEvent>;
export type ChangeHandler<T = string> = EventHandler<T>;

// Types pour les composants
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// Types pour les données avec timestamps
export interface WithTimestamps {
  created_at: string;
  updated_at: string;
}

export interface WithOrg {
  org_id: string;
}

export interface WithUser {
  user_id: string;
}

// Types pour les filtres et pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: StringOrNumber | StringOrNumber[] | undefined;
}

export interface SearchParams extends PaginationParams, Partial<SortParams> {
  search?: string;
  filters?: FilterParams;
}

// Types pour les états de chargement
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Types pour les droits et permissions
export interface Permission {
  action: string;
  resource: string;
  conditions?: JSONObject;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

// Utilitaires de type
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Types pour exclure certaines propriétés
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Types pour les callbacks de hooks React Query
export interface QueryCallbacks<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export interface MutationCallbacks<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

// Type guards utilitaires
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is JSONObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is JSONArray {
  return Array.isArray(value);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}