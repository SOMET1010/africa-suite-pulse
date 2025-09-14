import { ModernActionsPanel } from "./ModernActionsPanel";

interface RestaurantActionBarProps {
  onApplyDiscount: (type: 'percentage' | 'amount', value: number) => void;
  onRoomCharge: (roomId: string) => void;
  onSelectPrinter: (stationType: 'hot' | 'cold' | 'bar') => void;
}

export function RestaurantActionBar({
  onApplyDiscount,
  onRoomCharge,
  onSelectPrinter
}: RestaurantActionBarProps) {
  return (
    <div className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
      <ModernActionsPanel
        onApplyDiscount={onApplyDiscount}
        onRoomCharge={onRoomCharge}
        onSelectPrinter={onSelectPrinter}
      />
    </div>
  );
}