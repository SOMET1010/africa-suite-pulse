import { useEffect, useMemo, useState } from "react";
import { listPaymentMethods, createPaymentTransaction } from "@/features/payments/payments.api";
import { useOrgId } from "@/core/auth/useOrg";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingPaymentSheetProps {
  invoiceId: string;
  totalDue: number;
  onPaid?: () => void;
  defaultAmount?: number;
}

export default function BillingPaymentSheet({ invoiceId, totalDue, onPaid, defaultAmount }: BillingPaymentSheetProps) {
  const { orgId } = useOrgId();
  const [methods, setMethods] = useState<any[]>([]);
  const [methodId, setMethodId] = useState<string>("");
  const [amount, setAmount] = useState<number>(defaultAmount ?? totalDue);
  const [reference, setReference] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selected = useMemo(() => methods.find(m => m.id === methodId), [methods, methodId]);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        const { data } = await listPaymentMethods(orgId);
        const activeMethods = (data ?? []).filter(m => m.active);
        setMethods(activeMethods);
        if (activeMethods.length === 1) {
          setMethodId(activeMethods[0].id);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    })();
  }, [orgId]);

  const needsReference = !!selected?.code?.startsWith("MM_");

  async function handlePay() {
    if (!orgId || !selected) return;
    
    if (amount <= 0) {
      return toast({ 
        title: "Montant invalide", 
        description: "Le montant doit être supérieur à 0",
        variant: "destructive" 
      });
    }
    
    if (needsReference && !reference.trim()) {
      return toast({ 
        title: "Référence requise", 
        description: "Saisir le N° de transaction Mobile Money.", 
        variant: "destructive" 
      });
    }

    setIsProcessing(true);
    try {
      await createPaymentTransaction({
        org_id: orgId,
        invoice_id: invoiceId,
        method_id: selected.id,
        amount,
        reference: reference || undefined,
        metadata: needsReference ? { provider: selected.code.replace("MM_","") } : undefined,
      });
      
      toast({ 
        title: "Paiement enregistré", 
        description: `${amount.toLocaleString()} encaissé via ${selected.label}`
      });
      
      onPaid?.();
    } catch (e: any) {
      toast({ 
        title: "Erreur d'encaissement", 
        description: e.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing && methodId && amount > 0) {
      if (!needsReference || reference.trim()) {
        handlePay();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encaissement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" onKeyPress={handleKeyPress}>
        <div className="space-y-2">
          <Label htmlFor="payment-method">Moyen de paiement</Label>
          <Select value={methodId} onValueChange={setMethodId}>
            <SelectTrigger>
              <SelectValue placeholder="— Sélectionner —" />
            </SelectTrigger>
            <SelectContent>
              {methods.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label} {m.commission_percent ? `(${m.commission_percent}% com.)` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Montant</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="1"
            value={amount}
            onChange={e => setAmount(Number(e.target.value || 0))}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Reste à payer:</span>
            <span className="font-medium">{totalDue.toLocaleString()}</span>
          </div>
        </div>

        {needsReference && (
          <div className="space-y-2">
            <Label htmlFor="reference">Référence Mobile Money</Label>
            <Input
              id="reference"
              placeholder="Ex: TX-20250811-123456"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Numéro/ID de transaction fourni par l'opérateur.
            </p>
          </div>
        )}

        {selected?.commission_percent && selected.commission_percent > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Commission: {((amount * selected.commission_percent) / 100).toLocaleString()} 
              ({selected.commission_percent}%)
            </p>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handlePay}
          disabled={isProcessing || !methodId || amount <= 0 || (needsReference && !reference.trim())}
        >
          {isProcessing ? "Traitement..." : "Enregistrer le paiement"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Appuyez sur [Entrée] pour valider rapidement
        </p>
      </CardContent>
    </Card>
  );
}