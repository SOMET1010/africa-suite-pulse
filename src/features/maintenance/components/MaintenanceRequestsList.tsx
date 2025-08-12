import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Clock, 
  User, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Play
} from "lucide-react";
import { useMaintenanceRequests } from "../hooks/useMaintenanceRequests";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-700 border-red-500/20"
};

const statusColors = {
  pending: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  assigned: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-700 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/20"
};

const statusLabels = {
  pending: "En attente",
  assigned: "Assignée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée"
};

const priorityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  urgent: "Urgente"
};

export function MaintenanceRequestsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const { data: requests, isLoading, error } = useMaintenanceRequests({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "assigned":
        return <User className="w-4 h-4" />;
      case "in_progress":
        return <Play className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des demandes de maintenance
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Demandes de maintenance</CardTitle>
            <CardDescription>
              Gestion des interventions techniques et de maintenance
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par titre, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="assigned">Assignée</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement des demandes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Demande</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">
                    {request.request_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={priorityColors[request.priority as keyof typeof priorityColors]}
                    >
                      {priorityLabels[request.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${statusColors[request.status as keyof typeof statusColors]} flex items-center gap-1 w-fit`}
                    >
                      {getStatusIcon(request.status)}
                      {statusLabels[request.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {request.location || "Non spécifié"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.assigned_to ? (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-3 h-3 text-muted-foreground" />
                        Technicien assigné
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(request.created_at), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {requests?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune demande de maintenance trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}