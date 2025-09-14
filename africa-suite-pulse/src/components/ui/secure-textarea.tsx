import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export interface SecureTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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

const SecureTextarea = React.forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ 
    className, 
    sanitize = true, 
    allowedChars, 
    maxLength = 2000, 
    preventXSS = true, 
    onChange, 
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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

      // Update the textarea value
      event.target.value = value;

      // Call original onChange
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <Textarea
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
    );
  }
);

SecureTextarea.displayName = "SecureTextarea";

export { SecureTextarea };