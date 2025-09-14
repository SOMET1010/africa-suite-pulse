/**
 * Centralized POS Store - Phase 1: Architecture Foundation
 * Manages all POS state in a single, optimized store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { POSOutlet, POSTable } from '../types';

export type POSMode = 'serveur-rush' | 'caissier' | 'manager';
export type BusinessType = 'restaurant' | 'collectivites';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  category: string;
  notes?: string;
  status: 'pending' | 'sent' | 'ready' | 'served';
}

interface POSOrder {
  id: string;
  table_id?: string;
  customer_count: number;
  status: 'active' | 'sent' | 'completed';
  items: CartItem[];
  created_at: string;
  total: number;
}

interface POSState {
  // Configuration
  businessType: BusinessType | null;
  selectedMode: POSMode | null;
  selectedOutlet: POSOutlet | null;
  selectedTable: POSTable | null;
  selectedStaff: string | null;

  // Current session
  currentOrder: POSOrder | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;

  // UI State
  isPaymentOpen: boolean;
  isSplitBillOpen: boolean;
  isTableTransferOpen: boolean;
  showVisualKeyboard: boolean;
  searchQuery: string;

  // Settings
  discount: { type: 'none' | 'percentage' | 'amount'; value: number };
  customerCount: number;
}

interface POSActions {
  // Configuration
  setBusinessType: (type: BusinessType) => void;
  setMode: (mode: POSMode) => void;
  setOutlet: (outlet: POSOutlet | null) => void;
  setTable: (table: POSTable | null) => void;
  setStaff: (staffId: string | null) => void;

  // Order management
  createOrder: (customerCount: number) => void;
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  sendToKitchen: () => void;

  // UI Actions
  setPaymentOpen: (open: boolean) => void;
  setSplitBillOpen: (open: boolean) => void;
  setTableTransferOpen: (open: boolean) => void;
  toggleVisualKeyboard: () => void;
  setSearchQuery: (query: string) => void;

  // Settings
  setDiscount: (type: 'percentage' | 'amount', value: number) => void;
  clearDiscount: () => void;
  setCustomerCount: (count: number) => void;

  // Utils
  reset: () => void;
  calculateTotals: () => {
    subtotal: number;
    discount: number;
    serviceCharge: number;
    tax: number;
    total: number;
  };
}

const initialState: POSState = {
  businessType: null,
  selectedMode: null,
  selectedOutlet: null,
  selectedTable: null,
  selectedStaff: null,
  currentOrder: null,
  cartItems: [],
  isLoading: false,
  error: null,
  isPaymentOpen: false,
  isSplitBillOpen: false,
  isTableTransferOpen: false,
  showVisualKeyboard: true,
  searchQuery: '',
  discount: { type: 'none', value: 0 },
  customerCount: 1,
};

export const usePOSStore = create<POSState & POSActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Configuration actions
        setBusinessType: (type) => set({ businessType: type }),
        setMode: (mode) => set({ selectedMode: mode }),
        setOutlet: (outlet) => set({ selectedOutlet: outlet }),
        setTable: (table) => set({ selectedTable: table }),
        setStaff: (staffId) => set({ selectedStaff: staffId }),

        // Order management
        createOrder: (customerCount) => {
          const newOrder: POSOrder = {
            id: crypto.randomUUID(),
            table_id: get().selectedTable?.id,
            customer_count: customerCount,
            status: 'active',
            items: [],
            created_at: new Date().toISOString(),
            total: 0,
          };
          set({ currentOrder: newOrder, customerCount });
        },

        addToCart: (product, quantity = 1) => {
          const state = get();
          const existingItem = state.cartItems.find(item => item.product_id === product.id);
          
          if (existingItem) {
            const updatedItems = state.cartItems.map(item =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
                : item
            );
            set({ cartItems: updatedItems });
          } else {
            const newItem: CartItem = {
              id: crypto.randomUUID(),
              product_id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              total: product.price * quantity,
              category: product.category,
              status: 'pending',
            };
            set({ cartItems: [...state.cartItems, newItem] });
          }
        },

        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeFromCart(itemId);
            return;
          }
          
          const updatedItems = get().cartItems.map(item =>
            item.id === itemId
              ? { ...item, quantity, total: quantity * item.price }
              : item
          );
          set({ cartItems: updatedItems });
        },

        removeFromCart: (itemId) => {
          const updatedItems = get().cartItems.filter(item => item.id !== itemId);
          set({ cartItems: updatedItems });
        },

        clearCart: () => set({ cartItems: [], currentOrder: null, discount: { type: 'none', value: 0 } }),

        sendToKitchen: () => {
          const updatedItems = get().cartItems.map(item => ({ ...item, status: 'sent' as const }));
          set({ cartItems: updatedItems });
        },

        // UI Actions
        setPaymentOpen: (open) => set({ isPaymentOpen: open }),
        setSplitBillOpen: (open) => set({ isSplitBillOpen: open }),
        setTableTransferOpen: (open) => set({ isTableTransferOpen: open }),
        toggleVisualKeyboard: () => set((state) => ({ showVisualKeyboard: !state.showVisualKeyboard })),
        setSearchQuery: (query) => set({ searchQuery: query }),

        // Settings
        setDiscount: (type, value) => set({ discount: { type, value } }),
        clearDiscount: () => set({ discount: { type: 'none', value: 0 } }),
        setCustomerCount: (count) => set({ customerCount: count }),

        // Utils
        reset: () => set(initialState),

        calculateTotals: () => {
          const state = get();
          const subtotal = state.cartItems.reduce((sum, item) => sum + item.total, 0);
          
          let discount = 0;
          if (state.discount.type === 'percentage') {
            discount = subtotal * (state.discount.value / 100);
          } else if (state.discount.type === 'amount') {
            discount = Math.min(state.discount.value, subtotal);
          }

          const discountedSubtotal = subtotal - discount;
          const serviceCharge = discountedSubtotal * 0.1; // 10%
          const tax = (discountedSubtotal + serviceCharge) * 0.18; // 18%
          const total = discountedSubtotal + serviceCharge + tax;

          return {
            subtotal: discountedSubtotal,
            discount,
            serviceCharge,
            tax,
            total,
          };
        },
      }),
      {
        name: 'pos-store',
        partialize: (state) => ({
          businessType: state.businessType,
          selectedMode: state.selectedMode,
          selectedOutlet: state.selectedOutlet,
          showVisualKeyboard: state.showVisualKeyboard,
        }),
      }
    ),
    { name: 'POS Store' }
  )
);