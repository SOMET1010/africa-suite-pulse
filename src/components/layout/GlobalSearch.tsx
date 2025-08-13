import React, { useState, useCallback, useEffect } from 'react';
import { Search, Users, Bed, Package, CreditCard, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GlobalSearchService, SearchResult } from '@/services/globalSearch.api';
import { supabase } from '@/integrations/supabase/client';

// SearchResult interface is now imported from service

interface GlobalSearchProps {
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
}

// Mock results removed - now using real search

export function GlobalSearch({ className, onResultSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string>('');
  const navigate = useNavigate();

  // Get user org on mount
  useEffect(() => {
    const getOrgId = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: orgData } = await supabase
          .from('app_users')
          .select('org_id')
          .eq('user_id', user.user.id)
          .single();
        
        if (orgData) {
          setOrgId(orgData.org_id);
        }
      }
    };
    getOrgId();
  }, []);

  // Real search function
  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !orgId) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const searchResults = await GlobalSearchService.searchAll(searchQuery, orgId);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchItems]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'guest':
        return <Users className="h-4 w-4" />;
      case 'reservation':
        return <Clock className="h-4 w-4" />;
      case 'room':
        return <Bed className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'invoice':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getStatusColor = (type: SearchResult['type'], status?: string) => {
    if (!status) return '';
    
    switch (type) {
      case 'guest':
        return status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground';
      case 'reservation':
        return status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning';
      case 'room':
        return status === 'available' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive';
      case 'product':
        return 'bg-primary/10 text-primary';
      case 'invoice':
        return status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'guest': return 'Client';
      case 'reservation': return 'Réservation';
      case 'room': return 'Chambre';
      case 'product': return 'Produit';
      case 'invoice': return 'Facture';
      default: return '';
    }
  };

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    setQuery('');
    onResultSelect?.(result);
    result.action?.();
  }, [onResultSelect]);

  // Keyboard shortcut effect
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="inline-flex">Rechercher...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher clients, réservations, chambres..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {!loading && query && results.length === 0 && (
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          )}
          
          {!loading && results.length > 0 && (
            <>
              {/* Group by type */}
              {['guest', 'reservation', 'room', 'product', 'invoice'].map(type => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;
                
                return (
                  <CommandGroup key={type} heading={getTypeLabel(type as SearchResult['type'])}>
                    {typeResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        value={`${result.type}-${result.title}-${result.subtitle}`}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {getTypeIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {result.title}
                            </p>
                            {result.status && (
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", getStatusColor(result.type, result.status))}
                              >
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                          {result.metadata && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {result.metadata}
                            </p>
                          )}
                        </div>
                        
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
          
          {/* Quick Actions */}
          {!query && (
            <CommandGroup heading="Actions Rapides">
              <CommandItem onSelect={() => { setOpen(false); navigate('/guests'); }}>
                <Users className="mr-2 h-4 w-4" />
                <span>Nouveau Client</span>
              </CommandItem>
              <CommandItem onSelect={() => { setOpen(false); navigate('/reservations/new/quick'); }}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Nouvelle Réservation</span>
              </CommandItem>
              <CommandItem onSelect={() => { setOpen(false); navigate('/pos/terminal'); }}>
                <Package className="mr-2 h-4 w-4" />
                <span>Commande Restaurant</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}