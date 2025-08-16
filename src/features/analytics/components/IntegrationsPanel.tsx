import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IntegrationConfig } from "../types/advanced";
import { Settings, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { logger } from "@/lib/logger";
import { useState } from "react";

interface IntegrationsPanelProps {
  data: IntegrationConfig[];
  isLoading: boolean;
}

export function IntegrationsPanel({ data, isLoading }: IntegrationsPanelProps) {
  const [integrations, setIntegrations] = useState(data);
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google_analytics':
        return '📊';
      case 'power_bi':
        return '📈';
      case 'custom_api':
        return '🔗';
      default:
        return '⚙️';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google_analytics':
        return 'Google Analytics';
      case 'power_bi':
        return 'Microsoft Power BI';
      case 'custom_api':
        return 'API Personnalisée';
      default:
        return provider;
    }
  };

  const getStatusColor = (isActive: boolean, lastSync?: Date) => {
    if (!isActive) return 'secondary';
    if (!lastSync) return 'warning';
    
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 24 ? 'warning' : 'success';
  };

  const getStatusIcon = (isActive: boolean, lastSync?: Date) => {
    if (!isActive) return <AlertCircle className="h-4 w-4" />;
    if (!lastSync) return <AlertCircle className="h-4 w-4" />;
    
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 24 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
  };

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    logger.info('Toggling integration', { integrationId: id, enabled });
    setIntegrations(prev => prev.map(integration => 
      integration.id === id ? { ...integration, isActive: enabled } : integration
    ));
  };

  const handleConfigureIntegration = (id: string) => {
    logger.info('Opening integration configuration', { integrationId: id });
    // Integration configuration dialog will be handled by parent component
  };

  const handleSyncNow = (id: string) => {
    logger.info('Triggering manual sync', { integrationId: id });
    setIntegrations(prev => prev.map(integration => 
      integration.id === id ? { ...integration, lastSync: new Date() } : integration
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Intégrations Externes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intégrations Externes</CardTitle>
          <CardDescription>
            Connectez vos outils d'analyse et de reporting externes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getProviderIcon(integration.provider)}
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {integration.name}
                        <Badge variant={getStatusColor(integration.isActive, integration.lastSync) as any}>
                          {integration.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {getProviderName(integration.provider)}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Dernière sync: {format(integration.lastSync, 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.isActive, integration.lastSync)}
                      <Switch 
                        checked={integration.isActive}
                        onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                      />
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSyncNow(integration.id)}
                      disabled={!integration.isActive}
                      className="gap-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Sync
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConfigureIntegration(integration.id)}
                      className="gap-2"
                    >
                      <Settings className="h-3 w-3" />
                      Configurer
                    </Button>
                  </div>
                </div>
                
                {integration.isActive && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fréquence de sync: </span>
                        <span className="font-medium capitalize">{integration.syncFrequency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Champs mappés: </span>
                        <span className="font-medium">{Object.keys(integration.dataMapping).length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Intégrations Disponibles</CardTitle>
          <CardDescription>
            Nouvelles intégrations que vous pouvez configurer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                name: 'Zapier', 
                icon: '⚡', 
                description: 'Automatisez vos workflows',
                category: 'Automation'
              },
              { 
                name: 'Slack', 
                icon: '💬', 
                description: 'Notifications en temps réel',
                category: 'Communication'
              },
              { 
                name: 'Tableau', 
                icon: '📊', 
                description: 'Visualisations avancées',
                category: 'Analytics'
              },
              { 
                name: 'HubSpot', 
                icon: '🎯', 
                description: 'CRM et marketing automation',
                category: 'CRM'
              },
              { 
                name: 'Mailchimp', 
                icon: '📧', 
                description: 'Email marketing',
                category: 'Marketing'
              },
              { 
                name: 'Webhook', 
                icon: '🔗', 
                description: 'Intégration personnalisée',
                category: 'Custom'
              }
            ].map((available, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-center space-y-3">
                  <div className="text-3xl">{available.icon}</div>
                  <div>
                    <h4 className="font-semibold">{available.name}</h4>
                    <p className="text-xs text-muted-foreground">{available.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {available.category}
                  </Badge>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Connecter
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}