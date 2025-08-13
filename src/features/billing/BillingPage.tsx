// Page principale Facturation - Refactorisée Phase 1 avec UnifiedLayout
import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { TButton } from "@/core/ui/TButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBillingStats } from "./hooks/useBilling";
import { BillingDashboard } from "./components/BillingDashboard";
import { InvoicesWorkflow } from "./components/InvoicesWorkflow";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";
import { InvoiceTemplatesPage } from "./components/InvoiceTemplatesPage";

export default function BillingPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("facturation");
  
  const { data: stats, isLoading: statsLoading } = useBillingStats();

  const headerAction = (
    <TButton 
      onClick={() => setCreateDialogOpen(true)} 
      variant="primary"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Nouvelle facture
    </TButton>
  );

  return (
    <UnifiedLayout
      title="Facturation"
      headerAction={headerAction}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="facturation">Facturation</TabsTrigger>
          <TabsTrigger value="modeles" className="gap-2">
            <FileText className="h-4 w-4" />
            Modèles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="facturation" className="space-y-6 mt-6">
          {/* Dashboard Overview */}
          <BillingDashboard stats={stats} loading={statsLoading} />
          
          {/* Main Workflow */}
          <InvoicesWorkflow 
            selectedInvoiceId={selectedInvoiceId}
            onSelectInvoice={setSelectedInvoiceId}
          />
        </TabsContent>
        
        <TabsContent value="modeles" className="mt-6">
          <InvoiceTemplatesPage />
        </TabsContent>
      </Tabs>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </UnifiedLayout>
  );
}