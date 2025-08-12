
import React, { useState } from "react";
import { PageLayout } from "@/core/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, SearchIcon, UserIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDepartures, useCheckoutReservation } from "@/queries/departures.queries";
import { useOrgId } from "@/core/auth/useOrg";

export default function DeparturesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { orgId } = useOrgId();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: departures = [], isLoading } = useDepartures(
    orgId || "", 
    today
  );
  const checkoutMutation = useCheckoutReservation();

  const filteredDepartures = departures.filter(departure => {
    const matchesSearch = 
      departure.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departure.room_number.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || departure.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const departureStats = {
    total: departures.length,
    checked_in: departures.filter(d => d.status === "checked_in").length,
    checked_out: departures.filter(d => d.status === "checked_out").length,
    cancelled: departures.filter(d => d.status === "cancelled").length,
  };

  const handleCheckout = async (reservationId: string) => {
    try {
      await checkoutMutation.mutateAsync({ reservationId });
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <PageLayout title="Départs du jour">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total départs</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departureStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in effectués</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{departureStats.checked_in}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-out effectués</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{departureStats.checked_out}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annulés</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{departureStats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou numéro de chambre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="checked_in">Check-in effectué</SelectItem>
                  <SelectItem value="checked_out">Check-out effectué</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Departures List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des départs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Chargement des départs...</div>
              </div>
            ) : filteredDepartures.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Aucun départ trouvé avec ces critères" 
                    : "Aucun départ prévu pour aujourd'hui"}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDepartures.map((departure) => (
                  <div
                    key={departure.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <div className="font-semibold">{departure.guest_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPinIcon className="h-3 w-3" />
                          Chambre {departure.room_number}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Départ: {new Date(departure.date_departure).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {departure.adults} adulte{departure.adults > 1 ? 's' : ''}
                          {departure.children > 0 && `, ${departure.children} enfant${departure.children > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      
                      <Badge
                        className={cn(
                          departure.status === "checked_out" && "bg-green-100 text-green-800 hover:bg-green-100",
                          departure.status === "checked_in" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                          departure.status === "cancelled" && "bg-red-100 text-red-800 hover:bg-red-100"
                        )}
                      >
                        {departure.status === "checked_out" && "Check-out effectué"}
                        {departure.status === "checked_in" && "Check-in effectué"}
                        {departure.status === "cancelled" && "Annulé"}
                      </Badge>
                      
                      {departure.status === "checked_in" && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckout(departure.id)}
                          disabled={checkoutMutation.isPending}
                        >
                          {checkoutMutation.isPending ? "En cours..." : "Effectuer le départ"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
