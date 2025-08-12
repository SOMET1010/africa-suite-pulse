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
import { Search, Eye, Edit, Wrench, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useEquipment } from "../hooks/useEquipment";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusColors = {
  operational: "bg-green-500/10 text-green-700 border-green-500/20",
  maintenance: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  out_of_order: "bg-red-500/10 text-red-700 border-red-500/20",
  retired: "bg-gray-500/10 text-gray-700 border-gray-500/20"
};

const statusLabels = {
  operational: "Opérationnel",
  maintenance: "En maintenance",
  out_of_order: "Hors service",
  retired: "Retiré"
};

const categoryLabels = {
  hvac: "Climatisation",
  plumbing: "Plomberie",
  electrical: "Électricité",
  elevator: "Ascenseur",
  kitchen: "Cuisine",
  laundry: "Buanderie",
  cleaning: "Nettoyage",
  security: "Sécurité",
  other: "Autre"
};

export function EquipmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: equipment, isLoading, error } = useEquipment({
    search: searchTerm,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    status: statusFilter === "all" ? undefined : statusFilter
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4" />;
      case "maintenance":
        return <Wrench className="w-4 h-4" />;
      case "out_of_order":
        return <AlertTriangle className="w-4 h-4" />;
      case "retired":
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getMaintenanceStatus = (lastDate: string | null, nextDate: string | null) => {
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des équipements
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
            <CardTitle>Équipements</CardTitle>
            <CardDescription>
              Gestion du parc d'équipements et maintenance préventive
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, code, marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="hvac">Climatisation</SelectItem>
              <SelectItem value="plumbing">Plomberie</SelectItem>
              <SelectItem value="electrical">Électricité</SelectItem>
              <SelectItem value="elevator">Ascenseur</SelectItem>
              <SelectItem value="kitchen">Cuisine</SelectItem>
              <SelectItem value="laundry">Buanderie</SelectItem>
              <SelectItem value="cleaning">Nettoyage</SelectItem>
              <SelectItem value="security">Sécurité</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="operational">Opérationnel</SelectItem>
              <SelectItem value="maintenance">En maintenance</SelectItem>
              <SelectItem value="out_of_order">Hors service</SelectItem>
              <SelectItem value="retired">Retiré</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement des équipements...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Prochaine maintenance</TableHead>
                <TableHead>Garantie</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment?.map((item) => {
                const maintenanceStatus = getMaintenanceStatus(
                  item.last_maintenance_date, 
                  item.next_maintenance_date
                );
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.equipment_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.brand} {item.model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[item.category as keyof typeof categoryLabels] || item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[item.status as keyof typeof statusColors]} flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(item.status)}
                        {statusLabels[item.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.location || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`bg-${maintenanceStatus.color}-500/10 text-${maintenanceStatus.color}-700 border-${maintenanceStatus.color}-500/20`}
                      >
                        {maintenanceStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.warranty_until ? (
                        <span className={
                          new Date(item.warranty_until) > new Date() 
                            ? "text-green-600" 
                            : "text-red-600"
                        }>
                          {format(new Date(item.warranty_until), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Expirée</span>
                      )}
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
                );
              })}
              
              {equipment?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun équipement trouvé
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