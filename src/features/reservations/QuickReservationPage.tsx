import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, User, Calendar, MapPin } from "lucide-react";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { ReservationSuccessModal } from "@/components/reservations/ReservationSuccessModal";
import { useOrgId } from "@/core/auth/useOrg";
import { toast } from "@/components/ui/toast-unified";
import { reservationsApi } from "@/services/reservations.api";
import { format, addDays, differenceInDays } from "date-fns";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<any>(null);
  const [calculatedRate, setCalculatedRate] = useState<any>(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(quickReservationSchema),
    defaultValues: {
      date_arrival: format(new Date(), "yyyy-MM-dd"),
      date_departure: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      adults: 2,
    },
  });

  const watchedDates = form.watch(["date_arrival", "date_departure", "adults"]);
  const selectedRoom = form.watch("room_id");

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

  // Calculate nights
  const calculateNights = (arrival: string, departure: string) => {
    if (!arrival || !departure) return 0;
    try {
      const nights = differenceInDays(new Date(departure), new Date(arrival));
      return Math.max(0, nights);
    } catch {
      return 0;
    }
  };

  // Calculate rate when room is selected
  const calculateRateForRoom = async () => {
    const [dateArrival, dateDeparture] = watchedDates;
    
    if (selectedRoom && dateArrival && dateDeparture && orgId) {
      setIsCalculatingRate(true);
      try {
        const rateResult = await reservationsApi.calculateRate(
          orgId,
          selectedRoom,
          dateArrival,
          dateDeparture
        );
        setCalculatedRate(rateResult);
        form.setValue("rate_total", rateResult.total_rate);
      } catch (error) {
        console.error("Error calculating rate:", error);
        setCalculatedRate(null);
      } finally {
        setIsCalculatingRate(false);
      }
    } else {
      setCalculatedRate(null);
      form.setValue("rate_total", undefined);
    }
  };

  // Re-check when dates change
  React.useEffect(() => {
    checkAvailability();
  }, [watchedDates, orgId]);

  // Calculate rate when room or dates change
  React.useEffect(() => {
    calculateRateForRoom();
  }, [selectedRoom, watchedDates, orgId]);

  const onSubmit = async (data: FormData) => {
    if (!orgId) return;

    setIsSubmitting(true);
    
    try {
      toast({
        title: "Création en cours...",
        description: "Veuillez patienter pendant la création de la réservation.",
      });

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
      
      const result = await reservationsApi.create(reservationData);
      
      // Enrichir les données pour la modal
      const selectedRoom = availableRooms.find(room => room.id === data.room_id);
      const enrichedReservation = {
        ...result.data,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        date_arrival: data.date_arrival,
        date_departure: data.date_departure,
        room_number: selectedRoom?.number,
        room_type: selectedRoom?.type,
        rate_total: data.rate_total,
      };
      
      setCreatedReservation(enrichedReservation);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer la réservation. Vérifiez les informations et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    setShowSuccessModal(false);
    navigate("/reservations");
  };

  return (
    <UnifiedLayout
      title="Réservation Express"
      showStatusBar={true}
      headerAction={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      }
      showBottomBar={true}
      actions={[
        {
          id: 'advanced',
          label: 'Mode Avancé',
          icon: <div className="text-sm">⚙️</div>,
          onClick: () => navigate("/reservations/new/advanced"),
          variant: 'ghost',
        },
      ]}
      contentClassName="max-w-4xl mx-auto"
    >
      <div className="space-y-8">
        {/* Header avec icône */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            Créez une réservation en moins d'une minute
          </p>
        </div>

        {/* Quick Form */}
        <Card className="shadow-sm border-border bg-card">
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

                   {/* Night counter */}
                   {watchedDates[0] && watchedDates[1] && (
                     <div className="flex items-center justify-center">
                       <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full border border-primary/20">
                         <Calendar className="h-4 w-4 text-primary" />
                         <span className="text-sm font-medium text-primary">
                           {calculateNights(watchedDates[0], watchedDates[1])} nuit{calculateNights(watchedDates[0], watchedDates[1]) > 1 ? 's' : ''}
                         </span>
                       </div>
                     </div>
                   )}
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
                               <Input 
                                 {...field} 
                                 type="number" 
                                 placeholder={isCalculatingRate ? "Calcul..." : "À définir plus tard"}
                                 disabled={calculatedRate !== null}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>

                     {/* Rate calculation display */}
                     {calculatedRate && (
                       <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                         <div className="flex items-center gap-2 mb-3">
                           <div className="w-2 h-2 bg-success rounded-full"></div>
                           <span className="text-sm font-medium text-success">Calcul automatique</span>
                         </div>
                         <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Tarif de base/nuit:</span>
                             <span className="font-medium">{calculatedRate.base_rate?.toLocaleString()} XOF</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Nombre de nuits:</span>
                             <span className="font-medium">{calculatedRate.nights}</span>
                           </div>
                           <div className="border-t border-success/20 pt-2 flex justify-between font-semibold">
                             <span>Total:</span>
                             <span className="text-success">{calculatedRate.total_rate?.toLocaleString()} XOF</span>
                           </div>
                         </div>
                       </div>
                     )}
                 </div>
                )}

                {/* Bouton de validation dans le formulaire */}
                <div className="flex flex-col gap-4 pt-6 border-t border-border">
                  <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Créer & Confirmer
                  </LoadingButton>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      💡 Les détails manquants pourront être complétés après la création
                    </p>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Modal de succès */}
      {createdReservation && (
        <ReservationSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          reservation={createdReservation}
          onViewDetails={handleViewDetails}
        />
      )}
    </UnifiedLayout>
  );
}