/**
 * Dashboard de Compatibilité Elyx
 * Interface de gestion hybride Elyx/ERP moderne
 */

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { AfricanCard, AfricanStatCard } from './african-card'
import { AfricanButton, AfricanButtonGroup } from './african-button'
import { useElyxCompatibility } from '@/hooks/useElyxCompatibility'
import { useAfricanTheme } from '@/components/providers/african-theme-provider'
import {
  Database,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Package,
  Building,
  Zap,
  Clock,
  TrendingUp,
  Download,
  Upload,
  Settings,
  Info
} from 'lucide-react'

interface AfricanCompatibilityDashboardProps {
  className?: string
  siteId?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

export function AfricanCompatibilityDashboard({
  className,
  siteId,
  supabaseUrl,
  supabaseAnonKey
}: AfricanCompatibilityDashboardProps) {
  const { isAfricanTheme } = useAfricanTheme()
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<any>(null)

  const {
    isInitialized,
    isLoading,
    error,
    activeMode,
    connectionStatus,
    orders,
    products,
    sites,
    ordersLoading,
    productsLoading,
    sitesLoading,
    statistics,
    switchMode,
    migrateToModern,
    refreshAll,
    isHybridMode,
    isElyxMode,
    isModernMode,
    hasElyxData,
    hasModernData
  } = useElyxCompatibility({
    defaultMode: 'hybrid',
    autoDetect: true,
    supabaseUrl,
    supabaseAnonKey
  })

  const handleModeSwitch = async (newMode: 'elyx' | 'modern' | 'hybrid') => {
    await switchMode(newMode)
  }

  const handleMigration = async () => {
    try {
      setMigrationProgress({ status: 'running', progress: 0 })
      const result = await migrateToModern(siteId)
      setMigrationProgress({ 
        status: 'completed', 
        progress: 100,
        result 
      })
    } catch (error) {
      setMigrationProgress({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Erreur de migration'
      })
    }
  }

  if (!isInitialized) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="animate-spin w-8 h-8 border-2 border-african-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-african-neutral-600">Initialisation de la compatibilité Elyx...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-8', className)}>
        <AfricanCard variant="accent" className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-african-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-african-error-700 mb-2">
            Erreur de Compatibilité
          </h3>
          <p className="text-african-error-600 mb-4">{error}</p>
          <AfricanButton variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </AfricanButton>
        </AfricanCard>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header avec sélecteur de mode */}
      <AfricanCard variant="pattern" pattern="bogolan" patternIntensity="light">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold text-african-primary-700 font-heading mb-2">
                🔄 Compatibilité Elyx/ERP
              </h2>
              <p className="text-african-neutral-600">
                Gestion hybride pour une transition en douceur
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Sélecteur de mode */}
              <div className="flex bg-african-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => handleModeSwitch('elyx')}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    isElyxMode
                      ? 'bg-african-primary-500 text-white shadow-sm'
                      : 'text-african-neutral-600 hover:text-african-primary-600'
                  )}
                  disabled={isLoading}
                >
                  <Database className="w-4 h-4" />
                  Elyx
                </button>
                <button
                  onClick={() => handleModeSwitch('hybrid')}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    isHybridMode
                      ? 'bg-african-accent-500 text-white shadow-sm'
                      : 'text-african-neutral-600 hover:text-african-accent-600'
                  )}
                  disabled={isLoading}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Hybride
                </button>
                <button
                  onClick={() => handleModeSwitch('modern')}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    isModernMode
                      ? 'bg-african-success-500 text-white shadow-sm'
                      : 'text-african-neutral-600 hover:text-african-success-600'
                  )}
                  disabled={isLoading}
                >
                  <Zap className="w-4 h-4" />
                  Moderne
                </button>
              </div>
              
              <AfricanButton
                variant="outline"
                size="sm"
                onClick={refreshAll}
                loading={isLoading}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Actualiser
              </AfricanButton>
            </div>
          </div>
        </div>
      </AfricanCard>

      {/* Statut des connexions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AfricanCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-african-neutral-600">Connexion Elyx</p>
              <p className={cn(
                'text-lg font-semibold',
                connectionStatus.elyx ? 'text-african-success-600' : 'text-african-error-600'
              )}>
                {connectionStatus.elyx ? 'Connecté' : 'Déconnecté'}
              </p>
            </div>
            <div className={cn(
              'w-3 h-3 rounded-full',
              connectionStatus.elyx ? 'bg-african-success-500' : 'bg-african-error-500'
            )} />
          </div>
        </AfricanCard>

        <AfricanCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-african-neutral-600">Connexion Moderne</p>
              <p className={cn(
                'text-lg font-semibold',
                connectionStatus.modern ? 'text-african-success-600' : 'text-african-error-600'
              )}>
                {connectionStatus.modern ? 'Connecté' : 'Déconnecté'}
              </p>
            </div>
            <div className={cn(
              'w-3 h-3 rounded-full',
              connectionStatus.modern ? 'bg-african-success-500' : 'bg-african-error-500'
            )} />
          </div>
        </AfricanCard>

        <AfricanCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-african-neutral-600">Mode Actif</p>
              <p className="text-lg font-semibold text-african-primary-600 capitalize">
                {activeMode}
              </p>
            </div>
            <div className="text-african-primary-500">
              {isElyxMode && <Database className="w-5 h-5" />}
              {isHybridMode && <ArrowRightLeft className="w-5 h-5" />}
              {isModernMode && <Zap className="w-5 h-5" />}
            </div>
          </div>
        </AfricanCard>
      </div>

      {/* Statistiques unifiées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AfricanStatCard
          title="Commandes Totales"
          value={statistics.orders.total}
          description={`${statistics.orders.elyx} Elyx + ${statistics.orders.modern} Modernes`}
          icon={<BarChart3 className="w-6 h-6" />}
          trend="up"
        />
        
        <AfricanStatCard
          title="Revenus Totaux"
          value={`${statistics.orders.revenue.toLocaleString()} FCFA`}
          description="Toutes sources confondues"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
        />
        
        <AfricanStatCard
          title="Produits Actifs"
          value={statistics.products.total}
          description={`${statistics.products.elyx} Elyx + ${statistics.products.modern} Modernes`}
          icon={<Package className="w-6 h-6" />}
          trend="neutral"
        />
        
        <AfricanStatCard
          title="Sites Actifs"
          value={statistics.sites.active}
          description={`${statistics.sites.total} sites au total`}
          icon={<Building className="w-6 h-6" />}
          trend="neutral"
        />
      </div>

      {/* Répartition hybride */}
      {isHybridMode && statistics.hybridRatio && (
        <AfricanCard variant="accent" className="p-6">
          <h3 className="text-lg font-semibold text-african-primary-700 mb-4 font-heading">
            📊 Répartition des Données Hybrides
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-african-neutral-600">Données Elyx</span>
                <span className="text-sm font-semibold text-african-primary-600">
                  {statistics.hybridRatio.elyxPercentage}%
                </span>
              </div>
              <div className="w-full bg-african-neutral-200 rounded-full h-2">
                <div 
                  className="bg-african-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statistics.hybridRatio.elyxPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-african-neutral-600">Données Modernes</span>
                <span className="text-sm font-semibold text-african-success-600">
                  {statistics.hybridRatio.modernPercentage}%
                </span>
              </div>
              <div className="w-full bg-african-neutral-200 rounded-full h-2">
                <div 
                  className="bg-african-success-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statistics.hybridRatio.modernPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </AfricanCard>
      )}

      {/* Actions de migration */}
      {hasElyxData && (
        <AfricanCard variant="pattern" pattern="kita" patternIntensity="light" className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold text-african-primary-700 mb-2 font-heading">
                🚀 Migration vers ERP Moderne
              </h3>
              <p className="text-african-neutral-600">
                Migrez vos données Elyx vers la nouvelle plateforme pour bénéficier des dernières fonctionnalités.
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm text-african-neutral-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-african-success-500" />
                  Données préservées
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-african-success-500" />
                  Migration progressive
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-african-success-500" />
                  Rollback possible
                </span>
              </div>
            </div>
            
            <AfricanButtonGroup orientation="horizontal">
              <AfricanButton
                variant="outline"
                size="sm"
                icon={<Info className="w-4 h-4" />}
              >
                Guide Migration
              </AfricanButton>
              <AfricanButton
                variant="primary"
                size="sm"
                onClick={() => setShowMigrationModal(true)}
                icon={<Upload className="w-4 h-4" />}
              >
                Démarrer Migration
              </AfricanButton>
            </AfricanButtonGroup>
          </div>
        </AfricanCard>
      )}

      {/* Données récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <AfricanCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-african-primary-700 font-heading">
              Commandes Récentes
            </h3>
            <span className="text-xs text-african-neutral-500">
              {ordersLoading ? 'Chargement...' : `${orders.length} commandes`}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-african-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-african-neutral-800">{order.customerName}</p>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      order.source === 'elyx' 
                        ? 'bg-african-primary-100 text-african-primary-700'
                        : 'bg-african-success-100 text-african-success-700'
                    )}>
                      {order.source}
                    </span>
                  </div>
                  <p className="text-sm text-african-neutral-600">
                    {order.totalAmount.toLocaleString()} FCFA • {order.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-african-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && !ordersLoading && (
              <div className="text-center py-8 text-african-neutral-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune commande trouvée</p>
              </div>
            )}
          </div>
        </AfricanCard>

        {/* Produits populaires */}
        <AfricanCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-african-primary-700 font-heading">
              Produits Disponibles
            </h3>
            <span className="text-xs text-african-neutral-500">
              {productsLoading ? 'Chargement...' : `${products.length} produits`}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-african-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-african-neutral-800">{product.name}</p>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      product.source === 'elyx' 
                        ? 'bg-african-primary-100 text-african-primary-700'
                        : 'bg-african-success-100 text-african-success-700'
                    )}>
                      {product.source}
                    </span>
                  </div>
                  <p className="text-sm text-african-neutral-600">
                    {product.category} • {product.price.toLocaleString()} FCFA
                  </p>
                </div>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  product.isActive ? 'bg-african-success-500' : 'bg-african-neutral-400'
                )} />
              </div>
            ))}
            
            {products.length === 0 && !productsLoading && (
              <div className="text-center py-8 text-african-neutral-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun produit trouvé</p>
              </div>
            )}
          </div>
        </AfricanCard>
      </div>

      {/* Modal de migration */}
      {showMigrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AfricanCard className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-african-primary-700 mb-4 font-heading">
                Migration des Données Elyx
              </h3>
              
              {!migrationProgress && (
                <>
                  <p className="text-african-neutral-600 mb-6">
                    Cette opération va migrer vos données Elyx vers la nouvelle plateforme. 
                    L'opération est réversible et vos données Elyx seront préservées.
                  </p>
                  
                  <div className="flex gap-3">
                    <AfricanButton
                      variant="outline"
                      onClick={() => setShowMigrationModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </AfricanButton>
                    <AfricanButton
                      variant="primary"
                      onClick={handleMigration}
                      className="flex-1"
                    >
                      Démarrer
                    </AfricanButton>
                  </div>
                </>
              )}
              
              {migrationProgress && (
                <>
                  {migrationProgress.status === 'running' && (
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-african-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-african-neutral-600">Migration en cours...</p>
                    </div>
                  )}
                  
                  {migrationProgress.status === 'completed' && (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-african-success-500 mx-auto mb-4" />
                      <h4 className="font-semibold text-african-success-700 mb-2">Migration Réussie !</h4>
                      <p className="text-sm text-african-neutral-600 mb-4">
                        {migrationProgress.result.migratedOrders} commandes et {migrationProgress.result.migratedProducts} produits migrés.
                      </p>
                      <AfricanButton
                        variant="primary"
                        onClick={() => {
                          setShowMigrationModal(false)
                          setMigrationProgress(null)
                        }}
                        className="w-full"
                      >
                        Fermer
                      </AfricanButton>
                    </div>
                  )}
                  
                  {migrationProgress.status === 'error' && (
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 text-african-error-500 mx-auto mb-4" />
                      <h4 className="font-semibold text-african-error-700 mb-2">Erreur de Migration</h4>
                      <p className="text-sm text-african-error-600 mb-4">
                        {migrationProgress.error}
                      </p>
                      <AfricanButton
                        variant="outline"
                        onClick={() => {
                          setShowMigrationModal(false)
                          setMigrationProgress(null)
                        }}
                        className="w-full"
                      >
                        Fermer
                      </AfricanButton>
                    </div>
                  )}
                </>
              )}
            </div>
          </AfricanCard>
        </div>
      )}
    </div>
  )
}

export default AfricanCompatibilityDashboard

