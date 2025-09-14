/**
 * Système d'Authentification Sécurisé - Africa Suite Pulse
 * Correction des vulnérabilités critiques identifiées
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Types de sécurité
export interface SecureUser {
  id: string
  username: string
  email: string
  passwordHash: string
  salt: string
  role: 'admin' | 'manager' | 'staff' | 'user'
  isActive: boolean
  lastLogin: Date | null
  failedLoginAttempts: number
  lockedUntil: Date | null
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  success: boolean
  user?: Omit<SecureUser, 'passwordHash' | 'salt' | 'twoFactorSecret'>
  token?: string
  refreshToken?: string
  error?: string
  requiresTwoFactor?: boolean
}

export interface SecurityConfig {
  jwtSecret: string
  jwtRefreshSecret: string
  bcryptRounds: number
  maxFailedAttempts: number
  lockoutDuration: number // minutes
  sessionTimeout: number // minutes
  requireTwoFactor: boolean
}

// Configuration sécurisée depuis variables d'environnement
const getSecurityConfig = (): SecurityConfig => {
  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets must be set in environment variables')
  }

  if (jwtSecret.length < 32 || jwtRefreshSecret.length < 32) {
    throw new Error('JWT secrets must be at least 32 characters long')
  }

  return {
    jwtSecret,
    jwtRefreshSecret,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '30'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '480'), // 8 heures
    requireTwoFactor: process.env.REQUIRE_2FA === 'true'
  }
}

export class SecureAuthService {
  private config: SecurityConfig
  private supabase: any

  constructor() {
    this.config = getSecurityConfig()
    
    // Initialiser Supabase si disponible
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  /**
   * Hacher un mot de passe de manière sécurisée
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    // Validation de la force du mot de passe
    if (!this.isPasswordStrong(password)) {
      throw new Error('Le mot de passe ne respecte pas les critères de sécurité')
    }

    const salt = await bcrypt.genSalt(this.config.bcryptRounds)
    const hash = await bcrypt.hash(password, salt)
    
    return { hash, salt }
  }

  /**
   * Vérifier un mot de passe
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error)
      return false
    }
  }

  /**
   * Valider la force d'un mot de passe
   */
  private isPasswordStrong(password: string): boolean {
    // Critères de sécurité pour l'Afrique
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar
  }

  /**
   * Authentifier un utilisateur
   */
  async authenticateUser(username: string, password: string, ipAddress?: string): Promise<AuthResult> {
    try {
      // Validation des entrées
      if (!username || !password) {
        return { success: false, error: 'Nom d\'utilisateur et mot de passe requis' }
      }

      // Nettoyer les entrées pour prévenir les injections
      const cleanUsername = this.sanitizeInput(username)
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await this.getUserByUsername(cleanUsername)
      
      if (!user) {
        // Délai artificiel pour prévenir l'énumération des utilisateurs
        await this.artificialDelay()
        return { success: false, error: 'Identifiants invalides' }
      }

      // Vérifier si le compte est verrouillé
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { 
          success: false, 
          error: `Compte verrouillé jusqu'à ${user.lockedUntil.toLocaleString('fr-FR')}` 
        }
      }

      // Vérifier le mot de passe
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash)
      
      if (!isPasswordValid) {
        // Incrémenter les tentatives échouées
        await this.handleFailedLogin(user.id)
        return { success: false, error: 'Identifiants invalides' }
      }

      // Réinitialiser les tentatives échouées
      await this.resetFailedAttempts(user.id)

      // Vérifier si 2FA est requis
      if (user.twoFactorEnabled || this.config.requireTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          error: 'Authentification à deux facteurs requise'
        }
      }

      // Générer les tokens
      const tokens = await this.generateTokens(user)
      
      // Mettre à jour la dernière connexion
      await this.updateLastLogin(user.id, ipAddress)

      // Enregistrer l'événement de sécurité
      await this.logSecurityEvent('LOGIN_SUCCESS', user.id, ipAddress)

      return {
        success: true,
        user: this.sanitizeUserForResponse(user),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }

    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error)
      await this.logSecurityEvent('LOGIN_ERROR', undefined, ipAddress, error.message)
      return { success: false, error: 'Erreur interne du serveur' }
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  async registerUser(userData: {
    username: string
    email: string
    password: string
    role?: string
  }): Promise<AuthResult> {
    try {
      // Validation des entrées
      const { username, email, password, role = 'user' } = userData
      
      if (!username || !email || !password) {
        return { success: false, error: 'Tous les champs sont requis' }
      }

      // Nettoyer les entrées
      const cleanUsername = this.sanitizeInput(username)
      const cleanEmail = this.sanitizeInput(email)

      // Valider l'email
      if (!this.isValidEmail(cleanEmail)) {
        return { success: false, error: 'Format d\'email invalide' }
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.getUserByUsername(cleanUsername)
      if (existingUser) {
        return { success: false, error: 'Nom d\'utilisateur déjà utilisé' }
      }

      const existingEmail = await this.getUserByEmail(cleanEmail)
      if (existingEmail) {
        return { success: false, error: 'Email déjà utilisé' }
      }

      // Hacher le mot de passe
      const { hash, salt } = await this.hashPassword(password)

      // Créer l'utilisateur
      const newUser: Omit<SecureUser, 'id' | 'createdAt' | 'updatedAt'> = {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: hash,
        salt,
        role: role as any,
        isActive: true,
        lastLogin: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        twoFactorEnabled: false
      }

      const userId = await this.createUser(newUser)
      
      // Enregistrer l'événement de sécurité
      await this.logSecurityEvent('USER_REGISTERED', userId)

      return {
        success: true,
        user: {
          id: userId,
          username: cleanUsername,
          email: cleanEmail,
          role: role as any,
          isActive: true,
          lastLogin: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { success: false, error: 'Erreur lors de la création du compte' }
    }
  }

  /**
   * Générer des tokens JWT sécurisés
   */
  private async generateTokens(user: SecureUser): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    }

    const accessToken = jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: `${this.config.sessionTimeout}m`,
      issuer: 'africa-suite-pulse',
      audience: 'africa-suite-users'
    })

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.config.jwtRefreshSecret,
      {
        expiresIn: '7d',
        issuer: 'africa-suite-pulse',
        audience: 'africa-suite-users'
      }
    )

    return { accessToken, refreshToken }
  }

  /**
   * Valider un token JWT
   */
  async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.config.jwtSecret, {
        issuer: 'africa-suite-pulse',
        audience: 'africa-suite-users'
      })
    } catch (error) {
      throw new Error('Token invalide ou expiré')
    }
  }

  /**
   * Nettoyer les entrées utilisateur
   */
  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>\"'%;()&+]/g, '') // Supprimer les caractères dangereux
      .substring(0, 255) // Limiter la longueur
  }

  /**
   * Valider un email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Délai artificiel pour prévenir les attaques de timing
   */
  private async artificialDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500 // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Gérer les tentatives de connexion échouées
   */
  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await this.getUserById(userId)
    if (!user) return

    const failedAttempts = user.failedLoginAttempts + 1
    let lockedUntil = null

    if (failedAttempts >= this.config.maxFailedAttempts) {
      lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000)
      await this.logSecurityEvent('ACCOUNT_LOCKED', userId)
    }

    await this.updateFailedAttempts(userId, failedAttempts, lockedUntil)
  }

  /**
   * Réinitialiser les tentatives échouées
   */
  private async resetFailedAttempts(userId: string): Promise<void> {
    await this.updateFailedAttempts(userId, 0, null)
  }

  /**
   * Nettoyer les données utilisateur pour la réponse
   */
  private sanitizeUserForResponse(user: SecureUser): Omit<SecureUser, 'passwordHash' | 'salt' | 'twoFactorSecret'> {
    const { passwordHash, salt, twoFactorSecret, ...safeUser } = user
    return safeUser
  }

  // Méthodes de base de données (à implémenter selon le backend choisi)
  private async getUserByUsername(username: string): Promise<SecureUser | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('secure_users')
        .select('*')
        .eq('username', username)
        .single()
      
      return error ? null : data
    }
    
    // Fallback pour base de données locale ou Elyx
    return null
  }

  private async getUserByEmail(email: string): Promise<SecureUser | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('secure_users')
        .select('*')
        .eq('email', email)
        .single()
      
      return error ? null : data
    }
    
    return null
  }

  private async getUserById(userId: string): Promise<SecureUser | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('secure_users')
        .select('*')
        .eq('id', userId)
        .single()
      
      return error ? null : data
    }
    
    return null
  }

  private async createUser(user: Omit<SecureUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('secure_users')
        .insert([{
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single()
      
      if (error) throw error
      return data.id
    }
    
    // Fallback - générer un ID temporaire
    return crypto.randomUUID()
  }

  private async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
    if (this.supabase) {
      await this.supabase
        .from('secure_users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
  }

  private async updateFailedAttempts(userId: string, attempts: number, lockedUntil: Date | null): Promise<void> {
    if (this.supabase) {
      await this.supabase
        .from('secure_users')
        .update({ 
          failed_login_attempts: attempts,
          locked_until: lockedUntil?.toISOString() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
  }

  private async logSecurityEvent(
    event: string, 
    userId?: string, 
    ipAddress?: string, 
    details?: string
  ): Promise<void> {
    if (this.supabase) {
      await this.supabase
        .from('security_logs')
        .insert([{
          event_type: event,
          user_id: userId || null,
          ip_address: ipAddress || null,
          details: details || null,
          created_at: new Date().toISOString()
        }])
    }
    
    // Log local pour debugging
    console.log(`[SECURITY] ${event}`, { userId, ipAddress, details })
  }
}

// Export du service singleton
export const secureAuth = new SecureAuthService()

// Middleware d'authentification pour Express/Flask
export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' })
    }

    const payload = await secureAuth.validateToken(token)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

// Générateur de clés secrètes sécurisées
export const generateSecureSecret = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex')
}

// Validation des variables d'environnement de sécurité
export const validateSecurityEnvironment = (): boolean => {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Variables d\'environnement manquantes:', missing)
    return false
  }

  return true
}

