import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Smartphone, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Eye,
  MousePointer
} from 'lucide-react';

const demoScenarios = [
  {
    id: 'dashboard-overview',
    title: 'Vue d\'ensemble du Dashboard',
    description: 'Exploration interactive du tableau de bord principal',
    duration: '2 min',
    type: 'guided-tour'
  },
  {
    id: 'room-booking',
    title: 'Réservation de chambre',
    description: 'Simulation complète d\'une réservation client',
    duration: '5 min',
    type: 'simulation'
  },
  {
    id: 'pos-order',
    title: 'Commande Restaurant',
    description: 'Prise de commande et encaissement au restaurant',
    duration: '3 min',
    type: 'simulation'
  },
  {
    id: 'checkin-process',
    title: 'Processus Check-in',
    description: 'Arrivée client avec attribution de chambre',
    duration: '4 min',
    type: 'simulation'
  }
];

export function InteractiveDemo() {
  const [selectedDemo, setSelectedDemo] = useState(demoScenarios[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMode, setDemoMode] = useState<'guided' | 'free'>('guided');

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Démonstration Interactive
          </CardTitle>
          <CardDescription>
            Explorez AfricaSuite PMS avec des données de démonstration sécurisées
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Demo Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Scenario Selection */}
        <div className="lg:w-1/3 space-y-4">
          <h3 className="font-semibold text-foreground">Scénarios disponibles</h3>
          <div className="space-y-3">
            {demoScenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  selectedDemo.id === scenario.id 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'hover:border-muted-foreground/20'
                }`}
                onClick={() => setSelectedDemo(scenario)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{scenario.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {scenario.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                  <Badge 
                    variant={scenario.type === 'simulation' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {scenario.type === 'simulation' ? 'Simulation' : 'Visite guidée'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Interface */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedDemo.title}</CardTitle>
                  <CardDescription>{selectedDemo.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={demoMode === 'guided' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDemoMode('guided')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Guidé
                  </Button>
                  <Button
                    variant={demoMode === 'free' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDemoMode('free')}
                  >
                    <MousePointer className="h-4 w-4 mr-1" />
                    Libre
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Demo Viewport */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Interface de démonstration
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Cliquez sur "Démarrer" pour lancer la démonstration interactive 
                      avec des données sécurisées.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Démarrer
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Demo Info */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="steps">Étapes</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      ℹ️ À propos de cette démonstration
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>• Environnement sécurisé avec données de test</p>
                      <p>• Toutes les fonctionnalités sont accessibles</p>
                      <p>• Aucun impact sur les données réelles</p>
                      <p>• Session automatiquement réinitialisée</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="space-y-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                          {step}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Étape {step}</div>
                          <div className="text-xs text-muted-foreground">
                            Description de l'étape {step}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Vitesse de démonstration</div>
                        <div className="text-xs text-muted-foreground">Contrôle la vitesse d'exécution</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Mode plein écran</div>
                        <div className="text-xs text-muted-foreground">Affichage en plein écran</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Version mobile</div>
                        <div className="text-xs text-muted-foreground">Aperçu sur mobile</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}