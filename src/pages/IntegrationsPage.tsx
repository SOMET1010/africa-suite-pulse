import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Webhook, Zap, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { webhooksAPI, type Webhook as WebhookType } from '@/services/webhooks.api';
import { channelsAPI, type ChannelIntegration } from '@/services/channels.api';
import { workflowsAPI, type Workflow as WorkflowType } from '@/services/workflows.api';

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [channels, setChannels] = useState<ChannelIntegration[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [webhooksData, channelsData, workflowsData] = await Promise.all([
        webhooksAPI.getWebhooks(),
        channelsAPI.getChannels(),
        workflowsAPI.getWorkflows()
      ]);
      
      setWebhooks(webhooksData);
      setChannels(channelsData);
      setWorkflows(workflowsData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (id: string) => {
    try {
      const result = await webhooksAPI.testWebhook(id);
      if (result.success) {
        toast.success('Webhook testé avec succès');
      } else {
        toast.error('Échec du test: ' + result.message);
      }
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const testChannel = async (id: string) => {
    try {
      const result = await channelsAPI.testConnection(id);
      if (result.success) {
        toast.success('Connexion réussie');
      } else {
        toast.error('Échec de la connexion: ' + result.message);
      }
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const executeWorkflow = async (id: string) => {
    try {
      await workflowsAPI.executeWorkflow(id);
      toast.success('Workflow exécuté avec succès');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Intégrations</h1>
          <p className="text-muted-foreground">
            Gérez vos intégrations, webhooks et automatisations
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="channels">Channel Managers</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Channels Actifs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channels.filter(c => c.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {channels.length} au total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhooks.filter(w => w.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {webhooks.length} configurés
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.filter(w => w.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {workflows.length} créés
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Sécurisé</div>
                <p className="text-xs text-muted-foreground">
                  Toutes les connexions SSL
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Configurez rapidement vos intégrations principales
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span>Nouveau Channel</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Webhook className="h-6 w-6" />
                <span>Ajouter Webhook</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Zap className="h-6 w-6" />
                <span>Créer Workflow</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Paramètres API</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Channel Managers</h2>
              <p className="text-muted-foreground">
                Synchronisez avec Booking.com, Expedia, Airbnb et plus
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Channel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{channel.channel_name}</CardTitle>
                      <CardDescription>{channel.channel_type}</CardDescription>
                    </div>
                    <Badge variant={channel.is_active ? 'default' : 'secondary'}>
                      {channel.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Statut sync:</span>
                    <Badge variant={
                      channel.sync_status === 'success' ? 'default' :
                      channel.sync_status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {channel.sync_status}
                    </Badge>
                  </div>
                  
                  {channel.last_sync_at && (
                    <div className="flex justify-between text-sm">
                      <span>Dernière sync:</span>
                      <span className="text-muted-foreground">
                        {new Date(channel.last_sync_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testChannel(channel.id)}
                    >
                      Tester
                    </Button>
                    <Button size="sm" variant="outline">
                      Sync
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Webhooks</h2>
              <p className="text-muted-foreground">
                Recevez des notifications en temps réel des événements
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {webhook.url}
                      </CardDescription>
                    </div>
                    <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                      {webhook.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Événements:</div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event, index) => (
                        <Badge key={index} variant="outline">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tentatives max:</span>
                    <span>{webhook.retry_count}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Timeout:</span>
                    <span>{webhook.timeout_seconds}s</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testWebhook(webhook.id)}
                    >
                      Tester
                    </Button>
                    <Button size="sm" variant="outline">
                      Historique
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Workflows</h2>
              <p className="text-muted-foreground">
                Automatisez vos processus métier avec des workflows
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                      {workflow.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Déclencheur:</span>
                    <Badge variant="outline">
                      {workflow.trigger_type}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Version:</span>
                    <span>v{workflow.version}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={!workflow.is_active}
                    >
                      Exécuter
                    </Button>
                    <Button size="sm" variant="outline">
                      Historique
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">API & Tokens</h2>
            <p className="text-muted-foreground">
              Gérez vos clés API et tokens d'accès
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documentation API</CardTitle>
              <CardDescription>
                Intégrez AfricaSuite PMS avec vos applications externes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Base URL</h4>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    https://alfflpvdnywwbrzygmoc.supabase.co/rest/v1/
                  </code>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Authentification</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Utilisez les headers suivants:
                  </p>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    Authorization: Bearer YOUR_TOKEN<br />
                    apikey: YOUR_API_KEY
                  </code>
                </div>

                <Button variant="outline">
                  Voir la documentation complète
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tokens d'accès</CardTitle>
                  <CardDescription>
                    Créez et gérez vos tokens d'API
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Token
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Aucun token d'API configuré
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}