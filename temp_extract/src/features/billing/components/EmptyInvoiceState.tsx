// État vide pour sélection facture
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyInvoiceState() {
  return (
    <Card className="h-[calc(100vh-20rem)] flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Sélectionnez une facture</p>
        <p className="text-sm">pour afficher les détails</p>
      </div>
    </Card>
  );
}