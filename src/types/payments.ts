// Payment system types
import type { 
  PaymentMethod, 
  PaymentMethodInsert, 
  PaymentMethodUpdate,
  PaymentTerminal,
  PaymentTerminalInsert,
  PaymentTerminalUpdate,
  Currency,
  CurrencyInsert,
  CurrencyUpdate,
  PaymentTransaction,
  PaymentTransactionInsert,
  PaymentTransactionWithMethod,
  SupabaseResponse,
  SupabaseMultiResponse
} from './database';

// Re-export database types
export type {
  PaymentMethod,
  PaymentMethodInsert,
  PaymentMethodUpdate,
  PaymentTerminal,
  PaymentTerminalInsert,
  PaymentTerminalUpdate,
  Currency,
  CurrencyInsert,
  CurrencyUpdate,
  PaymentTransaction,
  PaymentTransactionInsert,
  PaymentTransactionWithMethod,
  SupabaseResponse,
  SupabaseMultiResponse
};

// Payment method kinds
export type PaymentMethodKind = 
  | 'cash'
  | 'card'
  | 'mobile_money'
  | 'bank_transfer'
  | 'check'
  | 'voucher';

// Payment capture modes
export type CaptureMode = 'passive' | 'active';

// Payment transaction status
export type TransactionStatus = 'captured' | 'pending' | 'failed' | 'cancelled';

// Create transaction input
export type CreateTransactionInput = {
  org_id: string;
  invoice_id: string;
  method_id: string;
  amount: number;
  currency_code?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

// Payment summary
export type PaymentSummary = {
  totalPaid: number;
  transactionCount: number;
};

// Payment method with metadata typed
export type PaymentMethodWithTypedMetadata = Omit<PaymentMethod, 'metadata'> & {
  metadata: {
    icon?: string;
    color?: string;
    description?: string;
    [key: string]: unknown;
  };
};

// Currency with rates
export type CurrencyWithRates = Currency & {
  rate_to_base: number;
  is_base: boolean;
};

// Mobile money provider types
export type MobileMoneyProvider = 
  | 'orange_money'
  | 'mtn_money'
  | 'moov_money'
  | 'wave'
  | 'free_money';

// Payment terminal providers
export type TerminalProvider = 
  | 'ingenico'
  | 'verifone'
  | 'worldline'
  | 'sumup'
  | 'square';