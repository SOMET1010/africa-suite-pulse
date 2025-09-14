import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import type { PaymentMethod, PaymentMethodKind } from "@/types/payments";

const PAYMENT_KINDS: PaymentMethodKind[] = ["cash", "card", "mobile_money", "bank_transfer", "check", "voucher"];

interface PaymentMethodsTableProps {
  methods: PaymentMethod[];
  loading: boolean;
  saving: Record<string, boolean>;
  onUpdate: (index: number, updates: Partial<PaymentMethod>) => void;
  onAdd: () => void;
  onRemove: (id: string, index: number) => void;
}

export function PaymentMethodsTable({
  methods,
  loading,
  saving,
  onUpdate,
  onAdd,
  onRemove,
}: PaymentMethodsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des méthodes...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Méthodes de Paiement</h3>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Libellé</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Commission %</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actif</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method, index) => {
              const tempId = `temp-${index}`;
              const isSaving = saving[method.id || tempId];
              
              return (
                <tr key={method.id || index} className="border-t">
                  <td className="px-4 py-3">
                    <Input
                      value={method.code || ""}
                      onChange={(e) => onUpdate(index, { code: e.target.value.toUpperCase() })}
                      placeholder="CODE"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={method.label || ""}
                      onChange={(e) => onUpdate(index, { label: e.target.value })}
                      placeholder="Libellé"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={method.kind || "card"}
                      onValueChange={(value: PaymentMethodKind) => onUpdate(index, { kind: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_KINDS.map((kind) => (
                          <SelectItem key={kind} value={kind}>
                            {kind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      step="0.001"
                      value={method.commission_percent || 0}
                      onChange={(e) => onUpdate(index, { commission_percent: Number(e.target.value || 0) })}
                      className="h-9 w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!method.active}
                      onCheckedChange={(checked) => onUpdate(index, { active: checked })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {method.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemove(method.id!, index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {methods.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune méthode de paiement configurée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}