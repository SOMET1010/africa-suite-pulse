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
import { Search, Eye, Edit, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useSpareParts } from "../hooks/useSpareParts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const categoryLabels = {
  hvac: "Climatisation",
  plumbing: "Plomberie",
  electrical: "Électricité",
  mechanical: "Mécanique",
  consumable: "Consommable",
  other: "Autre"
};

export function SparePartsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  
  const { data: spareParts, isLoading, error } = useSpareParts({
    search: searchTerm,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    lowStock: stockFilter === "low" ? true : undefined
  });

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) {
      return { status: "out", label: "Rupture", color: "red", icon: AlertTriangle };
    } else if (current <= min) {
      return { status: "low", label: "Stock bas", color: "yellow", icon: TrendingDown };
    } else if (current > min * 2) {
      return { status: "high", label: "Stock élevé", color: "green", icon: TrendingUp };
    } else {
      return { status: "normal", label: "Normal", color: "blue", icon: Package };
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erreur lors du chargement des pièces détachées
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
            <CardTitle>Pièces détachées</CardTitle>
            <CardDescription>
              Gestion des stocks et approvisionnements
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, code, fournisseur..."
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
              <SelectItem value="mechanical">Mécanique</SelectItem>
              <SelectItem value="consumable">Consommable</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stocks</SelectItem>
              <SelectItem value="low">Stock bas</SelectItem>
              <SelectItem value="out">Rupture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement des pièces détachées...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock actuel</TableHead>
                <TableHead>Stock min/max</TableHead>
                <TableHead>Coût unitaire</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Dernier réappro.</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spareParts?.map((part) => {
                const stockStatus = getStockStatus(part.current_stock, part.min_stock_level);
                const StockIcon = stockStatus.icon;
                
                return (
                  <TableRow key={part.id}>
                    <TableCell className="font-mono text-xs">
                      {part.part_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {part.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[part.category as keyof typeof categoryLabels] || part.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={`bg-${stockStatus.color}-500/10 text-${stockStatus.color}-700 border-${stockStatus.color}-500/20 flex items-center gap-1`}
                        >
                          <StockIcon className="w-3 h-3" />
                          {part.current_stock} {part.unit}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-muted-foreground">
                        Min: {part.min_stock_level} • Max: {part.max_stock_level}
                      </div>
                    </TableCell>
                    <TableCell>
                      {part.unit_cost !== null && part.unit_cost !== undefined 
                        ? `${part.unit_cost.toString()} ${part.unit || 'unité'}`
                        : "Non défini"
                      }
                    </TableCell>
                    <TableCell className="text-sm">
                      {part.supplier || (
                        <span className="text-muted-foreground">Non spécifié</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {part.last_restocked_date ? (
                        format(new Date(part.last_restocked_date), "dd MMM yyyy", { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">Jamais</span>
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
              
              {spareParts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucune pièce détachée trouvée
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
