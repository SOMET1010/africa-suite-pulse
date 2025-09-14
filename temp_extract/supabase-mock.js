// Mock Supabase pour tests locaux - Africa Suite Pulse
console.log('🔧 Configuration Mock Supabase pour Tests Locaux')
console.log('================================================')

// Simuler les réponses Supabase pour les tests
const mockSupabaseResponses = {
  auth: {
    getSession: () => ({
      data: { session: null },
      error: null
    }),
    
    signInWithPassword: (credentials) => {
      console.log('🔑 Mock: Tentative de connexion pour', credentials.email)
      
      // Simuler une connexion réussie pour les utilisateurs de test
      if (credentials.email === 'admin@africasuite.com' && credentials.password === 'AfricaSuite2025!') {
        return {
          data: {
            user: {
              id: 'mock-user-id-123',
              email: 'admin@africasuite.com',
              user_metadata: {
                full_name: 'Admin Africa Suite',
                role: 'admin'
              }
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        }
      } else {
        return {
          data: null,
          error: { message: 'Invalid login credentials' }
        }
      }
    },
    
    signUp: (userData) => {
      console.log('👤 Mock: Création utilisateur pour', userData.email)
      return {
        data: {
          user: {
            id: 'mock-new-user-id',
            email: userData.email,
            user_metadata: userData.options?.data || {}
          }
        },
        error: null
      }
    },
    
    signOut: () => {
      console.log('🚪 Mock: Déconnexion effectuée')
      return { error: null }
    },
    
    getUser: () => ({
      data: {
        user: {
          id: 'mock-user-id-123',
          email: 'admin@africasuite.com',
          user_metadata: {
            full_name: 'Admin Africa Suite',
            role: 'admin'
          }
        }
      },
      error: null
    })
  },
  
  database: {
    from: (table) => ({
      select: (columns) => ({
        limit: (count) => ({
          data: [
            { id: 1, name: 'Test Data', created_at: new Date().toISOString() }
          ],
          error: null
        })
      }),
      
      insert: (data) => ({
        data: [{ ...data, id: Math.floor(Math.random() * 1000) }],
        error: null
      }),
      
      update: (data) => ({
        eq: (column, value) => ({
          data: [{ ...data, id: value }],
          error: null
        })
      }),
      
      delete: () => ({
        eq: (column, value) => ({
          data: [],
          error: null
        })
      })
    })
  }
}

// Fonction de test avec mock
async function testWithMock() {
  console.log('\n🧪 Tests avec Mock Supabase')
  console.log('===========================')
  
  // Test 1: Authentification
  console.log('\n🔐 Test 1: Authentification...')
  const authResult = mockSupabaseResponses.auth.signInWithPassword({
    email: 'admin@africasuite.com',
    password: 'AfricaSuite2025!'
  })
  
  if (authResult.error) {
    console.log('❌ Échec:', authResult.error.message)
  } else {
    console.log('✅ Connexion réussie!')
    console.log('👤 Utilisateur:', authResult.data.user.email)
    console.log('🆔 ID:', authResult.data.user.id)
  }
  
  // Test 2: Accès aux données
  console.log('\n📊 Test 2: Accès base de données...')
  const dbResult = mockSupabaseResponses.database.from('test_table').select('*').limit(1)
  
  if (dbResult.error) {
    console.log('❌ Erreur DB:', dbResult.error.message)
  } else {
    console.log('✅ Données récupérées:', dbResult.data.length, 'enregistrement(s)')
  }
  
  // Test 3: Création d'utilisateur
  console.log('\n👤 Test 3: Création utilisateur...')
  const signUpResult = mockSupabaseResponses.auth.signUp({
    email: 'test@africasuite.com',
    password: 'TestPassword123!',
    options: {
      data: {
        full_name: 'Test User',
        role: 'user'
      }
    }
  })
  
  if (signUpResult.error) {
    console.log('❌ Échec création:', signUpResult.error.message)
  } else {
    console.log('✅ Utilisateur créé!')
    console.log('📧 Email:', signUpResult.data.user.email)
  }
  
  // Test 4: Déconnexion
  console.log('\n🚪 Test 4: Déconnexion...')
  const signOutResult = mockSupabaseResponses.auth.signOut()
  
  if (signOutResult.error) {
    console.log('❌ Erreur déconnexion:', signOutResult.error.message)
  } else {
    console.log('✅ Déconnexion réussie!')
  }
  
  console.log('\n🎯 RÉSUMÉ TESTS MOCK')
  console.log('===================')
  console.log('✅ Authentification: Fonctionnelle')
  console.log('✅ Base de données: Simulée')
  console.log('✅ Gestion utilisateurs: Opérationnelle')
  console.log('✅ Sessions: Gérées')
  console.log('🟢 STATUT: PRÊT POUR TESTS INTERFACE')
  
  return true
}

// Configuration pour l'application
const mockConfig = {
  supabaseUrl: 'mock://localhost:3000',
  supabaseKey: 'mock-anon-key',
  features: {
    auth: true,
    database: true,
    realtime: false,
    storage: false
  },
  testUsers: [
    {
      email: 'admin@africasuite.com',
      password: 'AfricaSuite2025!',
      role: 'admin',
      name: 'Admin Africa Suite'
    },
    {
      email: 'manager@africasuite.com',
      password: 'Manager2025!',
      role: 'manager',
      name: 'Manager Africa Suite'
    },
    {
      email: 'user@africasuite.com',
      password: 'User2025!',
      role: 'user',
      name: 'User Africa Suite'
    }
  ]
}

console.log('\n📋 Configuration Mock disponible:')
console.log('- URL:', mockConfig.supabaseUrl)
console.log('- Utilisateurs de test:', mockConfig.testUsers.length)
console.log('- Fonctionnalités:', Object.keys(mockConfig.features).filter(k => mockConfig.features[k]).join(', '))

// Exécuter les tests
testWithMock().then(() => {
  console.log('\n🎉 MOCK SUPABASE PRÊT!')
  console.log('💡 Utilisez ce mock pour tester l\'interface Africa Suite Pulse')
  console.log('🔧 Intégration dans l\'application recommandée')
})

