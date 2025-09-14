/**
 * Tests de Sécurité pour Africa Suite Pulse
 * Suite complète de tests de sécurité pour la production
 */

import { 
  SecureKeyGenerator, 
  SecureEncryption, 
  SecureSessionManager, 
  BruteForceProtection,
  InputSanitizer,
  SecurityLogger 
} from '../security/production-security';

/**
 * Interface pour les résultats de tests
 */
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

/**
 * Classe principale pour les tests de sécurité
 */
export class SecurityTestSuite {
  private results: TestResult[] = [];

  /**
   * Exécute tous les tests de sécurité
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🔒 Démarrage des tests de sécurité Africa Suite Pulse...');
    
    this.results = [];
    
    // Tests de génération de clés
    await this.testKeyGeneration();
    
    // Tests de chiffrement
    await this.testEncryption();
    
    // Tests de gestion des sessions
    await this.testSessionManagement();
    
    // Tests de protection contre la force brute
    await this.testBruteForceProtection();
    
    // Tests de validation des entrées
    await this.testInputValidation();
    
    // Tests de logging de sécurité
    await this.testSecurityLogging();
    
    // Tests de résistance aux attaques
    await this.testAttackResistance();
    
    this.generateReport();
    return this.results;
  }

  /**
   * Tests de génération de clés sécurisées
   */
  private async testKeyGeneration(): Promise<void> {
    await this.runTest('Génération de clés sécurisées', () => {
      // Test de génération de clé
      const key1 = SecureKeyGenerator.generateSecureKey(32);
      const key2 = SecureKeyGenerator.generateSecureKey(32);
      
      if (key1.length !== 64) throw new Error('Longueur de clé incorrecte');
      if (key1 === key2) throw new Error('Les clés ne sont pas uniques');
      if (!/^[0-9a-f]+$/.test(key1)) throw new Error('Format de clé invalide');
      
      // Test de génération de token CSRF
      const csrfToken = SecureKeyGenerator.generateCSRFToken();
      if (csrfToken.length !== 64) throw new Error('Longueur de token CSRF incorrecte');
      
      // Test de génération de salt
      const salt = SecureKeyGenerator.generateSalt();
      if (salt.length !== 64) throw new Error('Longueur de salt incorrecte');
      
      return 'Génération de clés sécurisées réussie';
    });
  }

  /**
   * Tests de chiffrement et déchiffrement
   */
  private async testEncryption(): Promise<void> {
    await this.runTest('Chiffrement et déchiffrement', () => {
      const originalData = 'Données sensibles Africa Suite Pulse 🔒';
      
      // Test de chiffrement
      const encrypted = SecureEncryption.encrypt(originalData);
      if (encrypted === originalData) throw new Error('Les données ne sont pas chiffrées');
      
      // Test de déchiffrement
      const decrypted = SecureEncryption.decrypt(encrypted);
      if (decrypted !== originalData) throw new Error('Échec du déchiffrement');
      
      // Test de hachage de mot de passe
      const password = 'MotDePasseSecurise123!';
      const { hash, salt } = SecureEncryption.hashPassword(password);
      
      if (!hash || !salt) throw new Error('Échec du hachage');
      if (hash === password) throw new Error('Le mot de passe n\'est pas haché');
      
      // Test de vérification de mot de passe
      const isValid = SecureEncryption.verifyPassword(password, hash, salt);
      if (!isValid) throw new Error('Échec de la vérification du mot de passe');
      
      const isInvalid = SecureEncryption.verifyPassword('MauvaisMotDePasse', hash, salt);
      if (isInvalid) throw new Error('Validation incorrecte du mauvais mot de passe');
      
      return 'Chiffrement et hachage fonctionnels';
    });
  }

  /**
   * Tests de gestion des sessions
   */
  private async testSessionManagement(): Promise<void> {
    await this.runTest('Gestion des sessions', () => {
      const userId = 'test-user-123';
      const userData = { name: 'Test User', role: 'admin' };
      
      // Test de création de session
      const csrfToken = SecureSessionManager.createSession(userId, userData);
      if (!csrfToken) throw new Error('Échec de création de session');
      
      // Test de récupération de session
      const session = SecureSessionManager.getSession();
      if (!session) throw new Error('Échec de récupération de session');
      if (session.userId !== userId) throw new Error('Données de session incorrectes');
      
      // Test de vérification CSRF
      const isValidCSRF = SecureSessionManager.verifyCSRFToken(csrfToken);
      if (!isValidCSRF) throw new Error('Échec de vérification CSRF');
      
      const isInvalidCSRF = SecureSessionManager.verifyCSRFToken('invalid-token');
      if (isInvalidCSRF) throw new Error('Validation CSRF incorrecte');
      
      // Test de renouvellement de session
      const renewed = SecureSessionManager.renewSession();
      if (!renewed) throw new Error('Échec de renouvellement de session');
      
      // Test de destruction de session
      SecureSessionManager.destroySession();
      const destroyedSession = SecureSessionManager.getSession();
      if (destroyedSession) throw new Error('Échec de destruction de session');
      
      return 'Gestion des sessions sécurisée';
    });
  }

  /**
   * Tests de protection contre la force brute
   */
  private async testBruteForceProtection(): Promise<void> {
    await this.runTest('Protection contre la force brute', () => {
      const testIdentifier = 'test@example.com';
      
      // Réinitialisation initiale
      BruteForceProtection.resetAttempts(testIdentifier);
      
      // Test d'état initial
      if (BruteForceProtection.isAccountLocked(testIdentifier)) {
        throw new Error('Le compte ne devrait pas être verrouillé initialement');
      }
      
      // Test d'enregistrement des tentatives échouées
      for (let i = 0; i < 4; i++) {
        BruteForceProtection.recordFailedAttempt(testIdentifier);
        if (BruteForceProtection.isAccountLocked(testIdentifier)) {
          throw new Error('Le compte ne devrait pas être verrouillé avant 5 tentatives');
        }
      }
      
      // Cinquième tentative - devrait verrouiller
      BruteForceProtection.recordFailedAttempt(testIdentifier);
      if (!BruteForceProtection.isAccountLocked(testIdentifier)) {
        throw new Error('Le compte devrait être verrouillé après 5 tentatives');
      }
      
      // Test de réinitialisation
      BruteForceProtection.resetAttempts(testIdentifier);
      if (BruteForceProtection.isAccountLocked(testIdentifier)) {
        throw new Error('Le compte devrait être déverrouillé après réinitialisation');
      }
      
      return 'Protection contre la force brute active';
    });
  }

  /**
   * Tests de validation des entrées
   */
  private async testInputValidation(): Promise<void> {
    await this.runTest('Validation des entrées', () => {
      // Test de nettoyage des chaînes
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = InputSanitizer.sanitizeString(maliciousInput);
      if (sanitized.includes('<script>')) throw new Error('Échec du nettoyage XSS');
      
      // Test de validation d'email
      const validEmail = 'user@africasuite.com';
      const invalidEmail = 'invalid-email';
      
      if (!InputSanitizer.validateEmail(validEmail)) {
        throw new Error('Email valide rejeté');
      }
      if (InputSanitizer.validateEmail(invalidEmail)) {
        throw new Error('Email invalide accepté');
      }
      
      // Test de validation de mot de passe
      const strongPassword = 'StrongPass123!';
      const weakPassword = '123';
      
      const strongResult = InputSanitizer.validatePassword(strongPassword);
      if (!strongResult.isValid) {
        throw new Error('Mot de passe fort rejeté: ' + strongResult.errors.join(', '));
      }
      
      const weakResult = InputSanitizer.validatePassword(weakPassword);
      if (weakResult.isValid) {
        throw new Error('Mot de passe faible accepté');
      }
      
      // Test de validation de téléphone africain
      const validPhone = '+2250123456789';
      const invalidPhone = '+1234567890';
      
      if (!InputSanitizer.validateAfricanPhone(validPhone)) {
        throw new Error('Numéro africain valide rejeté');
      }
      if (InputSanitizer.validateAfricanPhone(invalidPhone)) {
        throw new Error('Numéro non-africain accepté');
      }
      
      return 'Validation des entrées sécurisée';
    });
  }

  /**
   * Tests de logging de sécurité
   */
  private async testSecurityLogging(): Promise<void> {
    await this.runTest('Logging de sécurité', () => {
      // Test d'enregistrement d'événement
      const testEvent = 'test_security_event';
      const testDetails = { test: true, timestamp: Date.now() };
      
      // Ceci devrait fonctionner sans erreur
      SecurityLogger.logSecurityEvent(testEvent, testDetails);
      
      return 'Logging de sécurité fonctionnel';
    });
  }

  /**
   * Tests de résistance aux attaques
   */
  private async testAttackResistance(): Promise<void> {
    await this.runTest('Résistance aux attaques', () => {
      // Test de résistance aux injections SQL (simulation)
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitizedSQL = InputSanitizer.sanitizeString(sqlInjection);
      if (sanitizedSQL.includes('DROP TABLE')) {
        throw new Error('Vulnérabilité à l\'injection SQL détectée');
      }
      
      // Test de résistance aux attaques XSS
      const xssPayload = '<img src="x" onerror="alert(1)">';
      const sanitizedXSS = InputSanitizer.sanitizeString(xssPayload);
      if (sanitizedXSS.includes('onerror')) {
        throw new Error('Vulnérabilité XSS détectée');
      }
      
      // Test de résistance aux attaques CSRF (simulation)
      const validCSRF = SecureSessionManager.createSession('test', {});
      const invalidCSRF = 'fake-csrf-token';
      
      if (SecureSessionManager.verifyCSRFToken(invalidCSRF)) {
        throw new Error('Vulnérabilité CSRF détectée');
      }
      
      return 'Résistance aux attaques confirmée';
    });
  }

  /**
   * Exécute un test individuel
   */
  private async runTest(name: string, testFunction: () => string): Promise<void> {
    const startTime = performance.now();
    
    try {
      const message = testFunction();
      const duration = performance.now() - startTime;
      
      this.results.push({
        name,
        passed: true,
        message,
        duration
      });
      
      console.log(`✅ ${name}: ${message} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      
      this.results.push({
        name,
        passed: false,
        message,
        duration
      });
      
      console.error(`❌ ${name}: ${message} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Génère un rapport de tests
   */
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log('\n🔒 RAPPORT DE SÉCURITÉ AFRICA SUITE PULSE');
    console.log('==========================================');
    console.log(`Tests exécutés: ${totalTests}`);
    console.log(`Tests réussis: ${passedTests}`);
    console.log(`Tests échoués: ${failedTests}`);
    console.log(`Durée totale: ${totalDuration.toFixed(2)}ms`);
    console.log(`Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ TESTS ÉCHOUÉS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }
    
    if (passedTests === totalTests) {
      console.log('\n🎉 TOUS LES TESTS DE SÉCURITÉ SONT PASSÉS !');
      console.log('Africa Suite Pulse est prêt pour la production.');
    } else {
      console.log('\n⚠️  ATTENTION: Des problèmes de sécurité ont été détectés.');
      console.log('Veuillez corriger les erreurs avant le déploiement en production.');
    }
  }

  /**
   * Exporte les résultats au format JSON
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      application: 'Africa Suite Pulse',
      version: '1.0.0',
      environment: 'test',
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        duration: this.results.reduce((sum, r) => sum + r.duration, 0)
      },
      results: this.results
    }, null, 2);
  }
}

/**
 * Tests de performance de sécurité
 */
export class SecurityPerformanceTests {
  /**
   * Test de performance du chiffrement
   */
  static async testEncryptionPerformance(): Promise<number> {
    const testData = 'A'.repeat(1000); // 1KB de données
    const iterations = 1000;
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const encrypted = SecureEncryption.encrypt(testData);
      SecureEncryption.decrypt(encrypted);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`Performance chiffrement: ${avgTime.toFixed(2)}ms par opération`);
    return avgTime;
  }

  /**
   * Test de performance du hachage
   */
  static async testHashingPerformance(): Promise<number> {
    const password = 'TestPassword123!';
    const iterations = 100;
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      SecureEncryption.hashPassword(password);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`Performance hachage: ${avgTime.toFixed(2)}ms par opération`);
    return avgTime;
  }
}

/**
 * Fonction principale pour exécuter tous les tests
 */
export async function runSecurityTests(): Promise<TestResult[]> {
  const testSuite = new SecurityTestSuite();
  const results = await testSuite.runAllTests();
  
  // Tests de performance
  console.log('\n⚡ TESTS DE PERFORMANCE:');
  await SecurityPerformanceTests.testEncryptionPerformance();
  await SecurityPerformanceTests.testHashingPerformance();
  
  return results;
}

// Export par défaut
export default SecurityTestSuite;

