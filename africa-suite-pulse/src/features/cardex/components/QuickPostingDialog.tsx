import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TButton } from "@/core/ui/TButton";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cardexApi } from "@/services/cardex.api";
import { FOLIO_DEFINITIONS } from "@/types/billing";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface QuickPostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string | null;
}

export function QuickPostingDialog({ open, onOpenChange, reservationId }: QuickPostingDialogProps) {
  const [selectedService, setSelectedService] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [folioNumber, setFolioNumber] = useState<number>(2);
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les services disponibles
  const { data: services } = useQuery({
    queryKey: ['services-for-posting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, code, label, price')
        .eq('is_active', true)
        .order('label');
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredServices = services?.filter(service =>
    service.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleServiceSelect = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(serviceId);
      setUnitPrice(service.price || 0);
      setDescription(service.label);
    }
  };

  const handleSubmit = async () => {
    if (!reservationId || !selectedService) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un service",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0 || unitPrice < 0) {
      toast({
        title: "Erreur", 
        description: "Quantité et prix doivent être valides",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await cardexApi.quickPostService(reservationId, {
        service_id: selectedService,
        service_code: services?.find(s => s.id === selectedService)?.code || '',
        service_label: services?.find(s => s.id === selectedService)?.label || '',
        quantity,
        unit_price: unitPrice,
        folio_number: folioNumber,
        description: description || undefined
      });

      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['cardex-overview', reservationId] });

      toast({
        title: "Succès",
        description: "Prestation ajoutée au cardex"
      });

      // Reset form
      setSelectedService("");
      setQuantity(1);
      setUnitPrice(0);
      setDescription("");
      setSearchTerm("");
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error posting service:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la prestation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Passage rapide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recherche de service */}
          <div className="space-y-2">
            <Label>Service</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/50" />
              <Input
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchTerm && (
              <div className="max-h-32 overflow-y-auto border rounded-md bg-card">
                {filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`w-full text-left p-2 hover:bg-accent transition-colors ${
                        selectedService === service.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="font-medium">{service.label}</div>
                      <div className="text-sm text-charcoal/70">
                        {service.code} - {service.price ? `${service.price} XOF` : 'Prix libre'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-charcoal/50 text-center">Aucun service trouvé</div>
                )}
              </div>
            )}
          </div>

          {/* Service sélectionné */}
          {selectedService && (
            <div className="p-3 bg-accent-gold/10 rounded-md">
              <div className="font-medium">
                {services?.find(s => s.id === selectedService)?.label}
              </div>
              <div className="text-sm text-charcoal/70">
                {services?.find(s => s.id === selectedService)?.code}
              </div>
            </div>
          )}

          {/* Quantité */}
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Prix unitaire */}
          <div className="space-y-2">
            <Label>Prix unitaire (XOF)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Folio de destination */}
          <div className="space-y-2">
            <Label>Folio de destination</Label>
            <Select value={folioNumber.toString()} onValueChange={(value) => setFolioNumber(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLIO_DEFINITIONS.map(folio => (
                  <SelectItem key={folio.number} value={folio.number.toString()}>
                    Folio {folio.number} - {folio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description personnalisée */}
          <div className="space-y-2">
            <Label>Description (optionnelle)</Label>
            <Textarea
              placeholder="Description personnalisée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Résumé */}
          {selectedService && (
            <div className="p-3 bg-info/10 rounded-md">
              <div className="text-sm font-medium">Résumé</div>
              <div className="text-sm text-charcoal/70">
                {quantity} × {unitPrice} XOF = {quantity * unitPrice} XOF
              </div>
              <div className="text-sm text-charcoal/70">
                → Folio {folioNumber} ({FOLIO_DEFINITIONS.find(f => f.number === folioNumber)?.label})
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Annuler
          </Button>
          <TButton 
            onClick={handleSubmit} 
            disabled={!selectedService || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Ajout..." : "Ajouter au cardex"}
          </TButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}