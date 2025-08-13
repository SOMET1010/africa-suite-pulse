import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { BottomActionBar } from "@/core/layout/BottomActionBar";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Users, 
  Hotel, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Bed,
  Coffee,
  Star,
  TrendingUp,
  Phone,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  userRole?: 'receptionist' | 'housekeeper' | 'manager' | 'director';
}

export function HotelierDashboard({ userRole = 'receptionist' }: DashboardProps) {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return "Bonjour";
    if (currentHour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getTimeBasedActions = () => {
    if (currentHour >= 6 && currentHour < 12) {
      return {
        title: "Actions du matin",
        items: [
          { label: "Check-out clients", count: 9, urgent: true, to: "/departures" },
          { label: "Préparer arrivées", count: 12, urgent: false, to: "/arrivals" },
          { label: "Nettoyage chambres", count: 15, urgent: true, to: "/housekeeping" }
        ]
      };
    } else if (currentHour >= 12 && currentHour < 18) {
      return {
        title: "Actions de l'après-midi",
        items: [
          { label: "Check-in clients", count: 8, urgent: true, to: "/arrivals" },
          { label: "Réservations tardives", count: 3, urgent: false, to: "/reservations" },
          { label: "Services extras", count: 5, urgent: false, to: "/services" }
        ]
      };
    } else {
      return {
        title: "Actions du soir",
        items: [
          { label: "Derniers check-in", count: 2, urgent: false, to: "/arrivals" },
          { label: "Facturation jour", count: 1, urgent: true, to: "/billing" },
          { label: "Fermeture comptable", count: 1, urgent: true, to: "/reports/closure" }
        ]
      };
    }
  };

  const timeActions = getTimeBasedActions();

  const quickStats = [
    { label: "Occupées", value: 42, total: 85, color: "text-success", bg: "bg-soft-success" },
    { label: "Arrivées", value: 12, color: "text-info", bg: "bg-soft-info" },
    { label: "Départs", value: 9, color: "text-warning", bg: "bg-soft-warning" },
    { label: "Mainten.", value: 2, color: "text-danger", bg: "bg-soft-danger" }
  ];

  const priorityAlerts = [
    { 
      message: "3 clients VIP arrivent à 15h", 
      type: "vip",
      icon: Star,
      action: "Préparer accueil",
      to: "/guests/vip"
    },
    { 
      message: "Chambre 203 - Problème climatisation", 
      type: "maintenance",
      icon: AlertTriangle,
      action: "Contacter maintenance",
      to: "/maintenance"
    },
    { 
      message: "Groupe de 15 personnes - Confirmation repas", 
      type: "service",
      icon: Coffee,
      action: "Appeler restaurant",
      to: "/services/restaurant"
    }
  ];

  return (
    <div className="min-h-screen bg-pearl p-4 animate-fade-in">
      <div className="container mx-auto max-w-7xl space-y-6">
        
        {/* Greeting & Time */}
        <header className="text-center">
          <h1 className="text-2xl lg:text-3xl font-luxury font-bold text-charcoal mb-2">
            {getGreeting()} ! 👋
          </h1>
          <p className="text-muted-foreground font-premium">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        {/* Priority Alerts */}
        {priorityAlerts.length > 0 && (
          <section>
            <h2 className="text-lg font-luxury font-semibold text-charcoal mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Priorités du moment
            </h2>
            <div className="space-y-3">
              {priorityAlerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <Card key={index} className="border-l-4 border-l-warning bg-soft-warning/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-warning" />
                          <span className="font-medium text-foreground">{alert.message}</span>
                        </div>
                        <TButton asChild variant="default" size="sm" className="tap-target">
                          <Link to={alert.to}>{alert.action}</Link>
                        </TButton>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-luxury font-semibold text-charcoal mb-3">
            État de l'hôtel
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={stat.label} className={cn("border-0 shadow-soft", stat.bg)}>
                <CardContent className="p-4 text-center">
                  <div className={cn("text-2xl font-luxury font-bold mb-1", stat.color)}>
                    {stat.value}
                    {stat.total && <span className="text-sm text-muted-foreground">/{stat.total}</span>}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Time-based Actions */}
        <section>
          <h2 className="text-lg font-luxury font-semibold text-charcoal mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-accent" />
            {timeActions.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeActions.items.map((action, index) => (
              <Link key={action.label} to={action.to}>
                <Card className={cn(
                  "hover:shadow-luxury transition-elegant cursor-pointer group border-2",
                  action.urgent ? "border-warning/30 bg-soft-warning" : "border-border bg-card"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-luxury font-semibold">{action.label}</h3>
                      {action.urgent && (
                        <Badge variant="outline" className="bg-warning/20 border-warning text-warning">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{action.count}</span>
                      <span className="text-sm text-muted-foreground">
                        {action.count > 1 ? 'éléments' : 'élément'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Access Modules */}
        <section>
          <h2 className="text-lg font-luxury font-semibold text-charcoal mb-3">
            Accès rapide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Plan Chambres", icon: Hotel, to: "/reservations/rack", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Mes Clients", icon: Users, to: "/guests", color: "text-green-600", bg: "bg-green-50" },
              { label: "Check-in", icon: UserPlus, to: "/arrivals", color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Réservations", icon: Calendar, to: "/reservations", color: "text-purple-600", bg: "bg-purple-50" }
            ].map((module, index) => {
              const Icon = module.icon;
              return (
                <Link key={module.label} to={module.to}>
                  <Card className="hover:shadow-luxury transition-elegant cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className={cn("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center", module.bg)}>
                        <Icon className={cn("w-6 h-6", module.color)} />
                      </div>
                      <h3 className="font-luxury font-semibold text-sm">{module.label}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Communication Center */}
        <section>
          <h2 className="text-lg font-luxury font-semibold text-charcoal mb-3">
            Communication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-luxury transition-elegant cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-luxury font-semibold">Appels prioritaires</h3>
                    <p className="text-sm text-muted-foreground">2 appels en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-luxury transition-elegant cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-luxury font-semibold">Messages équipe</h3>
                    <p className="text-sm text-muted-foreground">5 nouveaux messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bottom Action Bar pour Dashboard */}
        <BottomActionBar>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Occupés: {quickStats[0].value}/{quickStats[0].total}</span>
            <span>•</span>
            <span>Arrivées: {quickStats[1].value}</span>
            <span>•</span>
            <span>Urgent: {timeActions.items.filter(i => i.urgent).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <TButton asChild className="tap-target">
              <Link to="/arrivals">Check-in Express</Link>
            </TButton>
            <TButton asChild variant="default" className="tap-target">
              <Link to="/reservations/rack">Voir Rack</Link>
            </TButton>
            <TButton asChild variant="ghost" className="tap-target">
              <Link to="/reports">Rapports</Link>
            </TButton>
          </div>
        </BottomActionBar>
      </div>
    </div>
  );
}