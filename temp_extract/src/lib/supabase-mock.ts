// Mock Supabase Client pour Africa Suite Pulse
// Simule toutes les fonctionnalités Supabase pour les tests

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: string;
    avatar_url?: string;
    site_id?: string;
  };
  created_at: string;
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  user: MockUser;
  expires_at: number;
}

// Données de test pour Africa Suite Pulse
const mockUsers: MockUser[] = [
  {
    id: 'admin-123',
    email: 'admin@africasuite.com',
    user_metadata: {
      full_name: 'Admin Africa Suite',
      role: 'admin',
      avatar_url: '/avatars/admin.jpg',
      site_id: 'site-1'
    },
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'manager-456',
    email: 'manager@africasuite.com',
    user_metadata: {
      full_name: 'Manager Hôtel Dakar',
      role: 'manager',
      avatar_url: '/avatars/manager.jpg',
      site_id: 'site-1'
    },
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-789',
    email: 'user@africasuite.com',
    user_metadata: {
      full_name: 'Réceptionniste Aminata',
      role: 'user',
      avatar_url: '/avatars/user.jpg',
      site_id: 'site-1'
    },
    created_at: '2025-01-01T00:00:00Z'
  }
];

// Données de test pour le dashboard
const mockDashboardData = {
  stats: {
    total_rooms: 45,
    occupied_rooms: 32,
    available_rooms: 13,
    occupancy_rate: 71.1,
    revenue_today: 2450000, // FCFA
    revenue_month: 45600000, // FCFA
    avg_daily_rate: 76562, // FCFA
    revpar: 54375 // FCFA
  },
  recent_bookings: [
    {
      id: 'booking-1',
      guest_name: 'Amadou Diallo',
      room_number: '205',
      check_in: '2025-09-13',
      check_out: '2025-09-15',
      status: 'confirmed',
      amount: 153125 // FCFA
    },
    {
      id: 'booking-2',
      guest_name: 'Fatou Sall',
      room_number: '312',
      check_in: '2025-09-13',
      check_out: '2025-09-17',
      status: 'checked_in',
      amount: 306250 // FCFA
    }
  ],
  restaurant_stats: {
    orders_today: 47,
    revenue_today: 890000, // FCFA
    popular_dishes: [
      { name: 'Thiéboudienne', orders: 12, revenue: 180000 },
      { name: 'Yassa Poulet', orders: 8, revenue: 120000 },
      { name: 'Mafé', orders: 6, revenue: 90000 }
    ]
  }
};

// Données de test pour le POS Restaurant
const mockMenuItems = [
  {
    id: 'dish-1',
    name: 'Thiéboudienne',
    local_name: 'Ceebu jën',
    description: 'Plat national sénégalais avec riz, poisson et légumes',
    price: 15000, // FCFA
    category: 'Plats principaux',
    image: '/dishes/thieboudienne.jpg',
    preparation_time: 45,
    ingredients: ['Riz', 'Poisson', 'Légumes', 'Épices'],
    allergens: ['Poisson'],
    cultural_info: 'Plat de convivialité familiale, symbole de partage'
  },
  {
    id: 'dish-2',
    name: 'Yassa Poulet',
    local_name: 'Yassa ginaar',
    description: 'Poulet mariné aux oignons et citron, spécialité casamançaise',
    price: 12000, // FCFA
    category: 'Plats principaux',
    image: '/dishes/yassa.jpg',
    preparation_time: 35,
    ingredients: ['Poulet', 'Oignons', 'Citron', 'Moutarde'],
    allergens: ['Moutarde'],
    cultural_info: 'Plat festif de la Casamance, tradition diola'
  },
  {
    id: 'dish-3',
    name: 'Mafé',
    local_name: 'Tigadèguèna',
    description: 'Ragoût à la pâte d\'arachide avec viande et légumes',
    price: 13500, // FCFA
    category: 'Plats principaux',
    image: '/dishes/mafe.jpg',
    preparation_time: 60,
    ingredients: ['Viande', 'Pâte d\'arachide', 'Légumes'],
    allergens: ['Arachides'],
    cultural_info: 'Plat traditionnel mandingue, riche en protéines'
  },
  {
    id: 'drink-1',
    name: 'Bissap',
    local_name: 'Bissap rouge',
    description: 'Boisson rafraîchissante à l\'hibiscus',
    price: 2500, // FCFA
    category: 'Boissons',
    image: '/drinks/bissap.jpg',
    preparation_time: 5,
    ingredients: ['Hibiscus', 'Sucre', 'Menthe'],
    allergens: [],
    cultural_info: 'Boisson traditionnelle riche en vitamine C'
  }
];

// Session storage pour persistance
let currentSession: MockSession | null = null;

// Mock Auth Client
export const mockAuth = {
  getSession: async () => {
    const stored = localStorage.getItem('mock-session');
    if (stored) {
      currentSession = JSON.parse(stored);
    }
    
    return {
      data: { session: currentSession },
      error: null
    };
  },

  onAuthStateChange: (callback: Function) => {
    console.log('👂 Mock Auth: Listening to auth state changes');
    
    // Simuler l'état initial
    setTimeout(() => {
      callback('INITIAL_SESSION', currentSession);
    }, 100);
    
    // Retourner un objet avec unsubscribe
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log('🚪 Mock Auth: Unsubscribed from auth state changes');
          }
        }
      }
    };
  },

  signInWithPassword: async (credentials: { email: string; password: string }) => {
    console.log('🔑 Mock Auth: Tentative de connexion pour', credentials.email);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        data: null,
        error: { message: 'Utilisateur non trouvé' }
      };
    }
    
    // Vérifier le mot de passe (simulation)
    const validPasswords: Record<string, string> = {
      'admin@africasuite.com': 'AfricaSuite2025!',
      'manager@africasuite.com': 'Manager2025!',
      'user@africasuite.com': 'User2025!'
    };
    
    if (validPasswords[credentials.email] !== credentials.password) {
      return {
        data: null,
        error: { message: 'Mot de passe incorrect' }
      };
    }
    
    // Créer la session
    const session: MockSession = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      user,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24h
    };
    
    currentSession = session;
    localStorage.setItem('mock-session', JSON.stringify(session));
    
    console.log('✅ Mock Auth: Connexion réussie pour', user.user_metadata.full_name);
    
    return {
      data: { user, session },
      error: null
    };
  },

  signUp: async (userData: { email: string; password: string; options?: any }) => {
    console.log('👤 Mock Auth: Création utilisateur pour', userData.email);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      user_metadata: {
        full_name: userData.options?.data?.full_name || 'Nouvel Utilisateur',
        role: userData.options?.data?.role || 'user',
        site_id: 'site-1'
      },
      created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return {
      data: { user: newUser },
      error: null
    };
  },

  signOut: async () => {
    console.log('🚪 Mock Auth: Déconnexion');
    currentSession = null;
    localStorage.removeItem('mock-session');
    
    return { error: null };
  },

  getUser: async () => {
    if (!currentSession) {
      return {
        data: { user: null },
        error: { message: 'Non authentifié' }
      };
    }
    
    return {
      data: { user: currentSession.user },
      error: null
    };
  },

  resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => {
    console.log('📧 Mock Auth: Demande de réinitialisation mot de passe pour', email);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return {
        data: null,
        error: { message: 'Aucun utilisateur trouvé avec cette adresse email' }
      };
    }
    
    console.log('✅ Mock Auth: Email de réinitialisation envoyé (simulation)');
    console.log('🔗 Mock Auth: Lien de redirection:', options?.redirectTo || 'Aucun');
    
    return {
      data: { user },
      error: null
    };
  }
};

// Mock Database Client
export const mockDatabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => {
      const selectQuery = {
        limit: (count: number) => {
          console.log(`📊 Mock DB: SELECT ${columns} FROM ${table} LIMIT ${count}`);
          
          // Retourner des données selon la table
          switch (table) {
            case 'dashboard_stats':
              return { data: [mockDashboardData.stats], error: null };
            case 'bookings':
              return { data: mockDashboardData.recent_bookings.slice(0, count), error: null };
            case 'menu_items':
              return { data: mockMenuItems.slice(0, count), error: null };
            case 'restaurant_orders':
              return { data: mockDashboardData.restaurant_stats.popular_dishes.slice(0, count), error: null };
            default:
              return { data: [], error: null };
          }
        },
        
        eq: (column: string, value: any) => {
          const filteredItems = mockMenuItems.filter(item => (item as any)[column] === value);
          return {
            data: filteredItems,
            error: null
          };
        }
      };
      
      return selectQuery;
    },
    
    insert: (data: any) => {
      console.log(`📝 Mock DB: INSERT INTO ${table}`, data);
      return {
        data: [{ ...data, id: `${table}-${Date.now()}` }],
        error: null
      };
    },
    
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        console.log(`✏️ Mock DB: UPDATE ${table} SET ... WHERE ${column} = ${value}`);
        return {
          data: [{ ...data, id: value }],
          error: null
        };
      }
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => {
        console.log(`🗑️ Mock DB: DELETE FROM ${table} WHERE ${column} = ${value}`);
        return {
          data: [],
          error: null
        };
      }
    })
  })
};

// Mock Supabase Client Principal
export const mockSupabase = {
  auth: mockAuth,
  from: mockDatabase.from,
  
  // Méthodes Supabase manquantes
  channel: (name: string) => ({
    on: (event: string, callback: Function) => {
      console.log(`📡 Mock Channel: Listening to ${event} on ${name}`);
      return {
        subscribe: () => {
          console.log(`✅ Mock Channel: Subscribed to ${name}`);
          return { unsubscribe: () => console.log(`🚪 Mock Channel: Unsubscribed from ${name}`) };
        }
      };
    }
  }),
  
  removeChannel: (channel: any) => {
    console.log('🗑️ Mock Channel: Removed');
  },
  
  // Fonctions utilitaires
  getDashboardData: () => mockDashboardData,
  getMenuItems: () => mockMenuItems,
  getTestUsers: () => mockUsers,
  
  // Configuration
  config: {
    url: 'mock://localhost:3000',
    key: 'mock-anon-key',
    mode: 'mock',
    features: {
      auth: true,
      database: true,
      realtime: true,
      storage: false
    }
  }
};

// Export par défaut
export default mockSupabase;

