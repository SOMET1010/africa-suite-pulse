import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/unified-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFNEIntegration } from "../hooks/useFNEIntegration";
import { getErrorMessage } from "@/utils/errorHandling";
export const FNETestPanel = () => {
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [testOrderNumber, setTestOrderNumber] = useState("");
  const [testAmount, setTestAmount] = useState("15000");
  const [testCustomer, setTestCustomer] = useState("");

  // Organization ID - will be retrieved from auth context when available
  const orgId = "7e389008-3dd1-4f54-816d-4f1daff1f435";
  const { submitInvoice, isSubmitting } = useFNEIntegration(orgId);

  const createTestOrder = async () => {
    setIsCreatingTest(true);
    try {
      const orderNumber = testOrderNumber || `TEST-FNE-${Date.now()}`;
      const amount = parseFloat(testAmount);
      const taxAmount = Math.round(amount * 0.18); // TVA 18%

      // 1. Créer la commande de test
      const { data: order, error: orderError } = await supabase
        .from("pos_orders")
        .insert({
          org_id: orgId,
          order_number: orderNumber,
          total_amount: amount,
          tax_amount: taxAmount,
          status: "completed",
          fne_status: "pending",
        })
        .select()
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (orderError) throw orderError;

      // 2. Soumettre à FNE
      await submitInvoice({
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: amount,
        taxAmount: taxAmount,
        items: [
          {
            name: `Article Test FNE - ${orderNumber}`,
            quantity: 1,
            unitPrice: amount,
            totalPrice: amount,
            taxRate: 18,
          },
        ],
        customer: testCustomer ? {
          name: testCustomer,
          phone: "+225 01 02 03 04 05",
          email: "test@example.com",
        } : undefined,
      });

      toast({
        title: "Commande de test créée",
        description: `Commande ${orderNumber} soumise à FNE`,
        variant: "success",
      });

      // Reset form
      setTestOrderNumber("");
      setTestCustomer("");

    } catch (error: unknown) {
      toast({
        title: "Erreur de test",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsCreatingTest(false);
    }
  };

  const testEdgeFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("fne-connector", {
        body: {
          action: "submit_invoice",
          orderId: "test-id",
          orgId: orgId,
          orderNumber: "TEST-DIRECT",
          totalAmount: 10000,
          taxAmount: 1800,
          items: [
            {
              name: "Test Direct API",
              quantity: 1,
              unitPrice: 10000,
              totalPrice: 10000,
              taxRate: 18,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast({
        title: "Test Edge Function",
        description: data.success ? "API DGI simulée avec succès" : `Erreur: ${data.error_message}`,
        variant: data.success ? "success" : "destructive",
      });

    } catch (error: unknown) {
      toast({
        title: "Erreur Edge Function",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const testPendingProcess = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("fne-connector", {
        body: {
          action: "process_pending",
        },
      });

      if (error) throw error;

      toast({
        title: "Traitement Queue",
        description: "Queue offline traitée avec succès",
        variant: "success",
      });

    } catch (error: unknown) {
      toast({
        title: "Erreur Queue",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tests FNE DGI</CardTitle>
          <CardDescription>
            Outils de test pour valider l'intégration FNE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Créer commande de test */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">1. Créer une commande de test</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-order">Numéro de commande</Label>
                <Input
                  id="test-order"
                  placeholder="Laissez vide pour auto-générer"
                  value={testOrderNumber}
                  onChange={(e) => setTestOrderNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-amount">Montant (FCFA)</Label>
                <Input
                  id="test-amount"
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-customer">Client (optionnel)</Label>
              <Input
                id="test-customer"
                placeholder="Nom du client de test"
                value={testCustomer}
                onChange={(e) => setTestCustomer(e.target.value)}
              />
            </div>
            
            <Button
              onClick={createTestOrder}
              disabled={isCreatingTest || isSubmitting}
              className="w-full"
            >
              {isCreatingTest ? "Création..." : "Créer commande et soumettre FNE"}
            </Button>
          </div>

          {/* Tests directs */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">2. Tests directs</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={testEdgeFunction}
                variant="outline"
              >
                Tester Edge Function
              </Button>
              
              <Button
                onClick={testPendingProcess}
                variant="outline"
              >
                Traiter Queue Offline
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Instructions de test :</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Utilisez "Créer commande" pour un test complet POS → FNE</li>
              <li>Les tests directs valident les fonctions individuellement</li>
              <li>Vérifiez les onglets "Factures FNE" et "Queue Offline" pour voir les résultats</li>
              <li>Les logs API montrent tous les échanges avec la DGI simulée</li>
              <li>En mode développement, 10% des appels échouent pour tester les retry</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};