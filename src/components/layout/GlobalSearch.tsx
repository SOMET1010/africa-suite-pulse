import React, { useState } from "react";
import { Search, User, Home, Calendar, FileText } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  type: 'guest' | 'room' | 'reservation' | 'invoice';
  title: string;
  subtitle: string;
  badge?: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Mock search results - in real app, this would be API-driven
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'guest',
      title: 'Jean Dupont',
      subtitle: 'jean.dupont@email.com',
      badge: 'VIP'
    },
    {
      id: '2', 
      type: 'room',
      title: 'Chambre 205',
      subtitle: 'Suite Deluxe - Étage 2',
      badge: 'Occupée'
    },
    {
      id: '3',
      type: 'reservation',
      title: 'RES-2024-001',
      subtitle: 'Marie Martin - Du 15/01 au 18/01',
      badge: 'Confirmée'
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Facture #1234',
      subtitle: 'Jean Dupont - 1,250 €',
      badge: 'Payée'
    }
  ];

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'guest':
        return <User className="w-4 h-4 text-info" />;
      case 'room':
        return <Home className="w-4 h-4 text-success" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-warning" />;
      case 'invoice':
        return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'guest':
        return 'Client';
      case 'room':
        return 'Chambre';
      case 'reservation':
        return 'Réservation';
      case 'invoice':
        return 'Facture';
    }
  };

  const filteredResults = query.length >= 2 
    ? mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hidden md:flex hover:bg-soft-primary transition-elegant"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 glass-card border-accent-gold/20 shadow-luxury"
      >
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-accent" />
            <span className="font-medium">Recherche globale</span>
          </div>
        </DropdownMenuLabel>
        
        <div className="px-2 pb-2">
          <Input
            placeholder="Rechercher clients, chambres, réservations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-card border-accent-gold/20"
            autoFocus
          />
        </div>
        
        <DropdownMenuSeparator className="bg-accent-gold/20" />
        
        <ScrollArea className="h-64">
          {query.length < 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat trouvé</p>
              <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((result) => (
                <DropdownMenuItem 
                  key={result.id}
                  className="p-3 hover:bg-soft-primary transition-elegant cursor-pointer"
                  onClick={() => {
                    // Handle navigation to result
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-charcoal truncate">
                          {result.title}
                        </h4>
                        {result.badge && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getResultTypeLabel(result.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {query.length >= 2 && filteredResults.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-accent-gold/20" />
            <DropdownMenuItem className="text-center hover:bg-soft-primary transition-elegant">
              <span className="w-full text-sm text-primary font-medium">
                Voir tous les résultats ({filteredResults.length})
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}