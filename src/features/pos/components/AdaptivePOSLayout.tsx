import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBusinessContext } from "../hooks/useBusinessContext";
import { ModernTicketPanel } from "./ModernTicketPanel";
import { MarketTilesCatalog } from "./MarketTilesCatalog";
import { BusinessContextualHeader } from "./BusinessContextualHeader";
import { BusinessDashboardWidgets } from "./BusinessDashboardWidgets";
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react";
import type { POSOutlet, POSTable, CartItem } from "../types";

interface AdaptivePOSLayoutProps {
  selectedOutlet: POSOutlet;
  selectedTable: POSTable | null;
  cartItems: CartItem[];
  customerCount: number;
  searchQuery: string;
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
    discount: number;
  };
  onAddToCart: (product: any, quantity?: number) => void;
  onSearchChange: (query: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckout: () => void;
  onSendToKitchen: () => void;
  onSplitBill: () => void;
  onTransferTable: () => void;
  // ... other handlers
}

type LayoutMode = 'restaurant' | 'fast_food' | 'bar' | 'boutique';
type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function AdaptivePOSLayout({
  selectedOutlet,
  selectedTable,
  cartItems,
  customerCount,
  searchQuery,
  totals,
  onAddToCart,
  onSearchChange,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  onSendToKitchen,
  onSplitBill,
  onTransferTable,
}: AdaptivePOSLayoutProps) {
  const { businessType, getBusinessConfig } = useBusinessContext();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('restaurant');
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isTicketCollapsed, setIsTicketCollapsed] = useState(false);

  const businessConfig = getBusinessConfig();

  // Detect viewport size
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 768) setViewportSize('mobile');
      else if (width < 1024) setViewportSize('tablet');
      else setViewportSize('desktop');
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Auto-adapt layout based on business type
  useEffect(() => {
    if (businessType) {
      setLayoutMode(businessType as LayoutMode);
    }
  }, [businessType]);

  // Layout configurations per business type
  const getLayoutConfig = () => {
    const configs = {
      restaurant: {
        columns: 'grid-cols-12',
        ticket: 'col-span-4',
        catalog: 'col-span-5', 
        actions: 'col-span-3',
        orientation: 'portrait' as const,
        priority: 'balance' as const
      },
      fast_food: {
        columns: 'grid-cols-10',
        ticket: 'col-span-3',
        catalog: 'col-span-7',
        actions: 'hidden', // Integrated in catalog
        orientation: 'landscape' as const,
        priority: 'speed' as const
      },
      bar: {
        columns: 'grid-cols-12',
        ticket: 'col-span-3',
        catalog: 'col-span-6',
        actions: 'col-span-3',
        orientation: 'landscape' as const,
        priority: 'visual' as const
      },
      boutique: {
        columns: 'grid-cols-12',
        ticket: 'col-span-4',
        catalog: 'col-span-5',
        actions: 'col-span-3',
        orientation: 'portrait' as const,
        priority: 'inventory' as const
      }
    };

    return configs[layoutMode] || configs.restaurant;
  };

  const layoutConfig = getLayoutConfig();

  // Mobile layout - stack vertically with tabs
  if (viewportSize === 'mobile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
        <BusinessContextualHeader
          selectedOutlet={selectedOutlet}
          selectedTable={selectedTable}
          customerCount={customerCount}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          businessConfig={businessConfig}
        />
        
        <div className="p-2 space-y-3">
          {/* Mobile Dashboard Widgets */}
          <BusinessDashboardWidgets 
            businessType={layoutMode}
            isExpanded={false}
            size="compact"
          />
          
          {/* Mobile Tab Content */}
          <div className="space-y-3">
            <Card className="glass-card">
              <MarketTilesCatalog
                outletId={selectedOutlet.id}
                searchQuery={searchQuery}
                onAddToCart={onAddToCart}
                onSearchChange={onSearchChange}
              />
            </Card>
            
            {cartItems.length > 0 && (
              <Card className="glass-card">
                <ModernTicketPanel
                  items={cartItems}
                  selectedTable={selectedTable}
                  customerCount={customerCount}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveFromCart}
                  onSendToKitchen={onSendToKitchen}
                  onCheckout={onCheckout}
                  onSplitBill={onSplitBill}
                  onTransferTable={onTransferTable}
                  totals={totals}
                  onDuplicateItem={(productId) => {
                    const item = cartItems.find(i => i.product_id === productId);
                    if (item) onAddToCart(item.product, 1);
                  }}
                  onTransferItem={() => {}}
                  onCancelItem={onRemoveFromCart}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tablet layout - adaptive columns
  if (viewportSize === 'tablet') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
        <BusinessContextualHeader
          selectedOutlet={selectedOutlet}
          selectedTable={selectedTable}
          customerCount={customerCount}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          businessConfig={businessConfig}
        />
        
        <div className="grid grid-cols-8 min-h-[calc(100vh-7rem)] gap-3 p-3">
          {/* Ticket Panel */}
          <div className={`col-span-3 ${isTicketCollapsed ? 'hidden' : ''}`}>
            <Card className="h-full glass-card rounded-2xl shadow-elevate">
              <ModernTicketPanel
                items={cartItems}
                selectedTable={selectedTable}
                customerCount={customerCount}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveFromCart}
                onSendToKitchen={onSendToKitchen}
                onCheckout={onCheckout}
                onSplitBill={onSplitBill}
                onTransferTable={onTransferTable}
                totals={totals}
                onDuplicateItem={(productId) => {
                  const item = cartItems.find(i => i.product_id === productId);
                  if (item) onAddToCart(item.product, 1);
                }}
                onTransferItem={() => {}}
                onCancelItem={onRemoveFromCart}
              />
            </Card>
          </div>
          
          {/* Catalog */}
          <div className={`${isTicketCollapsed ? 'col-span-8' : 'col-span-5'}`}>
            <Card className="h-full glass-card rounded-2xl shadow-elevate">
              <MarketTilesCatalog
                outletId={selectedOutlet.id}
                searchQuery={searchQuery}
                onAddToCart={onAddToCart}
                onSearchChange={onSearchChange}
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - full adaptive
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <BusinessContextualHeader
        selectedOutlet={selectedOutlet}
        selectedTable={selectedTable}
        customerCount={customerCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        businessConfig={businessConfig}
      />
      
      {/* Layout Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/50 border-b">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Monitor className="h-3 w-3" />
            Mode {layoutConfig.priority}
          </Badge>
          
          <div className="flex items-center gap-1">
            {(['restaurant', 'fast_food', 'bar', 'boutique'] as const).map((mode) => (
              <Button
                key={mode}
                variant={layoutMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode(mode)}
                className="capitalize"
              >
                {mode.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
          >
            {isDashboardExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            Dashboard
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTicketCollapsed(!isTicketCollapsed)}
          >
            {isTicketCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            Ticket
          </Button>
        </div>
      </div>

      {/* Expandable Dashboard */}
      {isDashboardExpanded && (
        <div className="border-b bg-card/30 p-4">
          <BusinessDashboardWidgets 
            businessType={layoutMode}
            isExpanded={true}
            size="full"
          />
        </div>
      )}
      
      {/* Adaptive Grid Layout */}
      <div className={`grid ${layoutConfig.columns} min-h-[calc(100vh-${isDashboardExpanded ? '16rem' : '10rem'})] gap-4 p-4`}>
        {/* Ticket Panel */}
        {!isTicketCollapsed && (
          <div className={layoutConfig.ticket}>
            <Card className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
              <ModernTicketPanel
                items={cartItems}
                selectedTable={selectedTable}
                customerCount={customerCount}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveFromCart}
                onSendToKitchen={onSendToKitchen}
                onCheckout={onCheckout}
                onSplitBill={onSplitBill}
                onTransferTable={onTransferTable}
                totals={totals}
                onDuplicateItem={(productId) => {
                  const item = cartItems.find(i => i.product_id === productId);
                  if (item) onAddToCart(item.product, 1);
                }}
                onTransferItem={() => {}}
                onCancelItem={onRemoveFromCart}
              />
            </Card>
          </div>
        )}
        
        {/* Product Catalog */}
        <div className={isTicketCollapsed ? 'col-span-9' : layoutConfig.catalog}>
          <Card className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
            <MarketTilesCatalog
              outletId={selectedOutlet.id}
              searchQuery={searchQuery}
              onAddToCart={onAddToCart}
              onSearchChange={onSearchChange}
            />
          </Card>
        </div>
        
        {/* Actions Panel - Business Specific */}
        {layoutConfig.actions !== 'hidden' && !isTicketCollapsed && (
          <div className={layoutConfig.actions}>
            <Card className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
              <BusinessDashboardWidgets 
                businessType={layoutMode}
                isExpanded={false}
                size="sidebar"
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
