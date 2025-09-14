/**
 * Configuration Sécurisée des Variables d'Environnement - Africa Suite Pulse
 * Gestion centralisée et sécurisée de toutes les variables d'environnement
 */

import crypto from 'crypto'

// Types de configuration
export interface SecurityEnvironment {
  // Authentification
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  BCRYPT_ROUNDS: number
  SESSION_TIMEOUT: number
  
  // CSRF Protection
  CSRF_SECRET_KEY: string
  
  // Base de données
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  
  // Elyx Legacy
  ELYX_DB_HOST?: string
  ELYX_DB_PORT?: number
  ELYX_DB_NAME?: string
  ELYX_DB_USER?: string
  ELYX_DB_PASSWORD?: string
  
  // Application
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  CORS_ORIGIN: string[]
  
  // Sécurité avancée
  RATE_LIMIT_WINDOW: number
  RATE_LIMIT_MAX: number
  MAX_FAILED_ATTEMPTS: number
  LOCKOUT_DURATION: number
  
  // Monitoring
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug'
  ENABLE_SECURITY_LOGS: boolean
  
  // Fonctionnalités africaines
  ENABLE_MOBILE_MONEY: boolean
  DEFAULT_CURRENCY: string
  SUPPORTED_LANGUAGES: string[]
}

export interface EnvironmentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingRequired: string[]
  weakSecrets: string[]
}

// Variables d'environnement requises
const REQUIRED_VARS = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CSRF_SECRET_KEY',
  'NODE_ENV'
]

// Variables d'environnement sensibles (à ne jamais logger)
const SENSITIVE_VARS = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CSRF_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ELYX_DB_PASSWORD'
]

// Configuration par défaut
const DEFAULT_CONFIG: Partial<SecurityEnvironment> = {
  BCRYPT_ROUNDS: 12,
  SESSION_TIMEOUT: 480, // 8 heures
  PORT: 3000,
  CORS_ORIGIN: ['http://localhost:3000', 'http://localhost:5173'],
  RATE_LIMIT_WINDOW: 15, // 15 minutes
  RATE_LIMIT_MAX: 100, // 100 requêtes par fenêtre
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30, // 30 minutes
  LOG_LEVEL: 'info',
  ENABLE_SECURITY_LOGS: true,
  ENABLE_MOBILE_MONEY: true,
  DEFAULT_CURRENCY: 'XOF', // Franc CFA
  SUPPORTED_LANGUAGES: ['fr', 'en', 'wo', 'bm'] // Français, Anglais, Wolof, Bambara
}

export class EnvironmentConfig {
  private config: SecurityEnvironment
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.config = this.loadConfiguration()
    this.validateConfiguration()
  }

  /**
   * Charger la configuration depuis les variables d'environnement
   */
  private loadConfiguration(): SecurityEnvironment {
    return {
      // Authentification
      JWT_SECRET: process.env.JWT_SECRET || this.generateSecureSecret(),
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || this.generateSecureSecret(),
      BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '480'),
      
      // CSRF Protection
      CSRF_SECRET_KEY: process.env.CSRF_SECRET_KEY || this.generateSecureSecret(),
      
      // Base de données
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      
      // Elyx Legacy
      ELYX_DB_HOST: process.env.ELYX_DB_HOST,
      ELYX_DB_PORT: parseInt(process.env.ELYX_DB_PORT || '1433'),
      ELYX_DB_NAME: process.env.ELYX_DB_NAME,
      ELYX_DB_USER: process.env.ELYX_DB_USER,
      ELYX_DB_PASSWORD: process.env.ELYX_DB_PASSWORD,
      
      // Application
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      PORT: parseInt(process.env.PORT || '3000'),
      CORS_ORIGIN: process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
        DEFAULT_CONFIG.CORS_ORIGIN!,
      
      // Sécurité avancée
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
      RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      MAX_FAILED_ATTEMPTS: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
      LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '30'),
      
      // Monitoring
      LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
      ENABLE_SECURITY_LOGS: process.env.ENABLE_SECURITY_LOGS !== 'false',
      
      // Fonctionnalités africaines
      ENABLE_MOBILE_MONEY: process.env.ENABLE_MOBILE_MONEY !== 'false',
      DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'XOF',
      SUPPORTED_LANGUAGES: process.env.SUPPORTED_LANGUAGES ? 
        process.env.SUPPORTED_LANGUAGES.split(',').map(lang => lang.trim()) : 
        DEFAULT_CONFIG.SUPPORTED_LANGUAGES!
    }
  }

  /**
   * Valider la configuration
   */
  private validateConfiguration(): EnvironmentValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const missingRequired: string[] = []
    const weakSecrets: string[] = []

    // Vérifier les variables requises
    for (const varName of REQUIRED_VARS) {
      if (!process.env[varName]) {
        missingRequired.push(varName)
        errors.push(`Variable d'environnement requise manquante: ${varName}`)
      }
    }

    // Vérifier la force des secrets
    const secrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'CSRF_SECRET_KEY']
    for (const secret of secrets) {
      const value = process.env[secret]
      if (value && value.length < 32) {
        weakSecrets.push(secret)
        errors.push(`${secret} doit contenir au moins 32 caractères`)
      }
    }

    // Vérifications spécifiques à la production
    if (this.isProduction) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        warnings.push('Configuration Supabase manquante en production')
      }

      if (this.config.LOG_LEVEL === 'debug') {
        warnings.push('LOG_LEVEL=debug n\'est pas recommandé en production')
      }

      if (this.config.CORS_ORIGIN.includes('http://localhost')) {
        errors.push('CORS_ORIGIN ne doit pas inclure localhost en production')
      }
    }

    // Vérifications de sécurité
    if (this.config.BCRYPT_ROUNDS < 10) {
      warnings.push('BCRYPT_ROUNDS < 10 peut être insuffisant pour la sécurité')
    }

    if (this.config.SESSION_TIMEOUT > 1440) { // 24 heures
      warnings.push('SESSION_TIMEOUT > 24h peut présenter des risques de sécurité')
    }

    const validation: EnvironmentValidation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingRequired,
      weakSecrets
    }

    // Logger les problèmes de configuration
    if (!validation.isValid) {
      console.error('❌ Configuration invalide:', validation.errors)
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Avertissements de configuration:', validation.warnings)
    }

    return validation
  }

  /**
   * Générer un secret sécurisé
   */
  private generateSecureSecret(length: number = 64): string {
    const secret = crypto.randomBytes(length).toString('hex')
    
    if (!this.isProduction) {
      console.warn(`⚠️  Secret généré automatiquement. Définissez une variable d'environnement pour la production.`)
    }
    
    return secret
  }

  /**
   * Obtenir la configuration complète
   */
  getConfig(): SecurityEnvironment {
    return { ...this.config }
  }

  /**
   * Obtenir une valeur de configuration spécifique
   */
  get<K extends keyof SecurityEnvironment>(key: K): SecurityEnvironment[K] {
    return this.config[key]
  }

  /**
   * Vérifier si on est en production
   */
  isProductionMode(): boolean {
    return this.isProduction
  }

  /**
   * Obtenir la configuration de base de données active
   */
  getDatabaseConfig(): {
    type: 'supabase' | 'elyx' | 'none'
    config: any
  } {
    if (this.config.SUPABASE_URL && this.config.SUPABASE_ANON_KEY) {
      return {
        type: 'supabase',
        config: {
          url: this.config.SUPABASE_URL,
          anonKey: this.config.SUPABASE_ANON_KEY,
          serviceRoleKey: this.config.SUPABASE_SERVICE_ROLE_KEY
        }
      }
    }

    if (this.config.ELYX_DB_HOST && this.config.ELYX_DB_USER) {
      return {
        type: 'elyx',
        config: {
          host: this.config.ELYX_DB_HOST,
          port: this.config.ELYX_DB_PORT,
          database: this.config.ELYX_DB_NAME,
          user: this.config.ELYX_DB_USER,
          password: this.config.ELYX_DB_PASSWORD
        }
      }
    }

    return { type: 'none', config: {} }
  }

  /**
   * Obtenir la configuration CORS
   */
  getCORSConfig(): {
    origin: string[]
    credentials: boolean
    methods: string[]
    allowedHeaders: string[]
  } {
    return {
      origin: this.config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token'
      ]
    }
  }

  /**
   * Obtenir la configuration de rate limiting
   */
  getRateLimitConfig(): {
    windowMs: number
    max: number
    message: string
  } {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW * 60 * 1000,
      max: this.config.RATE_LIMIT_MAX,
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    }
  }

  /**
   * Logger la configuration (sans les secrets)
   */
  logConfiguration(): void {
    const safeConfig = { ...this.config }
    
    // Masquer les variables sensibles
    for (const sensitiveVar of SENSITIVE_VARS) {
      if (safeConfig[sensitiveVar as keyof SecurityEnvironment]) {
        (safeConfig as any)[sensitiveVar] = '***MASKED***'
      }
    }

    console.log('🔧 Configuration chargée:', {
      environment: safeConfig.NODE_ENV,
      port: safeConfig.PORT,
      database: this.getDatabaseConfig().type,
      cors: safeConfig.CORS_ORIGIN,
      features: {
        mobileMoney: safeConfig.ENABLE_MOBILE_MONEY,
        currency: safeConfig.DEFAULT_CURRENCY,
        languages: safeConfig.SUPPORTED_LANGUAGES
      }
    })
  }

  /**
   * Créer un fichier .env d'exemple
   */
  generateEnvExample(): string {
    return `# Configuration Africa Suite Pulse
# Copiez ce fichier vers .env et remplissez les valeurs

# === SÉCURITÉ (REQUIS) ===
JWT_SECRET=${this.generateSecureSecret()}
JWT_REFRESH_SECRET=${this.generateSecureSecret()}
CSRF_SECRET_KEY=${this.generateSecureSecret()}

# === APPLICATION ===
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# === BASE DE DONNÉES SUPABASE ===
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === BASE DE DONNÉES ELYX (LEGACY) ===
ELYX_DB_HOST=localhost
ELYX_DB_PORT=1433
ELYX_DB_NAME=elyx_database
ELYX_DB_USER=elyx_user
ELYX_DB_PASSWORD=elyx_password

# === SÉCURITÉ AVANCÉE ===
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=480
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION=30
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# === MONITORING ===
LOG_LEVEL=info
ENABLE_SECURITY_LOGS=true

# === FONCTIONNALITÉS AFRICAINES ===
ENABLE_MOBILE_MONEY=true
DEFAULT_CURRENCY=XOF
SUPPORTED_LANGUAGES=fr,en,wo,bm

# === DÉVELOPPEMENT ===
# Décommentez pour le développement local
# DEBUG=true
# DISABLE_RATE_LIMIT=true
`
  }
}

// Instance singleton
export const envConfig = new EnvironmentConfig()

// Validation au démarrage
export const validateEnvironment = (): boolean => {
  const validation = (envConfig as any).validateConfiguration()
  
  if (!validation.isValid) {
    console.error('❌ Configuration invalide. L\'application ne peut pas démarrer.')
    console.error('Variables manquantes:', validation.missingRequired)
    console.error('Erreurs:', validation.errors)
    return false
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Avertissements de configuration:', validation.warnings)
  }

  // Logger la configuration en mode développement
  if (!envConfig.isProductionMode()) {
    envConfig.logConfiguration()
  }

  return true
}

// Helper pour créer le fichier .env
export const createEnvFile = (): void => {
  const fs = require('fs')
  const path = require('path')
  
  const envContent = envConfig.generateEnvExample()
  const envPath = path.join(process.cwd(), '.env.example')
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env.example créé')
}

export default envConfig

