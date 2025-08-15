import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  FileText, 
  Wrench, 
  Play, 
  CheckCircle,
  X,
  MessageSquare,
  Package
} from "lucide-react";
import { useUpdateMaintenanceRequest } from "../hooks/useMaintenanceRequests";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { MaintenancePartsConsumption } from "@/features/operations/components/MaintenancePartsConsumption";

interface MaintenanceRequestDetailsProps {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceRequestDetails({ request, open, onOpenChange }: MaintenanceRequestDetailsProps) {
  const [status, setStatus] = useState(request?.status || "pending");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPartsConsumption, setShowPartsConsumption] = useState(false);
  
  const updateMutation = useUpdateMaintenanceRequest();

  const handleStatusUpdate = async () => {
    if (!request) return;
    
    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync({
        id: request.id,
        updates: {
          status,
          notes: notes ? `${request.notes || ""}\n${new Date().toISOString()}: ${notes}` : request.notes
        }
      });
      
      toast.success("Demande mise à jour avec succès");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      assigned: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      completed: "bg-green-500/10 text-green-700 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-700 border-red-500/20"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      high: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      urgent: "bg-red-500/10 text-red-700 border-red-500/20"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Demande #{request.request_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-base">{request.title}</h4>
                <p className="text-muted-foreground mt-1">{request.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className={getPriorityColor(request.priority)}>
                  Priorité: {request.priority}
                </Badge>
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Localisation: {request.location || "Non spécifiée"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Créée le: {format(new Date(request.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                </div>
                {request.due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Échéance: {format(new Date(request.due_date), "dd MMMM yyyy", { locale: fr })}</span>
                  </div>
                )}
                {request.assigned_to && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Assigné à: Technicien</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions et mise à jour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>
                Mettre à jour le statut et ajouter des notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="assigned">Assignée</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Ajouter une note</label>
                <Textarea
                  placeholder="Décrivez l'intervention, les problèmes rencontrés..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                {request.status === 'in_progress' && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowPartsConsumption(true)}
                    className="flex-1"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Consommation pièces
                  </Button>
                )}
                
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Mettre à jour
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historique des notes */}
          {request.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Historique des interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded p-4">
                  <pre className="whitespace-pre-wrap text-sm">{request.notes}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Parts Consumption Dialog */}
        <MaintenancePartsConsumption
          maintenanceRequest={request}
          open={showPartsConsumption}
          onOpenChange={setShowPartsConsumption}
        />
      </DialogContent>
    </Dialog>
  );
}