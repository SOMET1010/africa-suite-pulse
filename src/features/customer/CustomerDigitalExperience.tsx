import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MenuDigitalInterface } from './components/MenuDigitalInterface';
import { CustomerKiosk } from './components/CustomerKiosk';
import { CustomerLoyaltyProgram } from './components/CustomerLoyaltyProgram';
import { CustomerNotifications } from './components/CustomerNotifications';
import { PersonalizedMenuRecommendations } from './components/PersonalizedMenuRecommendations';
import { IntelligentChatbot } from './components/IntelligentChatbot';
import { CustomerAnalyticsDashboard } from './components/CustomerAnalyticsDashboard';
import {
  Smartphone,
  Monitor,
  Award,
  Bell,
  BarChart3,
  QrCode,
  Wifi,
  NfcIcon,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles
} from 'lucide-react';

export function CustomerDigitalExperience() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for demo purposes
  const mockGuestId = "guest-demo-123";
  const mockOrgId = "org-demo-456";
  const mockCurrentMenu = [
    { id: '1', name: 'Pizza Margherita', category: 'pizza', price: 12.50 },
    { id: '2', name: 'Caesar Salad', category: 'salad', price: 8.90 },
    { id: '3', name: 'Tiramisu', category: 'dessert', price: 6.50 }
  ];

  const digitalServices = [
    {
      icon: QrCode,
      title: "Menu Digital QR",
      description: "Menu numérique accessible via QR code avec personnalisation IA",
      status: "active",
      color: "bg-blue-500",
      features: ["Recommandations IA", "Interface adaptive", "Allergènes intelligents"]
    },
    {
      icon: Smartphone,
      title: "App Mobile Intelligente", 
      description: "Application mobile avec IA pour expérience personnalisée",
      status: "active",
      color: "bg-green-500",
      features: ["Commande prédictive", "Assistant virtuel", "Notifications smart"]
    },
    {
      icon: Monitor,
      title: "Kiosque IA-Enhanced",
      description: "Bornes self-service avec interface adaptative",
      status: "active",
      color: "bg-orange-500", 
      features: ["Interface adaptive", "Reconnaissance faciale", "Suggestions temps réel"]
    },
    {
      icon: Award,
      title: "Fidélité Intelligente",
      description: "Programme de fidélité avec IA prédictive",
      status: "active",
      color: "bg-purple-500",
      features: ["Récompenses prédictives", "Challenges personnalisés", "Segmentation IA"]
    },
    {
      icon: Bell,
      title: "Notifications Smart",
      description: "Alertes contextuelles basées sur l'IA comportementale", 
      status: "active",
      color: "bg-red-500",
      features: ["Timing optimal", "Contenu personnalisé", "Prédiction d'engagement"]
    },
    {
      icon: BarChart3,
      title: "Analytics Avancées",
      description: "Tableaux de bord interactifs avec insights IA",
      status: "active",
      color: "bg-purple-500",
      features: ["Prédictions de demande", "Segmentation client", "ROI temps réel"]
    },
    {
      icon: Brain,
      title: "IA & Personnalisation",
      description: "Intelligence artificielle pour expérience personnalisée",
      status: "active",
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
      features: ["Recommandations IA", "Chatbot intelligent", "Prédictions comportementales"]
    }
  ];

  const metrics = [
    {
      label: "Commandes IA",
      value: "89%",
      trend: "+23%",
      icon: Brain
    },
    {
      label: "Satisfaction IA",
      value: "4.9/5",
      trend: "+0.4",
      icon: CheckCircle2
    },
    {
      label: "Personnalisation",
      value: "94%",
      trend: "+18%", 
      icon: Eye
    },
    {
      label: "Prédictions",
      value: "96%",
      trend: "+12%",
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques IA Enhanced */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0 bg-gradient-to-br from-background to-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {metric.trend}
                  </p>
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
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="menu">Menu Digital</TabsTrigger>
            <TabsTrigger value="kiosk">Kiosque</TabsTrigger>
            <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">IA & Personnalisation</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status === 'active' ? 'Actif' : 'Bêta'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <div className="grid gap-6">
            <MenuDigitalInterface />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recommandations Personnalisées
                </CardTitle>
                <CardDescription>
                  Menu adapté aux préférences et historique du client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalizedMenuRecommendations
                  guestId={mockGuestId}
                  orgId={mockOrgId}
                  currentMenu={mockCurrentMenu}
                  onAddToCart={(item) => console.log('Ajouté au panier:', item)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kiosk" className="space-y-6">
          <CustomerKiosk />
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <CustomerLoyaltyProgram />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <CustomerNotifications />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CustomerAnalyticsDashboard orgId={mockOrgId} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Intelligence Artificielle
                </CardTitle>
                <CardDescription>
                  Expérience client enrichie par l'IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recommandations IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PersonalizedMenuRecommendations
                        guestId={mockGuestId}
                        orgId={mockOrgId}
                        currentMenu={mockCurrentMenu}
                        onAddToCart={(item) => console.log('Ajouté au panier:', item)}
                        className="border-0 shadow-none p-0"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Assistant Intelligent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IntelligentChatbot
                        guestId={mockGuestId}
                        orgId={mockOrgId}
                        className="border-0 shadow-none p-0"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}