/**
 * Page d'Authentification Africaine
 * Interface complète de connexion/inscription avec design culturel
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AfricanSocialAuth, AfricanAuthSuccess } from '@/components/ui/african/african-social-auth'
import { useAfricanSocialAuth } from '@/hooks/useAfricanSocialAuth'
import { AfricanThemeToggle } from '@/components/providers/african-theme-provider'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'

export default function AfricanAuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    handleSocialLogin,
    handleEmailLogin,
    handleEmailRegister,
    clearError,
    checkAuth
  } = useAfricanSocialAuth()

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (checkAuth()) {
      navigate('/dashboard')
    }
  }, [checkAuth, navigate])

  // Surveiller le statut de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Afficher le succès quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      setShowSuccess(true)
    }
  }, [isAuthenticated, user])

  const handleSocialLoginWrapper = async (provider: string) => {
    clearError()
    await handleSocialLogin(provider)
  }

  const handleEmailLoginWrapper = async (email: string, password: string) => {
    clearError()
    await handleEmailLogin(email, password)
  }

  const handleEmailRegisterWrapper = async (data: any) => {
    clearError()
    await handleEmailRegister(data)
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  if (showSuccess && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-african-neutral-50 to-african-neutral-100 flex items-center justify-center p-4">
        <AfricanAuthSuccess 
          user={user} 
          onContinue={handleContinue}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-african-neutral-50 to-african-neutral-100">
      {/* Header avec informations de connexion */}
      <div className="bg-gradient-to-r from-african-primary-500 to-african-primary-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-african-success-300" />
              ) : (
                <WifiOff className="w-4 h-4 text-african-error-300" />
              )}
              <span className="text-sm">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            
            <div className="hidden sm:block text-sm text-african-neutral-200">
              🌍 Authentification sécurisée pour l'Afrique
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AfricanThemeToggle showLabel={false} />
            
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span>🇸🇳 🇲🇱 🇧🇫 🇨🇮 🇬🇭 🇳🇬</span>
              <span className="text-african-neutral-200">
                Disponible dans toute l'Afrique
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-african-error-50 border border-african-error-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-african-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-african-error-800">
                  Erreur d'authentification
                </h4>
                <p className="text-sm text-african-error-600 mt-1">
                  {error}
                </p>
                <button
                  onClick={clearError}
                  className="text-xs text-african-error-700 hover:text-african-error-800 underline mt-2"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Message hors ligne */}
          {!isOnline && (
            <div className="mb-6 p-4 bg-african-warning-50 border border-african-warning-200 rounded-lg flex items-start space-x-3">
              <WifiOff className="w-5 h-5 text-african-warning-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-african-warning-800">
                  Connexion limitée
                </h4>
                <p className="text-sm text-african-warning-600 mt-1">
                  Vous êtes hors ligne. L'authentification sociale nécessite une connexion internet.
                </p>
              </div>
            </div>
          )}

          {/* Composant d'authentification */}
          <AfricanSocialAuth
            mode={mode}
            onModeChange={setMode}
            onSocialLogin={handleSocialLoginWrapper}
            onEmailLogin={handleEmailLoginWrapper}
            onEmailRegister={handleEmailRegisterWrapper}
          />

          {/* Informations supplémentaires */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-african-neutral-200">
              <h3 className="text-sm font-semibold text-african-primary-700 mb-2">
                🔒 Sécurité Renforcée
              </h3>
              <ul className="text-xs text-african-neutral-600 space-y-1">
                <li>• Chiffrement SSL/TLS 256-bit</li>
                <li>• Authentification à deux facteurs</li>
                <li>• Conformité RGPD et lois africaines</li>
                <li>• Données stockées en Afrique</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-african-secondary-50 to-african-accent-50 rounded-lg p-4 border border-african-secondary-200">
              <h3 className="text-sm font-semibold text-african-primary-700 mb-2">
                🌍 Conçu pour l'Afrique
              </h3>
              <p className="text-xs text-african-neutral-600">
                Interface optimisée pour les connexions mobiles africaines, 
                support multilingue et intégration avec les services de paiement locaux.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-african-neutral-500">
              <a href="#" className="hover:text-african-primary-600 hover:underline">
                Aide
              </a>
              <a href="#" className="hover:text-african-primary-600 hover:underline">
                Confidentialité
              </a>
              <a href="#" className="hover:text-african-primary-600 hover:underline">
                Conditions
              </a>
              <a href="#" className="hover:text-african-primary-600 hover:underline">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-african-neutral-100 border-t border-african-neutral-200 p-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-african-neutral-600">
            © 2024 <strong>Africa Suite Pulse</strong> - Plateforme hôtelière authentiquement africaine
          </p>
          <p className="text-xs text-african-neutral-500 mt-1">
            Développé avec ❤️ pour l'Afrique par <strong>Manus AI</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

