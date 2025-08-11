import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Calendar, MapPin, Edit, Trash2, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationGroup {
  id: string;
  group_name: string;
  group_leader_name?: string;
  group_leader_email?: string;
  group_leader_phone?: string;
  total_rooms: number;
  total_guests: number;
  group_rate?: number;
  notes?: string;
  special_requests?: string;
  created_at: string;
  reservations?: {
    id: string;
    guest_name?: string;
    room_number?: string;
    status: string;
    rate_total?: number;
    date_arrival: string;
    date_departure: string;
  }[];
}

export default function GroupsManagementPage() {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<ReservationGroup | null>(null);

  // Load reservation groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["reservation-groups", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      // Simulate API call - replace with actual API
      const mockGroups: ReservationGroup[] = [
        {
          id: "1",
          group_name: "Délégation Commerciale Abidjan",
          group_leader_name: "Marie Kouassi",
          group_leader_email: "marie.kouassi@company.com",
          group_leader_phone: "+225 07 12 34 56",
          total_rooms: 5,
          total_guests: 8,
          group_rate: 125000,
          notes: "Groupe corporate avec forfait petit-déjeuner",
          created_at: "2024-01-15T10:00:00Z",
          reservations: [
            {
              id: "r1",
              guest_name: "Marie Kouassi",
              room_number: "101",
              status: "confirmed",
              rate_total: 25000,
              date_arrival: "2024-02-15",
              date_departure: "2024-02-17"
            },
            {
              id: "r2",
              guest_name: "Jean Yao",
              room_number: "102",
              status: "confirmed",
              rate_total: 25000,
              date_arrival: "2024-02-15",
              date_departure: "2024-02-17"
            }
          ]
        },
        {
          id: "2",
          group_name: "Équipe Football Yamoussoukro",
          group_leader_name: "Kofi Asante",
          group_leader_email: "coach@yamoussokro-fc.ci",
          total_rooms: 12,
          total_guests: 24,
          group_rate: 240000,
          special_requests: "Repas spéciaux pour sportifs",
          created_at: "2024-01-20T14:30:00Z",
          reservations: []
        }
      ];
      
      return mockGroups;
    },
    enabled: !!orgId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "success";
      case "option": return "warning";
      case "present": return "primary";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmée";
      case "option": return "Option";
      case "present": return "Présente";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  const getTotalAmount = (group: ReservationGroup) => {
    return group.reservations?.reduce((sum, res) => sum + (res.rate_total || 0), 0) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Groupes</h1>
          <p className="text-muted-foreground">
            Gérez les réservations de groupe et les séjours multi-chambres
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Groupe
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groupes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Groupes actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres Groupes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce((sum, group) => sum + group.total_rooms, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Chambres réservées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invités Groupes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce((sum, group) => sum + group.total_guests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Personnes attendues
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Groupes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce((sum, group) => sum + getTotalAmount(group), 0).toLocaleString()} F
            </div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Groups Cards */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des groupes...
            </div>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun groupe trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de réservations de groupe.
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer le premier groupe
                </Button>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => (
              <Card 
                key={group.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedGroup?.id === group.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.group_name}</CardTitle>
                      <CardDescription>
                        Responsable: {group.group_leader_name || "Non défini"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">{group.total_rooms}</p>
                      <p className="text-muted-foreground">Chambres</p>
                    </div>
                    <div>
                      <p className="font-medium">{group.total_guests}</p>
                      <p className="text-muted-foreground">Invités</p>
                    </div>
                    <div>
                      <p className="font-medium">{getTotalAmount(group).toLocaleString()} F</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                  </div>
                  
                  {group.special_requests && (
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        Demandes spéciales
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      Créé le {format(new Date(group.created_at), "dd/MM/yyyy", { locale: fr })}
                    </div>
                    <Badge variant="secondary">
                      {group.reservations?.length || 0} réservations
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Group Details */}
        <div className="space-y-4">
          {selectedGroup ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Détails du groupe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Informations générales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nom:</span>
                        <span className="font-medium">{selectedGroup.group_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Responsable:</span>
                        <span className="font-medium">{selectedGroup.group_leader_name || "Non défini"}</span>
                      </div>
                      {selectedGroup.group_leader_email && (
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedGroup.group_leader_email}</span>
                        </div>
                      )}
                      {selectedGroup.group_leader_phone && (
                        <div className="flex justify-between">
                          <span>Téléphone:</span>
                          <span className="font-medium">{selectedGroup.group_leader_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedGroup.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                        {selectedGroup.notes}
                      </p>
                    </div>
                  )}

                  {selectedGroup.special_requests && (
                    <div>
                      <h4 className="font-medium mb-2">Demandes spéciales</h4>
                      <p className="text-sm text-muted-foreground bg-warning/10 p-3 rounded">
                        {selectedGroup.special_requests}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Actions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Réservations du groupe</CardTitle>
                  <CardDescription>
                    {selectedGroup.reservations?.length || 0} réservation(s) liée(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedGroup.reservations && selectedGroup.reservations.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGroup.reservations.map((reservation) => (
                        <div key={reservation.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium text-sm">{reservation.guest_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Ch. {reservation.room_number} • {reservation.rate_total?.toLocaleString()} F
                            </p>
                          </div>
                          <Badge variant={getStatusColor(reservation.status) as any} className="text-xs">
                            {getStatusLabel(reservation.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Aucune réservation liée à ce groupe
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une réservation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Sélectionnez un groupe pour voir les détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}