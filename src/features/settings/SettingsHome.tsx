import { Link } from 'react-router-dom';
import { 
  Hotel, 
  BedDouble, 
  Gift, 
  CreditCard, 
  UserCheck, 
  Settings2, 
  FileText,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock4,
  Crown,
  Star,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainAppLayout } from '@/core/layout/MainAppLayout';

const settingsTiles = [
  {
    title: 'Configuration Hôtel',
    description: 'Paramètres généraux de votre établissement de prestige',
    to: '/settings/hotel',
    icon: Hotel,
    color: 'glass-card border-accent-gold',
    status: 'configured',
    priority: 'high',
    lastModified: '2 jours',
    category: 'Établissement',
  },
  {
    title: 'Suites & Chambres',
    description: 'Gestion du patrimoine hôtelier et classifications',
    to: '/settings/rooms',
    icon: BedDouble,
    color: 'glass-card border-success/30',
    status: 'configured',
    priority: 'high',
    lastModified: '1 semaine',
    category: 'Hébergement',
  },
  {
    title: 'Services de Prestige',
    description: 'Conciergerie, spa, restauration et services exclusifs',
    to: '/settings/services',
    icon: Gift,
    color: 'glass-card border-accent-copper',
    status: 'configured',
    priority: 'medium',
    lastModified: '3 jours',
    category: 'Services',
  },
  {
    title: 'Grille Tarifaire',
    description: 'Configuration des tarifs par type de chambre et période',
    to: '/settings/tariffs',
    icon: DollarSign,
    color: 'glass-card border-accent-gold',
    status: 'partial',
    priority: 'high',
    lastModified: '2 jours',
    category: 'Finance',
  },
  {
    title: 'Paiements & Facturation',
    description: 'Solutions de paiement premium et facturation',
    to: '/settings/payments',
    icon: CreditCard,
    color: 'glass-card border-warning/30',
    status: 'partial',
    priority: 'high',
    lastModified: '5 jours',
    category: 'Finance',
  },
  {
    title: 'Équipe & Permissions',
    description: 'Gestion du personnel et hiérarchie des accès',
    to: '/settings/users',
    icon: UserCheck,
    color: 'glass-card border-info/30',
    status: 'configured',
    priority: 'medium',
    lastModified: '1 jour',
    category: 'Personnel',
  },
  {
    title: 'Architecture Système',
    description: 'Configuration technique et infrastructure',
    to: '/settings/system',
    icon: Settings2,
    color: 'glass-card border-muted/30',
    status: 'pending',
    priority: 'low',
    lastModified: 'Jamais',
    category: 'Technique',
  },
  {
    title: 'Documents Personnalisés',
    description: 'Templates de facturation et correspondance premium',
    to: '/settings/templates',
    icon: FileText,
    color: 'glass-card border-primary/30',
    status: 'pending',
    priority: 'medium',
    lastModified: 'Jamais',
    category: 'Communication',
  },
  {
    title: 'Analytics Business',
    description: 'Tableaux de bord et indicateurs de performance',
    to: '/settings/analytics',
    icon: TrendingUp,
    color: 'glass-card border-danger/30',
    status: 'pending',
    priority: 'low',
    lastModified: 'Jamais',
    category: 'Performance',
  },
  {
    title: 'Sécurité & Conformité',
    description: 'Audit, sauvegarde et protection des données',
    to: '/settings/security',
    icon: ShieldCheck,
    color: 'glass-card border-warning/30',
    status: 'partial',
    priority: 'high',
    lastModified: '1 semaine',
    category: 'Sécurité',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'configured': return CheckCircle2;
    case 'partial': return AlertTriangle;
    case 'pending': return Clock4;
    default: return Clock4;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'configured': return 'glass-card border-success/40 bg-success/5 text-success';
    case 'partial': return 'glass-card border-warning/40 bg-warning/5 text-warning';
    case 'pending': return 'glass-card border-muted/40 bg-muted/5 text-muted-foreground';
    default: return 'glass-card border-muted/40 bg-muted/5 text-muted-foreground';
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
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Centre de Configuration</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Orchestrez l'excellence de votre établissement
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="glass-card border-success/40 px-4 py-2 rounded-full shadow-soft">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-premium font-medium text-success">
                  {configuredCount} Configurés
                </span>
              </div>
            </div>
            {partialCount > 0 && (
              <div className="glass-card border-warning/40 px-4 py-2 rounded-full shadow-soft">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-premium font-medium text-warning">
                    {partialCount} En cours
                  </span>
                </div>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="glass-card border-muted/40 px-4 py-2 rounded-full shadow-soft">
                <div className="flex items-center gap-2">
                  <Clock4 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-premium font-medium text-muted-foreground">
                    {pendingCount} À configurer
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {/* Introduction */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 glass-card border-accent-gold shadow-luxury rounded-xl">
              <Settings2 className="h-8 w-8 accent-gold" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4 accent-gold" />
            <span className="text-lg text-muted-foreground font-premium">
              Gestion hôtelière de prestige
            </span>
          </div>
          <p className="text-muted-foreground font-premium text-lg max-w-2xl mx-auto leading-relaxed">
            Orchestrez l'excellence de votre établissement grâce à notre suite de configuration avancée
          </p>
        </div>

        {/* Luxury Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {settingsTiles.map((tile, index) => {
            const Icon = tile.icon;
            const StatusIcon = getStatusIcon(tile.status);
            return (
              <Link 
                key={tile.to} 
                to={tile.to} 
                className="group block"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card className={`
                  h-full transition-elegant hover:shadow-luxury hover:scale-[1.03] 
                  ${tile.color} backdrop-blur-md
                  group-hover:border-accent-gold/50 animate-fade-in
                  relative overflow-hidden
                `}>
                  {/* Luxury shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 transform -translate-x-full" />
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className={`
                          p-4 rounded-xl ${tile.color} 
                          shadow-luxury group-hover:shadow-elevate transition-elegant
                          group-hover:scale-110 group-hover:rotate-3
                          border border-accent-gold/20
                        `}>
                          <Icon className="h-7 w-7 accent-gold" />
                        </div>
                        {tile.priority === 'high' && (
                          <div className="absolute -top-1 -right-1">
                            <Sparkles className="h-4 w-4 accent-gold animate-pulse" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className={`
                          text-xs px-3 py-1.5 rounded-full ${getStatusColor(tile.status)}
                          backdrop-blur-sm font-premium font-medium
                        `}>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(tile.status)}
                          </div>
                        </div>
                        <div className="text-xs font-premium text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                          {tile.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-luxury font-semibold text-charcoal group-hover:accent-gold transition-colors text-xl leading-tight">
                        {tile.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-premium">
                        {tile.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-accent-gold/10">
                        <span className="text-xs text-muted-foreground font-premium">
                          Modifié il y a {tile.lastModified}
                        </span>
                        <div className="w-6 h-6 rounded-full glass-card border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors">
                          <span className="text-xs accent-gold">→</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Luxury Analytics Dashboard */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-luxury text-3xl font-bold text-charcoal mb-2">
              Tableau de Bord Exécutif
            </h2>
            <p className="text-muted-foreground font-premium">
              Vision d'ensemble de l'état de votre système
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-success/30 group hover:shadow-luxury transition-elegant overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full" />
              <CardContent className="p-8 text-center relative">
                <div className="text-4xl font-luxury font-bold text-success mb-2 group-hover:scale-110 transition-elegant">
                  {configuredCount}
                </div>
                <div className="text-sm text-muted-foreground font-premium mb-4">Modules Configurés</div>
                <div className="w-full bg-success/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-success to-success/80 h-3 rounded-full transition-all duration-1000" 
                    style={{ width: `${(configuredCount / settingsTiles.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-success mt-2 font-premium">
                  {Math.round((configuredCount / settingsTiles.length) * 100)}% complété
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-accent-gold/30 group hover:shadow-luxury transition-elegant overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-gold/20 to-transparent rounded-bl-full" />
              <CardContent className="p-8 text-center relative">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-accent-gold rounded-full animate-pulse mr-3" />
                  <div className="text-3xl font-luxury font-bold accent-gold group-hover:scale-110 transition-elegant">
                    Premium
                  </div>
                </div>
                <div className="text-sm text-muted-foreground font-premium mb-2">État du Système</div>
                <div className="text-xs accent-gold font-premium bg-accent-gold/10 px-3 py-1 rounded-full">
                  Tous services opérationnels
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-primary/30 group hover:shadow-luxury transition-elegant overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
              <CardContent className="p-8 text-center relative">
                <div className="text-3xl font-luxury font-bold text-primary mb-2 group-hover:scale-110 transition-elegant">
                  v2.1.0
                </div>
                <div className="text-sm text-muted-foreground font-premium mb-2">Version PMS</div>
                <div className="text-xs text-primary font-premium bg-primary/10 px-3 py-1 rounded-full">
                  Dernière mise à jour
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-warning/30 group hover:shadow-luxury transition-elegant overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-warning/20 to-transparent rounded-bl-full" />
              <CardContent className="p-8 text-center relative">
                <div className="text-3xl font-luxury font-bold text-warning mb-2 group-hover:scale-110 transition-elegant">
                  {pendingCount}
                </div>
                <div className="text-sm text-muted-foreground font-premium mb-2">Actions Requises</div>
                {pendingCount > 0 ? (
                  <div className="text-xs text-warning font-premium bg-warning/10 px-3 py-1 rounded-full">
                    Configuration à finaliser
                  </div>
                ) : (
                  <div className="text-xs text-success font-premium bg-success/10 px-3 py-1 rounded-full">
                    Tout est configuré
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainAppLayout>
  );
}