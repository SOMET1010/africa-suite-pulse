import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Hotel, Users, Calendar, ClipboardList, BarChart3, 
  ShoppingCart, CreditCard, Smartphone, Globe, 
  Shield, Clock, Zap, TrendingUp, CheckCircle,
  Building2, Utensils, Coffee, ShoppingBag, GraduationCap,
  Wifi, Database, Cloud, Lock, Star, Award
} from 'lucide-react';

export default function PlatformPresentation() {
  const pmsModules = [
    {
      icon: Hotel,
      title: "Gestion des Chambres",
      description: "Plan interactif, états temps réel, housekeeping automatisé",
      features: ["Rack visuel", "Statuts temps réel", "Assignation automatique"]
    },
    {
      icon: Calendar,
      title: "Réservations",
      description: "Moteur de réservation complet avec gestion des groupes",
      features: ["Multi-canaux", "Overbooking intelligent", "Groupes & allotements"]
    },
    {
      icon: Users,
      title: "Check-in/out Express",
      description: "Processus optimisé mobile-first",
      features: ["Reconnaissance QR", "Signature digitale", "Facturation auto"]
    },
    {
      icon: ClipboardList,
      title: "Gouvernante",
      description: "Workflow housekeeping intelligent",
      features: ["Optimisation parcours", "Contrôle qualité", "Reporting temps réel"]
    }
  ];

  const posModules = [
    {
      icon: Utensils,
      title: "Restaurant",
      description: "Service table complet avec cuisine",
      color: "accent",
      features: ["Commandes cuisine", "Gestion tables", "Accords vins"]
    },
    {
      icon: Coffee,
      title: "Fast-Food",
      description: "Service rapide optimisé",
      color: "warning",
      features: ["Menus combo", "Commande rapide", "Comptoir pickup"]
    },
    {
      icon: ShoppingBag,
      title: "Boutique",
      description: "Retail avec inventaire",
      color: "info",
      features: ["Scanner codes-barres", "Gestion stock", "Étiquetage"]
    },
    {
      icon: GraduationCap,
      title: "Collectivités",
      description: "Cantines et restauration collective",
      color: "success",
      features: ["Scanner badges", "Calcul subventions", "Planification repas"]
    }
  ];

  const africanFeatures = [
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Intégration Orange Money, MTN Mobile Money, Moov Money",
      status: "Actif"
    },
    {
      icon: Wifi,
      title: "Mode Hors Ligne",
      description: "Fonctionnement sans internet avec synchronisation intelligente",
      status: "Actif"
    },
    {
      icon: Globe,
      title: "Multi-devises",
      description: "Support CFA, USD, EUR avec taux de change temps réel",
      status: "Actif"
    },
    {
      icon: Shield,
      title: "Conformité SYSCOHADA",
      description: "Rapports fiscaux conformes aux réglementations africaines",
      status: "Actif"
    }
  ];

  const techStack = [
    { name: "Frontend", tech: "React + TypeScript", icon: "⚛️" },
    { name: "Backend", tech: "Supabase (PostgreSQL)", icon: "🗄️" },
    { name: "Déploiement", tech: "Docker + Kubernetes", icon: "🚢" },
    { name: "Cache", tech: "Redis", icon: "⚡" },
    { name: "Stockage", tech: "MinIO", icon: "📦" },
    { name: "Sécurité", tech: "Chiffrement E2E", icon: "🔒" }
  ];

  const metrics = [
    { label: "Déploiement", value: "< 2h", icon: Clock, color: "success" },
    { label: "Réduction coûts", value: "60%", icon: TrendingUp, color: "accent" },
    { label: "Efficacité", value: "+45%", icon: Zap, color: "info" },
    { label: "ROI", value: "3 mois", icon: Award, color: "warning" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-soft-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-luxury">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AfricaSuite PMS
                </h1>
                <p className="text-muted-foreground text-lg">
                  Solution hôtelière complète pour l'Afrique
                </p>
              </div>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-2 text-sm">
              Version 2025
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-12">
        
        {/* Vue d'ensemble */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Plateforme Hybride PMS + POS
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Solution complète de gestion hôtelière et point de vente, spécialement adaptée 
              au marché africain avec des fonctionnalités innovantes et une architecture moderne.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="border-l-4 border-l-accent shadow-soft hover:shadow-elevate transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-accent">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </div>
                      <IconComponent className="w-8 h-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Modules PMS */}
        <section>
          <Card className="shadow-luxury border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Hotel className="w-8 h-8 text-primary" />
                <span>Modules PMS - Gestion Hôtelière</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pmsModules.map((module, index) => {
                  const IconComponent = module.icon;
                  return (
                    <Card key={index} className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                        <div className="space-y-1">
                          {module.features.map((feature, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modules POS */}
        <section>
          <Card className="shadow-luxury border-accent/20">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-warning/10 border-b">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <ShoppingCart className="w-8 h-8 text-accent" />
                <span>Modules POS - Points de Vente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posModules.map((module, index) => {
                  const IconComponent = module.icon;
                  const colorClass = module.color === 'accent' ? 'text-accent bg-accent/10' :
                                   module.color === 'warning' ? 'text-warning bg-warning/10' :
                                   module.color === 'info' ? 'text-info bg-info/10' :
                                   'text-success bg-success/10';
                  return (
                    <Card key={index} className="border-border hover:border-accent/30 transition-all duration-300 hover:shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                        <div className="space-y-1">
                          {module.features.map((feature, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spécificités Africaines */}
        <section>
          <Card className="shadow-luxury border-success/20">
            <CardHeader className="bg-gradient-to-r from-success/10 to-info/10 border-b">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Globe className="w-8 h-8 text-success" />
                <span>Adaptations Spécifiques à l'Afrique</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {africanFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="border-border bg-success/5">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-success" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{feature.title}</h3>
                              <Badge className="bg-success/20 text-success border-success/30 mt-1">
                                {feature.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Architecture Technique */}
        <section>
          <Card className="shadow-luxury border-info/20">
            <CardHeader className="bg-gradient-to-r from-info/10 to-primary/10 border-b">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Database className="w-8 h-8 text-info" />
                <span>Architecture Technique Moderne</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {techStack.map((tech, index) => (
                  <Card key={index} className="border-border bg-info/5">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{tech.icon}</div>
                      <h3 className="font-semibold text-foreground mb-2">{tech.name}</h3>
                      <p className="text-muted-foreground">{tech.tech}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Avantages Concurrentiels */}
        <section>
          <Card className="shadow-luxury border-warning/20">
            <CardHeader className="bg-gradient-to-r from-warning/10 to-accent/10 border-b">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Star className="w-8 h-8 text-warning" />
                <span>Avantages Concurrentiels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Déploiement Rapide</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-accent" />
                      <span>Installation complète en moins de 2 heures</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Cloud className="w-5 h-5 text-accent" />
                      <span>Déploiement cloud ou on-premise</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Formation équipe incluse</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Innovation Continue</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <span>Mises à jour automatiques mensuelles</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-accent" />
                      <span>Sécurité enterprise niveau bancaire</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-accent" />
                      <span>Support local 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="shadow-luxury bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Prêt à Révolutionner Votre Hôtel ?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Rejoignez plus de 500 établissements hôteliers africains qui ont choisi AfricaSuite 
                pour optimiser leurs opérations et augmenter leur rentabilité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-white px-8">
                  Demander une Démo
                </Button>
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 px-8">
                  POC Gratuit 30 jours
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}