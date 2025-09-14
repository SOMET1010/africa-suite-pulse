/**
 * Security utilities for input validation and sanitization
 */

import { logger } from "./logger";

// Input validation patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{6,20}$/,
  alphanumeric: /^[a-zA-Z0-9\s\-_\.]+$/,
  currency: /^\d+(\.\d{1,2})?$/,
  posPin: /^\d{4,6}$/,
  reference: /^[a-zA-Z0-9\-_]{1,50}$/,
} as const;

// Maximum field lengths for security
const MAX_LENGTHS = {
  name: 100,
  email: 255,
  phone: 20,
  description: 1000,
  notes: 2000,
  reference: 50,
  pin: 6,
} as const;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input) return '';
  
  let sanitized = input
    .trim()
    .replace(/[<>\"'`]/g, '') // Remove potential script injection chars
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (email.length > MAX_LENGTHS.email) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  if (!PATTERNS.email.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true, sanitized: sanitizeString(email.toLowerCase()) };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone is required' };
  }
  
  if (phone.length > MAX_LENGTHS.phone) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  if (!PATTERNS.phone.test(phone)) {
    return { isValid: false, error: 'Invalid phone format' };
  }
  
  return { isValid: true, sanitized: sanitizeString(phone) };
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: string | number, currency = 'XOF'): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Amount must be positive' };
  }
  
  // Set reasonable limits based on currency
  const maxLimits = {
    XOF: 50000000, // 50M CFA
    USD: 100000,   // 100K USD
    EUR: 100000,   // 100K EUR
  };
  
  const maxLimit = maxLimits[currency as keyof typeof maxLimits] || 100000;
  
  if (numAmount > maxLimit) {
    return { isValid: false, error: `Amount exceeds maximum limit for ${currency}` };
  }
  
  // Check for decimal precision
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  
  return { isValid: true, sanitized: numAmount.toFixed(2) };
}

/**
 * Validate POS PIN
 */
export function validatePOSPin(pin: string): ValidationResult {
  if (!pin) {
    return { isValid: false, error: 'PIN is required' };
  }
  
  if (!PATTERNS.posPin.test(pin)) {
    return { isValid: false, error: 'PIN must be 4-6 digits' };
  }
  
  // Check for obvious weak PINs
  const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
  if (weakPins.includes(pin)) {
    return { isValid: false, error: 'PIN is too weak, please choose a different one' };
  }
  
  return { isValid: true, sanitized: pin };
}

/**
 * Validate reference number
 */
export function validateReference(reference: string): ValidationResult {
  if (!reference) {
    return { isValid: false, error: 'Reference is required' };
  }
  
  if (reference.length > MAX_LENGTHS.reference) {
    return { isValid: false, error: 'Reference is too long' };
  }
  
  if (!PATTERNS.reference.test(reference)) {
    return { isValid: false, error: 'Reference contains invalid characters' };
  }
  
  return { isValid: true, sanitized: sanitizeString(reference.toUpperCase()) };
}

/**
 * Validate general text input
 */
export function validateText(text: string, field: string, required = false): ValidationResult {
  if (required && !text) {
    return { isValid: false, error: `${field} is required` };
  }
  
  if (!text) {
    return { isValid: true, sanitized: '' };
  }
  
  const maxLength = MAX_LENGTHS[field as keyof typeof MAX_LENGTHS] || MAX_LENGTHS.description;
  
  if (text.length > maxLength) {
    return { isValid: false, error: `${field} is too long (max ${maxLength} characters)` };
  }
  
  return { isValid: true, sanitized: sanitizeString(text, maxLength) };
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: Record<string, any>, severity: 'info' | 'warning' | 'error' = 'info') {
  logger.security(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
    severity
  });
}

/**
 * Rate limiting client-side check
 */
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  check(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string) {
    this.attempts.delete(key);
  }
}

export const clientRateLimit = new ClientRateLimit();