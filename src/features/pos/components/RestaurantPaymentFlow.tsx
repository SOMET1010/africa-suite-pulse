import { ModernPaymentDialog } from "./ModernPaymentDialog";
import { SplitBillDialog } from "./SplitBillDialog";
import { TableTransferDialog } from "./TableTransferDialog";
import { UnifiedBillDialog } from "./UnifiedBillDialog";
import type { CartItem, POSTable } from "../types";

interface RestaurantPaymentFlowProps {
  // Bill preview dialog (addition)
  isBillPreviewOpen: boolean;
  onCloseBillPreview: () => void;
  onProceedToPayment: () => void;

  // Payment dialog
  isPaymentOpen: boolean;
  onClosePayment: () => void;
  currentOrder: any;
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
    discount: number;
  };
  onPaymentComplete: () => void;

  // Split bill dialog
  isSplitBillOpen: boolean;
  onCloseSplitBill: () => void;

  // Table transfer dialog
  isTableTransferOpen: boolean;
  onCloseTableTransfer: () => void;
  selectedTable: POSTable | null;
  selectedOutlet: any;
}

export function RestaurantPaymentFlow({
  isBillPreviewOpen,
  onCloseBillPreview,
  onProceedToPayment,
  isPaymentOpen,
  onClosePayment,
  currentOrder,
  cartItems,
  totals,
  onPaymentComplete,
  isSplitBillOpen,
  onCloseSplitBill,
  isTableTransferOpen,
  onCloseTableTransfer,
  selectedTable,
  selectedOutlet
}: RestaurantPaymentFlowProps) {
  const handlePaymentComplete = () => {
    onPaymentComplete();
    // Focus back on quick add for immediate next order
    setTimeout(() => {
      const focusQuickAdd = () => {
        const el = document.getElementById('quick-add-input');
        if (el) (el as HTMLInputElement).focus();
      };
      focusQuickAdd();
    }, 100);
  };

  return (
    <>
      {/* Unified Bill Dialog (Addition + Quick Actions) */}
      {currentOrder && (
        <UnifiedBillDialog
          isOpen={isBillPreviewOpen}
          onClose={onCloseBillPreview}
          onSplitBill={() => {
            onCloseBillPreview();
            // Parent will handle opening split bill dialog
          }}
          currentOrder={currentOrder}
          cartItems={cartItems}
          totals={totals}
          onPaymentComplete={onPaymentComplete}
        />
      )}

      {/* Legacy Payment Dialog - now handled within UnifiedBillDialog */}
      {/* Keeping for backward compatibility or direct payment scenarios */}
      {currentOrder && isPaymentOpen && (
        <ModernPaymentDialog
          isOpen={isPaymentOpen}
          onClose={onClosePayment}
          order={currentOrder}
          cartItems={cartItems}
          totals={totals}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Split Bill Dialog */}
      <SplitBillDialog
        open={isSplitBillOpen}
        onOpenChange={onCloseSplitBill}
        orderId={currentOrder?.id || ""}
        orderItems={cartItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))}
        orderTotal={totals.total}
      />

      {/* Table Transfer Dialog */}
      <TableTransferDialog
        open={isTableTransferOpen}
        onOpenChange={onCloseTableTransfer}
        orderId={currentOrder?.id || ""}
        currentTableId={selectedTable?.id}
        outletId={selectedOutlet?.id || ""}
      />
    </>
  );
}