import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { 
  Crown, 
  Users, 
  Hotel, 
  FileText, 
  UserPlus, 
  CreditCard, 
  Settings, 
  Clock, 
  ArrowRight,
  Sparkles,
  Wrench,
  Eye,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const bottomActions = [
    {
      id: 'checkin-express',
      label: 'Check-in Express',
      icon: <UserCheck className="w-5 h-5" />,
      onClick: () => navigate('/arrivals'),
      variant: 'primary' as const
    },
    {
      id: 'voir-rack',
      label: 'Voir Rack',
      icon: <Eye className="w-5 h-5" />,
      onClick: () => navigate('/reservations/rack'),
      variant: 'accent' as const
    }
  ];

  const headerAction = (
    <Link 
      to="/settings"
      className="p-2 rounded-lg bg-muted/60 hover:bg-muted transition-smooth"
    >
      <Settings className="w-5 h-5 text-muted-foreground" />
    </Link>
  );

  return (
    <UnifiedLayout
      title={`${getGreeting()} ! 👋`}
      headerAction={headerAction}
      showStatusBar={true}
      showBottomBar={true}
      actions={bottomActions}
      className="animate-fade-in"
    >

      {/* Actions Rapides du Jour */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Actions du moment
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: "Check-in Express", 
                subtitle: "12 arrivées aujourd'hui", 
                icon: Users, 
                to: "/arrivals",
                color: "bg-soft-info border-info/30",
                urgent: true
              },
              { 
                title: "Chambres à Préparer", 
                subtitle: "9 départs ce matin", 
                icon: Hotel, 
                to: "/reservations/rack",
                color: "bg-soft-warning border-warning/30"
              },
              { 
                title: "Clients VIP", 
                subtitle: "3 arrivées premium", 
                icon: Crown, 
                to: "/guests",
                color: "bg-soft-accent border-accent/30"
              },
              { 
                title: "Réservations", 
                subtitle: "5 nouvelles demandes", 
                icon: FileText, 
                to: "/reservations",
                color: "bg-soft-success border-success/30"
              }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link 
                  key={action.title}
                  to={action.to}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-elegant hover:scale-[1.02] hover:shadow-luxury group",
                    action.color
                  )}
                >
                  {action.urgent && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-danger rounded-full animate-pulse"></div>
                  )}
                  <Icon className="w-8 h-8 text-foreground mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Vue d'Ensemble Rapide */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Vue d'ensemble de l'hôtel
        </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {label:"Clients présents",value:42,color:"text-success", bg: "bg-soft-success"},
              {label:"Arrivées du jour",value:12,color:"text-info", bg: "bg-soft-info"},
              {label:"Départs du jour",value:9,color:"text-warning", bg: "bg-soft-warning"},
              {label:"Chambres libres",value:57,color:"text-brand-accent", bg: "bg-soft-accent"}
            ].map((stat, index) => (
              <Card key={stat.label} className={cn("border-0 shadow-soft transition-elegant hover:shadow-luxury", stat.bg)}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={cn("text-2xl lg:text-3xl font-bold mb-1", stat.color)}>
                      {stat.value}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      {/* Modules Principaux */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Accès aux modules
        </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: "Plan des Chambres", 
                description: "Voir l'état des chambres en temps réel",
                icon: Hotel, 
                to: "/reservations/rack",
                iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-600/20",
                iconColor: "text-blue-600"
              },
              { 
                title: "Mes Clients", 
                description: "Profils et historique des clients",
                icon: Users, 
                to: "/guests",
                iconBg: "bg-gradient-to-br from-green-500/20 to-green-600/20",
                iconColor: "text-green-600"
              },
              { 
                title: "Réservations", 
                description: "Gérer les réservations et planning",
                icon: FileText, 
                to: "/reservations",
                iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/20",
                iconColor: "text-purple-600"
              },
              { 
                title: "Arrivées du jour", 
                description: "Check-in express et accueil",
                icon: UserPlus, 
                to: "/arrivals",
                iconBg: "bg-gradient-to-br from-orange-500/20 to-orange-600/20",
                iconColor: "text-orange-600"
              },
              { 
                title: "Facturation", 
                description: "Factures et paiements",
                icon: CreditCard, 
                to: "/billing",
                iconBg: "bg-gradient-to-br from-red-500/20 to-red-600/20",
                iconColor: "text-red-600"
              },
              { 
                title: "Gouvernante", 
                description: "Tâches ménage et statut chambres",
                icon: Sparkles, 
                to: "/housekeeping",
                iconBg: "bg-gradient-to-br from-pink-500/20 to-pink-600/20",
                iconColor: "text-pink-600"
              },
              { 
                title: "Maintenance", 
                description: "Gestion équipements et maintenance",
                icon: Wrench, 
                to: "/maintenance",
                iconBg: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20",
                iconColor: "text-yellow-600"
              },
              { 
                title: "Configuration", 
                description: "Paramètres de l'hôtel",
                icon: Settings, 
                to: "/settings",
                iconBg: "bg-gradient-to-br from-gray-500/20 to-gray-600/20",
                iconColor: "text-gray-600"
              }
            ].map((module, index) => {
              const Icon = module.icon;
              return (
              <Card key={module.title} className="border-0 shadow-soft hover:shadow-luxury transition-elegant group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl shrink-0", module.iconBg)}>
                      <Icon className={cn("w-6 h-6", module.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{module.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                      <Link 
                        to={module.to}
                        className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-elegant"
                      >
                        Accéder
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-elegant" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
          })}
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default Index;