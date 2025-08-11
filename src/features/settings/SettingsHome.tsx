import { Link } from 'react-router-dom';
import { 
  Building2, 
  Bed, 
  Package, 
  CreditCard, 
  Users, 
  Settings, 
  FileText,
  BarChart3,
  Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const settingsTiles = [
  {
    title: 'Paramètres Hôtel',
    description: 'Configuration générale de votre établissement',
    to: '/settings/hotel',
    icon: Building2,
    color: 'bg-soft-primary text-primary',
  },
  {
    title: 'Gestion des Chambres',
    description: 'Catalogue et types de chambres',
    to: '/settings/rooms',
    icon: Bed,
    color: 'bg-soft-success text-success',
  },
  {
    title: 'Catalogue Prestations',
    description: 'Services et prestations disponibles',
    to: '/settings/services',
    icon: Package,
    color: 'bg-soft-accent text-accent',
  },
  {
    title: 'Moyens de Paiement',
    description: 'Configuration des méthodes de paiement',
    to: '/settings/payments',
    icon: CreditCard,
    color: 'bg-soft-warning text-warning',
  },
  {
    title: 'Gestion Utilisateurs',
    description: 'Droits et accès du personnel',
    to: '/settings/users',
    icon: Users,
    color: 'bg-soft-info text-info',
  },
  {
    title: 'Paramètres Système',
    description: 'Configuration technique avancée',
    to: '/settings/system',
    icon: Settings,
    color: 'bg-muted text-muted-foreground',
  },
  {
    title: 'Modèles Documents',
    description: 'Factures, confirmations, rapports',
    to: '/settings/templates',
    icon: FileText,
    color: 'bg-soft-primary text-primary',
  },
  {
    title: 'Analytics & Rapports',
    description: 'Configuration des indicateurs',
    to: '/settings/analytics',
    icon: BarChart3,
    color: 'bg-soft-danger text-danger',
  },
  {
    title: 'Sécurité & Audit',
    description: 'Logs, sauvegardes, sécurité',
    to: '/settings/security',
    icon: Shield,
    color: 'bg-soft-warning text-warning',
  },
];

export default function SettingsHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Paramètres & Configuration
          </h1>
          <p className="text-muted-foreground">
            Configurez votre hôtel et personnalisez votre système de gestion
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.to} to={tile.to} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                     <div className={`
                        p-3 rounded-lg ${tile.color} 
                        shadow-soft group-hover:shadow-elevate transition-smooth
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {tile.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {tile.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Modules Configurés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-success">Active</div>
              <div className="text-sm text-muted-foreground">État du Système</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">v2.1.0</div>
              <div className="text-sm text-muted-foreground">Version PMS</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}