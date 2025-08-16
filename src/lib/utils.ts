import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// DEPRECATED: Use useCurrency hook or formatCurrency from @/lib/currency instead
export function formatCurrency(amount: number): string {
  console.warn('DEPRECATED: formatCurrency from utils.ts is deprecated. Use useCurrency hook instead.');
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateFR(date: Date = new Date()): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
