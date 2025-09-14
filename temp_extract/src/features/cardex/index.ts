// Export principal de la feature cardex
export { default as CardexPage } from './CardexPage';
export { CardexOverview } from './components/CardexOverview';
export { FoliosGrid } from './components/FoliosGrid';
export { CardexHistory } from './components/CardexHistory';
export { QuickPostingDialog } from './components/QuickPostingDialog';
export { ReservationSelector } from './components/ReservationSelector';

// Services et API
export { cardexApi } from '@/services/cardex.api';

// Types
export type * from '@/types/cardex';