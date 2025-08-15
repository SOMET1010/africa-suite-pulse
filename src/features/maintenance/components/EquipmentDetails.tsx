import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Calendar, 
  Wrench, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  History,
  Package,
  ClipboardList
} from "lucide-react";
import { useUpdateEquipment } from "../hooks/useEquipment";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface EquipmentDetailsProps {
  equipment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentDetails({ equipment, open, onOpenChange }: EquipmentDetailsProps) {
  const [status, setStatus] = useState(equipment?.status || "operational");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateMutation = useUpdateEquipment();

  const handleStatusUpdate = async () => {
    if (!equipment) return;
    
    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync({
        id: equipment.id,
        updates: {
          status,
          notes: notes ? `${equipment.notes || ""}\n${new Date().toISOString()}: ${notes}` : equipment.notes
        }
      });
      
      toast.success("Équipement mis à jour avec succès");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const triggerMaintenance = async () => {
    if (!equipment) return;
    
    try {
      // Créer automatiquement une demande de maintenance
      toast.success("Demande de maintenance créée automatiquement");
    } catch (error) {
      toast.error("Erreur lors de la création de la demande");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      operational: "bg-green-500/10 text-green-700 border-green-500/20",
      maintenance: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      out_of_order: "bg-red-500/10 text-red-700 border-red-500/20",
      retired: "bg-gray-500/10 text-gray-700 border-gray-500/20"
    };
    return colors[status as keyof typeof colors] || colors.operational;
  };

  const getMaintenanceStatus = (nextDate: string | null) => {
    if (!nextDate) return { status: "no-schedule", label: "Pas de planification", color: "gray" };
    
    const today = new Date();
    const next = new Date(nextDate);
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "overdue", label: "En retard", color: "red" };
    } else if (diffDays <= 7) {
      return { status: "due-soon", label: "Bientôt due", color: "yellow" };
    } else {
      return { status: "scheduled", label: `Dans ${diffDays} jours`, color: "green" };
    }
  };

  if (!equipment) return null;

  const maintenanceStatus = getMaintenanceStatus(equipment.next_maintenance_date);
  const isWarrantyValid = equipment.warranty_until && new Date(equipment.warranty_until) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Équipement: {equipment.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="parts">Pièces</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Code:</span>
                      <p className="font-mono">{equipment.equipment_code}</p>
                    </div>
                    <div>
                      <span className="font-medium">Nom:</span>
                      <p>{equipment.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Catégorie:</span>
                      <p>{equipment.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Localisation:</span>
                      <p>{equipment.location || "Non spécifiée"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Marque:</span>
                      <p>{equipment.brand || "Non spécifiée"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Modèle:</span>
                      <p>{equipment.model || "Non spécifié"}</p>
                    </div>
                    <div>
                      <span className="font-medium">N° Série:</span>
                      <p className="font-mono">{equipment.serial_number || "Non spécifié"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date d'installation:</span>
                      <p>{equipment.installation_date ? format(new Date(equipment.installation_date), "dd MMM yyyy", { locale: fr }) : "Non spécifiée"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(equipment.status)}>
                      {equipment.status}
                    </Badge>
                    {isWarrantyValid && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                        Sous garantie
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Statut et actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut et actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Changer le statut</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Opérationnel</SelectItem>
                        <SelectItem value="maintenance">En maintenance</SelectItem>
                        <SelectItem value="out_of_order">Hors service</SelectItem>
                        <SelectItem value="retired">Retiré</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ajouter une note</label>
                    <Textarea
                      placeholder="Notes sur l'état, interventions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleStatusUpdate}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mettre à jour
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={triggerMaintenance}
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Planning de maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Planning de maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Dernière maintenance:</span>
                      <span>{equipment.last_maintenance_date ? format(new Date(equipment.last_maintenance_date), "dd MMM yyyy", { locale: fr }) : "Jamais"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Prochaine maintenance:</span>
                      <Badge variant="outline" className={`bg-${maintenanceStatus.color}-500/10 text-${maintenanceStatus.color}-700 border-${maintenanceStatus.color}-500/20`}>
                        {maintenanceStatus.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Fréquence:</span>
                      <span>{equipment.maintenance_frequency_days} jours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Garantie */}
              <Card>
                <CardHeader>
                  <CardTitle>Garantie et support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Date d'achat:</span>
                      <span>{equipment.purchase_date ? format(new Date(equipment.purchase_date), "dd MMM yyyy", { locale: fr }) : "Non spécifiée"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Garantie jusqu'au:</span>
                      <span className={isWarrantyValid ? "text-green-600" : "text-red-600"}>
                        {equipment.warranty_until ? format(new Date(equipment.warranty_until), "dd MMM yyyy", { locale: fr }) : "Expirée"}
                      </span>
                    </div>
                  </div>

                  {equipment.specifications && (
                    <div>
                      <span className="font-medium text-sm">Spécifications:</span>
                      <div className="bg-muted/50 rounded p-3 mt-1">
                        <pre className="text-xs">{JSON.stringify(equipment.specifications, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun historique d'intervention disponible</p>
                  <p className="text-sm">Les futures interventions apparaîtront ici</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Pièces détachées compatibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune pièce détachée associée</p>
                  <p className="text-sm">Associez des pièces détachées pour faciliter la maintenance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}