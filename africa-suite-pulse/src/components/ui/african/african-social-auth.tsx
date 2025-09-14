/**
 * Composants d'Authentification Sociale Africaine
 * Interface de connexion avec réseaux sociaux et design culturel
 */

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { AfricanCard } from './african-card'
import { AfricanButton } from './african-button'
import { useAfricanTheme } from '@/components/providers/african-theme-provider'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone,
  MapPin,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Icônes des réseaux sociaux
const SocialIcons = {
  Google: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  
  Facebook: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  
  Microsoft: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#F25022" d="M0 0h11.377v11.372H0z"/>
      <path fill="#00A4EF" d="M12.623 0H24v11.372H12.623z"/>
      <path fill="#7FBA00" d="M0 12.628h11.377V24H0z"/>
      <path fill="#FFB900" d="M12.623 12.628H24V24H12.623z"/>
    </svg>
  ),
  
  Apple: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
      <path fill="currentColor" d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  ),
  
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

interface AfricanSocialAuthProps {
  mode?: 'login' | 'register'
  onModeChange?: (mode: 'login' | 'register') => void
  onSocialLogin?: (provider: string) => void
  onEmailLogin?: (email: string, password: string) => void
  onEmailRegister?: (data: RegisterData) => void
  className?: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  country?: string
}

export function AfricanSocialAuth({
  mode = 'login',
  onModeChange,
  onSocialLogin,
  onEmailLogin,
  onEmailRegister,
  className
}: AfricanSocialAuthProps) {
  const { isAfricanTheme } = useAfricanTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    country: ''
  })

  const handleSocialLogin = async (provider: string) => {
    setLoading(provider)
    try {
      await onSocialLogin?.(provider)
    } finally {
      setLoading(null)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('email')
    
    try {
      if (mode === 'login') {
        await onEmailLogin?.(formData.email, formData.password)
      } else {
        await onEmailRegister?.(formData)
      }
    } finally {
      setLoading(null)
    }
  }

  const socialProviders = [
    { 
      name: 'Google', 
      icon: SocialIcons.Google, 
      color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      description: 'Connexion rapide avec Google'
    },
    { 
      name: 'Facebook', 
      icon: SocialIcons.Facebook, 
      color: 'bg-[#1877F2] text-white hover:bg-[#166FE5]',
      description: 'Connexion avec Facebook'
    },
    { 
      name: 'Microsoft', 
      icon: SocialIcons.Microsoft, 
      color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      description: 'Connexion professionnelle Microsoft'
    },
    { 
      name: 'Apple', 
      icon: SocialIcons.Apple, 
      color: 'bg-black text-white hover:bg-gray-800',
      description: 'Connexion sécurisée avec Apple'
    }
  ]

  return (
    <div className={cn(
      'w-full max-w-md mx-auto',
      className
    )}>
      <AfricanCard 
        variant="pattern" 
        pattern="bogolan" 
        patternIntensity="light"
        className="overflow-hidden"
      >
        {/* Header avec design africain */}
        <div className="bg-gradient-to-r from-african-primary-500 to-african-primary-600 p-6 text-white text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-african-secondary-400 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🌍</span>
            </div>
            <h1 className="text-2xl font-bold font-heading">
              Africa Suite Pulse
            </h1>
            <p className="text-african-neutral-100 text-sm mt-1">
              Plateforme Hôtelière Authentiquement Africaine
            </p>
          </div>
          
          {/* Toggle mode */}
          <div className="flex bg-african-primary-700 rounded-lg p-1">
            <button
              onClick={() => onModeChange?.('login')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                mode === 'login'
                  ? 'bg-white text-african-primary-600 shadow-sm'
                  : 'text-african-neutral-200 hover:text-white'
              )}
            >
              Connexion
            </button>
            <button
              onClick={() => onModeChange?.('register')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                mode === 'register'
                  ? 'bg-white text-african-primary-600 shadow-sm'
                  : 'text-african-neutral-200 hover:text-white'
              )}
            >
              Inscription
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Authentification sociale */}
          <div>
            <p className="text-center text-sm text-african-neutral-600 mb-4">
              {mode === 'login' ? 'Connectez-vous avec' : 'Inscrivez-vous avec'}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSocialLogin(provider.name.toLowerCase())}
                  disabled={loading !== null}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200',
                    'hover:scale-105 hover:shadow-md',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    provider.color
                  )}
                  title={provider.description}
                >
                  {loading === provider.name.toLowerCase() ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <provider.icon />
                  )}
                  <span className="text-sm font-medium">
                    {provider.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-african-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-african-neutral-500">
                ou avec votre email
              </span>
            </div>
          </div>

          {/* Formulaire email */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                      placeholder="Amadou"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                      placeholder="Diallo"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                  placeholder="amadou@exemple.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-african-neutral-400 hover:text-african-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-african-neutral-700 mb-1">
                    Pays
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-african-neutral-400" />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-african-neutral-300 rounded-lg focus:ring-2 focus:ring-african-primary-500 focus:border-african-primary-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="SN">🇸🇳 Sénégal</option>
                      <option value="ML">🇲🇱 Mali</option>
                      <option value="BF">🇧🇫 Burkina Faso</option>
                      <option value="CI">🇨🇮 Côte d'Ivoire</option>
                      <option value="GH">🇬🇭 Ghana</option>
                      <option value="NG">🇳🇬 Nigeria</option>
                      <option value="KE">🇰🇪 Kenya</option>
                      <option value="ZA">🇿🇦 Afrique du Sud</option>
                      <option value="MA">🇲🇦 Maroc</option>
                      <option value="TN">🇹🇳 Tunisie</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <AfricanButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading === 'email'}
              pattern="subtle"
            >
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </AfricanButton>
          </form>

          {/* Liens additionnels */}
          <div className="text-center space-y-2">
            {mode === 'login' && (
              <button className="text-sm text-african-primary-600 hover:text-african-primary-700 hover:underline">
                Mot de passe oublié ?
              </button>
            )}
            
            <p className="text-xs text-african-neutral-500">
              En continuant, vous acceptez nos{' '}
              <a href="#" className="text-african-primary-600 hover:underline">
                Conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-african-primary-600 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </AfricanCard>
    </div>
  )
}

// Composant de succès d'authentification
export function AfricanAuthSuccess({ 
  user, 
  onContinue 
}: { 
  user: { name: string; email: string }
  onContinue: () => void 
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <AfricanCard variant="accent" className="text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-african-success-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-african-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-african-primary-700 font-heading mb-2">
            Bienvenue !
          </h2>
          <p className="text-african-neutral-600">
            Connexion réussie, {user.name}
          </p>
        </div>
        
        <div className="bg-african-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-african-neutral-600">
            Vous êtes maintenant connecté à <strong>Africa Suite Pulse</strong>
          </p>
          <p className="text-xs text-african-neutral-500 mt-1">
            {user.email}
          </p>
        </div>
        
        <AfricanButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onContinue}
        >
          Accéder au tableau de bord
        </AfricanButton>
      </AfricanCard>
    </div>
  )
}

// Export des composants
export default AfricanSocialAuth

