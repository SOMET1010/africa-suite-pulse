/**
 * Composant PWA Mobile Optimisé pour l'Afrique
 * Interface mobile avec optimisations spécifiques aux connexions africaines
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useAfricanMobileOptimization } from '../../../hooks/useAfricanMobileOptimization'
import { Card, CardContent, CardHeader, CardTitle } from '../card'
import { Button } from '../button'
import { Badge } from '../badge'
import { Progress } from '../progress'
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  Battery, 
  Signal,
  Settings,
  Smartphone,
  Globe,
  Zap,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react'

interface AfricanMobilePWAProps {
  className?: string
  showAdvancedMetrics?: boolean
}

export const AfricanMobilePWA: React.FC<AfricanMobilePWAProps> = ({
  className = '',
  showAdvancedMetrics = false
}) => {
  const mobileOptimization = useAfricanMobileOptimization()
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Gérer l'installation PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallPromptVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Installer l'application
  const handleInstallApp = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('🎉 PWA installée avec succès')
      }
      
      setDeferredPrompt(null)
      setIsInstallPromptVisible(false)
    }
  }, [deferredPrompt])

  // Obtenir l'icône de signal selon la qualité
  const getSignalIcon = (connectionQuality: string) => {
    switch (connectionQuality) {
      case 'excellent':
        return <Signal className="w-5 h-5 text-green-500" />
      case 'good':
        return <Signal className="w-5 h-5 text-yellow-500" />
      case 'poor':
        return <Signal className="w-5 h-5 text-red-500" />
      default:
        return <WifiOff className="w-5 h-5 text-gray-500" />
    }
  }

  // Obtenir la couleur selon l'utilisation des données
  const getDataUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Formater la taille des données
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Formater la durée
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className={`african-mobile-pwa space-y-6 ${className}`}>
      {/* En-tête avec statut de connexion */}
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-amber-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <span>Africa Suite PWA</span>
            </div>
            <div className="flex items-center gap-2">
              {mobileOptimization.isOnline ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3 mr-1" />
                  En ligne
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Hors ligne
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Qualité de connexion */}
            <div className="flex items-center gap-2">
              {getSignalIcon(mobileOptimization.connectionQuality)}
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {mobileOptimization.network.effectiveType?.toUpperCase() || 'Inconnu'}
                </p>
                <p className="text-xs text-amber-600">
                  {mobileOptimization.network.downlink}Mbps
                </p>
              </div>
            </div>

            {/* Mode économie de données */}
            <div className="flex items-center gap-2">
              <Battery className={`w-5 h-5 ${
                mobileOptimization.settings.dataSaverMode ? 'text-green-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {mobileOptimization.settings.dataSaverMode ? 'Économie' : 'Normal'}
                </p>
                <p className="text-xs text-amber-600">
                  Mode données
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation PWA */}
      {isInstallPromptVisible && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Installer l'application
                  </h3>
                  <p className="text-sm text-blue-600">
                    Accès rapide et fonctionnement hors ligne
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleInstallApp}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Installer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Utilisation des données */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Globe className="w-5 h-5" />
            Utilisation des données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-orange-700">Session actuelle</span>
              <span className="text-orange-600">
                {mobileOptimization.dataUsagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={mobileOptimization.dataUsagePercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-orange-600 mt-1">
              <span>{formatBytes(mobileOptimization.dataUsage.sessionBytes)}</span>
              <span>100MB/jour</span>
            </div>
          </div>

          {/* Actions de gestion des données */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mobileOptimization.toggleDataSaverMode(!mobileOptimization.settings.dataSaverMode)}
              className={`flex-1 ${
                mobileOptimization.settings.dataSaverMode 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'border-orange-200'
              }`}
            >
              <Zap className="w-4 h-4 mr-1" />
              {mobileOptimization.settings.dataSaverMode ? 'Économie ON' : 'Économie OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={mobileOptimization.clearCache}
              className="border-orange-200"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Vider cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Capacités hors ligne */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Database className="w-5 h-5" />
            Mode hors ligne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut offline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mobileOptimization.offline.isOfflineReady ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm font-medium text-purple-800">
                {mobileOptimization.offline.isOfflineReady ? 'Prêt' : 'Non configuré'}
              </span>
            </div>
            <Badge variant={mobileOptimization.offline.isOfflineReady ? 'default' : 'secondary'}>
              {mobileOptimization.offline.isOfflineReady ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          {/* Éléments en attente de sync */}
          {mobileOptimization.offline.pendingSyncItems > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {mobileOptimization.offline.pendingSyncItems} éléments à synchroniser
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={mobileOptimization.smartSync}
                disabled={!mobileOptimization.isOnline}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>
            </div>
          )}

          {/* Dernière synchronisation */}
          {mobileOptimization.offline.lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Clock className="w-4 h-4" />
              <span>
                Dernière sync: {mobileOptimization.offline.lastSyncTime.toLocaleString('fr-FR')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques avancées */}
      {showAdvancedMetrics && (
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Settings className="w-5 h-5" />
              Métriques de performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Temps de chargement */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">
                  {formatDuration(mobileOptimization.performance.loadTime)}
                </p>
                <p className="text-xs text-gray-600">Temps de chargement</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">
                  {formatDuration(mobileOptimization.performance.renderTime)}
                </p>
                <p className="text-xs text-gray-600">Temps de rendu</p>
              </div>
            </div>

            {/* Informations réseau détaillées */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Latence (RTT):</span>
                <span className="font-medium">{mobileOptimization.network.rtt}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Débit descendant:</span>
                <span className="font-medium">{mobileOptimization.network.downlink} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type de connexion:</span>
                <span className="font-medium">{mobileOptimization.network.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Économie de données:</span>
                <span className="font-medium">
                  {mobileOptimization.network.saveData ? 'Activée' : 'Désactivée'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations d'optimisation */}
      {mobileOptimization.getOptimizationRecommendations().length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="w-5 h-5" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mobileOptimization.getOptimizationRecommendations().map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Styles CSS intégrés pour les motifs africains */}
      <style jsx>{`
        .african-mobile-pwa {
          background: linear-gradient(135deg, 
            rgba(139, 69, 19, 0.05) 0%, 
            rgba(210, 105, 30, 0.05) 50%, 
            rgba(205, 133, 63, 0.05) 100%
          );
          border-radius: 20px;
          padding: 20px;
        }

        .african-mobile-pwa::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(210, 105, 30, 0.1) 2px, transparent 2px);
          background-size: 40px 40px;
          pointer-events: none;
          border-radius: 20px;
        }

        @media (max-width: 480px) {
          .african-mobile-pwa {
            padding: 15px;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default AfricanMobilePWA

