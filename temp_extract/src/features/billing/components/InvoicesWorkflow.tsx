// Workflow principal facturation - Liste + Détails optimisé
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicesList } from "./InvoicesList";
import { InvoiceDetails } from "./InvoiceDetails";
import { EmptyInvoiceState } from "./EmptyInvoiceState";
import type { BillingStatus } from "../types/billing.types";

interface InvoicesWorkflowProps {
  selectedInvoiceId: string | null;
  onSelectInvoice: (id: string | null) => void;
}

export function InvoicesWorkflow({ selectedInvoiceId, onSelectInvoice }: InvoicesWorkflowProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all');

  const statusTabs = [
    { value: 'all', label: 'Toutes', count: null },
    { value: 'pending' as const, label: 'En attente', count: null },
    { value: 'paid' as const, label: 'Payées', count: null },
    { value: 'overdue' as const, label: 'Échues', count: null },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Invoices List */}
      <div className="lg:col-span-1">
        <Card className="h-[calc(100vh-20rem)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Factures</CardTitle>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                {statusTabs.map(tab => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="text-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0 flex-1">
            <InvoicesList 
              searchTerm={searchTerm}
              statusFilter={statusFilter === 'all' ? undefined : [statusFilter]}
              selectedId={selectedInvoiceId}
              onSelect={onSelectInvoice}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Invoice Details */}
      <div className="lg:col-span-2">
        {selectedInvoiceId ? (
          <InvoiceDetails 
            invoiceId={selectedInvoiceId}
          />
        ) : (
          <EmptyInvoiceState />
        )}
      </div>
    </div>
  );
}