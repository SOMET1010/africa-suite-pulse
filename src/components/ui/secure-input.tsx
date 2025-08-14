/**
 * Secure input component with built-in validation and sanitization
 */

import React, { useState, useCallback } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Alert, AlertDescription } from './alert';
import { validateEmail, validatePhone, validateCurrencyAmount, validateText, ValidationResult } from '@/lib/security';

interface SecureInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  label?: string;
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  validationType?: 'email' | 'phone' | 'currency' | 'text' | 'none';
  required?: boolean;
  currency?: string;
  maxLength?: number;
  showValidation?: boolean;
}

export function SecureInput({
  label,
  value,
  onChange,
  validationType = 'text',
  required = false,
  currency = 'XOF',
  maxLength,
  showValidation = true,
  className,
  ...props
}: SecureInputProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isTouched, setIsTouched] = useState(false);

  const validateInput = useCallback((inputValue: string): ValidationResult => {
    if (!inputValue && !required) {
      return { isValid: true, sanitized: '' };
    }

    switch (validationType) {
      case 'email':
        return validateEmail(inputValue);
      case 'phone':
        return validatePhone(inputValue);
      case 'currency':
        return validateCurrencyAmount(inputValue, currency);
      case 'text':
        return validateText(inputValue, label || 'field', required);
      case 'none':
        return { isValid: true, sanitized: inputValue };
      default:
        return { isValid: true, sanitized: inputValue };
    }
  }, [validationType, currency, required, label]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Apply maxLength constraint
    const constrainedValue = maxLength ? inputValue.slice(0, maxLength) : inputValue;
    
    const validationResult = validateInput(constrainedValue);
    setValidation(validationResult);
    
    // Always call onChange with the current value and validation state
    onChange(constrainedValue, validationResult.isValid);
  }, [onChange, validateInput, maxLength]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    // Re-validate on blur
    const validationResult = validateInput(value);
    setValidation(validationResult);
    
    // If we have a sanitized value different from current, update it
    if (validationResult.sanitized && validationResult.sanitized !== value) {
      onChange(validationResult.sanitized, validationResult.isValid);
    }
  }, [value, validateInput, onChange]);

  const shouldShowError = showValidation && isTouched && !validation.isValid && validation.error;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} ${shouldShowError ? 'border-destructive' : ''}`}
        aria-invalid={!validation.isValid}
        aria-describedby={shouldShowError ? `${props.id}-error` : undefined}
      />
      
      {shouldShowError && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm" id={`${props.id}-error`}>
            {validation.error}
          </AlertDescription>
        </Alert>
      )}
      
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}