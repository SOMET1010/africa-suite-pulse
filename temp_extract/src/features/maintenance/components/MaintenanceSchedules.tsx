import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, Clock, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useMaintenanceSchedules } from "../hooks/useMaintenanceSchedules";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const frequencyLabels = {
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle",
  quarterly: "Trimestrielle",
  yearly: "Annuelle",
  custom: "Personnalisée"
};

export function MaintenanceSchedules() {
  const { data: schedules, isLoading, error } = useMaintenanceSchedules();

  const getScheduleStatus = (nextDate: string) => {
    const today = new Date();
    const next = new Date(nextDate);
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "overdue", label: "En retard", color: "red", icon: AlertTriangle };
    } else if (diffDays === 0) {
      return { status: "today", label: "Aujourd'hui", color: "orange", icon: Clock };
    } else if (diffDays <= 7) {
      return { status: "due-soon", label: "Cette semaine", color: "yellow", icon: Calendar };
    } else {
      return { status: "scheduled", label: `Dans ${diffDays} jours`, color: "green", icon: CheckCircle };
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des planifications
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {schedules?.filter(s => {
                const diffDays = Math.ceil((new Date(s.next_execution_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 0;
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              équipements en retard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {schedules?.filter(s => {
                const diffDays = Math.ceil((new Date(s.next_execution_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 7;
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              maintenances prévues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planifications actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules?.filter(s => s.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              équipements suivis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des planifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Planifications de maintenance préventive</CardTitle>
              <CardDescription>
                Suivi automatique des maintenances programmées
              </CardDescription>
            </div>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Nouvelle planification
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement des planifications...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Planification</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Prochaine maintenance</TableHead>
                  <TableHead>Dernière exécution</TableHead>
                  <TableHead>Durée estimée</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules?.map((schedule) => {
                  const status = getScheduleStatus(schedule.next_execution_date);
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{schedule.equipment?.name || "Équipement supprimé"}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.equipment?.equipment_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{schedule.schedule_name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {schedule.task_template}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {frequencyLabels[schedule.frequency_type as keyof typeof frequencyLabels]}
                          {schedule.frequency_value > 1 && ` (${schedule.frequency_value})`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`bg-${status.color}-500/10 text-${status.color}-700 border-${status.color}-500/20 flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {format(new Date(schedule.next_execution_date), "dd MMM yyyy", { locale: fr })}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {schedule.last_executed_date ? (
                          format(new Date(schedule.last_executed_date), "dd MMM yyyy", { locale: fr })
                        ) : (
                          <span className="text-muted-foreground">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {schedule.estimated_duration_hours ? (
                          `${schedule.estimated_duration_hours}h`
                        ) : (
                          <span className="text-muted-foreground">Non définie</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {schedule.assigned_technician ? (
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-muted-foreground" />
                            Assigné
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.is_active ? "default" : "secondary"}>
                          {schedule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Wrench className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {schedules?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucune planification de maintenance trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}