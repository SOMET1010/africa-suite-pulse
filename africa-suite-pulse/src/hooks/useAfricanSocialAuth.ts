/**
 * Hook d'Authentification Sociale Africaine
 * Gestion de l'authentification avec les réseaux sociaux
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  provider: string
  country?: string
  phone?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  country?: string
}

export function useAfricanSocialAuth() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  })

  // Simuler l'authentification sociale (à remplacer par vraie implémentation)
  const handleSocialLogin = useCallback(async (provider: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Simulation d'un délai d'authentification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simuler différents utilisateurs selon le provider
      const mockUsers = {
        google: {
          id: '1',
          email: 'amadou.diallo@gmail.com',
          name: 'Amadou Diallo',
          firstName: 'Amadou',
          lastName: 'Diallo',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          provider: 'google',
          country: 'SN',
          phone: '+221 77 123 45 67'
        },
        facebook: {
          id: '2',
          email: 'fatou.sow@facebook.com',
          name: 'Fatou Sow',
          firstName: 'Fatou',
          lastName: 'Sow',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          provider: 'facebook',
          country: 'ML',
          phone: '+223 66 789 012'
        },
        microsoft: {
          id: '3',
          email: 'ibrahim.traore@outlook.com',
          name: 'Ibrahim Traoré',
          firstName: 'Ibrahim',
          lastName: 'Traoré',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          provider: 'microsoft',
          country: 'BF',
          phone: '+226 70 345 678'
        },
        apple: {
          id: '4',
          email: 'aisha.kone@icloud.com',
          name: 'Aïsha Koné',
          firstName: 'Aïsha',
          lastName: 'Koné',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          provider: 'apple',
          country: 'CI',
          phone: '+225 07 456 789'
        }
      }

      const user = mockUsers[provider as keyof typeof mockUsers]
      
      if (!user) {
        throw new Error(`Provider ${provider} non supporté`)
      }

      // Stocker l'utilisateur dans localStorage (à remplacer par vraie gestion d'état)
      localStorage.setItem('african_auth_user', JSON.stringify(user))
      localStorage.setItem('african_auth_token', `token_${user.id}_${Date.now()}`)

      setAuthState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true
      })

      // Redirection après connexion réussie
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      }))
    }
  }, [navigate])

  // Authentification par email
  const handleEmailLogin = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Validation simple pour la démo
      if (email === 'demo@africasuite.com' && password === 'demo123') {
        const user: User = {
          id: 'demo',
          email,
          name: 'Utilisateur Démo',
          firstName: 'Utilisateur',
          lastName: 'Démo',
          provider: 'email',
          country: 'SN'
        }

        localStorage.setItem('african_auth_user', JSON.stringify(user))
        localStorage.setItem('african_auth_token', `token_demo_${Date.now()}`)

        setAuthState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true
        })

        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        throw new Error('Email ou mot de passe incorrect')
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      }))
    }
  }, [navigate])

  // Inscription par email
  const handleEmailRegister = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Validation simple
      if (data.email && data.password && data.firstName && data.lastName) {
        const user: User = {
          id: `user_${Date.now()}`,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          provider: 'email',
          country: data.country,
          phone: data.phone
        }

        localStorage.setItem('african_auth_user', JSON.stringify(user))
        localStorage.setItem('african_auth_token', `token_${user.id}`)

        setAuthState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true
        })

        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      }))
    }
  }, [navigate])

  // Déconnexion
  const logout = useCallback(() => {
    localStorage.removeItem('african_auth_user')
    localStorage.removeItem('african_auth_token')
    
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false
    })
    
    navigate('/auth')
  }, [navigate])

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem('african_auth_user')
    const storedToken = localStorage.getItem('african_auth_token')
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true
        })
        return true
      } catch (error) {
        // Token invalide, nettoyer
        localStorage.removeItem('african_auth_user')
        localStorage.removeItem('african_auth_token')
      }
    }
    
    return false
  }, [])

  // Réinitialiser l'erreur
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // État
    ...authState,
    
    // Actions
    handleSocialLogin,
    handleEmailLogin,
    handleEmailRegister,
    logout,
    checkAuth,
    clearError,
    
    // Utilitaires
    isGoogleUser: authState.user?.provider === 'google',
    isFacebookUser: authState.user?.provider === 'facebook',
    isMicrosoftUser: authState.user?.provider === 'microsoft',
    isAppleUser: authState.user?.provider === 'apple',
    isEmailUser: authState.user?.provider === 'email',
    
    // Informations utilisateur
    userCountry: authState.user?.country,
    userPhone: authState.user?.phone,
    userAvatar: authState.user?.avatar,
    userFullName: authState.user?.name,
    userFirstName: authState.user?.firstName,
    userLastName: authState.user?.lastName
  }
}

// Hook pour vérifier si l'utilisateur est authentifié
export function useAuthGuard() {
  const { isAuthenticated, checkAuth } = useAfricanSocialAuth()
  const navigate = useNavigate()

  const requireAuth = useCallback(() => {
    if (!checkAuth()) {
      navigate('/auth')
      return false
    }
    return true
  }, [checkAuth, navigate])

  return {
    isAuthenticated,
    requireAuth
  }
}

// Types exportés
export type { User, AuthState, RegisterData }

