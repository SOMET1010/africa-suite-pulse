import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TButton } from "@/core/ui/TButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, CreditCard, Users, Euro } from "lucide-react";
import { InvoicesList } from "./components/InvoicesList";
import { InvoiceDetails } from "./components/InvoiceDetails";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";

export default function BillingPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "AfricaSuite PMS - Facturation";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Gestion complète de la facturation - AfricaSuite PMS");
  }, []);

  return (
    <div className="min-h-screen bg-pearl p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-accent/10">
                <CreditCard className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-luxury font-bold text-charcoal">Facturation</h1>
                <p className="text-charcoal/70 font-premium">Gestion des factures et encaissements</p>
              </div>
            </div>
            <TButton 
              onClick={() => setCreateDialogOpen(true)} 
              variant="primary"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle facture
            </TButton>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Factures du jour", value: "12", icon: FileText, color: "text-info" },
              { label: "Montant total", value: "45 280 XOF", icon: Euro, color: "text-success" },
              { label: "En attente", value: "3", icon: CreditCard, color: "text-warning" },
              { label: "Clients facturés", value: "28", icon: Users, color: "text-brand-accent" }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="glass-card shadow-luxury">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal/70 font-premium">{stat.label}</p>
                        <p className={`text-2xl font-luxury font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <Icon className="h-8 w-8 text-charcoal/30" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/50" />
            <Input
              placeholder="Rechercher une facture, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-glass-card border-accent-gold/20"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Invoices List */}
          <div className="lg:col-span-1">
            <Card className="glass-card shadow-luxury h-[calc(100vh-20rem)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-luxury text-charcoal">Factures récentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InvoicesList 
                  searchTerm={searchTerm}
                  selectedId={selectedInvoiceId}
                  onSelect={setSelectedInvoiceId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Invoice Details */}
          <div className="lg:col-span-2">
            {selectedInvoiceId ? (
              <InvoiceDetails invoiceId={selectedInvoiceId} />
            ) : (
              <Card className="glass-card shadow-luxury h-[calc(100vh-20rem)] flex items-center justify-center">
                <div className="text-center text-charcoal/50">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-premium">Sélectionnez une facture</p>
                  <p className="text-sm">pour afficher les détails</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Create Invoice Dialog */}
        <CreateInvoiceDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
}