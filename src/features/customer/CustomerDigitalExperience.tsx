import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  QrCode, 
  CreditCard, 
  ShoppingCart, 
  Wifi, 
  Bell,
  Star,
  Gift,
  MessageCircle,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import { MenuDigitalInterface } from './components/MenuDigitalInterface';
import { CustomerKiosk } from './components/CustomerKiosk';
import { CustomerLoyaltyProgram } from './components/CustomerLoyaltyProgram';
import { CustomerNotifications } from './components/CustomerNotifications';

export function CustomerDigitalExperience() {
  const [activeTab, setActiveTab] = useState('overview');

  const digitalServices = [
    {
      icon: QrCode,
      title: 'Menu QR Code',
      description: 'Menu numérique accessible via QR code',
      status: 'active',
      color: 'bg-gradient-to-br from-soft-primary to-soft-accent',
      features: ['Carte interactive', 'Allergènes', 'Prix en temps réel', 'Multilingue']
    },
    {
      icon: Smartphone,
      title: 'Commande Mobile',
      description: 'Application de commande pour smartphones',
      status: 'active',
      color: 'bg-gradient-to-br from-soft-success to-soft-info',
      features: ['Commande rapide', 'Paiement intégré', 'Historique', 'Favoris']
    },
    {
      icon: ShoppingCart,
      title: 'Kiosque Self-Service',
      description: 'Bornes de commande autonomes',
      status: 'active',
      color: 'bg-gradient-to-br from-soft-warning to-soft-accent',
      features: ['Interface tactile', 'Personnalisation', 'Paiement CB', 'Reçu digital']
    },
    {
      icon: CreditCard,
      title: 'Paiement Contactless',
      description: 'Solutions de paiement modernes',
      status: 'active',
      color: 'bg-gradient-to-br from-soft-info to-soft-primary',
      features: ['Apple Pay', 'Google Pay', 'Cartes NFC', 'Crypto']
    },
    {
      icon: Gift,
      title: 'Programme Fidélité',
      description: 'Système de points et récompenses',
      status: 'beta',
      color: 'bg-gradient-to-br from-soft-accent to-soft-warning',
      features: ['Points automatiques', 'Offres personnalisées', 'Niveaux VIP', 'Parrainage']
    },
    {
      icon: Bell,
      title: 'Notifications Push',
      description: 'Alertes et promotions personnalisées',
      status: 'beta',
      color: 'bg-gradient-to-br from-soft-danger to-soft-warning',
      features: ['Offres spéciales', 'Commande prête', 'Nouveautés', 'Événements']
    }
  ];

  const metrics = [
    { label: 'Commandes digitales', value: '68%', trend: '+15%', icon: Smartphone },
    { label: 'Satisfaction client', value: '4.8/5', trend: '+0.3', icon: Star },
    { label: 'Temps de commande', value: '2min', trend: '-30s', icon: Clock },
    { label: 'Clients actifs', value: '2,847', trend: '+245', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-success font-medium">{metric.trend}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="menu">Menu Digital</TabsTrigger>
          <TabsTrigger value="kiosk">Kiosque</TabsTrigger>
          <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalServices.map((service, index) => (
              <Card key={index} className={`${service.color} border-border hover:shadow-lg transition-all duration-300`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <service.icon className="w-8 h-8 text-primary" />
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status === 'active' ? 'Actif' : 'Bêta'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    Configurer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Accès rapide */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-primary" />
                Accès Client Rapide
              </CardTitle>
              <CardDescription>
                Générez des liens et QR codes pour l'accès direct aux services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <QrCode className="w-6 h-6" />
                  Menu QR Code
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Smartphone className="w-6 h-6" />
                  App Mobile
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MapPin className="w-6 h-6" />
                  Géolocalisation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <MenuDigitalInterface />
        </TabsContent>

        <TabsContent value="kiosk">
          <CustomerKiosk />
        </TabsContent>

        <TabsContent value="loyalty">
          <CustomerLoyaltyProgram />
        </TabsContent>

        <TabsContent value="notifications">
          <CustomerNotifications />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Analytics de l'Expérience Client</CardTitle>
              <CardDescription>
                Données détaillées sur l'utilisation des services digitaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Module analytics en développement</p>
                <p className="text-sm">Bientôt disponible pour des insights avancés</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}