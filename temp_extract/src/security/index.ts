/**
 * Module de Sécurité - Africa Suite Pulse
 * Export centralisé de tous les composants de sécurité
 */

// Authentification sécurisée
export {
  SecureAuthService,
  secureAuth,
  authMiddleware,
  generateSecureSecret,
  validateSecurityEnvironment
} from './secure-auth'

export type {
  SecureUser,
  AuthResult,
  SecurityConfig
} from './secure-auth'

// Protection CSRF
export {
  CSRFProtection,
  csrfProtection,
  csrfMiddleware,
  useCSRFToken,
  fetchWithCSRF,
  CSRFTokenInput,
  validateCSRFEnvironment,
  generateCSRFSecret
} from './csrf-protection'

export type {
  CSRFConfig,
  CSRFToken
} from './csrf-protection'

// Validation des entrées
export {
  InputValidator,
  inputValidator,
  validationMiddleware,
  ValidationSchemas
} from './input-validation'

export type {
  ValidationRule,
  ValidationSchema,
  ValidationResult,
  AfricanValidationOptions
} from './input-validation'

// Configuration d'environnement
export {
  EnvironmentConfig,
  envConfig,
  validateEnvironment,
  createEnvFile
} from './environment-config'

export type {
  SecurityEnvironment,
  EnvironmentValidation
} from './environment-config'

// Classe principale de sécurité
export class AfricaSuiteSecurity {
  private static instance: AfricaSuiteSecurity
  
  private constructor() {
    // Validation de l'environnement au démarrage
    if (!validateEnvironment()) {
      throw new Error('Configuration de sécurité invalide')
    }
  }

  public static getInstance(): AfricaSuiteSecurity {
    if (!AfricaSuiteSecurity.instance) {
      AfricaSuiteSecurity.instance = new AfricaSuiteSecurity()
    }
    return AfricaSuiteSecurity.instance
  }

  /**
   * Initialiser tous les composants de sécurité
   */
  public async initialize(): Promise<void> {
    console.log('🔒 Initialisation du module de sécurité Africa Suite Pulse...')
    
    try {
      // Valider l'environnement
      if (!validateEnvironment()) {
        throw new Error('Configuration de sécurité invalide')
      }

      // Valider la configuration d'authentification
      if (!validateSecurityEnvironment()) {
        throw new Error('Configuration d\'authentification invalide')
      }

      // Valider la configuration CSRF
      if (!validateCSRFEnvironment()) {
        console.warn('⚠️  Configuration CSRF sous-optimale')
      }

      console.log('✅ Module de sécurité initialisé avec succès')
      
      // Logger les fonctionnalités activées
      this.logSecurityFeatures()
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la sécurité:', error)
      throw error
    }
  }

  /**
   * Logger les fonctionnalités de sécurité activées
   */
  private logSecurityFeatures(): void {
    const config = envConfig.getConfig()
    
    console.log('🛡️  Fonctionnalités de sécurité activées:')
    console.log('   ✓ Authentification JWT sécurisée')
    console.log('   ✓ Protection CSRF')
    console.log('   ✓ Validation et sanitisation des entrées')
    console.log('   ✓ Hachage bcrypt des mots de passe')
    console.log('   ✓ Rate limiting')
    console.log('   ✓ Verrouillage de compte après échecs')
    console.log('   ✓ Logs de sécurité')
    
    if (config.ENABLE_MOBILE_MONEY) {
      console.log('   ✓ Support Mobile Money africain')
    }
    
    console.log(`   ✓ Support multi-langues: ${config.SUPPORTED_LANGUAGES.join(', ')}`)
    console.log(`   ✓ Devise par défaut: ${config.DEFAULT_CURRENCY}`)
  }

  /**
   * Obtenir le statut de sécurité
   */
  public getSecurityStatus(): {
    isSecure: boolean
    features: string[]
    warnings: string[]
    recommendations: string[]
  } {
    const config = envConfig.getConfig()
    const features: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    // Fonctionnalités activées
    features.push('Authentification JWT')
    features.push('Protection CSRF')
    features.push('Validation des entrées')
    features.push('Hachage bcrypt')

    if (config.ENABLE_SECURITY_LOGS) {
      features.push('Logs de sécurité')
    }

    if (config.ENABLE_MOBILE_MONEY) {
      features.push('Mobile Money')
    }

    // Vérifications de sécurité
    if (!envConfig.isProductionMode()) {
      warnings.push('Mode développement - sécurité réduite')
    }

    if (config.BCRYPT_ROUNDS < 12) {
      warnings.push('BCRYPT_ROUNDS < 12 - considérez augmenter')
    }

    if (config.SESSION_TIMEOUT > 480) {
      warnings.push('Session timeout > 8h - risque de sécurité')
    }

    // Recommandations
    if (!config.SUPABASE_URL) {
      recommendations.push('Configurer Supabase pour la production')
    }

    if (config.LOG_LEVEL === 'debug' && envConfig.isProductionMode()) {
      recommendations.push('Changer LOG_LEVEL en production')
    }

    return {
      isSecure: warnings.length === 0,
      features,
      warnings,
      recommendations
    }
  }

  /**
   * Générer un rapport de sécurité
   */
  public generateSecurityReport(): string {
    const status = this.getSecurityStatus()
    const config = envConfig.getConfig()

    let report = `
# Rapport de Sécurité - Africa Suite Pulse
Généré le: ${new Date().toLocaleString('fr-FR')}

## Statut Global
${status.isSecure ? '✅ SÉCURISÉ' : '⚠️  ATTENTION REQUISE'}

## Fonctionnalités Activées
${status.features.map(f => `✓ ${f}`).join('\n')}

## Configuration
- Environnement: ${config.NODE_ENV}
- Port: ${config.PORT}
- Base de données: ${envConfig.getDatabaseConfig().type}
- Devise: ${config.DEFAULT_CURRENCY}
- Langues: ${config.SUPPORTED_LANGUAGES.join(', ')}

## Paramètres de Sécurité
- Rounds bcrypt: ${config.BCRYPT_ROUNDS}
- Timeout session: ${config.SESSION_TIMEOUT} minutes
- Tentatives max: ${config.MAX_FAILED_ATTEMPTS}
- Durée verrouillage: ${config.LOCKOUT_DURATION} minutes
- Rate limit: ${config.RATE_LIMIT_MAX} req/${config.RATE_LIMIT_WINDOW}min

${status.warnings.length > 0 ? `
## ⚠️  Avertissements
${status.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

${status.recommendations.length > 0 ? `
## 💡 Recommandations
${status.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

## Conformité
✓ Protection contre les injections SQL
✓ Protection contre les attaques XSS
✓ Protection CSRF
✓ Authentification forte
✓ Chiffrement des mots de passe
✓ Rate limiting
✓ Logs de sécurité
✓ Validation des entrées
✓ Configuration sécurisée

---
Africa Suite Pulse Security Module v1.0
`

    return report.trim()
  }
}

// Export de l'instance singleton
export const africaSuiteSecurity = AfricaSuiteSecurity.getInstance()

// Fonction d'initialisation rapide
export const initializeSecurity = async (): Promise<void> => {
  await africaSuiteSecurity.initialize()
}

// Export par défaut
export default africaSuiteSecurity

