/**
 * Dashboard Mobile Optimisé Africain
 * Interface dashboard spécialement conçue pour les mobiles africains
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAfricanMobileOptimization } from '@/hooks/useAfricanMobileOptimization'
import { useUnifiedData } from '@/hooks/useElyxCompatibility'
import { AfricanCard, AfricanStatCard } from './african-card'
import { AfricanButton, AfricanButtonGroup } from './african-button'
import {
  AfricanMobileNetworkStatus,
  AfricanMobileImage,
  AfricanMobileDataManager,
  AfricanMobileOfflineSync,
  AfricanMobilePerformanceIndicator
} from './african-mobile-interface'
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Smartphone,
  Wifi,
  Battery,
  Settings,
  Menu,
  X,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Zap,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface AfricanMobileDashboardProps {
  className?: string
  siteId?: string
}

export function AfricanMobileDashboard({
  className,
  siteId
}: AfricanMobileDashboardProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showOptimizations, setShowOptimizations] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings'>('overview')

  const {
    isSlowConnection,
    network,
    dataUsagePercentage,
    shouldReduceAnimations,
    getOptimizationRecommendations
  } = useAfricanMobileOptimization()

  const {
    orders,
    products,
    sites,
    isLoading,
    statistics
  } = useUnifiedData(siteId)

  const recommendations = getOptimizationRecommendations()

  // Fermer le menu mobile quand on change d'onglet
  useEffect(() => {
    setShowMobileMenu(false)
  }, [activeTab])

  // Données optimisées pour mobile
  const recentOrders = orders.slice(0, isSlowConnection ? 3 : 5)
  const topProducts = products.slice(0, isSlowConnection ? 3 : 5)

  return (
    <div className={cn('min-h-screen bg-african-neutral-50', className)}>
      {/* Header Mobile */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-african-primary-500 to-african-primary-600 text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-african-primary-400 rounded-lg transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div>
                <h1 className="font-bold text-lg font-heading">Africa Suite</h1>
                <p className="text-xs text-african-primary-100">
                  {sites[0]?.name || 'Dashboard Mobile'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOptimizations(!showOptimizations)}
                className="p-2 hover:bg-african-primary-400 rounded-lg transition-colors relative"
              >
                <Smartphone className="w-5 h-5" />
                {recommendations.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-african-warning-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Statut réseau compact */}
          <div className="mt-2 flex items-center justify-between">
            <AfricanMobileNetworkStatus />
            <AfricanMobilePerformanceIndicator />
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="px-4 pb-3">
          <div className="flex bg-african-primary-400 bg-opacity-30 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'orders', label: 'Commandes', icon: TrendingUp },
              { id: 'products', label: 'Produits', icon: Package },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-african-primary-700 shadow-sm'
                    : 'text-african-primary-100 hover:text-white'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu mobile coulissant */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="p-4 bg-gradient-to-r from-african-primary-500 to-african-primary-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg font-heading">Menu Principal</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-african-primary-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {[
                { label: 'Dashboard', icon: BarChart3, active: true },
                { label: 'Commandes', icon: TrendingUp },
                { label: 'Produits', icon: Package },
                { label: 'Clients', icon: Users },
                { label: 'Paramètres', icon: Settings }
              ].map((item, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    item.active 
                      ? 'bg-african-primary-50 text-african-primary-700'
                      : 'hover:bg-african-neutral-50 text-african-neutral-700'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel d'optimisations mobiles */}
      {showOptimizations && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowOptimizations(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-african-accent-500 to-african-accent-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg font-heading">Optimisations Mobile</h2>
                <button
                  onClick={() => setShowOptimizations(false)}
                  className="p-2 hover:bg-african-accent-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <AfricanMobileDataManager />
              <AfricanMobileOfflineSync />
              
              {recommendations.length > 0 && (
                <AfricanCard className="p-4">
                  <h3 className="font-semibold text-african-primary-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Recommandations
                  </h3>
                  <div className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-african-neutral-600 bg-african-warning-50 p-3 rounded-lg">
                        {rec}
                      </div>
                    ))}
                  </div>
                </AfricanCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="p-4 space-y-4">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <>
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 gap-3">
              <AfricanStatCard
                title="Commandes"
                value={statistics.orders.total}
                description="Total"
                icon={<BarChart3 className="w-5 h-5" />}
                trend="up"
                compact
              />
              
              <AfricanStatCard
                title="Revenus"
                value={`${(statistics.orders.revenue / 1000).toFixed(0)}k`}
                description="FCFA"
                icon={<TrendingUp className="w-5 h-5" />}
                trend="up"
                compact
              />
            </div>

            {/* Alertes importantes */}
            {isSlowConnection && (
              <AfricanCard variant="accent" className="p-3">
                <div className="flex items-start gap-2">
                  <Wifi className="w-4 h-4 text-african-warning-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-african-warning-700">Connexion lente détectée</p>
                    <p className="text-african-warning-600 text-xs mt-1">
                      Interface optimisée pour votre réseau {network.effectiveType.toUpperCase()}
                    </p>
                  </div>
                </div>
              </AfricanCard>
            )}

            {dataUsagePercentage > 80 && (
              <AfricanCard variant="accent" className="p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-african-error-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-african-error-700">Limite de données approchée</p>
                    <p className="text-african-error-600 text-xs mt-1">
                      {Math.round(dataUsagePercentage)}% de votre forfait quotidien utilisé
                    </p>
                  </div>
                </div>
              </AfricanCard>
            )}

            {/* Commandes récentes */}
            <AfricanCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-african-primary-700 font-heading">
                  Commandes Récentes
                </h3>
                <span className="text-xs text-african-neutral-500">
                  {recentOrders.length} sur {orders.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 bg-african-neutral-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-african-neutral-800 truncate">
                        {order.customerName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-african-neutral-600">
                        <span>{order.totalAmount.toLocaleString()} FCFA</span>
                        <span>•</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full',
                          order.source === 'elyx' 
                            ? 'bg-african-primary-100 text-african-primary-700'
                            : 'bg-african-success-100 text-african-success-700'
                        )}>
                          {order.source}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-african-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentOrders.length === 0 && (
                  <div className="text-center py-6 text-african-neutral-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune commande récente</p>
                  </div>
                )}
              </div>
            </AfricanCard>
          </>
        )}

        {/* Onglet Commandes */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <AfricanCard className="p-4">
              <h3 className="font-semibold text-african-primary-700 mb-3 font-heading">
                Toutes les Commandes ({orders.length})
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-3 bg-african-neutral-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-african-neutral-800">
                            {order.customerName}
                          </p>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            order.source === 'elyx' 
                              ? 'bg-african-primary-100 text-african-primary-700'
                              : 'bg-african-success-100 text-african-success-700'
                          )}>
                            {order.source}
                          </span>
                        </div>
                        <div className="text-sm text-african-neutral-600">
                          <p>{order.totalAmount.toLocaleString()} FCFA • {order.paymentMethod}</p>
                          <p className="text-xs mt-1">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        order.status === 'Validé' || order.status === 'completed'
                          ? 'bg-african-success-100 text-african-success-700'
                          : 'bg-african-warning-100 text-african-warning-700'
                      )}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AfricanCard>
          </div>
        )}

        {/* Onglet Produits */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <AfricanCard className="p-4">
              <h3 className="font-semibold text-african-primary-700 mb-3 font-heading">
                Produits Disponibles ({products.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {products.map((product) => (
                  <div key={product.id} className="p-3 bg-african-neutral-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-african-neutral-800">
                            {product.name}
                          </p>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            product.source === 'elyx' 
                              ? 'bg-african-primary-100 text-african-primary-700'
                              : 'bg-african-success-100 text-african-success-700'
                          )}>
                            {product.source}
                          </span>
                        </div>
                        <div className="text-sm text-african-neutral-600">
                          <p>{product.category} • {product.price.toLocaleString()} FCFA</p>
                          {product.description && (
                            <p className="text-xs mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        product.isActive ? 'bg-african-success-500' : 'bg-african-neutral-400'
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </AfricanCard>
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <AfricanMobileDataManager />
            <AfricanMobileOfflineSync />
            
            <AfricanCard className="p-4">
              <h3 className="font-semibold text-african-primary-700 mb-3 font-heading">
                Informations Système
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-african-neutral-600">Version</span>
                  <span className="text-sm font-medium text-african-primary-700">2.0.0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-african-neutral-600">Mode</span>
                  <span className="text-sm font-medium text-african-primary-700">Mobile Optimisé</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-african-neutral-600">Thème</span>
                  <span className="text-sm font-medium text-african-primary-700">Africain Authentique</span>
                </div>
              </div>
            </AfricanCard>
          </div>
        )}
      </div>

      {/* Indicateur de chargement global */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-african-primary-500 text-white p-3 rounded-full shadow-lg">
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  )
}

export default AfricanMobileDashboard

