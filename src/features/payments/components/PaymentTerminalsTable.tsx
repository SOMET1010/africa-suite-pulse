import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Plus } from "lucide-react";
import type { PaymentTerminal } from "@/types/payments";

interface PaymentTerminalsTableProps {
  terminals: PaymentTerminal[];
  loading: boolean;
  saving: Record<string, boolean>;
  onUpdate: (index: number, updates: Partial<PaymentTerminal>) => void;
  onAdd: () => void;
  onRemove: (id: string, index: number) => void;
}

export function PaymentTerminalsTable({
  terminals,
  loading,
  saving,
  onUpdate,
  onAdd,
  onRemove,
}: PaymentTerminalsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des terminaux...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Terminaux de Paiement</h3>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Fournisseur</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Device ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Commission</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actif</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terminals.map((terminal, index) => {
              const tempId = `temp-${index}`;
              const isSaving = saving[terminal.id || tempId];
              
              return (
                <tr key={terminal.id || index} className="border-t">
                  <td className="px-4 py-3">
                    <Input
                      value={terminal.name || ""}
                      onChange={(e) => onUpdate(index, { name: e.target.value })}
                      placeholder="Nom du terminal"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={terminal.provider || ""}
                      onChange={(e) => onUpdate(index, { provider: e.target.value })}
                      placeholder="Fournisseur"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={terminal.device_id || ""}
                      onChange={(e) => onUpdate(index, { device_id: e.target.value })}
                      placeholder="Device ID"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!terminal.take_commission}
                      onCheckedChange={(checked) => onUpdate(index, { take_commission: checked })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!terminal.active}
                      onCheckedChange={(checked) => onUpdate(index, { active: checked })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {terminal.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemove(terminal.id!, index)}
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
            {terminals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun terminal configuré
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}