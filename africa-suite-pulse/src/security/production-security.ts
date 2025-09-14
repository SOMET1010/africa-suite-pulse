/**
 * Production Security Module
 * Sécurité renforcée pour Africa Suite Pulse en production
 */

import CryptoJS from 'crypto-js';

// Configuration de sécurité pour la production
export const SECURITY_CONFIG = {
  // Chiffrement
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_DERIVATION_ITERATIONS: 100000,
  SALT_LENGTH: 32,
  IV_LENGTH: 16,
  
  // Sessions
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60 * 1000, // 7 jours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://api.africasuitepulse.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

/**
 * Générateur de clés sécurisées
 */
export class SecureKeyGenerator {
  /**
   * Génère une clé aléatoire sécurisée
   */
  static generateSecureKey(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Génère un token CSRF
   */
  static generateCSRFToken(): string {
    return this.generateSecureKey(SECURITY_CONFIG.CSRF_TOKEN_LENGTH);
  }

  /**
   * Génère un salt pour le hachage
   */
  static generateSalt(): string {
    return this.generateSecureKey(SECURITY_CONFIG.SALT_LENGTH);
  }

  /**
   * Génère un IV pour le chiffrement
   */
  static generateIV(): string {
    return this.generateSecureKey(SECURITY_CONFIG.IV_LENGTH);
  }
}

/**
 * Gestionnaire de chiffrement sécurisé
 */
export class SecureEncryption {
  private static getEncryptionKey(): string {
    const key = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('Clé de chiffrement invalide ou manquante');
    }
    return key;
  }

  /**
   * Chiffre des données sensibles
   */
  static encrypt(data: string): string {
    try {
      const key = this.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      throw new Error('Échec du chiffrement des données');
    }
  }

  /**
   * Déchiffre des données
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      throw new Error('Échec du déchiffrement des données');
    }
  }

  /**
   * Hache un mot de passe avec salt
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const passwordSalt = salt || SecureKeyGenerator.generateSalt();
    const hash = CryptoJS.PBKDF2(password, passwordSalt, {
      keySize: 256 / 32,
      iterations: SECURITY_CONFIG.KEY_DERIVATION_ITERATIONS
    }).toString();
    
    return { hash, salt: passwordSalt };
  }

  /**
   * Vérifie un mot de passe
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }
}

/**
 * Gestionnaire de sessions sécurisées
 */
export class SecureSessionManager {
  private static readonly SESSION_KEY = 'africasuite_session';
  private static readonly REFRESH_KEY = 'africasuite_refresh';

  /**
   * Crée une session sécurisée
   */
  static createSession(userId: string, userData: any): string {
    const sessionData = {
      userId,
      userData,
      createdAt: Date.now(),
      expiresAt: Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT,
      csrfToken: SecureKeyGenerator.generateCSRFToken()
    };

    const encryptedSession = SecureEncryption.encrypt(JSON.stringify(sessionData));
    localStorage.setItem(this.SESSION_KEY, encryptedSession);
    
    return sessionData.csrfToken;
  }

  /**
   * Récupère une session
   */
  static getSession(): any | null {
    try {
      const encryptedSession = localStorage.getItem(this.SESSION_KEY);
      if (!encryptedSession) return null;

      const sessionData = JSON.parse(SecureEncryption.decrypt(encryptedSession));
      
      // Vérification de l'expiration
      if (Date.now() > sessionData.expiresAt) {
        this.destroySession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Erreur de récupération de session:', error);
      this.destroySession();
      return null;
    }
  }

  /**
   * Renouvelle une session
   */
  static renewSession(): boolean {
    const session = this.getSession();
    if (!session) return false;

    session.expiresAt = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;
    const encryptedSession = SecureEncryption.encrypt(JSON.stringify(session));
    localStorage.setItem(this.SESSION_KEY, encryptedSession);
    
    return true;
  }

  /**
   * Détruit une session
   */
  static destroySession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  /**
   * Vérifie le token CSRF
   */
  static verifyCSRFToken(token: string): boolean {
    const session = this.getSession();
    return session && session.csrfToken === token;
  }
}

/**
 * Protection contre les attaques par force brute
 */
export class BruteForceProtection {
  private static readonly ATTEMPTS_KEY = 'login_attempts';
  private static readonly LOCKOUT_KEY = 'account_lockout';

  /**
   * Enregistre une tentative de connexion échouée
   */
  static recordFailedAttempt(identifier: string): void {
    const attempts = this.getAttempts(identifier);
    const newAttempts = attempts + 1;
    
    localStorage.setItem(`${this.ATTEMPTS_KEY}_${identifier}`, newAttempts.toString());
    
    if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      this.lockAccount(identifier);
    }
  }

  /**
   * Réinitialise les tentatives après une connexion réussie
   */
  static resetAttempts(identifier: string): void {
    localStorage.removeItem(`${this.ATTEMPTS_KEY}_${identifier}`);
    localStorage.removeItem(`${this.LOCKOUT_KEY}_${identifier}`);
  }

  /**
   * Vérifie si un compte est verrouillé
   */
  static isAccountLocked(identifier: string): boolean {
    const lockoutTime = localStorage.getItem(`${this.LOCKOUT_KEY}_${identifier}`);
    if (!lockoutTime) return false;

    const lockoutExpiry = parseInt(lockoutTime) + SECURITY_CONFIG.LOCKOUT_DURATION;
    if (Date.now() > lockoutExpiry) {
      this.resetAttempts(identifier);
      return false;
    }

    return true;
  }

  /**
   * Récupère le nombre de tentatives
   */
  private static getAttempts(identifier: string): number {
    const attempts = localStorage.getItem(`${this.ATTEMPTS_KEY}_${identifier}`);
    return attempts ? parseInt(attempts) : 0;
  }

  /**
   * Verrouille un compte
   */
  private static lockAccount(identifier: string): void {
    localStorage.setItem(`${this.LOCKOUT_KEY}_${identifier}`, Date.now().toString());
  }
}

/**
 * Validation et assainissement des entrées
 */
export class InputSanitizer {
  /**
   * Nettoie une chaîne de caractères
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Supprime les balises HTML
      .replace(/javascript:/gi, '') // Supprime les liens JavaScript
      .replace(/on\w+=/gi, '') // Supprime les gestionnaires d'événements
      .trim();
  }

  /**
   * Valide un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un mot de passe fort
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un numéro de téléphone africain
   */
  static validateAfricanPhone(phone: string): boolean {
    // Formats supportés: +225, +221, +223, +226, +227, +228, +229, +230, +231, +232, +233, +234, +235, +236, +237, +238, +239, +240, +241, +242, +243, +244, +245, +246, +247, +248, +249, +250, +251, +252, +253, +254, +255, +256, +257, +258, +260, +261, +262, +263, +264, +265, +266, +267, +268, +269, +290, +291
    const africanPhoneRegex = /^\+2[0-6][0-9]\d{6,9}$/;
    return africanPhoneRegex.test(phone);
  }
}

/**
 * Gestionnaire de Content Security Policy
 */
export class CSPManager {
  /**
   * Génère les directives CSP
   */
  static generateCSPHeader(): string {
    const directives = Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    return directives;
  }

  /**
   * Applique les directives CSP
   */
  static applyCSP(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSPHeader();
    document.head.appendChild(meta);
  }
}

/**
 * Gestionnaire de logs de sécurité
 */
export class SecurityLogger {
  /**
   * Enregistre un événement de sécurité
   */
  static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    // En production, envoyer vers un service de logging sécurisé
    if (import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
      this.sendToSecurityService(logEntry);
    } else {
      console.warn('Événement de sécurité:', logEntry);
    }
  }

  /**
   * Envoie les logs vers un service de sécurité
   */
  private static async sendToSecurityService(logEntry: any): Promise<void> {
    try {
      await fetch('/api/security/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken()
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Erreur d\'envoi des logs de sécurité:', error);
    }
  }

  /**
   * Récupère l'ID de session
   */
  private static getSessionId(): string {
    const session = SecureSessionManager.getSession();
    return session ? session.userId : 'anonymous';
  }

  /**
   * Récupère le token CSRF
   */
  private static getCSRFToken(): string {
    const session = SecureSessionManager.getSession();
    return session ? session.csrfToken : '';
  }
}

/**
 * Initialisation de la sécurité
 */
export class SecurityInitializer {
  /**
   * Initialise tous les modules de sécurité
   */
  static initialize(): void {
    // Application des directives CSP
    CSPManager.applyCSP();
    
    // Configuration des en-têtes de sécurité
    this.configureSecurityHeaders();
    
    // Surveillance des événements de sécurité
    this.setupSecurityMonitoring();
    
    // Nettoyage automatique des sessions expirées
    this.setupSessionCleanup();
    
    SecurityLogger.logSecurityEvent('security_initialized', {
      timestamp: Date.now(),
      environment: import.meta.env.VITE_APP_ENVIRONMENT
    });
  }

  /**
   * Configure les en-têtes de sécurité
   */
  private static configureSecurityHeaders(): void {
    // Ces en-têtes doivent être configurés au niveau du serveur
    // Ici on peut seulement les documenter pour la configuration serveur
    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };

    console.info('En-têtes de sécurité recommandés:', securityHeaders);
  }

  /**
   * Configure la surveillance de sécurité
   */
  private static setupSecurityMonitoring(): void {
    // Surveillance des tentatives d'accès non autorisées
    window.addEventListener('error', (event) => {
      if (event.error && event.error.name === 'SecurityError') {
        SecurityLogger.logSecurityEvent('security_error', {
          message: event.error.message,
          stack: event.error.stack
        });
      }
    });

    // Surveillance des changements de focus (détection de tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        SecurityLogger.logSecurityEvent('tab_hidden', { timestamp: Date.now() });
      }
    });
  }

  /**
   * Configure le nettoyage automatique des sessions
   */
  private static setupSessionCleanup(): void {
    setInterval(() => {
      const session = SecureSessionManager.getSession();
      if (!session) {
        // Nettoie les données locales si aucune session valide
        localStorage.clear();
        sessionStorage.clear();
      }
    }, 60000); // Vérification toutes les minutes
  }
}

// Export par défaut pour l'initialisation
export default SecurityInitializer;

