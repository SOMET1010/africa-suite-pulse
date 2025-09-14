import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Calendar, AlertTriangle, Package, Trash2, Archive, RotateCcw } from "lucide-react";
import { useInventoryData } from "../../hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errorHandling";

interface ExpiryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExpiryItem {
  id: string;
  name: string;
  batch_number?: string;
  expiry_date: string;
  current_stock: number;
  days_until_expiry: number;
  expiry_status: 'expired' | 'critical' | 'warning' | 'normal';
  warehouse_name?: string;
}

export function ExpiryManagementDialog({ open, onOpenChange }: ExpiryManagementDialogProps) {
  const { stockItems, warehouses } = useInventoryData();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const getExpiryItems = (): ExpiryItem[] => {
    const today = new Date();
    const items = stockItems
      .filter(item => item.expiry_date)
      .map(item => {
        const expiryDate = new Date(item.expiry_date!);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let expiry_status: 'expired' | 'critical' | 'warning' | 'normal';
        if (daysUntilExpiry < 0) expiry_status = 'expired';
        else if (daysUntilExpiry <= 2) expiry_status = 'critical';
        else if (daysUntilExpiry <= 7) expiry_status = 'warning';
        else expiry_status = 'normal';

        const warehouse = warehouses.find(w => w.id === item.warehouse_id);

        return {
          id: item.id,
          name: item.name,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date!,
          current_stock: item.current_stock,
          days_until_expiry: daysUntilExpiry,
          expiry_status,
          warehouse_name: warehouse?.name
        };
      })
      .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

    return items;
  };

  const expiryItems = getExpiryItems();
  const expiredItems = expiryItems.filter(item => item.expiry_status === 'expired');
  const criticalItems = expiryItems.filter(item => item.expiry_status === 'critical');
  const warningItems = expiryItems.filter(item => item.expiry_status === 'warning');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired': return <Trash2 className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Calendar className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleDisposeExpired = async () => {
    setIsProcessing(true);
    try {
      for (const item of expiredItems) {
        // Create disposal movement
        await supabase
          .from('pos_stock_movements')
          .insert([{
            org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
            stock_item_id: item.id,
            warehouse_id: warehouses[0]?.id,
            movement_type: 'out',
            quantity: item.current_stock,
            reason: 'Disposal - Expired product',
            notes: `Automatic disposal - Expired on ${new Date(item.expiry_date).toLocaleDateString('fr-FR')}`,
            performed_at: new Date().toISOString(),
            performed_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        // Update stock to 0
        await supabase
          .from('pos_stock_items')
          .update({ current_stock: 0 })
          .eq('id', item.id);
      }

      toast({
        title: "Produits expirés supprimés",
        description: `${expiredItems.length} produit(s) expirés ont été retirés du stock.`,
      });

      window.location.reload();
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: `Impossible de traiter les produits expirés: ${getErrorMessage(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkdownCritical = async () => {
    setIsProcessing(true);
    try {
      for (const item of criticalItems) {
        // Create markdown movement (50% off)
        const markdownQuantity = Math.floor(item.current_stock * 0.5);
        
        await supabase
          .from('pos_stock_movements')
          .insert([{
            org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
            stock_item_id: item.id,
            warehouse_id: warehouses[0]?.id,
            movement_type: 'out',
            quantity: markdownQuantity,
            reason: 'Markdown - Critical expiry',
            notes: `Markdown sale - Expires in ${item.days_until_expiry} days`,
            performed_at: new Date().toISOString(),
            performed_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        // Update stock
        await supabase
          .from('pos_stock_items')
          .update({ current_stock: item.current_stock - markdownQuantity })
          .eq('id', item.id);
      }

      toast({
        title: "Démarque appliquée",
        description: `Démarque appliquée à ${criticalItems.length} produit(s) à expiration critique.`,
      });

      window.location.reload();
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: `Impossible d'appliquer la démarque: ${getErrorMessage(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestion des Dates d'Expiration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expirés</p>
                    <p className="text-2xl font-bold text-red-600">{expiredItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Critique (≤2j)</p>
                    <p className="text-2xl font-bold text-orange-600">{criticalItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alerte (≤7j)</p>
                    <p className="text-2xl font-bold text-yellow-600">{warningItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">{expiryItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {(expiredItems.length > 0 || criticalItems.length > 0) && (
            <div className="flex gap-4">
              {expiredItems.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDisposeExpired}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer Produits Expirés ({expiredItems.length})
                </Button>
              )}
              
              {criticalItems.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleMarkdownCritical}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Démarquer Produits Critiques ({criticalItems.length})
                </Button>
              )}
            </div>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Articles avec Dates d'Expiration</CardTitle>
            </CardHeader>
            <CardContent>
              {expiryItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-medium">Aucun article avec date d'expiration</p>
                  <p className="text-muted-foreground">Ajoutez des dates d'expiration lors des entrées de stock</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Date d'Expiration</TableHead>
                      <TableHead>Jours Restants</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Entrepôt</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiryItems.map((item) => (
                      <TableRow key={item.id} className={item.expiry_status === 'expired' ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.batch_number || '-'}</TableCell>
                        <TableCell>{item.current_stock}</TableCell>
                        <TableCell>
                          {new Date(item.expiry_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={item.days_until_expiry < 0 ? 'text-red-600 font-bold' : ''}>
                              {item.days_until_expiry < 0 ? 
                                `Expiré depuis ${Math.abs(item.days_until_expiry)}j` : 
                                `${item.days_until_expiry}j`
                              }
                            </span>
                            {item.days_until_expiry >= 0 && (
                              <Progress 
                                value={Math.max(0, Math.min(100, (7 - item.days_until_expiry) / 7 * 100))}
                                className="w-16 h-2"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(item.expiry_status) as any} className="gap-1">
                            {getStatusIcon(item.expiry_status)}
                            {item.expiry_status === 'expired' ? 'Expiré' :
                             item.expiry_status === 'critical' ? 'Critique' :
                             item.expiry_status === 'warning' ? 'Alerte' : 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.warehouse_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.expiry_status === 'expired' && (
                              <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                            {item.expiry_status === 'critical' && (
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Archive className="w-3 h-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}