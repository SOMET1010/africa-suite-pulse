import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Sliders, Database, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

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
    <UnifiedLayout 
      title="Paramètres POS"
      headerAction={headerAction}
      showStatusBar={false}
    >
      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sliders className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Général</h3>
                <p className="text-sm text-muted-foreground">Configuration générale</p>
              </div>
            </div>
            <Badge variant="outline">En développement</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Points de Vente</h3>
                <p className="text-sm text-muted-foreground">Gérer les outlets</p>
              </div>
            </div>
            <Badge variant="outline">En développement</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Système</h3>
                <p className="text-sm text-muted-foreground">Paramètres avancés</p>
              </div>
            </div>
            <Badge variant="outline">En développement</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration POS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Module Paramètres</h3>
            <p className="text-muted-foreground mb-4">
              Cette section sera développée pour la configuration du système POS
            </p>
            <Badge variant="outline">En développement</Badge>
          </div>
        </CardContent>
      </Card>
    </UnifiedLayout>
  );
}