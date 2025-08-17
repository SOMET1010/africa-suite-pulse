import { supabase } from '@/integrations/supabase/client';
import type { 
  ServiceFamily, 
  Service, 
  Arrangement, 
  ArrangementService, 
  ServiceStats,
  ServiceFamilyInsert,
  ServiceInsert,
  ArrangementInsert
} from '@/types/database';

// Service-specific types
export interface ServiceFilters {
  search?: string;
  family_id?: string | 'all';
  is_active?: boolean | 'all';
  price_range?: [number, number];
  has_free_price?: boolean | 'all';
}

export class ServicesService {
  // Service Families
  static async getFamilies(orgId: string): Promise<ServiceFamily[]> {
    const { data, error } = await supabase
      .from('service_families' as any)
      .select('*')
      .eq('org_id', orgId)
      .order('order_index');

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async saveFamily(orgId: string, family: Partial<ServiceFamily>): Promise<ServiceFamily> {
    if (family.id) {
      const { data, error } = await supabase
        .from('service_families' as any)
        .update({
          code: family.code,
          label: family.label,
          description: family.description,
          icon: family.icon,
          color: family.color,
          order_index: family.order_index,
          is_active: family.is_active
        })
        .eq('id', family.id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ServiceFamily;
    } else {
      const { data, error } = await supabase
        .from('service_families' as any)
        .insert({
          org_id: orgId,
          code: family.code!,
          label: family.label!,
          description: family.description,
          icon: family.icon,
          color: family.color,
          order_index: family.order_index || 0,
          is_active: family.is_active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ServiceFamily;
    }
  }

  static async deleteFamily(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_families' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Services
  static async getServices(orgId: string): Promise<Service[]> {
    // Use secure function instead of view
    const { data, error } = await supabase
      .rpc('get_services_with_family')
      .returns<any[]>()
      .order('family_id, code');

    if (error) throw error;

    // Map view rows to Service shape with nested family object
    const rows = (data as any[]) || [];
    return rows.map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      family_id: row.family_id,
      code: row.code,
      label: row.label,
      description: row.description,
      unit: row.unit,
      price: Number(row.price ?? 0),
      vat_rate: Number(row.vat_rate ?? 0),
      is_active: !!row.is_active,
      is_free_price: !!row.is_free_price,
      cost_price: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : undefined,
      profit_margin: row.profit_margin !== null && row.profit_margin !== undefined ? Number(row.profit_margin) : undefined,
      min_quantity: row.min_quantity !== null && row.min_quantity !== undefined ? Number(row.min_quantity) : undefined,
      max_quantity: row.max_quantity !== null && row.max_quantity !== undefined ? Number(row.max_quantity) : undefined,
      tags: row.tags || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      family: row.family_id
        ? {
            id: row.family_id,
            code: row.family_code,
            label: row.family_label,
            color: row.family_color,
            icon: row.family_icon,
            org_id: row.org_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active,
            order_index: 0,
            description: row.description,
          } as any
        : undefined,
    })) as unknown as Service[];
  }

  static async saveService(orgId: string, service: Partial<Service>): Promise<Service> {
    if (service.id) {
      const { data: updated, error: updateError } = await supabase
        .from('services' as any)
        .update({
          family_id: service.family_id,
          code: service.code,
          label: service.label,
          description: service.description,
          price: service.price,
          vat_rate: service.vat_rate,
          unit: service.unit,
          is_active: service.is_active,
          is_free_price: service.is_free_price,
          cost_price: service.cost_price,
          profit_margin: service.profit_margin,
          min_quantity: service.min_quantity,
          max_quantity: service.max_quantity,
          tags: service.tags
        })
        .eq('id', service.id)
        .eq('org_id', orgId)
        .select('id')
        .single();

      if (updateError) throw updateError;

      const { data, error } = await supabase
        .rpc('get_services_with_family', { p_service_id: (updated as any).id })
        .returns<any[]>()
        .maybeSingle();

      if (error) throw error;
      return (await this.getServices(orgId)).find(s => s.id === (updated as any).id)!;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('services' as any)
        .insert({
          org_id: orgId,
          family_id: service.family_id!,
          code: service.code!,
          label: service.label!,
          description: service.description,
          price: service.price || 0,
          vat_rate: service.vat_rate || 18,
          unit: service.unit || 'unité',
          is_active: service.is_active ?? true,
          is_free_price: service.is_free_price ?? false,
          cost_price: service.cost_price,
          profit_margin: service.profit_margin,
          min_quantity: service.min_quantity,
          max_quantity: service.max_quantity,
          tags: service.tags
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return (await this.getServices(orgId)).find(s => s.id === (inserted as any).id)!;
    }
  }

  static async deleteService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Arrangements
  static async getArrangements(orgId: string): Promise<Arrangement[]> {
    const { data: arrangements, error } = await supabase
      .from('arrangements' as any)
      .select('*')
      .eq('org_id', orgId)
      .order('code');

    if (error) throw error;
    const arrs = (arrangements as any[]) || [];
    if (arrs.length === 0) return [] as unknown as Arrangement[];

    const ids = arrs.map(a => a.id);
    const { data: arrServices, error: svcError } = await supabase
      .from('arrangement_services' as any)
      .select('*')
      .in('arrangement_id', ids)
      .order('order_index');

    if (svcError) throw svcError;
    const byArrangement = (arrServices as any[] | null) || [];

    return arrs.map(a => ({
      ...a,
      services: byArrangement.filter(s => s.arrangement_id === a.id)
    })) as unknown as Arrangement[];
  }

  static async saveArrangement(orgId: string, arrangement: Partial<Arrangement>): Promise<Arrangement> {
    if (arrangement.id) {
      // Update arrangement
      const { data: updatedArrangement, error: updateError } = await supabase
        .from('arrangements' as any)
        .update({
          code: arrangement.code,
          label: arrangement.label,
          description: arrangement.description,
          base_price: arrangement.base_price,
          is_active: arrangement.is_active,
          valid_from: arrangement.valid_from,
          valid_until: arrangement.valid_until,
          min_nights: arrangement.min_nights,
          max_nights: arrangement.max_nights
        })
        .eq('id', arrangement.id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Delete existing arrangement services
      await supabase
        .from('arrangement_services' as any)
        .delete()
        .eq('arrangement_id', arrangement.id);

      // Insert new arrangement services
      if (arrangement.services && arrangement.services.length > 0) {
        const { error: servicesError } = await supabase
          .from('arrangement_services' as any)
          .insert(
            arrangement.services.map((svc, index) => ({
              arrangement_id: arrangement.id!,
              service_id: svc.service_id,
              quantity: svc.quantity,
              unit_price: svc.unit_price,
              is_included: svc.is_included,
              is_optional: svc.is_optional || false,
              order_index: index
            })) as any
          );

        if (servicesError) throw servicesError;
      }

      // Return arrangement with services (no embeds)
      const { data: arr, error: fetchErr } = await supabase
        .from('arrangements' as any)
        .select('*')
        .eq('id', arrangement.id)
        .single();
      if (fetchErr) throw fetchErr;

      const { data: svc, error: svcFetchErr } = await supabase
        .from('arrangement_services' as any)
        .select('*')
        .eq('arrangement_id', arrangement.id)
        .order('order_index');
      if (svcFetchErr) throw svcFetchErr;

      return { ...(arr as any), services: (svc as any[]) || [] } as unknown as Arrangement;
    } else {
      // Create new arrangement
      const { data: newArrangement, error: insertError } = await supabase
        .from('arrangements' as any)
        .insert({
          org_id: orgId,
          code: arrangement.code!,
          label: arrangement.label!,
          description: arrangement.description,
          base_price: arrangement.base_price,
          is_active: arrangement.is_active ?? true,
          valid_from: arrangement.valid_from,
          valid_until: arrangement.valid_until,
          min_nights: arrangement.min_nights,
          max_nights: arrangement.max_nights
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert arrangement services
      if (arrangement.services && arrangement.services.length > 0) {
        const { error: servicesError } = await supabase
          .from('arrangement_services' as any)
          .insert(
            arrangement.services.map((svc, index) => ({
              arrangement_id: (newArrangement as any).id,
              service_id: svc.service_id,
              quantity: svc.quantity,
              unit_price: svc.unit_price,
              is_included: svc.is_included,
              is_optional: svc.is_optional || false,
              order_index: index
            })) as any
          );

        if (servicesError) throw servicesError;
      }

      // Return arrangement with services (no embeds)
      const { data: arr, error: fetchErr } = await supabase
        .from('arrangements' as any)
        .select('*')
        .eq('id', (newArrangement as any).id)
        .single();
      if (fetchErr) throw fetchErr;

      const { data: svc, error: svcFetchErr } = await supabase
        .from('arrangement_services' as any)
        .select('*')
        .eq('arrangement_id', (newArrangement as any).id)
        .order('order_index');
      if (svcFetchErr) throw svcFetchErr;

      return { ...(arr as any), services: (svc as any[]) || [] } as unknown as Arrangement;
    }
  }

  static async deleteArrangement(id: string): Promise<void> {
    const { error } = await supabase
      .from('arrangements' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Statistics
  static async getStats(orgId: string): Promise<ServiceStats> {
    const [families, services, arrangements] = await Promise.all([
      this.getFamilies(orgId),
      this.getServices(orgId),
      this.getArrangements(orgId)
    ]);

    const activeServices = services.filter(s => s.is_active);
    const averagePrice = activeServices.length > 0 
      ? activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length 
      : 0;

    const byFamily = families.reduce((acc, family) => {
      acc[family.label] = services.filter(s => s.family_id === family.id).length;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenuePotential = activeServices.reduce((sum, s) => sum + s.price, 0);
    const totalCost = activeServices.reduce((sum, s) => sum + (s.cost_price || 0), 0);
    const profitMargin = totalRevenuePotential > 0 ? ((totalRevenuePotential - totalCost) / totalRevenuePotential) * 100 : 0;

    return {
      totalFamilies: families.filter(f => f.is_active).length,
      activeFamilies: families.filter(f => f.is_active).length,
      totalServices: services.length,
      activeServices: activeServices.length,
      totalArrangements: arrangements.filter(a => a.is_active).length,
      activeArrangements: arrangements.filter(a => a.is_active).length,
      averageServicePrice: averagePrice,
      totalServiceValue: totalRevenuePotential,
      // Legacy properties for compatibility
      averagePrice,
      byFamily,
      totalRevenuePotential,
      profitMargin
    };
  }

  // Validation
  static validateFamily(family: Partial<ServiceFamily>, allFamilies: ServiceFamily[] = []): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!family.code?.trim()) {
      errors.code = 'Code obligatoire';
    } else if (family.code.length > 10) {
      errors.code = 'Code trop long (10 max)';
    } else {
      const duplicate = allFamilies.find(f => 
        f.id !== family.id && 
        f.code?.toUpperCase() === family.code.toUpperCase()
      );
      if (duplicate) {
        errors.code = 'Code déjà utilisé';
      }
    }

    if (!family.label?.trim()) {
      errors.label = 'Libellé obligatoire';
    } else if (family.label.length < 2) {
      errors.label = 'Trop court (2 min)';
    } else if (family.label.length > 100) {
      errors.label = 'Trop long (100 max)';
    }

    return errors;
  }

  static validateService(service: Partial<Service>, allServices: Service[] = []): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!service.family_id) {
      errors.family_id = 'Famille obligatoire';
    }

    if (!service.code?.trim()) {
      errors.code = 'Code obligatoire';
    } else if (service.code.length > 20) {
      errors.code = 'Code trop long (20 max)';
    } else {
      const duplicate = allServices.find(s => 
        s.id !== service.id && 
        s.code?.toUpperCase() === service.code.toUpperCase()
      );
      if (duplicate) {
        errors.code = 'Code déjà utilisé';
      }
    }

    if (!service.label?.trim()) {
      errors.label = 'Libellé obligatoire';
    } else if (service.label.length < 2) {
      errors.label = 'Trop court (2 min)';
    } else if (service.label.length > 200) {
      errors.label = 'Trop long (200 max)';
    }

    if (!service.is_free_price && (service.price === undefined || service.price < 0)) {
      errors.price = 'Prix obligatoire et positif';
    }

    if (service.vat_rate === undefined || service.vat_rate < 0 || service.vat_rate > 100) {
      errors.vat_rate = 'TVA entre 0 et 100%';
    }

    return errors;
  }

  static validateArrangement(arrangement: Partial<Arrangement>, allArrangements: Arrangement[] = []): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!arrangement.code?.trim()) {
      errors.code = 'Code obligatoire';
    } else if (arrangement.code.length > 20) {
      errors.code = 'Code trop long (20 max)';
    } else {
      const duplicate = allArrangements.find(a => 
        a.id !== arrangement.id && 
        a.code?.toUpperCase() === arrangement.code.toUpperCase()
      );
      if (duplicate) {
        errors.code = 'Code déjà utilisé';
      }
    }

    if (!arrangement.label?.trim()) {
      errors.label = 'Libellé obligatoire';
    } else if (arrangement.label.length < 2) {
      errors.label = 'Trop court (2 min)';
    } else if (arrangement.label.length > 200) {
      errors.label = 'Trop long (200 max)';
    }

    if (!arrangement.services || arrangement.services.length === 0) {
      errors.services = 'Au moins un service requis';
    }

    return errors;
  }

  // Filters
  static filterServices(services: Service[], filters: ServiceFilters): Service[] {
    return services.filter(service => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!service.label.toLowerCase().includes(search) && 
            !service.code.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (filters.family_id && filters.family_id !== 'all') {
        if (service.family_id !== filters.family_id) return false;
      }

      if (filters.is_active !== undefined && filters.is_active !== 'all') {
        if (service.is_active !== filters.is_active) return false;
      }

      if (filters.has_free_price !== undefined && filters.has_free_price !== 'all') {
        if (service.is_free_price !== filters.has_free_price) return false;
      }

      if (filters.price_range) {
        const [min, max] = filters.price_range;
        if (service.price < min || service.price > max) return false;
      }

      return true;
    });
  }

  // Export
  static exportFamiliesToCSV(families: ServiceFamily[]): void {
    const headers = ['Code', 'Libellé', 'Description', 'Icône', 'Couleur', 'Actif'];
    const rows = families.map(f => [
      f.code,
      f.label,
      f.description || '',
      f.icon || '',
      f.color || '',
      f.is_active ? 'Oui' : 'Non'
    ]);

    this.downloadCSV([headers, ...rows], `familles-services-${new Date().toISOString().split('T')[0]}.csv`);
  }

  static exportServicesToCSV(services: Service[]): void {
    const headers = ['Famille', 'Code', 'Libellé', 'Prix', 'TVA %', 'Unité', 'Prix libre', 'Actif'];
    const rows = services.map(s => [
      s.family?.code || '',
      s.code,
      s.label,
      s.price.toString(),
      s.vat_rate.toString(),
      s.unit || '',
      s.is_free_price ? 'Oui' : 'Non',
      s.is_active ? 'Oui' : 'Non'
    ]);

    this.downloadCSV([headers, ...rows], `services-${new Date().toISOString().split('T')[0]}.csv`);
  }

  static exportArrangementsToCSV(arrangements: Arrangement[]): void {
    const headers = ['Code', 'Libellé', 'Description', 'Prix base', 'Services inclus', 'Actif'];
    const rows = arrangements.map(a => [
      a.code,
      a.label,
      a.description || '',
      a.base_price?.toString() || '',
      a.services.map(s => `${s.service?.code} (${s.quantity})`).join('; '),
      a.is_active ? 'Oui' : 'Non'
    ]);

    this.downloadCSV([headers, ...rows], `arrangements-${new Date().toISOString().split('T')[0]}.csv`);
  }

  private static downloadCSV(data: string[][], filename: string): void {
    const csvContent = data
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}