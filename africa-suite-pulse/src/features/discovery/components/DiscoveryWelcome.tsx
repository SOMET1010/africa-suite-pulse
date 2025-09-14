import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Target, 
  Users, 
  ArrowRight,
  CheckCircle,
  Hotel,
  UtensilsCrossed,
  BarChart3,
  Settings
} from 'lucide-react';

interface DiscoveryWelcomeProps {
  onStartGuide: () => void;
}

const features = [
  {
    icon: Hotel,
    title: 'Gestion Hôtelière Complète',
    description: 'Réservations, check-in/out, facturation et gestion des chambres'
  },
  {
    icon: UtensilsCrossed,
    title: 'Point de Vente Restaurant',
    description: 'Commandes, gestion des tables et encaissement intégré'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Tableaux de bord en temps réel et rapports détaillés'
  },
  {
    icon: Settings,
    title: 'Opérations Quotidiennes',
    description: 'Ménage, maintenance et gestion des stocks'
  }
];

const userRoles = [
  {
    role: 'Réceptionniste',
    focus: 'Front Office',
    description: 'Gestion des arrivées, départs et services clients'
  },
  {
    role: 'Serveur/Barman',
    focus: 'Restaurant POS',
    description: 'Prise de commandes et service en salle'
  },
  {
    role: 'Manager',
    focus: 'Analytics & Contrôle',
    description: 'Supervision, reporting et prise de décision'
  }
];

export function DiscoveryWelcome({ onStartGuide }: DiscoveryWelcomeProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenue dans AfricaSuite PMS
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Votre solution complète de gestion hôtelière et de point de vente. 
          Ce guide vous accompagnera dans la découverte de toutes les fonctionnalités 
          pour optimiser la gestion de votre établissement.
        </p>
        <div className="flex justify-center">
          <Button size="lg" onClick={onStartGuide} className="mt-4">
            <Target className="h-5 w-5 mr-2" />
            Commencer le Guide
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* What You'll Learn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Ce que vous allez apprendre
          </CardTitle>
          <CardDescription>
            Un parcours structuré pour maîtriser AfricaSuite PMS en moins de 30 minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Adapté à votre rôle
          </CardTitle>
          <CardDescription>
            Le guide s'adapte à votre fonction pour une expérience personnalisée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRoles.map((user, index) => (
              <div key={index} className="text-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Badge variant="outline" className="mb-2">
                  {user.role}
                </Badge>
                <h3 className="font-semibold text-sm mb-1">{user.focus}</h3>
                <p className="text-xs text-muted-foreground">
                  {user.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Modules Principaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Workflows Guidés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">30</div>
            <div className="text-sm text-muted-foreground">Minutes Totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Interactif</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}