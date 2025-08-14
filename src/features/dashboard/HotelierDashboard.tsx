import React from "react";
import { Link } from "react-router-dom";
import { TButton } from "@/core/ui/TButton";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { ActionCard } from "@/core/ui/ActionCard";
import { DataCard } from "@/core/ui/DataCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MessageSquare,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  userRole?: 'receptionist' | 'housekeeper' | 'manager' | 'director';
}

export function HotelierDashboard({ userRole = 'receptionist' }: DashboardProps) {
  const navigate = useNavigate();
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
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{getGreeting()} !</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tableau de bord principal AfricaSuite PMS
            </p>
          </div>
          <TButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TButton>
        </div>

        {/* Dashboard Content */}
        {/* Date actuelle */}
        <div className="text-center">
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Priority Alerts */}
        {priorityAlerts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Priorités du moment
            </h2>
            <div className="space-y-3">
              {priorityAlerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <ActionCard
                    key={index}
                    title={alert.message}
                    icon={Icon}
                    onClick={() => navigate(alert.to)}
                    className="border-l-4 border-l-warning bg-warning/5"
                  >
                    <TButton variant="default" size="sm">
                      {alert.action}
                    </TButton>
                  </ActionCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            État de l'hôtel
          </h2>
          <div className="grid-adaptive-1 gap-4">
            <DataCard
              title="Chambres occupées"
              value={`${quickStats[0].value}/${quickStats[0].total}`}
              subtitle="87% d'occupation"
              icon={Bed}
              variant="success"
            />
            <DataCard
              title="Arrivées prévues"
              value={quickStats[1].value}
              subtitle="clients aujourd'hui"
              icon={UserPlus}
              variant="default"
            />
            <DataCard
              title="Départs prévus"
              value={quickStats[2].value}
              subtitle="check-out du jour"
              icon={Clock}
              variant="warning"
            />
            <DataCard
              title="Maintenance"
              value={quickStats[3].value}
              subtitle="chambres en réparation"
              icon={AlertTriangle}
              variant="danger"
            />
          </div>
        </section>

        {/* Time-based Actions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            {timeActions.title}
          </h2>
          <div className="grid-adaptive-1 gap-4">
            {timeActions.items.map((action, index) => (
              <ActionCard
                key={action.label}
                title={action.label}
                description={`${action.count} ${action.count > 1 ? 'éléments' : 'élément'}`}
                onClick={() => navigate(action.to)}
                className={action.urgent ? "border-warning/30 bg-warning/5" : ""}
              >
                {action.urgent && (
                  <Badge variant="outline" className="bg-warning/20 border-warning text-warning">
                    Urgent
                  </Badge>
                )}
              </ActionCard>
            ))}
          </div>
        </section>

        {/* Quick Access Modules */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Accès rapide
          </h2>
          <div className="grid-adaptive-2 gap-4">
            {[
              { label: "Plan Chambres", icon: Hotel, to: "/reservations/rack" },
              { label: "Mes Clients", icon: Users, to: "/guests" },
              { label: "Check-in", icon: UserPlus, to: "/arrivals" },
              { label: "Réservations", icon: Calendar, to: "/reservations" }
            ].map((module, index) => {
              const Icon = module.icon;
              return (
                <ActionCard
                  key={module.label}
                  title={module.label}
                  icon={Icon}
                  onClick={() => navigate(module.to)}
                />
              );
            })}
          </div>
        </section>

        {/* Communication Center */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Communication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              title="Appels prioritaires"
              description="2 appels en attente"
              icon={Phone}
            />
            
            <ActionCard
              title="Messages équipe"
              description="5 nouveaux messages"
              icon={MessageSquare}
            />
          </div>
        </section>

      </div>
    </MainAppLayout>
  );
}