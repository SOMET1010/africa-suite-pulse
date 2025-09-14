// Export principal de la feature guests
export { default as GuestsPage } from './GuestsPage';
export { GuestCard } from './components/GuestCard';
export { CreateGuestDialog } from './components/CreateGuestDialog';
export { EditGuestDialog } from './components/EditGuestDialog';
export { GuestDetailsSheet } from './components/GuestDetailsSheet';
export { GuestFiltersSheet } from './components/GuestFiltersSheet';

// Services et API
export { guestsApi } from '@/services/guests.api';

// Types
export type * from '@/types/guest';