/**
 * Adaptateur de Compatibilité Elyx
 * Interface unifiée pour les données Elyx et ERP moderne
 */

import { createClient } from '@supabase/supabase-js'

// Types Elyx (basés sur l'analyse de la base TIAMA)
export interface ElyxSuiviDevise {
  id: number
  date_operation: string
  montant: number
  mode_paiement: string
  site_id: number
  user_id?: number
  reference?: string
  statut?: string
  created_at?: string
}

export interface ElyxArticle {
  id: number
  nom: string
  prix: number
  categorie?: string
  description?: string
  actif: boolean
  site_id: number
  created_at?: string
  updated_at?: string
}

export interface ElyxSite {
  id: number
  nom: string
  adresse?: string
  telephone?: string
  email?: string
  actif: boolean
  type?: string
  created_at?: string
}

export interface ElyxUser {
  id: number
  nom: string
  email: string
  role?: string
  site_id?: number
  actif: boolean
  created_at?: string
}

// Types ERP Moderne (nouvelle structure)
export interface ModernOrder {
  id: string
  customer_name: string
  total_amount: number
  payment_method: string
  status: string
  items: ModernOrderItem[]
  created_at: string
  updated_at: string
  site_id: string
}

export interface ModernOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface ModernProduct {
  id: string
  name: string
  price: number
  category: string
  description?: string
  is_active: boolean
  site_id: string
  created_at: string
  updated_at: string
}

export interface ModernSite {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  is_active: boolean
  type: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Configuration de l'adaptateur
export interface ElyxAdapterConfig {
  mode: 'elyx' | 'modern' | 'hybrid'
  elyxConnection?: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }
  supabaseConnection?: {
    url: string
    anonKey: string
  }
  autoDetect?: boolean
  fallbackMode?: 'elyx' | 'modern'
}

// Interface unifiée pour les données
export interface UnifiedOrder {
  id: string
  customerName: string
  totalAmount: number
  paymentMethod: string
  status: string
  items?: UnifiedOrderItem[]
  createdAt: string
  siteId: string
  source: 'elyx' | 'modern'
}

export interface UnifiedOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface UnifiedProduct {
  id: string
  name: string
  price: number
  category?: string
  description?: string
  isActive: boolean
  siteId: string
  createdAt: string
  source: 'elyx' | 'modern'
}

export interface UnifiedSite {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  type?: string
  createdAt: string
  source: 'elyx' | 'modern'
}

export class ElyxAdapter {
  private config: ElyxAdapterConfig
  private supabaseClient?: any
  private elyxConnection?: any
  private detectedMode?: 'elyx' | 'modern'

  constructor(config: ElyxAdapterConfig) {
    this.config = config
    this.initializeConnections()
  }

  private async initializeConnections() {
    // Initialiser Supabase si configuré
    if (this.config.supabaseConnection) {
      this.supabaseClient = createClient(
        this.config.supabaseConnection.url,
        this.config.supabaseConnection.anonKey
      )
    }

    // Initialiser la connexion Elyx si configurée
    if (this.config.elyxConnection) {
      // Note: En production, utiliser un vrai driver SQL Server
      // Pour la démo, on simule avec des données locales
      this.elyxConnection = {
        connected: true,
        config: this.config.elyxConnection
      }
    }

    // Auto-détection du mode si activée
    if (this.config.autoDetect) {
      await this.detectMode()
    }
  }

  private async detectMode(): Promise<'elyx' | 'modern'> {
    try {
      // Tenter de se connecter à Elyx d'abord
      if (this.elyxConnection && await this.testElyxConnection()) {
        this.detectedMode = 'elyx'
        console.log('🔍 Mode Elyx détecté automatiquement')
        return 'elyx'
      }

      // Fallback vers Supabase moderne
      if (this.supabaseClient && await this.testSupabaseConnection()) {
        this.detectedMode = 'modern'
        console.log('🔍 Mode moderne détecté automatiquement')
        return 'modern'
      }

      // Utiliser le mode de fallback
      this.detectedMode = this.config.fallbackMode || 'modern'
      console.log(`🔍 Utilisation du mode de fallback: ${this.detectedMode}`)
      return this.detectedMode
    } catch (error) {
      console.error('❌ Erreur lors de la détection automatique:', error)
      this.detectedMode = this.config.fallbackMode || 'modern'
      return this.detectedMode
    }
  }

  private async testElyxConnection(): Promise<boolean> {
    try {
      // Simuler un test de connexion Elyx
      // En production, exécuter une requête simple comme SELECT 1
      return this.elyxConnection?.connected === true
    } catch (error) {
      return false
    }
  }

  private async testSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseClient
        .from('sites')
        .select('id')
        .limit(1)
      
      return !error
    } catch (error) {
      return false
    }
  }

  public getActiveMode(): 'elyx' | 'modern' | 'hybrid' {
    if (this.config.mode === 'hybrid') {
      return 'hybrid'
    }
    return this.detectedMode || this.config.mode
  }

  // === MÉTHODES UNIFIÉES POUR LES COMMANDES ===

  public async getOrders(siteId?: string, limit = 50): Promise<UnifiedOrder[]> {
    const mode = this.getActiveMode()
    
    if (mode === 'hybrid') {
      // Récupérer des deux sources et fusionner
      const [elyxOrders, modernOrders] = await Promise.allSettled([
        this.getElyxOrders(siteId, limit / 2),
        this.getModernOrders(siteId, limit / 2)
      ])
      
      const orders: UnifiedOrder[] = []
      
      if (elyxOrders.status === 'fulfilled') {
        orders.push(...elyxOrders.value)
      }
      
      if (modernOrders.status === 'fulfilled') {
        orders.push(...modernOrders.value)
      }
      
      // Trier par date décroissante
      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, limit)
    }
    
    if (mode === 'elyx') {
      return this.getElyxOrders(siteId, limit)
    }
    
    return this.getModernOrders(siteId, limit)
  }

  private async getElyxOrders(siteId?: string, limit = 50): Promise<UnifiedOrder[]> {
    try {
      // Simuler la récupération depuis Elyx
      // En production, exécuter une vraie requête SQL
      const mockElyxData: ElyxSuiviDevise[] = [
        {
          id: 1,
          date_operation: '2024-01-15T10:30:00Z',
          montant: 15000,
          mode_paiement: 'Espèces',
          site_id: 1,
          reference: 'ELX-001',
          statut: 'Validé'
        },
        {
          id: 2,
          date_operation: '2024-01-15T14:20:00Z',
          montant: 25000,
          mode_paiement: 'Carte',
          site_id: 1,
          reference: 'ELX-002',
          statut: 'Validé'
        }
      ]

      return mockElyxData.map(this.transformElyxToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes Elyx:', error)
      return []
    }
  }

  private async getModernOrders(siteId?: string, limit = 50): Promise<UnifiedOrder[]> {
    try {
      if (!this.supabaseClient) {
        throw new Error('Client Supabase non initialisé')
      }

      let query = this.supabaseClient
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (siteId) {
        query = query.eq('site_id', siteId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []).map(this.transformModernToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes modernes:', error)
      return []
    }
  }

  private transformElyxToUnified = (elyxOrder: ElyxSuiviDevise): UnifiedOrder => ({
    id: `elyx_${elyxOrder.id}`,
    customerName: `Client ${elyxOrder.id}`,
    totalAmount: elyxOrder.montant,
    paymentMethod: elyxOrder.mode_paiement,
    status: elyxOrder.statut || 'Validé',
    createdAt: elyxOrder.date_operation,
    siteId: elyxOrder.site_id.toString(),
    source: 'elyx'
  })

  private transformModernToUnified = (modernOrder: any): UnifiedOrder => ({
    id: modernOrder.id,
    customerName: modernOrder.customer_name,
    totalAmount: modernOrder.total_amount,
    paymentMethod: modernOrder.payment_method,
    status: modernOrder.status,
    items: modernOrder.order_items?.map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    })),
    createdAt: modernOrder.created_at,
    siteId: modernOrder.site_id,
    source: 'modern'
  })

  // === MÉTHODES UNIFIÉES POUR LES PRODUITS ===

  public async getProducts(siteId?: string): Promise<UnifiedProduct[]> {
    const mode = this.getActiveMode()
    
    if (mode === 'hybrid') {
      const [elyxProducts, modernProducts] = await Promise.allSettled([
        this.getElyxProducts(siteId),
        this.getModernProducts(siteId)
      ])
      
      const products: UnifiedProduct[] = []
      
      if (elyxProducts.status === 'fulfilled') {
        products.push(...elyxProducts.value)
      }
      
      if (modernProducts.status === 'fulfilled') {
        products.push(...modernProducts.value)
      }
      
      return products.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    if (mode === 'elyx') {
      return this.getElyxProducts(siteId)
    }
    
    return this.getModernProducts(siteId)
  }

  private async getElyxProducts(siteId?: string): Promise<UnifiedProduct[]> {
    try {
      // Simuler la récupération depuis Elyx
      const mockElyxProducts: ElyxArticle[] = [
        {
          id: 1,
          nom: 'Thieboudienne',
          prix: 2500,
          categorie: 'Plat Principal',
          actif: true,
          site_id: 1
        },
        {
          id: 2,
          nom: 'Yassa Poulet',
          prix: 2000,
          categorie: 'Plat Principal',
          actif: true,
          site_id: 1
        }
      ]

      return mockElyxProducts
        .filter(p => !siteId || p.site_id.toString() === siteId)
        .map(this.transformElyxProductToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits Elyx:', error)
      return []
    }
  }

  private async getModernProducts(siteId?: string): Promise<UnifiedProduct[]> {
    try {
      if (!this.supabaseClient) {
        throw new Error('Client Supabase non initialisé')
      }

      let query = this.supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (siteId) {
        query = query.eq('site_id', siteId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []).map(this.transformModernProductToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits modernes:', error)
      return []
    }
  }

  private transformElyxProductToUnified = (elyxProduct: ElyxArticle): UnifiedProduct => ({
    id: `elyx_${elyxProduct.id}`,
    name: elyxProduct.nom,
    price: elyxProduct.prix,
    category: elyxProduct.categorie,
    description: elyxProduct.description,
    isActive: elyxProduct.actif,
    siteId: elyxProduct.site_id.toString(),
    createdAt: elyxProduct.created_at || new Date().toISOString(),
    source: 'elyx'
  })

  private transformModernProductToUnified = (modernProduct: any): UnifiedProduct => ({
    id: modernProduct.id,
    name: modernProduct.name,
    price: modernProduct.price,
    category: modernProduct.category,
    description: modernProduct.description,
    isActive: modernProduct.is_active,
    siteId: modernProduct.site_id,
    createdAt: modernProduct.created_at,
    source: 'modern'
  })

  // === MÉTHODES UNIFIÉES POUR LES SITES ===

  public async getSites(): Promise<UnifiedSite[]> {
    const mode = this.getActiveMode()
    
    if (mode === 'hybrid') {
      const [elyxSites, modernSites] = await Promise.allSettled([
        this.getElyxSites(),
        this.getModernSites()
      ])
      
      const sites: UnifiedSite[] = []
      
      if (elyxSites.status === 'fulfilled') {
        sites.push(...elyxSites.value)
      }
      
      if (modernSites.status === 'fulfilled') {
        sites.push(...modernSites.value)
      }
      
      return sites.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    if (mode === 'elyx') {
      return this.getElyxSites()
    }
    
    return this.getModernSites()
  }

  private async getElyxSites(): Promise<UnifiedSite[]> {
    try {
      const mockElyxSites: ElyxSite[] = [
        {
          id: 1,
          nom: 'Hôtel Baobab Dakar',
          adresse: 'Plateau, Dakar',
          telephone: '+221 33 123 45 67',
          email: 'contact@baobab-dakar.sn',
          actif: true,
          type: 'Hotel'
        }
      ]

      return mockElyxSites.map(this.transformElyxSiteToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sites Elyx:', error)
      return []
    }
  }

  private async getModernSites(): Promise<UnifiedSite[]> {
    try {
      if (!this.supabaseClient) {
        throw new Error('Client Supabase non initialisé')
      }

      const { data, error } = await this.supabaseClient
        .from('sites')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw error
      }

      return (data || []).map(this.transformModernSiteToUnified)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sites modernes:', error)
      return []
    }
  }

  private transformElyxSiteToUnified = (elyxSite: ElyxSite): UnifiedSite => ({
    id: `elyx_${elyxSite.id}`,
    name: elyxSite.nom,
    address: elyxSite.adresse,
    phone: elyxSite.telephone,
    email: elyxSite.email,
    isActive: elyxSite.actif,
    type: elyxSite.type,
    createdAt: elyxSite.created_at || new Date().toISOString(),
    source: 'elyx'
  })

  private transformModernSiteToUnified = (modernSite: any): UnifiedSite => ({
    id: modernSite.id,
    name: modernSite.name,
    address: modernSite.address,
    phone: modernSite.phone,
    email: modernSite.email,
    isActive: modernSite.is_active,
    type: modernSite.type,
    createdAt: modernSite.created_at,
    source: 'modern'
  })

  // === MÉTHODES DE MIGRATION ===

  public async migrateElyxToModern(siteId?: string): Promise<{
    success: boolean
    migratedOrders: number
    migratedProducts: number
    errors: string[]
  }> {
    const errors: string[] = []
    let migratedOrders = 0
    let migratedProducts = 0

    try {
      // Migrer les produits
      const elyxProducts = await this.getElyxProducts(siteId)
      for (const product of elyxProducts) {
        try {
          await this.createModernProduct(product)
          migratedProducts++
        } catch (error) {
          errors.push(`Erreur migration produit ${product.name}: ${error}`)
        }
      }

      // Migrer les commandes
      const elyxOrders = await this.getElyxOrders(siteId, 1000)
      for (const order of elyxOrders) {
        try {
          await this.createModernOrder(order)
          migratedOrders++
        } catch (error) {
          errors.push(`Erreur migration commande ${order.id}: ${error}`)
        }
      }

      return {
        success: errors.length === 0,
        migratedOrders,
        migratedProducts,
        errors
      }
    } catch (error) {
      errors.push(`Erreur générale de migration: ${error}`)
      return {
        success: false,
        migratedOrders,
        migratedProducts,
        errors
      }
    }
  }

  private async createModernProduct(product: UnifiedProduct): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Client Supabase non initialisé')
    }

    const { error } = await this.supabaseClient
      .from('products')
      .insert({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        is_active: product.isActive,
        site_id: product.siteId,
        migrated_from_elyx: true,
        elyx_id: product.id.replace('elyx_', '')
      })

    if (error) {
      throw error
    }
  }

  private async createModernOrder(order: UnifiedOrder): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Client Supabase non initialisé')
    }

    const { error } = await this.supabaseClient
      .from('orders')
      .insert({
        customer_name: order.customerName,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        status: order.status,
        site_id: order.siteId,
        migrated_from_elyx: true,
        elyx_id: order.id.replace('elyx_', ''),
        created_at: order.createdAt
      })

    if (error) {
      throw error
    }
  }

  // === MÉTHODES UTILITAIRES ===

  public getConnectionStatus(): {
    elyx: boolean
    modern: boolean
    activeMode: string
  } {
    return {
      elyx: !!this.elyxConnection?.connected,
      modern: !!this.supabaseClient,
      activeMode: this.getActiveMode()
    }
  }

  public async switchMode(newMode: 'elyx' | 'modern' | 'hybrid'): Promise<void> {
    this.config.mode = newMode
    if (newMode !== 'hybrid') {
      this.detectedMode = newMode
    }
    console.log(`🔄 Mode basculé vers: ${newMode}`)
  }
}

// Factory pour créer l'adaptateur
export function createElyxAdapter(config: ElyxAdapterConfig): ElyxAdapter {
  return new ElyxAdapter(config)
}

// Export des types
export type {
  ElyxAdapterConfig,
  UnifiedOrder,
  UnifiedProduct,
  UnifiedSite,
  UnifiedOrderItem
}

