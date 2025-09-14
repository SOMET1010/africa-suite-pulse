import { useMemo, useCallback } from 'react';

/**
 * Hook optimisé pour memoïser les calculs coûteux avec map/filter/reduce
 * Évite les re-calculs inutiles lors des re-renders
 */

export function useOptimizedFilter<T>(
  data: T[] | undefined,
  filterFn: (item: T) => boolean,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => {
    if (!data) return [];
    return data.filter(filterFn);
  }, [data, ...deps]);
}

export function useOptimizedMap<T, R>(
  data: T[] | undefined,
  mapFn: (item: T, index: number) => R,
  deps: React.DependencyList = []
): R[] {
  return useMemo(() => {
    if (!data) return [];
    return data.map(mapFn);
  }, [data, ...deps]);
}

export function useOptimizedReduce<T, R>(
  data: T[] | undefined,
  reduceFn: (acc: R, current: T, index: number) => R,
  initialValue: R,
  deps: React.DependencyList = []
): R {
  return useMemo(() => {
    if (!data) return initialValue;
    return data.reduce(reduceFn, initialValue);
  }, [data, initialValue, ...deps]);
}

/**
 * Hook pour optimiser les event handlers coûteux
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Hook pour optimiser les objets complexes passés comme props
 */
export function useOptimizedObject<T extends Record<string, any>>(
  obj: T,
  deps: React.DependencyList = []
): T {
  return useMemo(() => obj, deps);
}

/**
 * Hook pour optimiser les calculs de totaux/agrégations
 */
export function useOptimizedAggregation<T>(
  data: T[] | undefined,
  aggregations: {
    [K: string]: (data: T[]) => any;
  },
  deps: React.DependencyList = []
) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return Object.keys(aggregations).reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {} as Record<string, any>);
    }

    return Object.entries(aggregations).reduce((acc, [key, fn]) => {
      acc[key] = fn(data);
      return acc;
    }, {} as Record<string, any>);
  }, [data, ...deps]);
}