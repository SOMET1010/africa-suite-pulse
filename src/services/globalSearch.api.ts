import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'guest' | 'reservation' | 'room' | 'product' | 'invoice' | 'maintenance' | 'template';
  title: string;
  subtitle: string;
  metadata?: string;
  status?: string;
  action?: () => void;
}

export class GlobalSearchService {
  static async searchAll(query: string, orgId: string): Promise<SearchResult[]> {
    if (!query.trim() || query.length < 2) return [];

    const results: SearchResult[] = [];
    const searchTerm = `%${query.toLowerCase()}%`;

    try {
      // Search guests using secure function
      const { data: guests } = await supabase
        .rpc('search_guests_secure', {
          search_term: query,
          limit_count: 5
        });

      guests?.forEach(guest => {
        results.push({
          id: guest.id,
          type: 'guest',
          title: `${guest.first_name} ${guest.last_name}`,
          subtitle: guest.email || guest.phone || 'Pas d\'email',
          metadata: guest.guest_type || 'Client Standard',
          status: 'active'
        });
      });

      // Search POS products
      const { data: posProducts } = await supabase
        .from('pos_stock_items')
        .select('id, name, item_code, last_cost')
        .eq('org_id', orgId)
        .or(`name.ilike.${searchTerm},item_code.ilike.${searchTerm}`)
        .limit(3);

      posProducts?.forEach(product => {
        results.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: product.item_code || 'Produit POS',
          metadata: `${product.last_cost || 0} XOF`,
          status: 'active'
        });
      });

      // Search maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select('id, title, status, priority, request_number')
        .eq('org_id', orgId)
        .or(`title.ilike.${searchTerm},request_number.ilike.${searchTerm}`)
        .limit(3);

      maintenance?.forEach(request => {
        results.push({
          id: request.id,
          type: 'maintenance',
          title: request.request_number || request.title,
          subtitle: request.title,
          metadata: `Priorité: ${request.priority}`,
          status: request.status
        });
      });

      // Search document templates
      const { data: templates } = await supabase
        .from('document_templates')
        .select('id, name, type, category')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .or(`name.ilike.${searchTerm},type.ilike.${searchTerm}`)
        .limit(3);

      templates?.forEach(template => {
        results.push({
          id: template.id,
          type: 'template',
          title: template.name,
          subtitle: `Template ${template.type}`,
          metadata: template.category || 'Document',
          status: 'active'
        });
      });

      // Search reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          id, reference, status, date_arrival, date_departure,
          guests(first_name, last_name),
          rooms(number)
        `)
        .eq('org_id', orgId)
        .or(`reference.ilike.${searchTerm}`)
        .limit(5);

      reservations?.forEach(reservation => {
        const guest = reservation.guests as any;
        const room = reservation.rooms as any;
        results.push({
          id: reservation.id,
          type: 'reservation',
          title: reservation.reference,
          subtitle: guest ? `${guest.first_name} ${guest.last_name}` : 'Pas de client',
          metadata: room ? `Chambre ${room.number} • ${reservation.date_arrival} - ${reservation.date_departure}` : undefined,
          status: reservation.status
        });
      });

      // Search rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, number, type, status, floor')
        .eq('org_id', orgId)
        .or(`number.ilike.${searchTerm},type.ilike.${searchTerm}`)
        .limit(5);

      rooms?.forEach(room => {
        results.push({
          id: room.id,
          type: 'room',
          title: `Chambre ${room.number}`,
          subtitle: room.type,
          metadata: room.floor ? `Étage ${room.floor}` : undefined,
          status: room.status
        });
      });

      // Search invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, number, guest_name, total_amount, status, created_at')
        .eq('org_id', orgId)
        .or(`number.ilike.${searchTerm},guest_name.ilike.${searchTerm}`)
        .limit(5);

      invoices?.forEach(invoice => {
        results.push({
          id: invoice.id.toString(),
          type: 'invoice',
          title: invoice.number || `Facture ${invoice.id}`,
          subtitle: invoice.guest_name || 'Client inconnu',
          metadata: `${invoice.total_amount || 0} XOF • ${new Date(invoice.created_at).toLocaleDateString()}`,
          status: invoice.status
        });
      });

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  static async getQuickActions(orgId: string) {
    return [
      {
        id: 'new-guest',
        title: 'Nouveau Client',
        action: () => window.location.href = '/guests/new'
      },
      {
        id: 'new-reservation',
        title: 'Nouvelle Réservation',
        action: () => window.location.href = '/rack/new-reservation'
      },
      {
        id: 'pos-order',
        title: 'Commande Restaurant',
        action: () => window.location.href = '/pos'
      },
      {
        id: 'housekeeping',
        title: 'Ménage',
        action: () => window.location.href = '/housekeeping'
      }
    ];
  }
}