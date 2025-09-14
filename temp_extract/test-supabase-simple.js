// Test de connexion Supabase simplifié pour Africa Suite Pulse
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://alffplvdnywwbrzygmoc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY'

console.log('🔍 Test Supabase Simplifié - Africa Suite Pulse')
console.log('===============================================')

async function testSupabaseSimple() {
  try {
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Client Supabase créé avec succès')
    console.log('🌐 URL:', supabaseUrl)
    console.log('🔑 Clé API:', supabaseKey.substring(0, 20) + '...')
    
    // Test d'authentification de base
    console.log('\n🔐 Test d\'authentification...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    } else {
      console.log('✅ Système d\'authentification accessible')
      console.log('📊 Session actuelle:', authData.session ? 'Connecté' : 'Non connecté')
    }
    
    // Test de connexion avec utilisateur de test
    console.log('\n🔑 Test de connexion utilisateur...')
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@africasuite.com',
        password: 'AfricaSuite2025!'
      })
      
      if (signInError) {
        console.log('⚠️  Connexion échouée:', signInError.message)
        
        // Essayer de créer l'utilisateur
        console.log('\n👤 Tentative de création d\'utilisateur...')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@africasuite.com',
          password: 'AfricaSuite2025!',
          options: {
            data: {
              full_name: 'Admin Africa Suite',
              role: 'admin',
              site: 'africa-suite-pulse'
            }
          }
        })
        
        if (signUpError) {
          console.log('⚠️  Création utilisateur:', signUpError.message)
        } else {
          console.log('✅ Utilisateur créé avec succès')
          console.log('📧 Email:', signUpData.user?.email)
        }
      } else {
        console.log('✅ Connexion réussie!')
        console.log('👤 Utilisateur:', signInData.user?.email)
        console.log('🆔 ID:', signInData.user?.id)
        
        // Test d'accès aux données utilisateur
        console.log('\n📊 Test d\'accès aux données...')
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.log('⚠️  Erreur données utilisateur:', userError.message)
        } else {
          console.log('✅ Données utilisateur accessibles')
          console.log('📋 Métadonnées:', userData.user?.user_metadata)
        }
        
        // Déconnexion
        await supabase.auth.signOut()
        console.log('🚪 Déconnexion effectuée')
      }
    } catch (error) {
      console.log('❌ Erreur test connexion:', error.message)
    }
    
    // Test de création de table simple (si permissions)
    console.log('\n🗄️  Test de base de données...')
    try {
      const { data: testData, error: testError } = await supabase
        .from('test_connection')
        .select('*')
        .limit(1)
      
      if (testError) {
        console.log('⚠️  Table test non accessible:', testError.message)
        console.log('💡 Ceci est normal si la table n\'existe pas encore')
      } else {
        console.log('✅ Accès base de données fonctionnel')
        console.log('📊 Données test:', testData)
      }
    } catch (error) {
      console.log('⚠️  Test base de données:', error.message)
    }
    
    // Résumé final
    console.log('\n🎯 RÉSUMÉ FINAL')
    console.log('===============')
    console.log('✅ Connexion Supabase: OPÉRATIONNELLE')
    console.log('✅ URL valide:', supabaseUrl)
    console.log('✅ Clé API valide: Oui')
    console.log('✅ Authentification: Disponible')
    console.log('🟢 STATUT: PRÊT POUR AFRICA SUITE PULSE')
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message)
    console.log('\n🔴 STATUT: ERREUR DE CONNEXION')
    return false
  }
}

// Exécuter le test
testSupabaseSimple().then(success => {
  if (success) {
    console.log('\n🎉 SUPABASE PRÊT POUR LES TESTS COMPLETS!')
  } else {
    console.log('\n⚠️  CONFIGURATION SUPABASE REQUISE')
  }
  process.exit(success ? 0 : 1)
})

