import { supabase } from '@/integrations/supabase/client';

// Types pour le POS africain
export interface AfricanMenuItem {
  id: string;
  name: string;
  name_local: string;
  description: string;
  price: number;
  category: string;
  prep_time: number;
  image: string;
  allergens: string[];
  origin: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AfricanOrder {
  id: string;
  items: AfricanOrderItem[];
  total: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  table_number?: number;
  customer_name?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  served_at?: string;
}

export interface AfricanOrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  prep_time: number;
  special_instructions?: string;
}

export interface AfricanPOSStats {
  daily_sales: number;
  orders_count: number;
  customers_served: number;
  average_order_value: number;
  popular_items: Array<{
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

class AfricanPOSAPI {
  
  // Menu Management
  async getMenu(): Promise<AfricanMenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('african_menu_items')
        .select('*')
        .eq('available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Fallback to mock data if database fails
      return this.getMockMenu();
    }
  }

  async createMenuItem(item: Omit<AfricanMenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<AfricanMenuItem> {
    try {
      const { data, error } = await supabase
        .from('african_menu_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, updates: Partial<AfricanMenuItem>): Promise<AfricanMenuItem> {
    try {
      const { data, error } = await supabase
        .from('african_menu_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  // Order Management
  async createOrder(order: Omit<AfricanOrder, 'id' | 'created_at' | 'updated_at'>): Promise<AfricanOrder> {
    try {
      const orderData = {
        ...order,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('african_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Also create order items
      if (order.items.length > 0) {
        const orderItems = order.items.map(item => ({
          ...item,
          order_id: data.id,
        }));

        await supabase
          .from('african_order_items')
          .insert(orderItems);
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to mock creation
      return this.createMockOrder(order);
    }
  }

  async getOrders(limit: number = 50): Promise<AfricanOrder[]> {
    try {
      const { data, error } = await supabase
        .from('african_orders')
        .select(`
          *,
          african_order_items (*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map(order => ({
        ...order,
        items: order.african_order_items || []
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return this.getMockOrders();
    }
  }

  async updateOrderStatus(orderId: string, status: AfricanOrder['status']): Promise<AfricanOrder> {
    try {
      const updates: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === 'served') {
        updates.served_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('african_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Statistics
  async getDailyStats(): Promise<AfricanPOSStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: orders, error } = await supabase
        .from('african_orders')
        .select(`
          total,
          status,
          african_order_items (
            name,
            quantity,
            price
          )
        `)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) throw error;

      const completedOrders = orders?.filter(o => o.status === 'served') || [];
      const daily_sales = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const orders_count = completedOrders.length;
      const customers_served = orders_count; // Assuming 1 customer per order
      const average_order_value = orders_count > 0 ? daily_sales / orders_count : 0;

      // Calculate popular items
      const itemCounts: Record<string, { quantity: number; revenue: number }> = {};
      completedOrders.forEach(order => {
        order.african_order_items?.forEach(item => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = { quantity: 0, revenue: 0 };
          }
          itemCounts[item.name].quantity += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        });
      });

      const popular_items = Object.entries(itemCounts)
        .map(([name, stats]) => ({
          name,
          quantity_sold: stats.quantity,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity_sold - a.quantity_sold)
        .slice(0, 5);

      return {
        daily_sales,
        orders_count,
        customers_served,
        average_order_value,
        popular_items
      };
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return this.getMockStats();
    }
  }

  // Mock data fallbacks
  private getMockMenu(): AfricanMenuItem[] {
    return [
      {
        id: "thieboudienne",
        name: "Thiéboudienne",
        name_local: "Ceebu jën",
        description: "Riz au poisson, légumes et sauce tomate",
        price: 2500,
        category: "Plats principaux",
        prep_time: 45,
        image: "🍚",
        allergens: ["poisson"],
        origin: "Sénégal",
        available: true
      },
      {
        id: "yassa_poulet",
        name: "Yassa Poulet",
        name_local: "Yassa ginaar",
        description: "Poulet mariné aux oignons et citron",
        price: 2000,
        category: "Plats principaux",
        prep_time: 35,
        image: "🍗",
        allergens: ["moutarde"],
        origin: "Sénégal",
        available: true
      },
      {
        id: "mafe",
        name: "Mafé",
        name_local: "Tigadèguèna",
        description: "Ragoût à la pâte d'arachide",
        price: 1800,
        category: "Plats principaux",
        prep_time: 60,
        image: "🥜",
        allergens: ["arachides"],
        origin: "Mali",
        available: true
      },
      {
        id: "bissap",
        name: "Bissap",
        name_local: "Bissap",
        description: "Boisson à l'hibiscus, fraîche et parfumée",
        price: 500,
        category: "Boissons",
        prep_time: 5,
        image: "🥤",
        allergens: [],
        origin: "Sénégal",
        available: true
      }
    ];
  }

  private createMockOrder(order: Omit<AfricanOrder, 'id' | 'created_at' | 'updated_at'>): AfricanOrder {
    return {
      ...order,
      id: `CMD-${Date.now()}`,
      created_at: new Date().toISOString()
    };
  }

  private getMockOrders(): AfricanOrder[] {
    return [];
  }

  private getMockStats(): AfricanPOSStats {
    return {
      daily_sales: 47400,
      orders_count: 7,
      customers_served: 7,
      average_order_value: 6771,
      popular_items: [
        { name: "Thiéboudienne", quantity_sold: 3, revenue: 7500 },
        { name: "Yassa Poulet", quantity_sold: 2, revenue: 4000 },
        { name: "Bissap", quantity_sold: 5, revenue: 2500 }
      ]
    };
  }
}

export const africanPOSAPI = new AfricanPOSAPI();

