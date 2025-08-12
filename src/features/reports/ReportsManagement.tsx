import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReportTemplateEditor } from "./components/ReportTemplateEditor";
import { ReportScheduler } from "./components/ReportScheduler";
import { ReportHistory } from "./components/ReportHistory";
import { useReportGeneration, useReportTemplates } from "./hooks/useReportTemplates";
import { Plus, FileText, Clock, History, Send, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClosurePanel } from "./components/ClosurePanel";

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("templates");
  const { data: templates, isLoading } = useReportTemplates();
  const { generateReport, isGenerating } = useReportGeneration();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Rapports & Clôtures – AfricaSuite";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Gestion des rapports, planification et clôtures journalières/mensuelles.");
  }, []);

  const handleGenerateReport = async (templateId: string) => {
    try {
      generateReport({ templateId, manual: true });
      toast({ title: "Génération lancée", description: "Le rapport est en cours de génération." });
      setActiveTab("history");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Impossible de lancer la génération", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports Automatisés</h1>
          <p className="text-muted-foreground">
            Gestion des templates, planification et historique des rapports
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Planification
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Templates actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {templates?.filter(t => t.isActive).length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Rapports ce mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taux de réussite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">98%</div>
                </CardContent>
              </Card>
            </div>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle>Templates de rapports</CardTitle>
                <CardDescription>
                  Gérez vos modèles de rapports automatisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates?.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Fréquence: {template.frequency} • {template.recipients.length} destinataire(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={isGenerating}
                          >
                            Générer
                          </Button>
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun template configuré
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduler">
          <ReportScheduler />
        </TabsContent>

        <TabsContent value="history">
          <ReportHistory />
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de distribution</CardTitle>
              <CardDescription>
                Gestion des listes de diffusion et paramètres d'envoi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Paramètres Email</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Expéditeur</label>
                        <p className="text-sm text-muted-foreground">reports@africasuite.com</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Objet par défaut</label>
                        <p className="text-sm text-muted-foreground">Rapport automatique - [Template] - [Date]</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistiques d'envoi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Emails envoyés ce mois</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taux de délivrance</span>
                        <span className="font-medium text-success">99.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Erreurs d'envoi</span>
                        <span className="font-medium text-destructive">2</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}