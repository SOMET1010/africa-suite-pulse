import { useState, useMemo } from 'react';
import { useSearchDebounce } from './useDebounce';

interface UseSearchFilterOptions {
  delay?: number;
  filterKeys?: string[];
}

export function useSearchFilter<T extends Record<string, any>>(
  data: T[] = [],
  { delay = 300, filterKeys = [] }: UseSearchFilterOptions = {}
) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useSearchDebounce(searchTerm, delay);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return data;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item => {
      // If no filter keys specified, search all string properties
      if (filterKeys.length === 0) {
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchLower)
        );
      }

      // Search only specified keys
      return filterKeys.some(key => {
        const value = item[key];
        return typeof value === 'string' && 
               value.toLowerCase().includes(searchLower);
      });
    });
  }, [data, debouncedSearchTerm, filterKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}