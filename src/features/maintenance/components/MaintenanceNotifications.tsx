import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Package, 
  Wrench,
  CheckCircle,
  X
} from "lucide-react";
import { useMaintenanceKPIs } from "../hooks/useMaintenanceKPIs";
import { useEquipment } from "../hooks/useEquipment";
import { useSpareParts } from "../hooks/useSpareParts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export function MaintenanceNotifications() {
  const { data: kpis } = useMaintenanceKPIs();
  const { data: equipment } = useEquipment({ status: "maintenance" });
  const { data: spareParts } = useSpareParts({ lowStock: true });

  // Calculer les notifications actives
  const notifications = [
    // Équipements en maintenance urgente
    ...(equipment?.filter(eq => {
      if (!eq.next_maintenance_date) return false;
      const diffDays = Math.ceil((new Date(eq.next_maintenance_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 0;
    }).map(eq => ({
      id: `maintenance-${eq.id}`,
      type: "maintenance-overdue",
      title: "Maintenance en retard",
      message: `${eq.name} nécessite une maintenance`,
      priority: "high",
      icon: AlertTriangle,
      data: eq
    })) || []),

    // Maintenance due bientôt
    ...(equipment?.filter(eq => {
      if (!eq.next_maintenance_date) return false;
      const diffDays = Math.ceil((new Date(eq.next_maintenance_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).map(eq => ({
      id: `maintenance-soon-${eq.id}`,
      type: "maintenance-due-soon",
      title: "Maintenance prévue",
      message: `${eq.name} - maintenance dans ${Math.ceil((new Date(eq.next_maintenance_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jour(s)`,
      priority: "medium",
      icon: Calendar,
      data: eq
    })) || []),

    // Stock bas
    ...(spareParts?.filter(part => part.current_stock <= part.min_stock_level).map(part => ({
      id: `stock-low-${part.id}`,
      type: "stock-low",
      title: "Stock bas",
      message: `${part.name} - ${part.current_stock} ${part.unit} restant(s)`,
      priority: part.current_stock === 0 ? "high" : "medium",
      icon: Package,
      data: part
    })) || [])
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const handleNotificationAction = (notification: any) => {
    switch (notification.type) {
      case "maintenance-overdue":
      case "maintenance-due-soon":
        // Créer automatiquement une demande de maintenance
        toast.success("Demande de maintenance créée pour " + notification.data.name);
        break;
      case "stock-low":
        // Ouvrir le dialogue de réapprovisionnement
        toast.info("Redirection vers la gestion des stocks");
        break;
      default:
        break;
    }
  };

  const dismissNotification = (notificationId: string) => {
    // Dans une vraie app, on sauvegarderait l'état de dismissal
    toast.success("Notification masquée");
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Notifications
          </CardTitle>
          <CardDescription>
            Aucune notification de maintenance en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Tout est à jour ! 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications ({notifications.length})
        </CardTitle>
        <CardDescription>
          Alertes de maintenance et gestion des stocks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          
          return (
            <div
              key={notification.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(notification.priority)}
                  >
                    {notification.priority === "high" ? "Urgent" : notification.priority === "medium" ? "Important" : "Info"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNotificationAction(notification)}
                  className="h-8 px-2"
                >
                  <Wrench className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-8 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}