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
    const { data, error } = await supabase
      .from('services' as any)
      .select(`
        *,
        family:service_families(*)
      `)
      .eq('org_id', orgId)
      .order('family_id, code');

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async saveService(orgId: string, service: Partial<Service>): Promise<Service> {
    if (service.id) {
      const { data, error } = await supabase
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
        .select(`
          *,
          family:service_families(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Service;
    } else {
      const { data, error } = await supabase
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
        .select(`
          *,
          family:service_families(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Service;
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
    const { data, error } = await supabase
      .from('arrangements' as any)
      .select(`
        *,
        services:arrangement_services(
          *,
          service:services(
            *,
            family:service_families(*)
          )
        )
      `)
      .eq('org_id', orgId)
      .order('code');

    if (error) throw error;
    return (data as any[]) || [];
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

      // Return full arrangement with services
      const { data, error } = await supabase
        .from('arrangements' as any)
        .select(`
          *,
          services:arrangement_services(
            *,
            service:services(
              *,
              family:service_families(*)
            )
          )
        `)
        .eq('id', arrangement.id)
        .single();

      if (error) throw error;
      return data as unknown as Arrangement;
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

      // Return full arrangement with services
      const { data, error } = await supabase
        .from('arrangements' as any)
        .select(`
          *,
          services:arrangement_services(
            *,
            service:services(
              *,
              family:service_families(*)
            )
          )
        `)
        .eq('id', (newArrangement as any).id)
        .single();

      if (error) throw error;
      return data as unknown as Arrangement;
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