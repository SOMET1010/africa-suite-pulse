/**
 * Bundle optimization utilities
 * Helps with tree shaking and code splitting
 */

import React from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

/**
 * Lazy load Lucide icons to improve bundle size
 */
export const createLucideIcon = (iconName: keyof typeof dynamicIconImports) => {
  return React.lazy(dynamicIconImports[iconName]);
};

/**
 * Common Radix UI imports optimization
 * Replace * as imports with specific named imports
 */

// Accordion optimized imports
export {
  Root as AccordionRoot,
  Item as AccordionItem,
  Header as AccordionHeader,
  Trigger as AccordionTrigger,
  Content as AccordionContent,
} from '@radix-ui/react-accordion';

// Dialog optimized imports
export {
  Root as DialogRoot,
  Portal as DialogPortal,
  Overlay as DialogOverlay,
  Content as DialogContent,
  Title as DialogTitle,
  Description as DialogDescription,
  Close as DialogClose,
  Trigger as DialogTrigger,
} from '@radix-ui/react-dialog';

// Select optimized imports
export {
  Root as SelectRoot,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Icon as SelectIcon,
  Portal as SelectPortal,
  Content as SelectContent,
  Viewport as SelectViewport,
  Item as SelectItem,
  ItemText as SelectItemText,
  ItemIndicator as SelectItemIndicator,
  ScrollUpButton as SelectScrollUpButton,
  ScrollDownButton as SelectScrollDownButton,
  Group as SelectGroup,
  Label as SelectLabel,
  Separator as SelectSeparator,
} from '@radix-ui/react-select';

/**
 * Bundle analysis helper
 */
export const getBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      timestamp: new Date().toISOString(),
      chunks: performance.getEntriesByType('navigation'),
      memory: (performance as any).memory,
    };
  }
  return null;
};