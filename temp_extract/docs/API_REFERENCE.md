# 🔌 AfricaSuite PMS - Référence API

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Types de données](#types-de-données)
4. [API Réservations](#api-réservations)
5. [API Clients](#api-clients)
6. [API Chambres](#api-chambres)
7. [API Point de Vente](#api-point-de-vente)
8. [API Facturation](#api-facturation)
9. [API Rapports](#api-rapports)
10. [Edge Functions](#edge-functions)
11. [Webhooks](#webhooks)
12. [Rate Limiting](#rate-limiting)

## 🌟 Vue d'ensemble

L'API AfricaSuite PMS est construite sur Supabase et expose une interface RESTful avec support temps réel. Toutes les opérations respectent les politiques de sécurité Row Level Security (RLS).

### URL de base
```
Production: https://alfflpvdnywwbrzygmoc.supabase.co
Staging: https://alfflpvdnywwbrzygmoc.supabase.co
```

### Format des réponses
```typescript
// Réponse standard
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading?: boolean;
}

// Réponse paginée
interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
```

## 🔐 Authentification

### Headers requis
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

### Obtenir un token
```typescript
import { supabase } from '@/integrations/supabase/client';

// Connexion par email/mot de passe
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Utiliser le token dans les requêtes
const token = data.session?.access_token;
```

### Gestion des tokens
```typescript
// Vérifier la validité du token
const { data: { user } } = await supabase.auth.getUser();

// Rafraîchir le token
const { data, error } = await supabase.auth.refreshSession();
```

## 📊 Types de données

### Types de base
```typescript
// UUID standard
type UUID = string;

// Timestamps ISO 8601
type Timestamp = string;

// Statuts de réservation
type ReservationStatus = 'option' | 'confirmed' | 'present' | 'cancelled' | 'noshow';

// Statuts de chambre
type RoomStatus = 'clean' | 'inspected' | 'dirty' | 'maintenance' | 'out_of_order';
```

### Structures principales
```typescript
interface Reservation {
  id: UUID;
  org_id: UUID;
  guest_id?: UUID;
  room_id: UUID | null;
  status: ReservationStatus;
  date_arrival: string; // YYYY-MM-DD
  date_departure: string; // YYYY-MM-DD
  adults: number;
  children: number;
  rate_total: number;
  reference: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface Guest {
  id: UUID;
  org_id: UUID;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
  nationality?: string;
  vip_status: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface Room {
  id: UUID;
  org_id: UUID;
  number: string;
  type: string;
  floor: string | null;
  status: RoomStatus;
  is_fictive: boolean;
  features?: RoomFeatures;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

## 🏨 API Réservations

### Lister les réservations
```http
GET /rest/v1/reservations
```

**Paramètres de requête:**
```typescript
interface ReservationFilters {
  status?: ReservationStatus;
  date_arrival?: string; // YYYY-MM-DD
  date_departure?: string; // YYYY-MM-DD
  guest_id?: UUID;
  room_id?: UUID;
  limit?: number;
  offset?: number;
}
```

**Exemple de requête:**
```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    guests (first_name, last_name, email),
    rooms (number, type)
  `)
  .eq('org_id', orgId)
  .gte('date_arrival', '2024-01-01')
  .order('date_arrival', { ascending: true });
```

### Créer une réservation
```http
POST /rest/v1/reservations
```

**Corps de la requête:**
```typescript
interface CreateReservationRequest {
  guest_id?: UUID;
  room_id?: UUID;
  status: ReservationStatus;
  date_arrival: string;
  date_departure: string;
  adults: number;
  children?: number;
  rate_total?: number;
  reference?: string;
  special_requests?: string;
}
```

**Exemple:**
```typescript
const { data, error } = await supabase
  .from('reservations')
  .insert({
    guest_id: 'guest-uuid',
    room_id: 'room-uuid',
    status: 'confirmed',
    date_arrival: '2024-03-15',
    date_departure: '2024-03-18',
    adults: 2,
    children: 0,
    rate_total: 450.00
  })
  .select();
```

### Mettre à jour une réservation
```http
PATCH /rest/v1/reservations?id=eq.{reservation_id}
```

### Supprimer une réservation
```http
DELETE /rest/v1/reservations?id=eq.{reservation_id}
```

### Obtenir le planning (rack)
```http
GET /rest/v1/rpc/get_rack_data
```

**Paramètres:**
```typescript
interface RackDataRequest {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  room_types?: string[];
}
```

## 👥 API Clients

### Rechercher des clients
```http
GET /rest/v1/rpc/search_guests_secure
```

**Paramètres:**
```typescript
interface GuestSearchRequest {
  search_term: string;
  limit_count?: number; // default: 50
}
```

**Exemple:**
```typescript
const { data, error } = await supabase.rpc('search_guests_secure', {
  search_term: 'john doe',
  limit_count: 20
});
```

### Créer un client
```http
POST /rest/v1/guests
```

**Corps de la requête:**
```typescript
interface CreateGuestRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
  date_of_birth?: string;
  nationality?: string;
  address_line1?: string;
  city?: string;
  country?: string;
  guest_type?: string;
  vip_status?: boolean;
  marketing_consent?: boolean;
  special_requests?: string;
  notes?: string;
}
```

### Historique de séjour
```http
GET /rest/v1/rpc/get_guest_stay_history_secure
```

**Paramètres:**
```typescript
interface GuestHistoryRequest {
  p_guest_id?: UUID;
}
```

## 🏠 API Chambres

### Lister les chambres
```http
GET /rest/v1/rooms
```

**Paramètres de requête:**
```typescript
interface RoomFilters {
  type?: string;
  floor?: string;
  status?: RoomStatus;
  is_fictive?: boolean;
}
```

### Créer des chambres en série
```http
POST /rest/v1/rpc/create_room_series
```

**Paramètres:**
```typescript
interface CreateRoomSeriesRequest {
  start_number: number;
  end_number: number;
  type_code: string;
  floor: string;
  features?: RoomFeatures;
  is_fictive?: boolean;
  prefix?: string;
  suffix?: string;
}
```

### Mettre à jour le statut d'une chambre
```http
PATCH /rest/v1/rooms?id=eq.{room_id}
```

**Corps de la requête:**
```typescript
interface UpdateRoomStatusRequest {
  status: RoomStatus;
  notes?: string;
}
```

## 💰 API Point de Vente

### Authentification POS
```http
POST /rest/v1/rpc/authenticate_pos_user
```

**Paramètres:**
```typescript
interface POSAuthRequest {
  p_pin: string;
  p_org_id?: UUID;
}
```

**Réponse:**
```typescript
interface POSAuthResponse {
  session_token: string;
  user_id: UUID;
  display_name: string;
  role_name: string;
  org_id: UUID;
  outlet_id?: UUID;
}
```

### Créer une commande
```http
POST /rest/v1/pos_orders
```

**Corps de la requête:**
```typescript
interface CreatePOSOrderRequest {
  table_id?: UUID;
  customer_count?: number;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'room_service';
  items: POSOrderItem[];
  notes?: string;
}

interface POSOrderItem {
  product_id: UUID;
  quantity: number;
  unit_price: number;
  variant_selection?: Record<string, any>;
  special_instructions?: string;
}
```

### Traiter un paiement
```http
POST /rest/v1/rpc/process_pos_payment
```

**Paramètres:**
```typescript
interface ProcessPaymentRequest {
  order_id: UUID;
  payment_method_id: UUID;
  amount: number;
  cash_received?: number;
  reference?: string;
}
```

## 🧾 API Facturation

### Créer une facture
```http
POST /rest/v1/invoices
```

### Ajouter des articles à une facture
```http
POST /rest/v1/invoice_items
```

### Enregistrer un paiement
```http
POST /rest/v1/payment_transactions
```

**Corps de la requête:**
```typescript
interface CreatePaymentRequest {
  invoice_id: UUID;
  method_id: UUID;
  amount: number;
  currency_code?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}
```

## 📊 API Rapports

### Rapport d'occupation
```http
GET /rest/v1/rpc/get_occupancy_report
```

**Paramètres:**
```typescript
interface OccupancyReportRequest {
  start_date: string;
  end_date: string;
  room_types?: string[];
}
```

### Rapport de revenus
```http
GET /rest/v1/rpc/get_revenue_report
```

### Analytiques prédictives
```http
GET /rest/v1/analytics_predictions
```

## ⚡ Edge Functions

### Traitement de paiement avancé
```http
POST /functions/v1/process-payment
```

**Corps de la requête:**
```typescript
interface AdvancedPaymentRequest {
  amount: number;
  currency: string;
  method: string;
  customer_id?: UUID;
  metadata?: Record<string, unknown>;
}
```

### Notification par email
```http
POST /functions/v1/send-notification
```

### Export de données
```http
POST /functions/v1/export-data
```

**Paramètres:**
```typescript
interface ExportRequest {
  type: 'reservations' | 'guests' | 'financial';
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: Record<string, unknown>;
  date_range?: {
    start: string;
    end: string;
  };
}
```

## 🔔 Webhooks

### Configuration
```typescript
// Enregistrer un webhook
const webhook = {
  url: 'https://your-app.com/webhooks/africasuite',
  events: ['reservation.created', 'payment.completed'],
  secret: 'your-webhook-secret'
};
```

### Événements supportés
```typescript
type WebhookEvent =
  | 'reservation.created'
  | 'reservation.updated' 
  | 'reservation.cancelled'
  | 'payment.completed'
  | 'guest.checked_in'
  | 'guest.checked_out'
  | 'room.status_changed';
```

### Format des payloads
```typescript
interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
  org_id: UUID;
}
```

## ⏱️ Rate Limiting

### Limites par défaut
- **API REST**: 100 requêtes/minute/utilisateur
- **Edge Functions**: 50 requêtes/minute/utilisateur
- **Search**: 20 requêtes/minute/utilisateur
- **Exports**: 5 requêtes/heure/utilisateur

### Headers de réponse
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Gestion des erreurs de rate limiting
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Attendre avant de retry
  setTimeout(() => {
    // Retry la requête
  }, parseInt(retryAfter) * 1000);
}
```

## 🔧 Codes d'erreur

### Erreurs HTTP standard
- **400**: Bad Request - Paramètres invalides
- **401**: Unauthorized - Token manquant/invalide
- **403**: Forbidden - Permissions insuffisantes
- **404**: Not Found - Ressource introuvable
- **409**: Conflict - Contrainte de données
- **422**: Unprocessable Entity - Validation échouée
- **429**: Too Many Requests - Rate limit dépassé
- **500**: Internal Server Error - Erreur serveur

### Codes d'erreur métier
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Exemples de codes
const ERROR_CODES = {
  RESERVATION_CONFLICT: 'RESERVATION_CONFLICT',
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  GUEST_NOT_FOUND: 'GUEST_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS'
} as const;
```

## 📚 Exemples d'intégration

### Client JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://alfflpvdnywwbrzygmoc.supabase.co',
  'your-anon-key'
);

// Exemple complet de création de réservation
async function createReservation(data: CreateReservationRequest) {
  try {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(data)
      .select(`
        *,
        guests (first_name, last_name),
        rooms (number, type)
      `)
      .single();
      
    if (error) throw error;
    return reservation;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}
```

### Client Python
```python
import requests

class AfricaSuitePMSClient:
    def __init__(self, base_url, api_key, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'apikey': api_key,
            'Content-Type': 'application/json'
        }
    
    def create_reservation(self, data):
        response = requests.post(
            f'{self.base_url}/rest/v1/reservations',
            json=data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
```

---

**📡 Cette API évolue constamment. Consultez la documentation pour les dernières mises à jour.**

Pour support technique : [Créer une issue](./issues)