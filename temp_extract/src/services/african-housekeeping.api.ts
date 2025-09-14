import { supabase } from '@/integrations/supabase/client';

// Types pour le système Housekeeping africain
export interface LinenInventoryItem {
  id: string;
  type: 'bed_sheet' | 'towel' | 'pillowcase' | 'bathrobe' | 'blanket' | 'duvet_cover';
  size: 'single' | 'double' | 'queen' | 'king' | 'small' | 'medium' | 'large';
  quantity_available: number;
  quantity_in_use: number;
  quantity_in_laundry: number;
  quantity_damaged: number;
  quality_grade: 'A' | 'B' | 'C';
  last_restocked: string;
  cost_per_unit: number;
  supplier: string;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface RecoucheWorkflowItem {
  id: string;
  room_id: string;
  room_number: string;
  reservation_id?: string;
  guest_name?: string;
  checkout_completed_at?: string;
  cleaning_started_at?: string;
  cleaning_completed_at?: string;
  inspection_started_at?: string;
  inspection_completed_at?: string;
  ready_for_checkin_at?: string;
  status: 'checkout_dirty' | 'cleaning_assigned' | 'cleaning_in_progress' | 'cleaning_completed' | 
          'inspection_pending' | 'inspection_in_progress' | 'inspection_failed' | 'ready_for_checkin';
  priority: 'low' | 'normal' | 'high' | 'express' | 'vip';
  assigned_cleaner?: string;
  assigned_inspector?: string;
  estimated_completion: string;
  expected_checkin_at?: string;
  notes?: string;
  cleaning_duration_minutes?: number;
  inspection_duration_minutes?: number;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface LinenChangeRecord {
  id: string;
  room_id: string;
  room_number: string;
  workflow_id?: string;
  bed_linen_changed: boolean;
  bathroom_linen_changed: boolean;
  items_changed: {
    sheets: number;
    pillowcases: number;
    towels: number;
    bathrobes: number;
    blankets: number;
    duvet_covers: number;
  };
  previous_linen_condition: 'excellent' | 'good' | 'acceptable' | 'worn' | 'stained' | 'damaged';
  replacement_reason: 'schedule' | 'checkout' | 'guest_request' | 'stained' | 'damaged' | 'maintenance';
  changed_by: string;
  changed_at: string;
  cost_impact: number;
  org_id: string;
}

export interface HousekeepingStaff {
  id: string;
  name: string;
  role: 'cleaner' | 'inspector' | 'supervisor' | 'laundry';
  shift_start: string;
  shift_end: string;
  rooms_assigned: string[];
  performance_rating: number;
  tasks_completed_today: number;
  average_cleaning_time: number;
  is_available: boolean;
  org_id: string;
}

export interface HousekeepingStats {
  total_rooms: number;
  rooms_dirty: number;
  rooms_cleaning: number;
  rooms_inspection: number;
  rooms_ready: number;
  average_cleaning_time: number;
  average_inspection_time: number;
  linen_changes_today: number;
  staff_utilization: number;
  priority_rooms_pending: number;
}

class AfricanHousekeepingAPI {
  // Gestion de l'inventaire du linge
  async getLinenInventory(): Promise<LinenInventoryItem[]> {
    try {
      // En mode mock pour les tests
      if (process.env.NODE_ENV === 'development') {
        return this.getMockLinenInventory();
      }

      const { data, error } = await supabase
        .from('linen_inventory')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching linen inventory:', error);
      return this.getMockLinenInventory();
    }
  }

  async updateLinenQuantity(itemId: string, quantityChange: number, operation: 'use' | 'return' | 'damage' | 'restock'): Promise<void> {
    try {
      const { data: item } = await supabase
        .from('linen_inventory')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) throw new Error('Linen item not found');

      let updates: Partial<LinenInventoryItem> = {};

      switch (operation) {
        case 'use':
          updates = {
            quantity_available: Math.max(0, item.quantity_available - quantityChange),
            quantity_in_use: item.quantity_in_use + quantityChange
          };
          break;
        case 'return':
          updates = {
            quantity_available: item.quantity_available + quantityChange,
            quantity_in_use: Math.max(0, item.quantity_in_use - quantityChange)
          };
          break;
        case 'damage':
          updates = {
            quantity_in_use: Math.max(0, item.quantity_in_use - quantityChange),
            quantity_damaged: item.quantity_damaged + quantityChange
          };
          break;
        case 'restock':
          updates = {
            quantity_available: item.quantity_available + quantityChange,
            last_restocked: new Date().toISOString()
          };
          break;
      }

      const { error } = await supabase
        .from('linen_inventory')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating linen quantity:', error);
      throw error;
    }
  }

  // Gestion des workflows de recouche
  async getRecoucheWorkflows(): Promise<RecoucheWorkflowItem[]> {
    try {
      // En mode mock pour les tests
      if (process.env.NODE_ENV === 'development') {
        return this.getMockRecoucheWorkflows();
      }

      const { data, error } = await supabase
        .from('recouche_workflows')
        .select('*')
        .order('priority', { ascending: false })
        .order('expected_checkin_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recouche workflows:', error);
      return this.getMockRecoucheWorkflows();
    }
  }

  async updateWorkflowStatus(
    workflowId: string, 
    status: RecoucheWorkflowItem['status'], 
    staffId?: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      let updates: Partial<RecoucheWorkflowItem> = { status, updated_at: now };

      // Mettre à jour les timestamps selon le statut
      switch (status) {
        case 'cleaning_in_progress':
          updates.cleaning_started_at = now;
          if (staffId) updates.assigned_cleaner = staffId;
          break;
        case 'cleaning_completed':
          updates.cleaning_completed_at = now;
          break;
        case 'inspection_in_progress':
          updates.inspection_started_at = now;
          if (staffId) updates.assigned_inspector = staffId;
          break;
        case 'inspection_completed':
        case 'ready_for_checkin':
          updates.inspection_completed_at = now;
          updates.ready_for_checkin_at = now;
          break;
      }

      const { error } = await supabase
        .from('recouche_workflows')
        .update(updates)
        .eq('id', workflowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      throw error;
    }
  }

  async createLinenChangeRecord(record: Omit<LinenChangeRecord, 'id' | 'created_at'>): Promise<LinenChangeRecord> {
    try {
      const newRecord = {
        ...record,
        id: `linen_change_${Date.now()}`,
        created_at: new Date().toISOString()
      };

      // En mode mock pour les tests
      if (process.env.NODE_ENV === 'development') {
        return newRecord as LinenChangeRecord;
      }

      const { data, error } = await supabase
        .from('linen_changes')
        .insert(newRecord)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating linen change record:', error);
      throw error;
    }
  }

  // Gestion du personnel
  async getHousekeepingStaff(): Promise<HousekeepingStaff[]> {
    try {
      // En mode mock pour les tests
      if (process.env.NODE_ENV === 'development') {
        return this.getMockHousekeepingStaff();
      }

      const { data, error } = await supabase
        .from('housekeeping_staff')
        .select('*')
        .eq('is_available', true)
        .order('performance_rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching housekeeping staff:', error);
      return this.getMockHousekeepingStaff();
    }
  }

  async assignStaffToRoom(staffId: string, roomId: string, role: 'cleaner' | 'inspector'): Promise<void> {
    try {
      const { error } = await supabase
        .from('recouche_workflows')
        .update({
          [role === 'cleaner' ? 'assigned_cleaner' : 'assigned_inspector']: staffId,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning staff to room:', error);
      throw error;
    }
  }

  // Statistiques et analytics
  async getHousekeepingStats(): Promise<HousekeepingStats> {
    try {
      // En mode mock pour les tests
      if (process.env.NODE_ENV === 'development') {
        return this.getMockHousekeepingStats();
      }

      // Requêtes parallèles pour optimiser les performances
      const [workflowsResult, staffResult, changesResult] = await Promise.all([
        supabase.from('recouche_workflows').select('status, priority'),
        supabase.from('housekeeping_staff').select('is_available, tasks_completed_today'),
        supabase.from('linen_changes').select('changed_at').gte('changed_at', new Date().toISOString().split('T')[0])
      ]);

      const workflows = workflowsResult.data || [];
      const staff = staffResult.data || [];
      const changes = changesResult.data || [];

      return {
        total_rooms: workflows.length,
        rooms_dirty: workflows.filter(w => w.status === 'checkout_dirty').length,
        rooms_cleaning: workflows.filter(w => w.status.includes('cleaning')).length,
        rooms_inspection: workflows.filter(w => w.status.includes('inspection')).length,
        rooms_ready: workflows.filter(w => w.status === 'ready_for_checkin').length,
        average_cleaning_time: 45, // À calculer depuis les données réelles
        average_inspection_time: 15, // À calculer depuis les données réelles
        linen_changes_today: changes.length,
        staff_utilization: staff.filter(s => !s.is_available).length / Math.max(1, staff.length) * 100,
        priority_rooms_pending: workflows.filter(w => ['high', 'express', 'vip'].includes(w.priority)).length
      };
    } catch (error) {
      console.error('Error fetching housekeeping stats:', error);
      return this.getMockHousekeepingStats();
    }
  }

  // Données mock pour les tests
  private getMockLinenInventory(): LinenInventoryItem[] {
    return [
      {
        id: 'linen_001',
        type: 'bed_sheet',
        size: 'queen',
        quantity_available: 24,
        quantity_in_use: 45,
        quantity_in_laundry: 12,
        quantity_damaged: 3,
        quality_grade: 'A',
        last_restocked: '2024-01-10',
        cost_per_unit: 15000, // FCFA
        supplier: 'Textiles Africains SARL',
        org_id: 'org-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      },
      {
        id: 'linen_002',
        type: 'towel',
        size: 'large',
        quantity_available: 18,
        quantity_in_use: 32,
        quantity_in_laundry: 8,
        quantity_damaged: 2,
        quality_grade: 'A',
        last_restocked: '2024-01-12',
        cost_per_unit: 8000, // FCFA
        supplier: 'Textiles Africains SARL',
        org_id: 'org-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-12T00:00:00Z'
      },
      {
        id: 'linen_003',
        type: 'pillowcase',
        size: 'medium',
        quantity_available: 30,
        quantity_in_use: 90,
        quantity_in_laundry: 15,
        quantity_damaged: 5,
        quality_grade: 'B',
        last_restocked: '2024-01-08',
        cost_per_unit: 5000, // FCFA
        supplier: 'Coton du Mali',
        org_id: 'org-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-08T00:00:00Z'
      },
      {
        id: 'linen_004',
        type: 'bathrobe',
        size: 'large',
        quantity_available: 8,
        quantity_in_use: 12,
        quantity_in_laundry: 4,
        quantity_damaged: 1,
        quality_grade: 'A',
        last_restocked: '2024-01-05',
        cost_per_unit: 25000, // FCFA
        supplier: 'Luxury Linens Dakar',
        org_id: 'org-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z'
      }
    ];
  }

  private getMockRecoucheWorkflows(): RecoucheWorkflowItem[] {
    const now = new Date();
    return [
      {
        id: 'workflow_001',
        room_id: 'room_101',
        room_number: '101',
        reservation_id: 'res_001',
        guest_name: 'Amadou Diallo',
        checkout_completed_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'checkout_dirty',
        priority: 'express',
        estimated_completion: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        expected_checkin_at: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        notes: 'Client VIP - check-in anticipé demandé à 15h',
        org_id: 'org-1',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'workflow_002',
        room_id: 'room_102',
        room_number: '102',
        reservation_id: 'res_002',
        guest_name: 'Fatou Sow',
        checkout_completed_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        cleaning_started_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'cleaning_in_progress',
        priority: 'normal',
        assigned_cleaner: 'staff_002',
        estimated_completion: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        expected_checkin_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        cleaning_duration_minutes: 45,
        org_id: 'org-1',
        created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'workflow_003',
        room_id: 'room_103',
        room_number: '103',
        reservation_id: 'res_003',
        guest_name: 'Moussa Traoré',
        checkout_completed_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        cleaning_started_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        cleaning_completed_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        status: 'inspection_pending',
        priority: 'vip',
        assigned_cleaner: 'staff_001',
        estimated_completion: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        expected_checkin_at: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        notes: 'Suite VIP - inspection qualité renforcée requise',
        cleaning_duration_minutes: 90,
        org_id: 'org-1',
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'workflow_004',
        room_id: 'room_104',
        room_number: '104',
        checkout_completed_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        cleaning_started_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        cleaning_completed_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        inspection_completed_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        ready_for_checkin_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'ready_for_checkin',
        priority: 'normal',
        assigned_cleaner: 'staff_001',
        assigned_inspector: 'staff_003',
        estimated_completion: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        expected_checkin_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        cleaning_duration_minutes: 50,
        inspection_duration_minutes: 15,
        org_id: 'org-1',
        created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockHousekeepingStaff(): HousekeepingStaff[] {
    return [
      {
        id: 'staff_001',
        name: 'Aïcha Koné',
        role: 'cleaner',
        shift_start: '08:00',
        shift_end: '16:00',
        rooms_assigned: ['101', '102', '103'],
        performance_rating: 4.8,
        tasks_completed_today: 3,
        average_cleaning_time: 45,
        is_available: true,
        org_id: 'org-1'
      },
      {
        id: 'staff_002',
        name: 'Mamadou Sidibé',
        role: 'cleaner',
        shift_start: '09:00',
        shift_end: '17:00',
        rooms_assigned: ['104', '105', '106'],
        performance_rating: 4.6,
        tasks_completed_today: 2,
        average_cleaning_time: 50,
        is_available: false,
        org_id: 'org-1'
      },
      {
        id: 'staff_003',
        name: 'Fatoumata Diarra',
        role: 'inspector',
        shift_start: '10:00',
        shift_end: '18:00',
        rooms_assigned: ['101', '102', '103', '104', '105', '106'],
        performance_rating: 4.9,
        tasks_completed_today: 5,
        average_cleaning_time: 15,
        is_available: true,
        org_id: 'org-1'
      },
      {
        id: 'staff_004',
        name: 'Ousmane Touré',
        role: 'supervisor',
        shift_start: '07:00',
        shift_end: '15:00',
        rooms_assigned: [],
        performance_rating: 4.7,
        tasks_completed_today: 0,
        average_cleaning_time: 0,
        is_available: true,
        org_id: 'org-1'
      }
    ];
  }

  private getMockHousekeepingStats(): HousekeepingStats {
    return {
      total_rooms: 4,
      rooms_dirty: 1,
      rooms_cleaning: 1,
      rooms_inspection: 1,
      rooms_ready: 1,
      average_cleaning_time: 48,
      average_inspection_time: 15,
      linen_changes_today: 8,
      staff_utilization: 75,
      priority_rooms_pending: 2
    };
  }
}

export const africanHousekeepingAPI = new AfricanHousekeepingAPI();

