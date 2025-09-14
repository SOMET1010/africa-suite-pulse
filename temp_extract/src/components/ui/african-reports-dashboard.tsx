import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Users,
  Bed,
  Utensils,
  ClipboardList,
  Star,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Settings,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  africanReportsAPI, 
  ReportTemplate, 
  ReportData, 
  ReportParameter 
} from '@/services/african-reports.api';
import { reportsEdgeService } from '@/services/edge-functions/reports-generator';
import { reportsAutomationService, ScheduledReport } from '@/services/edge-functions/reports-automation';
import { hotelReportTemplatesService, HotelReportTemplate } from '@/services/hotel-report-templates';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Couleurs du thème africain
const AFRICAN_COLORS = {
  primary: '#8B4513',
  secondary: '#D2691E', 
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FF8C00',
  danger: '#DC143C'
};

export function AfricanReportsDashboard() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  // États des données
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [hotelTemplates, setHotelTemplates] = useState<HotelReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedHotelTemplate, setSelectedHotelTemplate] = useState<HotelReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [generatedReports, setGeneratedReports] = useState<ReportData[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // États des modales
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);
  
  // États des edge functions
  const [useEdgeFunctions, setUseEdgeFunctions] = useState(true);
  const [cacheStats, setCacheStats] = useState({ size: 0, entries: 0 });
  const [automationMetrics, setAutomationMetrics] = useState(null);

  // Charger les templates
  useEffect(() => {
    loadReportTemplates();
    loadHotelTemplates();
    loadScheduledReports();
    loadCacheStats();
    loadAutomationMetrics();
  }, []);

  const loadReportTemplates = () => {
    const templatesData = africanReportsAPI.getReportTemplates();
    setTemplates(templatesData);
  };

  const loadHotelTemplates = () => {
    const hotelTemplatesData = hotelReportTemplatesService.getHotelReportTemplates();
    setHotelTemplates(hotelTemplatesData);
  };

  const loadScheduledReports = () => {
    const scheduled = reportsAutomationService.getScheduledReports();
    setScheduledReports(scheduled);
  };

  const loadCacheStats = () => {
    const stats = reportsEdgeService.getCacheStats();
    setCacheStats(stats);
  };

  const loadAutomationMetrics = () => {
    const metrics = reportsAutomationService.getMetrics();
    setAutomationMetrics(metrics);
  };

  // Fonctions utilitaires
  const getTypeIcon = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <TrendingUp className="h-4 w-4" />;
      case 'guest': return <Star className="h-4 w-4" />;
      case 'housekeeping': return <Bed className="h-4 w-4" />;
      case 'pos': return <Utensils className="h-4 w-4" />;
      case 'analytics': return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-purple-100 text-purple-800';
      case 'housekeeping': return 'bg-orange-100 text-orange-800';
      case 'pos': return 'bg-red-100 text-red-800';
      case 'analytics': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency: ReportTemplate['frequency']) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-orange-100 text-orange-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Gestion des paramètres
  const handleParameterChange = (paramName: string, value: any) => {
    setReportParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const renderParameterInput = (param: ReportParameter) => {
    switch (param.type) {
      case 'date':
        return (
          <Input
            type="date"
            value={reportParameters[param.name] || param.default_value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
          />
        );
      
      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              placeholder="Date début"
              value={reportParameters[param.name]?.start || ''}
              onChange={(e) => handleParameterChange(param.name, {
                ...reportParameters[param.name],
                start: e.target.value
              })}
            />
            <Input
              type="date"
              placeholder="Date fin"
              value={reportParameters[param.name]?.end || ''}
              onChange={(e) => handleParameterChange(param.name, {
                ...reportParameters[param.name],
                end: e.target.value
              })}
            />
          </div>
        );
      
      case 'select':
        return (
          <Select
            value={reportParameters[param.name] || param.default_value || ''}
            onValueChange={(value) => handleParameterChange(param.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Sélectionner ${param.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={reportParameters[param.name] || param.default_value || ''}
            onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
          />
        );
      
      case 'text':
        return (
          <Input
            type="text"
            value={reportParameters[param.name] || param.default_value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={param.name}
              checked={reportParameters[param.name] ?? param.default_value ?? false}
              onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
            />
            <Label htmlFor={param.name}>Oui</Label>
          </div>
        );
      
      default:
        return <Input disabled placeholder="Type non supporté" />;
    }
  };

  // Génération de rapport avec edge functions
  const handleGenerateReport = async () => {
    if (!selectedTemplate && !selectedHotelTemplate) return;

    setIsGenerating(true);
    try {
      let result;
      
      if (useEdgeFunctions && selectedTemplate) {
        // Utilisation des edge functions pour optimisation
        result = await reportsEdgeService.generateReport(
          selectedTemplate.id, 
          reportParameters,
          selectedTemplate.format as 'pdf' | 'excel',
          true // Utiliser le cache
        );
      } else if (selectedHotelTemplate) {
        // Utilisation des templates hôteliers
        const blob = await hotelReportTemplatesService.generateReportFromTemplate(
          selectedHotelTemplate.id,
          reportParameters,
          'pdf'
        );
        result = {
          data: {
            id: `hotel_report_${Date.now()}`,
            template_id: selectedHotelTemplate.id,
            title: selectedHotelTemplate.name,
            generated_at: new Date().toISOString(),
            generated_by: 'Africa Suite Pulse - Templates Hôteliers',
            parameters: reportParameters,
            data: {},
            metadata: {
              total_records: 0,
              date_range: { start: '', end: '' },
              currency: 'FCFA',
              organization: 'Africa Suite Pulse'
            }
          },
          blob
        };
      } else {
        // Méthode classique
        const reportData = await africanReportsAPI.generateReportData(
          selectedTemplate!.id, 
          reportParameters
        );
        const blob = selectedTemplate!.format === 'pdf' 
          ? await africanReportsAPI.generatePDFReport(reportData)
          : await africanReportsAPI.generateExcelReport(reportData);
        result = { data: reportData, blob };
      }
      
      setGeneratedReports(prev => [result.data, ...prev]);
      setIsGenerateOpen(false);
      setReportParameters({});
      setSelectedTemplate(null);
      setSelectedHotelTemplate(null);
      
      // Mettre à jour les statistiques
      loadCacheStats();
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Téléchargement de rapport
  const handleDownloadReport = async (report: ReportData, format: 'pdf' | 'excel') => {
    try {
      await africanReportsAPI.saveReport(report, format);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Prévisualisation
  const handlePreviewReport = (report: ReportData) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">📊 Rapports Africains</h1>
          <p className="text-amber-700">Génération et gestion des rapports hôteliers</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadReportTemplates} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Templates</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{templates.length}</div>
            <div className="text-xs text-blue-600">Modèles disponibles</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Générés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{generatedReports.length}</div>
            <div className="text-xs text-green-600">Rapports créés</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Formats</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">PDF + Excel</div>
            <div className="text-xs text-purple-600">Formats supportés</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Automatisation</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">Bientôt</div>
            <div className="text-xs text-orange-600">Génération programmée</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="hotel-templates">Templates Hôteliers</TabsTrigger>
          <TabsTrigger value="generated">Rapports Générés</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Templates de rapports */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">📋 Templates de Rapports</CardTitle>
              <CardDescription>Modèles prédéfinis pour la génération de rapports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        <Badge className={getFrequencyColor(template.frequency)}>
                          {template.frequency}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{template.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Format: {template.format.toUpperCase()}</span>
                      <span>{template.parameters.length} paramètres</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setReportParameters({});
                        setIsGenerateOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Générer Rapport
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates hôteliers */}
        <TabsContent value="hotel-templates" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">🏨 Templates Hôteliers Africains</CardTitle>
              <CardDescription>Modèles spécialisés pour l'industrie hôtelière avec design africain authentique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotelTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.africanTheme.culturalElements[0]}</span>
                        <h4 className="font-semibold text-amber-900">{template.name}</h4>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">
                        {template.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">{template.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {template.africanTheme.patterns.map((pattern, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Sections: {template.sections.length}</span>
                      <span>KPIs: {template.kpis.length}</span>
                    </div>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        setSelectedHotelTemplate(template);
                        setSelectedTemplate(null);
                        setReportParameters({});
                        setIsGenerateOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Générer Rapport Hôtelier
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapports générés */}
        <TabsContent value="generated" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">📄 Rapports Générés</CardTitle>
              <CardDescription>Historique des rapports créés</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun rapport généré pour le moment</p>
                  <p className="text-sm">Utilisez l'onglet Templates pour créer votre premier rapport</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{report.title}</h4>
                          {report.subtitle && (
                            <p className="text-sm text-gray-600">{report.subtitle}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadReport(report, 'pdf')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(report, 'excel')}
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-1" />
                            Excel
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Généré le:</span>
                          <p className="font-medium">
                            {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Période:</span>
                          <p className="font-medium">
                            {format(new Date(report.metadata.date_range.start), 'dd/MM/yyyy', { locale: fr })} - 
                            {format(new Date(report.metadata.date_range.end), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Généré par:</span>
                          <p className="font-medium">{report.generated_by}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automatisation */}
        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">🤖 Automatisation des Rapports</CardTitle>
              <CardDescription>Génération programmée et gestion automatique des rapports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-800">Rapports Programmés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{scheduledReports.length}</div>
                    <div className="text-xs text-blue-600">Total configurés</div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-800">Cache Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{cacheStats.entries}</div>
                    <div className="text-xs text-green-600">Entrées en cache</div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-800">Edge Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {useEdgeFunctions ? 'ON' : 'OFF'}
                    </div>
                    <div className="text-xs text-purple-600">Optimisation active</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Rapports Programmés</h3>
                  <Button onClick={() => setIsScheduleOpen(true)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Nouveau Planning
                  </Button>
                </div>

                {scheduledReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun rapport programmé</p>
                    <p className="text-sm">Configurez la génération automatique de vos rapports</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledReports.map((scheduled) => (
                      <div key={scheduled.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{scheduled.name}</h4>
                            <p className="text-sm text-gray-600">
                              {scheduled.schedule.frequency} à {scheduled.schedule.time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={scheduled.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {scheduled.enabled ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reportsAutomationService.executeScheduledReport(scheduled.id)}
                            >
                              Exécuter
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">🎭 Sagesse Africaine</h4>
                  <p className="text-sm text-amber-800 italic">
                    "Comme les saisons suivent leur rythme naturel, nos rapports s'adaptent aux besoins de votre établissement."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">⚙️ Paramètres des Rapports</CardTitle>
              <CardDescription>Configuration et personnalisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Paramètres Généraux</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Organisation</Label>
                      <Input defaultValue="Hôtel Africa Suite" />
                    </div>
                    <div>
                      <Label>Monnaie</Label>
                      <Select defaultValue="FCFA">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FCFA">FCFA</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Automatisation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-daily" />
                      <Label htmlFor="auto-daily">Génération automatique des rapports quotidiens</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-weekly" />
                      <Label htmlFor="auto-weekly">Génération automatique des rapports hebdomadaires</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-monthly" />
                      <Label htmlFor="auto-monthly">Génération automatique des rapports mensuels</Label>
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder Paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de génération de rapport */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Générer un Rapport</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold">{selectedTemplate.name}</h4>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Paramètres du Rapport</h5>
                {selectedTemplate.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label>
                      {param.label}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderParameterInput(param)}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleGenerateReport} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du Rapport</DialogTitle>
          </DialogHeader>
          
          {previewReport && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{previewReport.title}</h3>
                {previewReport.subtitle && (
                  <p className="text-gray-700">{previewReport.subtitle}</p>
                )}
                <div className="text-sm text-gray-600 mt-2">
                  Généré le {format(new Date(previewReport.generated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </div>
              </div>

              <div className="bg-white p-6 border rounded-lg">
                <h4 className="font-semibold mb-4">📊 Données du Rapport</h4>
                <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                  {JSON.stringify(previewReport.data, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => handleDownloadReport(previewReport, 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

