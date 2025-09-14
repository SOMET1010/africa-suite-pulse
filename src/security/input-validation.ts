/**
 * Validation des Entrées - Africa Suite Pulse
 * Système de validation et sanitisation pour prévenir les injections
 */

import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

// Types de validation
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'boolean'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  sanitize?: boolean
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: { [key: string]: string[] }
  sanitizedData: { [key: string]: any }
}

export interface AfricanValidationOptions {
  allowFrench: boolean
  allowLocalLanguages: boolean
  supportMobileNumbers: boolean
  supportLocalCurrencies: boolean
}

// Configuration pour le contexte africain
const africanConfig: AfricanValidationOptions = {
  allowFrench: true,
  allowLocalLanguages: true,
  supportMobileNumbers: true,
  supportLocalCurrencies: true
}

// Patterns de validation pour l'Afrique
const AFRICAN_PATTERNS = {
  // Numéros de téléphone africains
  phoneNumbers: {
    senegal: /^(\+221|221)?[0-9]{9}$/,
    mali: /^(\+223|223)?[0-9]{8}$/,
    burkina: /^(\+226|226)?[0-9]{8}$/,
    cotedivoire: /^(\+225|225)?[0-9]{8}$/,
    ghana: /^(\+233|233)?[0-9]{9}$/,
    nigeria: /^(\+234|234)?[0-9]{10}$/,
    general: /^(\+[1-9]\d{1,14})$/
  },
  
  // Noms africains (avec caractères spéciaux)
  africanNames: /^[a-zA-ZÀ-ÿ\u00C0-\u017F\u0100-\u024F\s\-'\.]{2,50}$/,
  
  // Devises africaines
  currencies: /^(XOF|XAF|GHS|NGN|KES|UGX|TZS|ZAR|MAD|EGP|DZD|TND|LYD)$/,
  
  // Codes postaux africains
  postalCodes: {
    senegal: /^[0-9]{5}$/,
    ghana: /^[A-Z]{2}[0-9]{3}[0-9]{4}$/,
    nigeria: /^[0-9]{6}$/,
    southafrica: /^[0-9]{4}$/
  }
}

export class InputValidator {
  private config: AfricanValidationOptions

  constructor(config: Partial<AfricanValidationOptions> = {}) {
    this.config = { ...africanConfig, ...config }
  }

  /**
   * Valider des données selon un schéma
   */
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string[] } = {}
    const sanitizedData: { [key: string]: any } = {}

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors: string[] = []

      // Vérifier si le champ est requis
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`Le champ ${field} est requis`)
        continue
      }

      // Si le champ n'est pas requis et est vide, passer
      if (!rule.required && (value === undefined || value === null || value === '')) {
        sanitizedData[field] = value
        continue
      }

      // Sanitiser la valeur si demandé
      let sanitizedValue = rule.sanitize ? this.sanitizeInput(value) : value

      // Validation par type
      const typeValidation = this.validateType(sanitizedValue, rule.type || 'string')
      if (!typeValidation.isValid) {
        fieldErrors.push(typeValidation.error!)
      } else {
        sanitizedValue = typeValidation.value
      }

      // Validation de longueur pour les chaînes
      if (typeof sanitizedValue === 'string') {
        if (rule.minLength && sanitizedValue.length < rule.minLength) {
          fieldErrors.push(`${field} doit contenir au moins ${rule.minLength} caractères`)
        }
        if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
          fieldErrors.push(`${field} ne peut pas dépasser ${rule.maxLength} caractères`)
        }
      }

      // Validation de valeur pour les nombres
      if (typeof sanitizedValue === 'number') {
        if (rule.min !== undefined && sanitizedValue < rule.min) {
          fieldErrors.push(`${field} doit être supérieur ou égal à ${rule.min}`)
        }
        if (rule.max !== undefined && sanitizedValue > rule.max) {
          fieldErrors.push(`${field} doit être inférieur ou égal à ${rule.max}`)
        }
      }

      // Validation par pattern
      if (rule.pattern && typeof sanitizedValue === 'string') {
        if (!rule.pattern.test(sanitizedValue)) {
          fieldErrors.push(`${field} ne respecte pas le format requis`)
        }
      }

      // Validation personnalisée
      if (rule.custom) {
        const customResult = rule.custom(sanitizedValue)
        if (customResult !== true) {
          fieldErrors.push(typeof customResult === 'string' ? customResult : `${field} n'est pas valide`)
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      } else {
        sanitizedData[field] = sanitizedValue
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Validation par type
   */
  private validateType(value: any, type: string): { isValid: boolean; value?: any; error?: string } {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, error: 'Doit être une chaîne de caractères' }
        }
        return { isValid: true, value: value.trim() }

      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          return { isValid: false, error: 'Doit être un nombre valide' }
        }
        return { isValid: true, value: num }

      case 'email':
        if (typeof value !== 'string' || !validator.isEmail(value)) {
          return { isValid: false, error: 'Doit être une adresse email valide' }
        }
        return { isValid: true, value: value.toLowerCase().trim() }

      case 'phone':
        return this.validateAfricanPhone(value)

      case 'url':
        if (typeof value !== 'string' || !validator.isURL(value)) {
          return { isValid: false, error: 'Doit être une URL valide' }
        }
        return { isValid: true, value: value.trim() }

      case 'date':
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { isValid: false, error: 'Doit être une date valide' }
        }
        return { isValid: true, value: date }

      case 'boolean':
        if (typeof value === 'boolean') {
          return { isValid: true, value }
        }
        if (value === 'true' || value === '1' || value === 1) {
          return { isValid: true, value: true }
        }
        if (value === 'false' || value === '0' || value === 0) {
          return { isValid: true, value: false }
        }
        return { isValid: false, error: 'Doit être un booléen valide' }

      default:
        return { isValid: true, value }
    }
  }

  /**
   * Validation des numéros de téléphone africains
   */
  private validateAfricanPhone(value: any): { isValid: boolean; value?: string; error?: string } {
    if (typeof value !== 'string') {
      return { isValid: false, error: 'Le numéro de téléphone doit être une chaîne' }
    }

    const cleanPhone = value.replace(/[\s\-\(\)]/g, '')

    // Tester contre les patterns africains
    for (const [country, pattern] of Object.entries(AFRICAN_PATTERNS.phoneNumbers)) {
      if (pattern.test(cleanPhone)) {
        return { isValid: true, value: cleanPhone }
      }
    }

    return { isValid: false, error: 'Numéro de téléphone africain invalide' }
  }

  /**
   * Sanitiser les entrées pour prévenir XSS et injections
   */
  sanitizeInput(input: any): any {
    if (typeof input !== 'string') {
      return input
    }

    // Nettoyer le HTML avec DOMPurify
    let sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Pas de tags HTML autorisés
      ALLOWED_ATTR: []
    })

    // Échapper les caractères spéciaux SQL
    sanitized = sanitized.replace(/['";\\]/g, (match) => {
      switch (match) {
        case "'": return "\\'"
        case '"': return '\\"'
        case ';': return '\\;'
        case '\\': return '\\\\'
        default: return match
      }
    })

    // Limiter la longueur pour prévenir les attaques DoS
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000)
    }

    return sanitized.trim()
  }

  /**
   * Validation spécifique pour les noms africains
   */
  validateAfricanName(name: string): boolean {
    return AFRICAN_PATTERNS.africanNames.test(name)
  }

  /**
   * Validation des devises africaines
   */
  validateAfricanCurrency(currency: string): boolean {
    return AFRICAN_PATTERNS.currencies.test(currency.toUpperCase())
  }

  /**
   * Validation des mots de passe forts
   */
  validateStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule')
    }

    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial')
    }

    // Vérifier contre les mots de passe communs
    const commonPasswords = [
      'password', '123456', 'azerty', 'qwerty', 'admin', 'root',
      'senegal', 'dakar', 'bamako', 'ouagadougou', 'abidjan'
    ]

    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Le mot de passe ne doit pas contenir de mots communs')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Échapper les caractères pour prévenir les injections SQL
   */
  escapeSQLString(input: string): string {
    return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0'
        case '\x08': return '\\b'
        case '\x09': return '\\t'
        case '\x1a': return '\\z'
        case '\n': return '\\n'
        case '\r': return '\\r'
        case '"':
        case "'":
        case '\\':
        case '%': return '\\' + char
        default: return char
      }
    })
  }

  /**
   * Valider les données de commande restaurant
   */
  validateRestaurantOrder(orderData: any): ValidationResult {
    const schema: ValidationSchema = {
      customerName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100,
        sanitize: true,
        custom: (value) => this.validateAfricanName(value)
      },
      customerPhone: {
        required: true,
        type: 'phone'
      },
      items: {
        required: true,
        custom: (value) => Array.isArray(value) && value.length > 0
      },
      totalAmount: {
        required: true,
        type: 'number',
        min: 0,
        max: 1000000 // 1M FCFA max
      },
      currency: {
        required: true,
        type: 'string',
        custom: (value) => this.validateAfricanCurrency(value)
      },
      paymentMethod: {
        required: true,
        type: 'string',
        pattern: /^(cash|card|mobile_money|orange_money|mtn_money)$/
      }
    }

    return this.validate(orderData, schema)
  }

  /**
   * Valider les données d'utilisateur
   */
  validateUserData(userData: any): ValidationResult {
    const schema: ValidationSchema = {
      username: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        sanitize: true
      },
      email: {
        required: true,
        type: 'email'
      },
      password: {
        required: true,
        type: 'string',
        custom: (value) => {
          const result = this.validateStrongPassword(value)
          return result.isValid || result.errors.join(', ')
        }
      },
      firstName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 50,
        sanitize: true,
        custom: (value) => this.validateAfricanName(value)
      },
      lastName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 50,
        sanitize: true,
        custom: (value) => this.validateAfricanName(value)
      },
      phone: {
        required: false,
        type: 'phone'
      }
    }

    return this.validate(userData, schema)
  }
}

// Instance singleton
export const inputValidator = new InputValidator()

// Middleware Express pour la validation automatique
export const validationMiddleware = (schema: ValidationSchema) => {
  return (req: any, res: any, next: any) => {
    const result = inputValidator.validate(req.body, schema)
    
    if (!result.isValid) {
      return res.status(400).json({
        error: 'Données invalides',
        details: result.errors
      })
    }

    // Remplacer req.body par les données sanitisées
    req.body = result.sanitizedData
    next()
  }
}

// Schémas de validation prédéfinis
export const ValidationSchemas = {
  user: {
    username: { required: true, type: 'string' as const, minLength: 3, maxLength: 30, sanitize: true },
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, minLength: 8 }
  },
  
  order: {
    customerName: { required: true, type: 'string' as const, minLength: 2, maxLength: 100, sanitize: true },
    totalAmount: { required: true, type: 'number' as const, min: 0 },
    currency: { required: true, type: 'string' as const }
  },
  
  product: {
    name: { required: true, type: 'string' as const, minLength: 2, maxLength: 200, sanitize: true },
    price: { required: true, type: 'number' as const, min: 0 },
    category: { required: true, type: 'string' as const, sanitize: true }
  }
}

export default inputValidator

