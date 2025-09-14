import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { GuestFilters } from "@/types/guest";

interface GuestFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: GuestFilters;
  onFiltersChange: (filters: GuestFilters) => void;
}

export function GuestFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: GuestFiltersSheetProps) {
  const updateFilter = (key: keyof GuestFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtres des clients</SheetTitle>
          <SheetDescription>
            Affinez votre recherche de clients avec des filtres avancés
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Type de client */}
          <div className="space-y-2">
            <Label>Type de client</Label>
            <Select
              value={filters.guest_type || ""}
              onValueChange={(value) => updateFilter("guest_type", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="individual">Particulier</SelectItem>
                <SelectItem value="corporate">Entreprise</SelectItem>
                <SelectItem value="group">Groupe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statut VIP */}
          <div className="space-y-2">
            <Label>Statut VIP</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vip-filter"
                checked={filters.vip_status === true}
                onCheckedChange={(checked) => 
                  updateFilter("vip_status", checked ? true : undefined)
                }
              />
              <Label htmlFor="vip-filter">Clients VIP uniquement</Label>
            </div>
          </div>

          {/* Nationalité */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationalité</Label>
            <Input
              id="nationality"
              placeholder="Ex: Française, Ivoirienne..."
              value={filters.nationality || ""}
              onChange={(e) => updateFilter("nationality", e.target.value || undefined)}
            />
          </div>

          {/* Réservations futures */}
          <div className="space-y-2">
            <Label>Réservations</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="future-reservations"
                checked={filters.has_future_reservations === true}
                onCheckedChange={(checked) => 
                  updateFilter("has_future_reservations", checked ? true : undefined)
                }
              />
              <Label htmlFor="future-reservations">
                Avec réservations futures
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-6">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              Effacer les filtres
            </Button>
            
            <Button onClick={() => onOpenChange(false)}>
              Appliquer ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''})
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}