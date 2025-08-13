import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ReservationFilters } from "@/types/reservation";

interface ReservationFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ReservationFilters;
  onFiltersChange: (filters: ReservationFilters) => void;
}

export function ReservationFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: ReservationFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState<ReservationFilters>(filters);

  const updateFilter = (key: keyof ReservationFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
    onOpenChange(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(Boolean).length;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres avancés
          </SheetTitle>
          <SheetDescription>
            Filtrez les réservations selon vos critères
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Dates d'arrivée */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dates d'arrivée</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="arrival-from" className="text-sm text-muted-foreground">Du</Label>
                <Input
                  id="arrival-from"
                  type="date"
                  value={localFilters.date_arrival_from || ""}
                  onChange={(e) => updateFilter("date_arrival_from", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="arrival-to" className="text-sm text-muted-foreground">Au</Label>
                <Input
                  id="arrival-to"
                  type="date"
                  value={localFilters.date_arrival_to || ""}
                  onChange={(e) => updateFilter("date_arrival_to", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates de départ */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Dates de départ</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="departure-from" className="text-sm text-muted-foreground">Du</Label>
                <Input
                  id="departure-from"
                  type="date"
                  value={localFilters.date_departure_from || ""}
                  onChange={(e) => updateFilter("date_departure_from", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="departure-to" className="text-sm text-muted-foreground">Au</Label>
                <Input
                  id="departure-to"
                  type="date"
                  value={localFilters.date_departure_to || ""}
                  onChange={(e) => updateFilter("date_departure_to", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Type de chambre */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type de chambre</Label>
            <Select
              value={localFilters.room_type || ""}
              onValueChange={(value) => updateFilter("room_type", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="STD">Standard</SelectItem>
                <SelectItem value="SUP">Supérieure</SelectItem>
                <SelectItem value="DEL">Deluxe</SelectItem>
                <SelectItem value="SUI">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type de client */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type de client</Label>
            <Select
              value={localFilters.guest_type || ""}
              onValueChange={(value) => updateFilter("guest_type", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="individual">Individuel</SelectItem>
                <SelectItem value="corporate">Entreprise</SelectItem>
                <SelectItem value="group">Groupe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Source de réservation */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Source</Label>
            <Select
              value={localFilters.source || ""}
              onValueChange={(value) => updateFilter("source", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sources</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="phone">Téléphone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="website">Site web</SelectItem>
                <SelectItem value="booking_com">Booking.com</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Nombre d'adultes */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Nombre d'adultes</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="adults-min" className="text-sm text-muted-foreground">Min</Label>
                <Input
                  id="adults-min"
                  type="number"
                  min="1"
                  value={localFilters.adults_min || ""}
                  onChange={(e) => updateFilter("adults_min", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="adults-max" className="text-sm text-muted-foreground">Max</Label>
                <Input
                  id="adults-max"
                  type="number"
                  min="1"
                  value={localFilters.adults_max || ""}
                  onChange={(e) => updateFilter("adults_max", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tarif */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tarif (XOF)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rate-min" className="text-sm text-muted-foreground">Min</Label>
                <Input
                  id="rate-min"
                  type="number"
                  min="0"
                  value={localFilters.rate_min || ""}
                  onChange={(e) => updateFilter("rate_min", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="rate-max" className="text-sm text-muted-foreground">Max</Label>
                <Input
                  id="rate-max"
                  type="number"
                  min="0"
                  value={localFilters.rate_max || ""}
                  onChange={(e) => updateFilter("rate_max", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Options spéciales */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Options spéciales</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-special-requests"
                checked={localFilters.has_special_requests || false}
                onCheckedChange={(checked) => updateFilter("has_special_requests", checked)}
              />
              <Label htmlFor="has-special-requests" className="text-sm">
                Avec demandes spéciales
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            Effacer
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Appliquer
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}