import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { InventoryManagement } from "@/features/pos/inventory/InventoryManagement";
import EnhancedProductManagement from "@/features/pos/components/EnhancedProductManagement";
import { InventoryNotifications } from "@/features/pos/inventory/components/InventoryNotifications";
import { StockAnalytics } from "@/features/pos/inventory/components/StockAnalytics";
import { useInventoryData } from "@/features/pos/hooks/useInventoryData";

export default function POSInventoryPage() {
  const navigate = useNavigate();
  const { stockItems, lowStockItems } = useInventoryData();

  const headerAction = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => navigate("/pos")}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </Button>
  );

  return (
    <UnifiedLayout 
      title="Inventaire POS"
      headerAction={headerAction}
      showStatusBar={false}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produits</p>
                <p className="text-2xl font-bold">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-2xl font-bold">
                  {stockItems.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mouvements</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <InventoryNotifications />
        </div>
        <div className="lg:col-span-2">
          <StockAnalytics />
        </div>
      </div>

      <EnhancedProductManagement outletId="default" />
    </UnifiedLayout>
  );
}