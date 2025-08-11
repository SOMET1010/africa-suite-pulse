import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, User, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { reservationsApi } from "@/services/reservations.api";
import { format, addDays } from "date-fns";
import type { ReservationInsert } from "@/types/reservation";

const quickReservationSchema = z.object({
  guest_name: z.string().min(1, "Le nom du client est requis"),
  guest_phone: z.string().optional(),
  date_arrival: z.string().min(1, "La date d'arrivée est requise"),
  date_departure: z.string().min(1, "La date de départ est requise"),
  adults: z.coerce.number().min(1, "Au moins 1 adulte requis"),
  room_id: z.string().optional(),
  rate_total: z.coerce.number().optional(),
});

type FormData = z.infer<typeof quickReservationSchema>;

export default function QuickReservationPage() {
  const navigate = useNavigate();
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(quickReservationSchema),
    defaultValues: {
      date_arrival: format(new Date(), "yyyy-MM-dd"),
      date_departure: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      adults: 2,
    },
  });

  const watchedDates = form.watch(["date_arrival", "date_departure", "adults"]);

  // Check room availability when dates change
  const checkAvailability = async () => {
    const [dateArrival, dateDeparture, adults] = watchedDates;
    
    if (dateArrival && dateDeparture && orgId) {
      try {
        const rooms = await reservationsApi.checkAvailability(orgId, {
          date_arrival: dateArrival,
          date_departure: dateDeparture,
          adults: adults || 2,
          children: 0,
        });
        setAvailableRooms(rooms);
      } catch (error) {
        console.error("Error checking availability:", error);
      }
    }
  };

  // Re-check when dates change
  React.useEffect(() => {
    checkAvailability();
  }, [watchedDates, orgId]);

  const onSubmit = async (data: FormData) => {
    if (!orgId) return;

    setIsSubmitting(true);
    
    try {
      const reservationData: ReservationInsert = {
        org_id: orgId,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone || undefined,
        date_arrival: data.date_arrival,
        date_departure: data.date_departure,
        adults: data.adults,
        children: 0,
        room_id: data.room_id || undefined,
        rate_total: data.rate_total || undefined,
        status: "confirmed",
        source: "walk_in",
      };
      
      await reservationsApi.create(reservationData);
      
      toast({
        title: "Réservation créée rapidement",
        description: "La réservation a été créée et confirmée avec succès.",
      });
      
      navigate("/reservations");
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Réservation Express
            </h1>
            <p className="text-muted-foreground text-lg">
              Créez une réservation en moins d'une minute
            </p>
          </div>
        </div>

        {/* Quick Form */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Informations essentielles
            </CardTitle>
            <CardDescription>
              Saisissez uniquement les informations indispensables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Client */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <User className="h-4 w-4" />
                    Client
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guest_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du client *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nom complet" className="text-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guest_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+225 XX XX XX XX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Calendar className="h-4 w-4" />
                    Séjour
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="date_arrival"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arrivée *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_departure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Départ *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adultes *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Room Selection */}
                {availableRooms.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <MapPin className="h-4 w-4" />
                      Chambre ({availableRooms.length} disponible{availableRooms.length > 1 ? 's' : ''})
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="room_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chambre (optionnel)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Assigner plus tard" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableRooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id}>
                                    Ch. {room.number} - {room.type} (Ét. {room.floor || 'N/A'})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rate_total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tarif total (XOF)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="À définir plus tard" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/reservations/new/advanced")}
                    className="flex-1"
                  >
                    Mode Avancé
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Création..." : "Créer & Confirmer"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quick tip */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            💡 Les détails manquants pourront être complétés après la création
          </p>
        </div>
      </div>
    </div>
  );
}