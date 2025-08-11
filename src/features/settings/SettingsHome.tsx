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
  Shield,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const settingsTiles = [
  {
    title: 'Paramètres Hôtel',
    description: 'Configuration générale de votre établissement',
    to: '/settings/hotel',
    icon: Building2,
    color: 'bg-soft-primary text-primary',
    status: 'configured',
    priority: 'high',
    lastModified: '2 jours',
  },
  {
    title: 'Gestion des Chambres',
    description: 'Catalogue et types de chambres',
    to: '/settings/rooms',
    icon: Bed,
    color: 'bg-soft-success text-success',
    status: 'configured',
    priority: 'high',
    lastModified: '1 semaine',
  },
  {
    title: 'Catalogue Prestations',
    description: 'Services et prestations disponibles',
    to: '/settings/services',
    icon: Package,
    color: 'bg-soft-accent text-accent',
    status: 'configured',
    priority: 'medium',
    lastModified: '3 jours',
  },
  {
    title: 'Moyens de Paiement',
    description: 'Configuration des méthodes de paiement',
    to: '/settings/payments',
    icon: CreditCard,
    color: 'bg-soft-warning text-warning',
    status: 'partial',
    priority: 'high',
    lastModified: '5 jours',
  },
  {
    title: 'Gestion Utilisateurs',
    description: 'Droits et accès du personnel',
    to: '/settings/users',
    icon: Users,
    color: 'bg-soft-info text-info',
    status: 'configured',
    priority: 'medium',
    lastModified: '1 jour',
  },
  {
    title: 'Paramètres Système',
    description: 'Configuration technique avancée',
    to: '/settings/system',
    icon: Settings,
    color: 'bg-muted text-muted-foreground',
    status: 'pending',
    priority: 'low',
    lastModified: 'Jamais',
  },
  {
    title: 'Modèles Documents',
    description: 'Factures, confirmations, rapports',
    to: '/settings/templates',
    icon: FileText,
    color: 'bg-soft-primary text-primary',
    status: 'pending',
    priority: 'medium',
    lastModified: 'Jamais',
  },
  {
    title: 'Analytics & Rapports',
    description: 'Configuration des indicateurs',
    to: '/settings/analytics',
    icon: BarChart3,
    color: 'bg-soft-danger text-danger',
    status: 'pending',
    priority: 'low',
    lastModified: 'Jamais',
  },
  {
    title: 'Sécurité & Audit',
    description: 'Logs, sauvegardes, sécurité',
    to: '/settings/security',
    icon: Shield,
    color: 'bg-soft-warning text-warning',
    status: 'partial',
    priority: 'high',
    lastModified: '1 semaine',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'configured': return CheckCircle;
    case 'partial': return AlertCircle;
    case 'pending': return Clock;
    default: return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'configured': return 'bg-soft-success text-success border-success/20';
    case 'partial': return 'bg-soft-warning text-warning border-warning/20';
    case 'pending': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'configured': return 'Configuré';
    case 'partial': return 'Partiel';
    case 'pending': return 'À configurer';
    default: return 'À configurer';
  }
};

export default function SettingsHome() {
  const configuredCount = settingsTiles.filter(tile => tile.status === 'configured').length;
  const partialCount = settingsTiles.filter(tile => tile.status === 'partial').length;
  const pendingCount = settingsTiles.filter(tile => tile.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
            <span>Accueil</span> <span className="mx-2">/</span> <span className="text-foreground">Paramètres</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Paramètres & Configuration
              </h1>
              <p className="text-muted-foreground">
                Configurez votre hôtel et personnalisez votre système de gestion
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-soft-success text-success border-success/20">
                {configuredCount} configurés
              </Badge>
              {partialCount > 0 && (
                <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">
                  {partialCount} partiels
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge variant="outline" className="border-muted-foreground/30">
                  {pendingCount} à faire
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {settingsTiles.map((tile, index) => {
            const Icon = tile.icon;
            const StatusIcon = getStatusIcon(tile.status);
            return (
              <Link 
                key={tile.to} 
                to={tile.to} 
                className="group block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border group-hover:border-primary/20 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        p-3 rounded-lg ${tile.color} 
                        shadow-soft group-hover:shadow-elevate transition-all duration-300
                        group-hover:scale-110
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${getStatusColor(tile.status)}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusLabel(tile.status)}
                        </Badge>
                        {tile.priority === 'high' && (
                          <div className="w-2 h-2 bg-danger rounded-full animate-pulse" title="Priorité élevée" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                        {tile.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tile.description}
                      </p>
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span>Modifié: {tile.lastModified}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Enhanced Quick Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-1 group-hover:scale-110 transition-transform">
                {configuredCount}
              </div>
              <div className="text-sm text-muted-foreground">Modules Configurés</div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(configuredCount / settingsTiles.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse mr-2" />
                <div className="text-2xl font-bold text-success group-hover:scale-110 transition-transform">
                  Active
                </div>
              </div>
              <div className="text-sm text-muted-foreground">État du Système</div>
              <div className="text-xs text-success mt-2">Tous services opérationnels</div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                v2.1.0
              </div>
              <div className="text-sm text-muted-foreground">Version PMS</div>
              <div className="text-xs text-primary mt-2">Dernière mise à jour</div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-warning mb-1 group-hover:scale-110 transition-transform">
                {pendingCount}
              </div>
              <div className="text-sm text-muted-foreground">Actions Requises</div>
              {pendingCount > 0 ? (
                <div className="text-xs text-warning mt-2">Configuration incomplète</div>
              ) : (
                <div className="text-xs text-success mt-2">Tout est configuré</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}