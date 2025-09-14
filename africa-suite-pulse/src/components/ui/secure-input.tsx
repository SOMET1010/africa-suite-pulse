import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SecureInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  sanitize?: boolean;
  allowedChars?: RegExp;
  maxLength?: number;
  preventXSS?: boolean;
}

const sanitizeInput = (value: string): string => {
  // Remove potentially dangerous characters and patterns
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
};

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    className, 
    type = "text", 
    sanitize = true, 
    allowedChars, 
    maxLength = 500, 
    preventXSS = true, 
    onChange, 
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      // Apply character restrictions
      if (allowedChars && !allowedChars.test(value)) {
        return; // Reject invalid characters
      }

      // Apply length restrictions
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }

      // Apply sanitization
      if (sanitize && preventXSS) {
        value = sanitizeInput(value);
      }

      // Update the input value
      event.target.value = value;

      // Call original onChange
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <Input
        type={type}
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
    );
  }
);

SecureInput.displayName = "SecureInput";

export { SecureInput };