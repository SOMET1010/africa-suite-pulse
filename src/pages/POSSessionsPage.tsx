import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, DollarSign, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function POSSessionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/pos")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sessions de Caisse</h1>
              <p className="text-muted-foreground">Gérer les sessions de vente</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Actuelle</p>
                  <p className="text-2xl font-bold">0 FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée Session</p>
                  <p className="text-2xl font-bold">--:--</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ClipboardList className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Module Sessions</h3>
              <p className="text-muted-foreground mb-4">
                Cette section sera développée pour gérer les sessions de caisse
              </p>
              <Badge variant="outline">En développement</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}