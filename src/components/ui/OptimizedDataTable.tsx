import React, { useMemo } from 'react';
import { DataTable } from './DataTable';
import { useOptimizedFilter, useOptimizedMap } from '@/hooks/useOptimizedMemo';

interface OptimizedDataTableProps<T> {
  data: T[];
  columns: any[];
  searchTerm?: string;
  searchFields?: (keyof T)[];
  filterFn?: (item: T) => boolean;
  sortBy?: keyof T;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  actions?: any[];
  onExport?: (data: T[]) => void;
}

/**
 * Version optimisée du DataTable avec memoïsation automatique
 * des opérations coûteuses (filtrage, tri, recherche)
 */
export function OptimizedDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchTerm = '',
  searchFields = [],
  filterFn,
  sortBy,
  sortDirection = 'asc',
  pageSize = 10,
  actions,
  onExport
}: OptimizedDataTableProps<T>) {
  
  // Filtrage optimisé avec recherche
  const filteredData = useOptimizedFilter(
    data,
    (item) => {
      // Appliquer le filtre personnalisé si fourni
      if (filterFn && !filterFn(item)) return false;
      
      // Appliquer la recherche si terme fourni
      if (searchTerm && searchFields.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        return searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    },
    [searchTerm, searchFields, filterFn]
  );

  // Tri optimisé
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortDirection]);

  // Colonnes optimisées pour éviter les re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);
  
  // Actions optimisées
  const memoizedActions = useMemo(() => actions || [], [actions]);

  return (
    <DataTable
      data={sortedData}
      columns={memoizedColumns}
      actions={memoizedActions}
    />
  );
}