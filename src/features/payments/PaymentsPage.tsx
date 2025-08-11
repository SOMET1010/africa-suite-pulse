import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrgId } from "@/core/auth/useOrg";
import { usePaymentMethods } from "./hooks/usePaymentMethods";
import { usePaymentTerminals } from "./hooks/usePaymentTerminals";
import { useCurrencies } from "./hooks/useCurrencies";
import { PaymentMethodsTable } from "./components/PaymentMethodsTable";
import { PaymentTerminalsTable } from "./components/PaymentTerminalsTable";
import { CurrenciesTable } from "./components/CurrenciesTable";

export default function PaymentsPage() {
  const { orgId, loading, error } = useOrgId();
  const [tab, setTab] = useState("methods");

  if (loading) return <div className="p-6">Chargement de l'organisation...</div>;
  if (error) return <div className="p-6 text-destructive">Erreur: {error}</div>;
  if (!orgId) return <div className="p-6">Aucune organisation trouvée. Veuillez configurer votre profil.</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Moyens de Paiement</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="methods">Méthodes</TabsTrigger>
          <TabsTrigger value="terminals">Terminaux / TPE</TabsTrigger>
          <TabsTrigger value="currencies">Devises</TabsTrigger>
        </TabsList>

        <TabsContent value="methods">
          <MethodsTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="terminals">
          <TerminalsTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="currencies">
          <CurrenciesTab orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MethodsTab({ orgId }: { orgId: string }) {
  const paymentMethods = usePaymentMethods(orgId);

  return (
    <PaymentMethodsTable
      methods={paymentMethods.methods}
      loading={paymentMethods.loading}
      saving={paymentMethods.saving}
      onUpdate={paymentMethods.updateMethod}
      onAdd={paymentMethods.addMethod}
      onRemove={paymentMethods.removeMethod}
    />
  );
}

function TerminalsTab({ orgId }: { orgId: string }) {
  const paymentTerminals = usePaymentTerminals(orgId);

  return (
    <PaymentTerminalsTable
      terminals={paymentTerminals.terminals}
      loading={paymentTerminals.loading}
      saving={paymentTerminals.saving}
      onUpdate={paymentTerminals.updateTerminal}
      onAdd={paymentTerminals.addTerminal}
      onRemove={paymentTerminals.removeTerminal}
    />
  );
}

function CurrenciesTab({ orgId }: { orgId: string }) {
  const currencies = useCurrencies(orgId);

  return (
    <CurrenciesTable
      currencies={currencies.currencies}
      loading={currencies.loading}
      saving={currencies.saving}
      onUpdate={currencies.updateCurrency}
      onAdd={currencies.addCurrency}
      onRemove={currencies.removeCurrency}
    />
  );
}