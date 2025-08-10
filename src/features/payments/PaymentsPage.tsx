ort { useEffect, useState } from "react";
import { Tabsimp, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useOrgId } from "@/hooks/useOrgId";
import {
  listPaymentMethods, upsertPaymentMethod, deletePaymentMethod,
  listTerminals, upsertTerminal, deleteTerminal,
  listCurrencies, upsertCurrency, deleteCurrency
} from "./payments.api";
import { useToast } from "@/hooks/use-toast";

const kinds = ["cash","card","bank","mobile","other"] as const;

export default function PaymentsPage() {
  const { orgId } = useOrgId();
  const [tab, setTab] = useState("methods");

  if (!orgId) return <div className="p-6">Organisation requise…</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Moyens de Paiement</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="methods">Méthodes</TabsTrigger>
          <TabsTrigger value="terminals">Terminaux / TPE</TabsTrigger>
          <TabsTrigger value="currencies">Devises</TabsTrigger>
        </TabsList>

        <TabsContent value="methods"><MethodsTab orgId={orgId}/></TabsContent>
        <TabsContent value="terminals"><TerminalsTab orgId={orgId}/></TabsContent>
        <TabsContent value="currencies"><CurrenciesTab orgId={orgId}/></TabsContent>
      </Tabs>
    </div>
  );
}

function MethodsTab({ orgId }: {orgId: string}) {
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => { 
    (async () => { 
      const {data} = await listPaymentMethods(orgId); 
      setRows(data || []); 
    })(); 
  }, [orgId]);

  return (
    <div className="rounded-2xl border overflow-hidden bg-card">
      <div className="flex justify-end p-3">
        <Button onClick={() => setRows([...rows, {
          org_id: orgId, 
          code: "", 
          label: "", 
          kind: "card", 
          commission_percent: 0, 
          active: true
        }])}>
          Ajouter
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Code</th>
            <th className="px-3 py-2 text-left">Libellé</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Commission %</th>
            <th className="px-3 py-2 text-left">Actif</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-t">
              <td className="px-3 py-2">
                <Input 
                  value={r.code} 
                  onChange={e => patch(setRows, i, {code: e.target.value.toUpperCase()})}
                />
              </td>
              <td className="px-3 py-2">
                <Input 
                  value={r.label} 
                  onChange={e => patch(setRows, i, {label: e.target.value})}
                />
              </td>
              <td className="px-3 py-2">
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2" 
                  value={r.kind} 
                  onChange={e => patch(setRows, i, {kind: e.target.value})}
                >
                  {kinds.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
              <td className="px-3 py-2 w-28">
                <Input 
                  type="number" 
                  step="0.001" 
                  value={r.commission_percent} 
                  onChange={e => patch(setRows, i, {commission_percent: Number(e.target.value || 0)})}
                />
              </td>
              <td className="px-3 py-2">
                <Switch 
                  checked={!!r.active} 
                  onCheckedChange={v => patch(setRows, i, {active: v})}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={async () => { 
                      const {error} = await upsertPaymentMethod(r); 
                      error 
                        ? toast({title: "Erreur", description: error.message, variant: "destructive"})
                        : toast({title: "Enregistré"}); 
                    }}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={async () => { 
                      if(r.id) { 
                        await deletePaymentMethod(r.id); 
                        const {data} = await listPaymentMethods(orgId); 
                        setRows(data || []);
                      } 
                    }}
                  >
                    Suppr.
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TerminalsTab({ orgId }: {orgId: string}) {
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => { 
    (async () => { 
      const {data} = await listTerminals(orgId); 
      setRows(data || []); 
    })(); 
  }, [orgId]);

  return (
    <div className="rounded-2xl border overflow-hidden bg-card">
      <div className="flex justify-end p-3">
        <Button onClick={() => setRows([...rows, {
          org_id: orgId, 
          name: "", 
          provider: "", 
          device_id: "", 
          take_commission: true, 
          active: true
        }])}>
          Ajouter
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Nom</th>
            <th className="px-3 py-2 text-left">Fournisseur</th>
            <th className="px-3 py-2 text-left">Device ID</th>
            <th className="px-3 py-2 text-left">Commission</th>
            <th className="px-3 py-2 text-left">Actif</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-t">
              <td className="px-3 py-2">
                <Input 
                  value={r.name} 
                  onChange={e => patch(setRows, i, {name: e.target.value})}
                />
              </td>
              <td className="px-3 py-2">
                <Input 
                  value={r.provider} 
                  onChange={e => patch(setRows, i, {provider: e.target.value})}
                />
              </td>
              <td className="px-3 py-2">
                <Input 
                  value={r.device_id} 
                  onChange={e => patch(setRows, i, {device_id: e.target.value})}
                />
              </td>
              <td className="px-3 py-2">
                <Switch 
                  checked={!!r.take_commission} 
                  onCheckedChange={v => patch(setRows, i, {take_commission: v})}
                />
              </td>
              <td className="px-3 py-2">
                <Switch 
                  checked={!!r.active} 
                  onCheckedChange={v => patch(setRows, i, {active: v})}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={async () => { 
                      const {error} = await upsertTerminal(r); 
                      error 
                        ? toast({title: "Erreur", description: error.message, variant: "destructive"})
                        : toast({title: "Enregistré"}); 
                    }}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={async () => { 
                      if(r.id) { 
                        await deleteTerminal(r.id); 
                        const {data} = await listTerminals(orgId); 
                        setRows(data || []);
                      } 
                    }}
                  >
                    Suppr.
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CurrenciesTab({ orgId }: {orgId: string}) {
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => { 
    (async () => { 
      const {data} = await listCurrencies(orgId); 
      setRows(data || []); 
    })(); 
  }, [orgId]);

  return (
    <div className="rounded-2xl border overflow-hidden bg-card">
      <div className="flex justify-end p-3">
        <Button onClick={() => setRows([...rows, {
          org_id: orgId, 
          code: "", 
          label: "", 
          rate_to_base: 1, 
          is_base: false, 
          active: true
        }])}>
          Ajouter
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Code</th>
            <th className="px-3 py-2 text-left">Libellé</th>
            <th className="px-3 py-2 text-left">Taux (→ base)</th>
            <th className="px-3 py-2 text-left">Base</th>
            <th className="px-3 py-2 text-left">Actif</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-t">
              <td className="px-3 py-2">
                <Input 
                  value={r.code} 
                  onChange={e => patch(setRows, i, {code: e.target.value.toUpperCase()})}
                />
              </td>
              <td className="px-3 py-2">
                <Input 
                  value={r.label} 
                  onChange={e => patch(setRows, i, {label: e.target.value})}
                />
              </td>
              <td className="px-3 py-2 w-32">
                <Input 
                  type="number" 
                  step="0.000001" 
                  value={r.rate_to_base} 
                  onChange={e => patch(setRows, i, {rate_to_base: Number(e.target.value || 1)})}
                />
              </td>
              <td className="px-3 py-2">
                <Switch 
                  checked={!!r.is_base} 
                  onCheckedChange={v => patch(setRows, i, {is_base: v})}
                />
              </td>
              <td className="px-3 py-2">
                <Switch 
                  checked={!!r.active} 
                  onCheckedChange={v => patch(setRows, i, {active: v})}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={async () => { 
                      const {error} = await upsertCurrency(r); 
                      error 
                        ? toast({title: "Erreur", description: error.message, variant: "destructive"})
                        : toast({title: "Enregistré"}); 
                    }}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={async () => { 
                      if(r.id) { 
                        await deleteCurrency(r.id); 
                        const {data} = await listCurrencies(orgId); 
                        setRows(data || []);
                      } 
                    }}
                  >
                    Suppr.
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function patch<T>(set: React.Dispatch<React.SetStateAction<T[]>>, i: number, p: Partial<T>) {
  set(prev => prev.map((row: any, idx) => idx === i ? {...row, ...p} : row));
}