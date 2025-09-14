import React, { useState } from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Users, 
  Hotel, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  CheckCircle,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import { DiscoveryWelcome } from '../components/DiscoveryWelcome';
import { ModuleGuide } from '../components/ModuleGuide';
import { WorkflowGuide } from '../components/WorkflowGuide';
import { InteractiveDemo } from '../components/InteractiveDemo';

const modules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    description: 'Vue d\'ensemble de votre établissement avec KPIs et métriques en temps réel',
    status: 'active',
    features: ['KPIs en temps réel', 'Tableaux de bord personnalisés', 'Alertes intelligentes'],
    estimatedTime: '5 min'
  },
  {
    id: 'front-office',
    name: 'Gestion Hôtelière',
    icon: Hotel,
    description: 'Gestion complète des réservations, check-in/out et operations front office',
    status: 'active',
    features: ['Rack visuel', 'Réservations', 'Arrivées/Départs', 'Facturation'],
    estimatedTime: '10 min'
  },
  {
    id: 'restaurant-pos',
    name: 'Restaurant POS',
    icon: UtensilsCrossed,
    description: 'Point de vente restaurant avec gestion des commandes et facturation',
    status: 'active',
    features: ['Catalogue produits', 'Gestion des tables', 'Commandes', 'Encaissement'],
    estimatedTime: '8 min'
  },
  {
    id: 'operations',
    name: 'Opérations',
    icon: Settings,
    description: 'Gestion des opérations quotidiennes : ménage, maintenance, inventaire',
    status: 'coming-soon',
    features: ['Planification ménage', 'Maintenance préventive', 'Inventaire'],
    estimatedTime: '6 min'
  }
];

const workflows = [
  {
    id: 'checkin',
    title: 'Check-in Client',
    description: 'Processus complet d\'arrivée d\'un client',
    steps: 5,
    duration: '3-5 min',
    difficulty: 'Débutant'
  },
  {
    id: 'restaurant-order',
    title: 'Commande Restaurant',
    description: 'Prise de commande et facturation restaurant',
    steps: 4,
    duration: '2-3 min',
    difficulty: 'Débutant'
  },
  {
    id: 'daily-closure',
    title: 'Clôture de Journée',
    description: 'Procédures de fin de journée et reporting',
    steps: 6,
    duration: '5-8 min',
    difficulty: 'Intermédiaire'
  }
];

export function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => [...prev, moduleId]);
  };

  const progress = (completedModules.length / modules.filter(m => m.status === 'active').length) * 100;

  return (
    <UnifiedLayout
      title="Guide de Découverte AfricaSuite PMS"
      headerAction={
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{Math.round(progress)}% complété</Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        {completedModules.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Progression</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedModules.length} modules complétés sur {modules.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="welcome">Bienvenue</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="demo">Démo Interactive</TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="space-y-6">
            <DiscoveryWelcome onStartGuide={() => setActiveTab('modules')} />
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <module.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                              {module.status === 'active' ? 'Disponible' : 'Bientôt'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {module.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {completedModules.includes(module.id) && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {module.description}
                    </CardDescription>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Fonctionnalités clés :</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        disabled={module.status !== 'active'}
                        onClick={() => handleModuleComplete(module.id)}
                      >
                        {module.status === 'active' ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Commencer le Tour
                          </>
                        ) : (
                          'Bientôt Disponible'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{workflow.title}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Étapes :</span>
                        <span className="font-medium">{workflow.steps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Durée :</span>
                        <span className="font-medium">{workflow.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Niveau :</span>
                        <Badge variant="outline" className="text-xs">
                          {workflow.difficulty}
                        </Badge>
                      </div>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer le Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <InteractiveDemo />
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
}