import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Settings } from "lucide-react";

export function ReportScheduler() {
  const mockSchedules = [
    {
      id: '1',
      templateName: 'Rapport d\'occupation quotidien',
      frequency: 'daily',
      time: '08:00',
      isActive: true,
      lastRun: new Date('2024-01-15T08:00:00'),
      nextRun: new Date('2024-01-16T08:00:00')
    },
    {
      id: '2', 
      templateName: 'Rapport hebdomadaire performance',
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1, // Monday
      isActive: true,
      lastRun: new Date('2024-01-14T09:00:00'),
      nextRun: new Date('2024-01-21T09:00:00')
    },
    {
      id: '3',
      templateName: 'Rapport mensuel complet',
      frequency: 'monthly',
      time: '10:00',
      dayOfMonth: 1,
      isActive: false,
      lastRun: new Date('2024-01-01T10:00:00'),
      nextRun: new Date('2024-02-01T10:00:00')
    }
  ];

  const getFrequencyLabel = (frequency: string, dayOfWeek?: number, dayOfMonth?: number) => {
    switch (frequency) {
      case 'daily':
        return 'Quotidien';
      case 'weekly':
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return `Hebdomadaire (${days[dayOfWeek || 1]})`;
      case 'monthly':
        return `Mensuel (le ${dayOfMonth || 1})`;
      default:
        return frequency;
    }
  };

  const toggleSchedule = (id: string, active: boolean) => {
    console.log('Toggle schedule:', id, active);
    // TODO: Implement schedule toggle
  };

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Planifications actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockSchedules.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prochaine exécution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              Dans 2h 30min
            </div>
            <div className="text-xs text-muted-foreground">
              Rapport quotidien
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exécutions ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Planifications configurées</CardTitle>
          <CardDescription>
            Gestion des exécutions automatiques de rapports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{schedule.templateName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getFrequencyLabel(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth)} à {schedule.time}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      {schedule.nextRun && (
                        <span className="text-xs text-muted-foreground">
                          Prochaine: {schedule.nextRun.toLocaleDateString('fr-FR')} {schedule.nextRun.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={schedule.isActive}
                      onCheckedChange={(checked) => toggleSchedule(schedule.id, checked)}
                    />
                    <Label className="text-sm">
                      {schedule.isActive ? "Actif" : "Inactif"}
                    </Label>
                  </div>
                  
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configurer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Status */}
      <Card>
        <CardHeader>
          <CardTitle>Statut d'exécution</CardTitle>
          <CardDescription>
            Monitoring en temps réel des tâches planifiées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Système de planification</span>
              </div>
              <Badge variant="default" className="bg-success">Opérationnel</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dernière vérification:</span>
                <span className="ml-2 font-medium">Il y a 30 secondes</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prochaine vérification:</span>
                <span className="ml-2 font-medium">Dans 30 secondes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}