/**
 * Enhanced Components Index
 * Composants enrichis pour AfricaSuite PMS 2025
 * Optimisés mobile-first, workflows hôteliers, accessibilité
 */

// Cards et conteneurs
export { 
  HotelCard, 
  ReservationCard, 
  RoomCard, 
  GuestCard, 
  UrgentCard 
} from './HotelCard';

// Indicateurs de statut
export { 
  StatusIndicator, 
  ReservationStatus, 
  RoomStatus, 
  PaymentStatus, 
  StaffStatus 
} from './StatusIndicator';

// Boutons tactiles
export { 
  TouchButton, 
  PrimaryTouchButton, 
  SecondaryTouchButton, 
  FloatingActionButton, 
  QuickActionButton,
  DangerTouchButton 
} from './TouchButton';

// Formulaires enrichis
export { EnhancedInput } from './EnhancedInput';
export { ToggleButtons } from './ToggleButtons';
export { 
  LoadingState, 
  ButtonLoadingState, 
  FormLoadingState, 
  PageLoadingState 
} from './LoadingState';

// Types communs
export type { HotelCardProps } from './HotelCard';
export type { StatusIndicatorProps } from './StatusIndicator'; 
export type { TouchButtonProps } from './TouchButton';