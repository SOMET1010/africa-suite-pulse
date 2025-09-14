import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onSendToKitchen: () => void;
  onCheckout: () => void;
  onChangeTable?: () => void;
  onChangeMode?: () => void;
  onChangeStaff?: () => void;
  onNewOrder?: () => void;
  onSplitBill?: () => void;
  onTransferTable?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onSendToKitchen,
  onCheckout,
  onChangeTable,
  onChangeMode,
  onChangeStaff,
  onNewOrder,
  onSplitBill,
  onTransferTable,
  disabled = false
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'F1': // Nouvelle commande
          e.preventDefault();
          onNewOrder?.();
          break;
        case 'F2': // Changer mode service
          e.preventDefault();
          onChangeMode?.();
          break;
        case 'F3': // Changer table
          e.preventDefault();
          onChangeTable?.();
          break;
        case 'F4': // Transférer commande
          e.preventDefault();
          onTransferTable?.();
          break;
        case 'F6': // Split bill
          e.preventDefault();
          onSplitBill?.();
          break;
        case 'F9': // Envoyer en cuisine
          e.preventDefault();
          onSendToKitchen();
          break;
        case 'F10': // Encaisser
          e.preventDefault();
          onCheckout();
          break;
        case 'F12': // Changer staff
          e.preventDefault();
          onChangeStaff?.();
          break;
        case 'F5': // Actualiser
          e.preventDefault();
          window.location.reload();
          break;
        case 'F7': // Focus search
          e.preventDefault();
          const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    disabled,
    onSendToKitchen,
    onCheckout,
    onChangeTable,
    onChangeMode,
    onChangeStaff,
    onNewOrder,
    onSplitBill,
    onTransferTable
  ]);
}