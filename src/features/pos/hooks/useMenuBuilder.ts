import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MenuTimeSlot {
  start_time: string;
  end_time: string;
  days: number[]; // 0-6, Sunday to Saturday
}

export interface MenuLayoutConfig {
  columns?: number;
  showImages?: boolean;
  showDescriptions?: boolean;
  theme?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface Menu {
  id: string;
  code: string;
  name: string;
  description?: string;
  valid_from?: string;
  valid_until?: string;
  time_slots: MenuTimeSlot[];
  layout_config: MenuLayoutConfig;
  is_active: boolean;
  outlet_id: string;
}

export interface MenuSection {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  display_order: number;
  section_config: Record<string, any>;
  is_visible: boolean;
}

export interface MenuItem {
  id: string;
  menu_section_id: string;
  product_id: string;
  display_order: number;
  custom_name?: string;
  custom_description?: string;
  custom_price?: number;
  is_featured: boolean;
  is_available: boolean;
}

export interface ProductGarnish {
  id: string;
  parent_product_id: string;
  outlet_id: string;
  name: string;
  description?: string;
  price_addon: number;
  is_required: boolean;
  max_selections: number;
  display_order: number;
  is_active: boolean;
}

export function useMenus(outletId?: string) {
  return useQuery({
    queryKey: ['pos-menus', outletId],
    queryFn: async () => {
      let query = supabase
        .from('pos_menus')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!outletId
  });
}

export function useMenu(menuId?: string) {
  return useQuery({
    queryKey: ['pos-menu', menuId],
    queryFn: async () => {
      if (!menuId) return null;
      
      try {
        const { data, error } = await supabase
          .from('pos_menus')
          .select(`
            *,
            sections:pos_menu_sections!fk_pos_menu_sections_menu_id(
              *,
              items:pos_menu_items!fk_pos_menu_items_section_id(
                *,
                product:pos_products(*)
              )
            )
          `)
          .eq('id', menuId)
          .single();

        if (error) {
          console.error('Menu query error:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Menu fetch error:', err);
        return null;
      }
    },
    enabled: !!menuId
  });
}

export function useProductGarnishes(productId?: string) {
  return useQuery({
    queryKey: ['product-garnishes', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('pos_product_garnishes')
        .select('*')
        .eq('parent_product_id', productId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as ProductGarnish[];
    },
    enabled: !!productId
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Menu, 'id'>) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const { data: result, error } = await supabase
        .from('pos_menus')
        .insert({
          ...data,
          org_id: orgData.org_id,
          time_slots: data.time_slots as any,
          layout_config: data.layout_config as any
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-menus'] });
      toast({
        title: "Succès",
        description: "Menu créé avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le menu",
        variant: "destructive"
      });
      console.error('Menu creation error:', error);
    }
  });
}

export function useCreateMenuSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<MenuSection, 'id'>) => {
      const { data: result, error } = await supabase
        .from('pos_menu_sections')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-menu'] });
      toast({
        title: "Succès",
        description: "Section créée avec succès"
      });
    }
  });
}

export function useCreateProductGarnish() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ProductGarnish, 'id'>) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const { data: result, error } = await supabase
        .from('pos_product_garnishes')
        .insert({
          ...data,
          org_id: orgData.org_id,
          outlet_id: data.outlet_id || '' // Add required outlet_id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-garnishes'] });
      toast({
        title: "Succès",
        description: "Garniture créée avec succès"
      });
    }
  });
}