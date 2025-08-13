import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        
        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useDashboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrl: true,
      action: () => navigate('/reservations/new'),
      description: 'Nouvelle réservation (Ctrl+N)'
    },
    {
      key: 'r',
      ctrl: true,
      action: () => navigate('/reservations/rack'),
      description: 'Rack visuel (Ctrl+R)'
    },
    {
      key: 'p',
      ctrl: true,
      action: () => navigate('/pos'),
      description: 'POS Terminal (Ctrl+P)'
    },
    {
      key: 'a',
      ctrl: true,
      action: () => navigate('/arrivals'),
      description: 'Arrivées (Ctrl+A)'
    },
    {
      key: 'h',
      ctrl: true,
      action: () => navigate('/housekeeping'),
      description: 'Housekeeping (Ctrl+H)'
    },
    {
      key: 'f',
      ctrl: true,
      action: () => {
        // Trigger global search modal
        toast({
          title: "Recherche",
          description: "Fonction de recherche à implémenter",
        });
      },
      description: 'Recherche globale (Ctrl+F)'
    },
    {
      key: '/',
      action: () => {
        toast({
          title: "Raccourcis clavier",
          description: "Ctrl+N: Nouvelle réservation, Ctrl+R: Rack, Ctrl+P: POS, Ctrl+A: Arrivées, Ctrl+H: Housekeeping",
        });
      },
      description: 'Afficher les raccourcis (/)'
    }
  ];

  useKeyboardShortcuts({ shortcuts });

  return shortcuts;
}