// Page principale Facturation - Refactorisée Phase 1 avec UnifiedLayout
import { useState } from "react";
import { Plus } from "lucide-react";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { TButton } from "@/core/ui/TButton";
import { useBillingStats } from "./hooks/useBilling";
import { BillingDashboard } from "./components/BillingDashboard";
import { InvoicesWorkflow } from "./components/InvoicesWorkflow";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";

export default function BillingPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
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
      {/* Dashboard Overview */}
      <BillingDashboard stats={stats} loading={statsLoading} />
      
      {/* Main Workflow */}
      <InvoicesWorkflow 
        selectedInvoiceId={selectedInvoiceId}
        onSelectInvoice={setSelectedInvoiceId}
      />

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </UnifiedLayout>
  );
}