import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Receipt } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Confirmation de Réservation",
      type: "Email",
      icon: Mail,
      status: "Actif",
      lastModified: "Il y a 2 jours"
    },
    {
      id: 2,
      name: "Facture Standard",
      type: "Document",
      icon: Receipt,
      status: "Actif",
      lastModified: "Il y a 1 semaine"
    },
    {
      id: 3,
      name: "Contrat de Location",
      type: "Document",
      icon: FileText,
      status: "Brouillon",
      lastModified: "Il y a 3 jours"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Modèles Documents</h1>
          <p className="text-muted-foreground">Gestion des modèles d'emails et documents</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Modèle
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.type} • {template.lastModified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={template.status === "Actif" ? "default" : "secondary"}>
                      {template.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variables Disponibles</CardTitle>
          <CardDescription>Variables que vous pouvez utiliser dans vos modèles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <code className="text-sm">{"{{client.nom}}"}</code>
              <p className="text-xs text-muted-foreground mt-1">Nom du client</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <code className="text-sm">{"{{reservation.numero}}"}</code>
              <p className="text-xs text-muted-foreground mt-1">Numéro de réservation</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <code className="text-sm">{"{{chambre.numero}}"}</code>
              <p className="text-xs text-muted-foreground mt-1">Numéro de chambre</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}