import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Plus } from "lucide-react";
import type { Currency } from "@/types/payments";

interface CurrenciesTableProps {
  currencies: Currency[];
  loading: boolean;
  saving: Record<string, boolean>;
  onUpdate: (index: number, updates: Partial<Currency>) => void;
  onAdd: () => void;
  onRemove: (id: string, index: number) => void;
}

export function CurrenciesTable({
  currencies,
  loading,
  saving,
  onUpdate,
  onAdd,
  onRemove,
}: CurrenciesTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des devises...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Devises</h3>
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
              <th className="px-4 py-3 text-left text-sm font-medium">Taux (→ base)</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Base</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actif</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency, index) => {
              const tempId = `temp-${index}`;
              const isSaving = saving[currency.id || tempId];
              
              return (
                <tr key={currency.id || index} className="border-t">
                  <td className="px-4 py-3">
                    <Input
                      value={currency.code || ""}
                      onChange={(e) => onUpdate(index, { code: e.target.value.toUpperCase() })}
                      placeholder="USD"
                      className="h-9 w-20"
                      maxLength={3}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={currency.label || ""}
                      onChange={(e) => onUpdate(index, { label: e.target.value })}
                      placeholder="Dollar US"
                      className="h-9"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      step="0.000001"
                      value={currency.rate_to_base || 1}
                      onChange={(e) => onUpdate(index, { rate_to_base: Number(e.target.value || 1) })}
                      className="h-9 w-32"
                      disabled={currency.is_base}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!currency.is_base}
                      onCheckedChange={(checked) => onUpdate(index, { 
                        is_base: checked,
                        rate_to_base: checked ? 1 : currency.rate_to_base
                      })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={!!currency.active}
                      onCheckedChange={(checked) => onUpdate(index, { active: checked })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {currency.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemove(currency.id!, index)}
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
            {currencies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune devise configurée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}