/**
 * Interface Mobile Optimisée Africaine
 * Composants d'interface spécialement conçus pour les mobiles africains
 */

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAfricanMobileOptimization } from '@/hooks/useAfricanMobileOptimization'
import { AfricanCard } from './african-card'
import { AfricanButton } from './african-button'
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Download,
  Upload,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  HardDrive,
  Image,
  Minimize2,
  Maximize2,
  RefreshCw,
  X
} from 'lucide-react'

// Composant de statut réseau mobile
export function AfricanMobileNetworkStatus({ className }: { className?: string }) {
  const {
    network,
    dataUsagePercentage,
    connectionQuality,
    isSlowConnection,
    isOnline
  } = useAfricanMobileOptimization()

  const getSignalIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-african-error-500" />
    
    switch (network.effectiveType) {
      case '4g':
      case '5g':
        return <Signal className="w-4 h-4 text-african-success-500" />
      case '3g':
        return <Signal className="w-4 h-4 text-african-warning-500" />
      default:
        return <Signal className="w-4 h-4 text-african-error-500" />
    }
  }

  const getConnectionColor = () => {
    if (!isOnline) return 'text-african-error-600'
    if (isSlowConnection) return 'text-african-warning-600'
    return 'text-african-success-600'
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {getSignalIcon()}
      <span className={getConnectionColor()}>
        {isOnline ? network.effectiveType.toUpperCase() : 'Hors ligne'}
      </span>
      
      {isOnline && (
        <>
          <span className="text-african-neutral-400">•</span>
          <span className="text-african-neutral-600">
            {Math.round(network.downlink * 1000)}ms
          </span>
          
          {dataUsagePercentage > 0 && (
            <>
              <span className="text-african-neutral-400">•</span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                dataUsagePercentage > 80 
                  ? 'bg-african-error-100 text-african-error-700'
                  : dataUsagePercentage > 50
                  ? 'bg-african-warning-100 text-african-warning-700'
                  : 'bg-african-success-100 text-african-success-700'
              )}>
                {Math.round(dataUsagePercentage)}%
              </span>
            </>
          )}
        </>
      )}
    </div>
  )
}

// Composant d'optimisation d'image mobile
interface AfricanMobileImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  priority?: boolean
  placeholder?: string
}

export function AfricanMobileImage({
  src,
  alt,
  priority = false,
  placeholder,
  className,
  ...props
}: AfricanMobileImageProps) {
  const { optimizeImageUrl, shouldCompressImages, isSlowConnection } = useAfricanMobileOptimization()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const optimizedSrc = shouldCompressImages ? optimizeImageUrl(src) : src

  useEffect(() => {
    if (priority && imgRef.current) {
      // Précharger les images prioritaires
      const img = new Image()
      img.src = optimizedSrc
    }
  }, [optimizedSrc, priority])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-african-neutral-100 flex items-center justify-center">
          {isSlowConnection ? (
            <div className="text-center">
              <Image className="w-8 h-8 text-african-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-african-neutral-500">Chargement...</p>
            </div>
          ) : (
            <div className="animate-pulse bg-african-neutral-200 w-full h-full" />
          )}
        </div>
      )}

      {/* Image d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-african-neutral-100 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-african-error-400 mx-auto mb-2" />
            <p className="text-xs text-african-error-500">Erreur de chargement</p>
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading={priority ? 'eager' : 'lazy'}
        {...props}
      />

      {/* Indicateur de compression */}
      {shouldCompressImages && isLoaded && (
        <div className="absolute top-2 right-2">
          <div className="bg-african-warning-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Minimize2 className="w-3 h-3" />
            Optimisé
          </div>
        </div>
      )}
    </div>
  )
}

// Composant de gestion des données mobiles
export function AfricanMobileDataManager({ className }: { className?: string }) {
  const {
    dataUsage,
    settings,
    network,
    dataUsagePercentage,
    toggleDataSaverMode,
    clearCache,
    getOptimizationRecommendations
  } = useAfricanMobileOptimization()

  const [showDetails, setShowDetails] = useState(false)
  const recommendations = getOptimizationRecommendations()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <AfricanCard className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-african-primary-500" />
            <h3 className="font-semibold text-african-primary-700">
              Gestion des Données
            </h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-african-neutral-500 hover:text-african-primary-600"
          >
            {showDetails ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Utilisation des données */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-african-neutral-600">Utilisation session</span>
            <span className="font-medium text-african-primary-700">
              {formatBytes(dataUsage.sessionBytes)}
            </span>
          </div>
          
          <div className="w-full bg-african-neutral-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                dataUsagePercentage > 80 ? 'bg-african-error-500' :
                dataUsagePercentage > 50 ? 'bg-african-warning-500' :
                'bg-african-success-500'
              )}
              style={{ width: `${Math.min(dataUsagePercentage, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-african-neutral-500">
            <span>0 MB</span>
            <span>{Math.round(dataUsagePercentage)}% utilisé</span>
            <span>100 MB</span>
          </div>
        </div>

        {/* Mode économie de données */}
        <div className="flex items-center justify-between p-3 bg-african-neutral-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className={cn(
              'w-4 h-4',
              settings.dataSaverMode ? 'text-african-success-500' : 'text-african-neutral-400'
            )} />
            <span className="text-sm font-medium text-african-neutral-700">
              Mode Économie
            </span>
          </div>
          
          <button
            onClick={() => toggleDataSaverMode(!settings.dataSaverMode)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              settings.dataSaverMode ? 'bg-african-success-500' : 'bg-african-neutral-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.dataSaverMode ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Détails étendus */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-african-neutral-200">
            {/* Qualité d'image */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-african-neutral-600">Qualité images</span>
              <span className="text-sm font-medium text-african-primary-700 capitalize">
                {settings.imageQuality}
              </span>
            </div>

            {/* Type de réseau */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-african-neutral-600">Réseau</span>
              <span className="text-sm font-medium text-african-primary-700">
                {network.effectiveType.toUpperCase()} ({Math.round(network.downlink)} Mbps)
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <AfricanButton
                variant="outline"
                size="sm"
                onClick={clearCache}
                icon={<HardDrive className="w-4 h-4" />}
                className="flex-1"
              >
                Vider Cache
              </AfricanButton>
              
              <AfricanButton
                variant="outline"
                size="sm"
                icon={<Settings className="w-4 h-4" />}
                className="flex-1"
              >
                Paramètres
              </AfricanButton>
            </div>
          </div>
        )}

        {/* Recommandations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-african-neutral-200">
            <h4 className="text-sm font-medium text-african-primary-700 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Recommandations
            </h4>
            {recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="text-xs text-african-neutral-600 bg-african-warning-50 p-2 rounded">
                {rec}
              </div>
            ))}
          </div>
        )}
      </div>
    </AfricanCard>
  )
}

// Composant de synchronisation offline
export function AfricanMobileOfflineSync({ className }: { className?: string }) {
  const {
    offline,
    network,
    smartSync,
    saveForLaterSync
  } = useAfricanMobileOptimization()

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await smartSync()
    } finally {
      setIsSyncing(false)
    }
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Jamais'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes}min`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    
    const days = Math.floor(hours / 24)
    return `Il y a ${days}j`
  }

  return (
    <AfricanCard className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              network.isOnline ? 'bg-african-success-500' : 'bg-african-error-500'
            )} />
            <h3 className="font-semibold text-african-primary-700">
              Synchronisation
            </h3>
          </div>
          
          <AfricanButton
            variant="outline"
            size="sm"
            onClick={handleSync}
            loading={isSyncing}
            disabled={!network.isOnline || offline.pendingSyncItems === 0}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Sync
          </AfricanButton>
        </div>

        {/* Statut */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-african-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-african-primary-700">
              {offline.pendingSyncItems}
            </div>
            <div className="text-xs text-african-neutral-600">
              En attente
            </div>
          </div>
          
          <div className="text-center p-3 bg-african-neutral-50 rounded-lg">
            <div className="text-lg font-semibold text-african-success-700">
              {formatTimeAgo(offline.lastSyncTime)}
            </div>
            <div className="text-xs text-african-neutral-600">
              Dernière sync
            </div>
          </div>
        </div>

        {/* Mode hors ligne */}
        <div className="flex items-center justify-between p-3 bg-african-accent-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-african-accent-600" />
            <span className="text-sm font-medium text-african-accent-700">
              Mode Hors Ligne
            </span>
          </div>
          
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            offline.isOfflineReady 
              ? 'bg-african-success-100 text-african-success-700'
              : 'bg-african-warning-100 text-african-warning-700'
          )}>
            {offline.isOfflineReady ? 'Prêt' : 'Non configuré'}
          </div>
        </div>

        {/* Alertes */}
        {!network.isOnline && offline.pendingSyncItems > 0 && (
          <div className="flex items-start gap-2 p-3 bg-african-warning-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-african-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-african-warning-700">
              <p className="font-medium">Synchronisation en attente</p>
              <p className="text-xs mt-1">
                {offline.pendingSyncItems} éléments seront synchronisés dès que vous serez en ligne.
              </p>
            </div>
          </div>
        )}

        {network.isOnline && network.effectiveType === '2g' && offline.pendingSyncItems > 5 && (
          <div className="flex items-start gap-2 p-3 bg-african-info-50 rounded-lg">
            <Gauge className="w-4 h-4 text-african-info-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-african-info-700">
              <p className="font-medium">Connexion lente détectée</p>
              <p className="text-xs mt-1">
                La synchronisation peut prendre plus de temps sur réseau 2G.
              </p>
            </div>
          </div>
        )}
      </div>
    </AfricanCard>
  )
}

// Composant de performance mobile
export function AfricanMobilePerformanceIndicator({ className }: { className?: string }) {
  const {
    performance,
    network,
    connectionQuality,
    shouldReduceAnimations
  } = useAfricanMobileOptimization()

  const getPerformanceColor = (value: number, thresholds: { good: number, poor: number }) => {
    if (value <= thresholds.good) return 'text-african-success-600'
    if (value <= thresholds.poor) return 'text-african-warning-600'
    return 'text-african-error-600'
  }

  const getPerformanceIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-african-success-500" />
      case 'good':
        return <CheckCircle className="w-4 h-4 text-african-warning-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-african-error-500" />
    }
  }

  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      {/* Qualité de connexion */}
      <div className="flex items-center gap-1">
        {getPerformanceIcon(connectionQuality)}
        <span className="text-african-neutral-600 capitalize">
          {connectionQuality}
        </span>
      </div>

      {/* Temps de chargement */}
      {performance.loadTime > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-african-neutral-400" />
          <span className={getPerformanceColor(performance.loadTime, { good: 2000, poor: 5000 })}>
            {Math.round(performance.loadTime)}ms
          </span>
        </div>
      )}

      {/* Indicateur d'animations réduites */}
      {shouldReduceAnimations && (
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-african-warning-500" />
          <span className="text-african-warning-600 text-xs">
            Mode rapide
          </span>
        </div>
      )}
    </div>
  )
}

// Export des composants
export {
  AfricanMobileNetworkStatus,
  AfricanMobileImage,
  AfricanMobileDataManager,
  AfricanMobileOfflineSync,
  AfricanMobilePerformanceIndicator
}

