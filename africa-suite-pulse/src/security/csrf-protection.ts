/**
 * Protection CSRF - Africa Suite Pulse
 * Système de protection contre les attaques Cross-Site Request Forgery
 */

import crypto from 'crypto'

export interface CSRFConfig {
  secretKey: string
  tokenLength: number
  cookieName: string
  headerName: string
  sessionTimeout: number // minutes
}

export interface CSRFToken {
  token: string
  timestamp: number
  sessionId: string
}

// Configuration par défaut
const defaultConfig: CSRFConfig = {
  secretKey: process.env.CSRF_SECRET_KEY || crypto.randomBytes(32).toString('hex'),
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  sessionTimeout: 60 // 1 heure
}

export class CSRFProtection {
  private config: CSRFConfig
  private tokenStore: Map<string, CSRFToken> = new Map()

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    
    // Validation de la clé secrète
    if (this.config.secretKey.length < 32) {
      throw new Error('CSRF secret key must be at least 32 characters long')
    }

    // Nettoyage périodique des tokens expirés
    setInterval(() => this.cleanExpiredTokens(), 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Générer un token CSRF sécurisé
   */
  generateToken(sessionId: string): string {
    const tokenData = crypto.randomBytes(this.config.tokenLength).toString('hex')
    const timestamp = Date.now()
    
    // Créer une signature HMAC pour vérifier l'intégrité
    const signature = this.createSignature(tokenData, sessionId, timestamp)
    const token = `${tokenData}.${timestamp}.${signature}`
    
    // Stocker le token
    this.tokenStore.set(token, {
      token: tokenData,
      timestamp,
      sessionId
    })

    return token
  }

  /**
   * Valider un token CSRF
   */
  validateToken(token: string, sessionId: string): boolean {
    try {
      if (!token || !sessionId) {
        return false
      }

      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      const [tokenData, timestampStr, signature] = parts
      const timestamp = parseInt(timestampStr)

      // Vérifier l'expiration
      const now = Date.now()
      const maxAge = this.config.sessionTimeout * 60 * 1000
      if (now - timestamp > maxAge) {
        this.tokenStore.delete(token)
        return false
      }

      // Vérifier la signature
      const expectedSignature = this.createSignature(tokenData, sessionId, timestamp)
      if (!this.constantTimeCompare(signature, expectedSignature)) {
        return false
      }

      // Vérifier que le token existe dans le store
      const storedToken = this.tokenStore.get(token)
      if (!storedToken || storedToken.sessionId !== sessionId) {
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la validation du token CSRF:', error)
      return false
    }
  }

  /**
   * Invalider un token CSRF (usage unique)
   */
  invalidateToken(token: string): void {
    this.tokenStore.delete(token)
  }

  /**
   * Créer une signature HMAC
   */
  private createSignature(tokenData: string, sessionId: string, timestamp: number): string {
    const data = `${tokenData}.${sessionId}.${timestamp}`
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(data)
      .digest('hex')
  }

  /**
   * Comparaison en temps constant pour éviter les attaques de timing
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * Nettoyer les tokens expirés
   */
  private cleanExpiredTokens(): void {
    const now = Date.now()
    const maxAge = this.config.sessionTimeout * 60 * 1000

    for (const [token, data] of this.tokenStore.entries()) {
      if (now - data.timestamp > maxAge) {
        this.tokenStore.delete(token)
      }
    }
  }

  /**
   * Obtenir les statistiques des tokens
   */
  getStats(): {
    activeTokens: number
    oldestToken: number | null
    newestToken: number | null
  } {
    const tokens = Array.from(this.tokenStore.values())
    
    return {
      activeTokens: tokens.length,
      oldestToken: tokens.length > 0 ? Math.min(...tokens.map(t => t.timestamp)) : null,
      newestToken: tokens.length > 0 ? Math.max(...tokens.map(t => t.timestamp)) : null
    }
  }
}

// Instance singleton
export const csrfProtection = new CSRFProtection()

// Middleware Express pour la protection CSRF
export const csrfMiddleware = (req: any, res: any, next: any) => {
  // Générer un token pour les requêtes GET
  if (req.method === 'GET') {
    const sessionId = req.session?.id || req.sessionID || 'anonymous'
    const token = csrfProtection.generateToken(sessionId)
    
    // Ajouter le token aux cookies et aux headers
    res.cookie(csrfProtection.config.cookieName, token, {
      httpOnly: false, // Accessible en JavaScript pour les formulaires
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: csrfProtection.config.sessionTimeout * 60 * 1000
    })
    
    res.locals.csrfToken = token
    return next()
  }

  // Valider le token pour les requêtes de modification
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const sessionId = req.session?.id || req.sessionID || 'anonymous'
    const token = req.headers[csrfProtection.config.headerName.toLowerCase()] || 
                  req.body.csrf_token || 
                  req.cookies[csrfProtection.config.cookieName]

    if (!token) {
      return res.status(403).json({
        error: 'Token CSRF manquant',
        code: 'CSRF_TOKEN_MISSING'
      })
    }

    if (!csrfProtection.validateToken(token, sessionId)) {
      return res.status(403).json({
        error: 'Token CSRF invalide ou expiré',
        code: 'CSRF_TOKEN_INVALID'
      })
    }

    // Invalider le token après usage (protection contre la réutilisation)
    csrfProtection.invalidateToken(token)
  }

  next()
}

// Helper pour React/Vue - Hook pour obtenir le token CSRF
export const useCSRFToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  // Récupérer le token depuis les cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  return getCookie(defaultConfig.cookieName)
}

// Helper pour ajouter automatiquement le token CSRF aux requêtes fetch
export const fetchWithCSRF = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = useCSRFToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set(defaultConfig.headerName, token)
  }

  return fetch(url, {
    ...options,
    headers
  })
}

// Composant React pour les formulaires avec protection CSRF
export const CSRFTokenInput: React.FC = () => {
  const token = useCSRFToken()
  
  if (!token) {
    return null
  }

  return (
    <input
      type="hidden"
      name="csrf_token"
      value={token}
    />
  )
}

// Validation de la configuration CSRF
export const validateCSRFEnvironment = (): boolean => {
  if (!process.env.CSRF_SECRET_KEY) {
    console.warn('CSRF_SECRET_KEY not set, using generated key (not recommended for production)')
    return false
  }

  if (process.env.CSRF_SECRET_KEY.length < 32) {
    console.error('CSRF_SECRET_KEY must be at least 32 characters long')
    return false
  }

  return true
}

// Générateur de clé secrète CSRF
export const generateCSRFSecret = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// Export des types et constantes
export { CSRFConfig, CSRFToken }
export default csrfProtection

