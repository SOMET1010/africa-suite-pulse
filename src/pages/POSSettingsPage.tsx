import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { POSLayout } from '@/core/layout/POSLayout';
import { POSSettings } from '@/features/pos/settings/POSSettings';

export default function POSSettingsPage() {
  const navigate = useNavigate();

  const headerAction = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => navigate("/pos")}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </Button>
  );

  return (
    <POSLayout 
      title="Paramètres POS"
      showStatusBar={true}
      headerAction={headerAction}
    >
      <POSSettings />
    </POSLayout>
  );
}