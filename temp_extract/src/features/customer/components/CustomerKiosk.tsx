import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  CreditCard, 
  Users, 
  Settings, 
  Wifi,
  Volume2,
  Palette,
  ShoppingCart,
  Clock,
  BarChart3,
  AlertCircle,
  Smartphone
} from 'lucide-react';

export function CustomerKiosk() {
  const [kioskSettings, setKioskSettings] = useState({
    touchMode: true,
    soundEnabled: true,
    autoTimeout: 120,
    showWaitTime: true,
    allowCustomization: true,
    guestMode: false
  });

  const kiosks = [
    {
      id: 'KIOSK-001',
      name: 'Kiosque Entrée',
      location: 'Hall d\'accueil',
      status: 'online',
      orders: 47,
      revenue: 1250.50,
      lastActivity: '2 min'
    },
    {
      id: 'KIOSK-002', 
      name: 'Kiosque Terrasse',
      location: 'Terrasse extérieure',
      status: 'online',
      orders: 23,
      revenue: 680.00,
      lastActivity: '5 min'
    },
    {
      id: 'KIOSK-003',
      name: 'Kiosque VIP',
      location: 'Salon privé',
      status: 'maintenance',
      orders: 0,
      revenue: 0,
      lastActivity: '2h'
    }
  ];

  const paymentMethods = [
    { name: 'Carte bancaire', enabled: true, icon: CreditCard },
    { name: 'Apple Pay', enabled: true, icon: Smartphone },
    { name: 'Google Pay', enabled: true, icon: Smartphone },
    { name: 'PayPal', enabled: false, icon: CreditCard },
    { name: 'Tickets restaurant', enabled: true, icon: CreditCard },
    { name: 'Espèces', enabled: false, icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* État des kiosques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kiosks.map((kiosk, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{kiosk.name}</CardTitle>
                    <Badge variant={
                      kiosk.status === 'online' ? 'default' : 
                      kiosk.status === 'maintenance' ? 'destructive' : 'secondary'
                    }>
                      {kiosk.status === 'online' ? 'En ligne' : 
                       kiosk.status === 'maintenance' ? 'Maintenance' : 'Hors ligne'}
                    </Badge>
                  </div>
                  <CardDescription>{kiosk.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Commandes</p>
                      <p className="text-2xl font-bold text-primary">{kiosk.orders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenus</p>
                      <p className="text-2xl font-bold text-success">{kiosk.revenue.toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Dernière activité: {kiosk.lastActivity}
                    </span>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Métriques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">70</p>
                <p className="text-sm text-muted-foreground">Commandes total</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">3.2min</p>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">1,930€</p>
                <p className="text-sm text-muted-foreground">CA journalier</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-info mx-auto mb-2" />
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration générale */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Configuration Générale</CardTitle>
                <CardDescription>
                  Paramètres de fonctionnement des kiosques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mode tactile optimisé</label>
                  <Switch 
                    checked={kioskSettings.touchMode}
                    onCheckedChange={(checked) => setKioskSettings({...kioskSettings, touchMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sons activés</label>
                  <Switch 
                    checked={kioskSettings.soundEnabled}
                    onCheckedChange={(checked) => setKioskSettings({...kioskSettings, soundEnabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Afficher temps d'attente</label>
                  <Switch 
                    checked={kioskSettings.showWaitTime}
                    onCheckedChange={(checked) => setKioskSettings({...kioskSettings, showWaitTime: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Permettre personnalisation</label>
                  <Switch 
                    checked={kioskSettings.allowCustomization}
                    onCheckedChange={(checked) => setKioskSettings({...kioskSettings, allowCustomization: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mode invité</label>
                  <Switch 
                    checked={kioskSettings.guestMode}
                    onCheckedChange={(checked) => setKioskSettings({...kioskSettings, guestMode: checked})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Timeout automatique (secondes)
                  </label>
                  <Input 
                    type="number"
                    value={kioskSettings.autoTimeout}
                    onChange={(e) => setKioskSettings({...kioskSettings, autoTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Méthodes de paiement */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Méthodes de Paiement
                </CardTitle>
                <CardDescription>
                  Configurez les options de paiement disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <method.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <Switch 
                        checked={method.enabled}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personnalisation interface */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Personnalisation Interface
                </CardTitle>
                <CardDescription>
                  Adaptez l'apparence des kiosques à votre marque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Taille des boutons</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">Petit</Button>
                    <Button variant="default" size="sm">Moyen</Button>
                    <Button variant="outline" size="sm">Grand</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Thème de couleur</label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer border-2 border-blue-600"></div>
                    <div className="w-8 h-8 bg-green-500 rounded cursor-pointer"></div>
                    <div className="w-8 h-8 bg-orange-500 rounded cursor-pointer"></div>
                    <div className="w-8 h-8 bg-purple-500 rounded cursor-pointer"></div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Disposition</label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Monitor className="w-4 h-4 mr-2" />
                      Grille (recommandé)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Monitor className="w-4 h-4 mr-2" />
                      Liste verticale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aperçu interface */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Aperçu Interface Kiosque</CardTitle>
                <CardDescription>
                  Prévisualisation de l'interface client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-soft-primary to-soft-accent p-6 rounded-lg border border-border">
                  <div className="bg-white rounded-lg p-4 shadow-inner">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Bienvenue !</h3>
                      <p className="text-sm text-gray-600">Touchez pour commencer votre commande</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded text-center border">
                        <div className="w-8 h-8 bg-blue-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Entrées</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded text-center border">
                        <div className="w-8 h-8 bg-green-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Plats</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded text-center border">
                        <div className="w-8 h-8 bg-orange-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Desserts</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded text-center border">
                        <div className="w-8 h-8 bg-purple-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs font-medium">Boissons</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Monitor className="w-4 h-4 mr-2" />
                  Tester sur écran tactile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Analytics des Kiosques</CardTitle>
              <CardDescription>
                Données détaillées sur l'utilisation et les performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Module analytics en développement</p>
                <p className="text-sm">Graphiques et métriques détaillées bientôt disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}