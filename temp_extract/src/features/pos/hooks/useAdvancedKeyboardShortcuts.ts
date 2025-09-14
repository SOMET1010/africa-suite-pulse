import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedKeyboardShortcutsProps {
  onQuickAdd: (plu: string) => void;
  onQuickFunction: (functionKey: string) => void;
  onNumericEntry: (value: string) => void;
  onSearch: (query: string) => void;
  isSearchFocused: boolean;
}

export function useAdvancedKeyboardShortcuts({
  onQuickAdd,
  onQuickFunction,
  onNumericEntry,
  onSearch,
  isSearchFocused
}: AdvancedKeyboardShortcutsProps) {
  const { toast } = useToast();

  const handleKeyboardEvent = useCallback((event: KeyboardEvent) => {
    // Si on est dans la recherche, laisser le comportement normal sauf pour Escape
    if (isSearchFocused && event.key !== 'Escape') return;

    // Escape - Effacer recherche ou retour menu
    if (event.key === 'Escape') {
      event.preventDefault();
      onSearch('');
      return;
    }

    // Fonctions rapides F1-F12
    if (event.key.startsWith('F') && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      onQuickFunction(event.key);
      
      const functionMap: Record<string, string> = {
        'F1': 'Aide & Raccourcis',
        'F2': 'Recherche rapide',
        'F3': 'Dernier article',
        'F4': 'Transfert article',
        'F5': 'Remise 10%',
        'F6': 'Menu du jour',
        'F7': 'Boissons populaires',
        'F8': 'Envoi cuisine',
        'F9': 'Split bill',
        'F10': 'Room charge',
        'F11': 'Changer mode',
        'F12': 'Changer vendeur'
      };
      
      toast({
        title: event.key,
        description: functionMap[event.key] || 'Fonction rapide',
        duration: 1500,
      });
      return;
    }

    // PLU rapide avec chiffres (0-9)
    if (/^\d$/.test(event.key) && !isSearchFocused && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      onNumericEntry(event.key);
      return;
    }

    // Raccourcis avec Ctrl
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'f': // Ctrl+F - Focus recherche
          event.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        case 'd': // Ctrl+D - Dupliquer dernier article
          event.preventDefault();
          onQuickFunction('duplicate_last');
          break;
        case 'enter': // Ctrl+Enter - Envoyer cuisine
          event.preventDefault();
          onQuickFunction('send_kitchen');
          break;
        case 'p': // Ctrl+P - Imprimer ticket
          event.preventDefault();
          onQuickFunction('print_ticket');
          break;
      }
      return;
    }

    // Navigation rapide avec Alt
    if (event.altKey) {
      switch (event.key) {
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          event.preventDefault();
          onQuickFunction(`category_${event.key}`);
          toast({
            title: `Catégorie ${event.key}`,
            description: 'Navigation rapide',
            duration: 1000,
          });
          break;
      }
      return;
    }

    // Entrée rapide PLU avec codes spéciaux
    if (event.key === 'Enter' && !isSearchFocused) {
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        // Focus sur l'input de recherche pour saisie PLU
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    }
  }, [onQuickAdd, onQuickFunction, onNumericEntry, onSearch, isSearchFocused, toast]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardEvent);
    return () => document.removeEventListener('keydown', handleKeyboardEvent);
  }, [handleKeyboardEvent]);

  // Fonction pour afficher l'aide
  const showKeyboardHelp = () => {
    toast({
      title: "Raccourcis clavier POS",
      description: "F1: Aide | F2: Recherche | F5: Remise | F8: Cuisine | Ctrl+F: Focus recherche",
      duration: 5000,
    });
  };

  return {
    showKeyboardHelp
  };
}