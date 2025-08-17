import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, Calendar, Users, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { reservationsApi } from "@/services/reservations.api";
import { useToast } from "@/hooks/use-toast";
import type { Reservation, ReservationUpdate } from "@/types/reservation";

const editReservationSchema = z.object({
  guest_name: z.string().min(1, "Le nom du client est requis"),
  guest_email: z.string().email().optional().or(z.literal("")),
  guest_phone: z.string().optional(),
  date_arrival: z.string().min(1, "La date d'arrivée est requise"),
  date_departure: z.string().min(1, "La date de départ est requise"),
  planned_time: z.string().optional(),
  adults: z.coerce.number().min(1, "Au moins 1 adulte requis"),
  children: z.coerce.number().min(0),
  room_id: z.string().optional(),
  rate_total: z.coerce.number().optional(),
  status: z.enum(["draft", "option", "pending_payment", "confirmed", "checked_in", "checked_out", "no_show", "cancelled", "modified"]),
  source: z.enum(["walk_in", "phone", "email", "website", "booking_com", "airbnb", "other"]),
  source_reference: z.string().optional(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof editReservationSchema>;

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

export function EditReservationDialog({ open, onOpenChange, reservation }: EditReservationDialogProps) {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(editReservationSchema),
    defaultValues: {
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      date_arrival: "",
      date_departure: "",
      planned_time: "",
      adults: 2,
      children: 0,
      rate_total: 0,
      status: "draft",
      source: "walk_in",
      source_reference: "",
      special_requests: "",
      notes: "",
    },
  });

  // Initialiser le formulaire avec les données de la réservation
  useEffect(() => {
    if (reservation && open) {
      form.reset({
        guest_name: reservation.guest_name || "",
        guest_email: reservation.guest_email || "",
        guest_phone: reservation.guest_phone || "",
        date_arrival: reservation.date_arrival,
        date_departure: reservation.date_departure,
        planned_time: reservation.planned_time || "",
        adults: reservation.adults,
        children: reservation.children,
        rate_total: reservation.rate_total || 0,
        status: reservation.status,
        source: (reservation.source as any) || "walk_in",
        source_reference: reservation.source_reference || "",
        special_requests: reservation.special_requests || "",
        notes: reservation.notes || "",
      });
    }
  }, [reservation, open, form]);

  const onSubmit = async (data: FormData) => {
    if (!orgId) return;

    setIsSubmitting(true);
    
    try {
      const updateData: ReservationUpdate = {
        guest_name: data.guest_name,
        guest_email: data.guest_email || undefined,
        guest_phone: data.guest_phone || undefined,
        date_arrival: data.date_arrival,
        date_departure: data.date_departure,
        planned_time: data.planned_time || undefined,
        adults: data.adults,
        children: data.children,
        rate_total: data.rate_total || undefined,
        status: data.status,
        source: data.source,
        source_reference: data.source_reference || undefined,
        special_requests: data.special_requests || undefined,
        notes: data.notes || undefined,
      };
      
      await reservationsApi.update(reservation.id, updateData);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["reservations-management", orgId] });
      queryClient.invalidateQueries({ queryKey: ["reservations-stats", orgId] });
      
      toast({
        title: "Réservation mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier la réservation
          </DialogTitle>
          <DialogDescription>
            Référence: {reservation.reference || "Non définie"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="guest" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="guest">Client</TabsTrigger>
                <TabsTrigger value="stay">Séjour</TabsTrigger>
                <TabsTrigger value="status">Statut</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
              </TabsList>

              {/* Onglet Client */}
              <TabsContent value="guest" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informations client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="guest_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du client *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nom complet" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guest_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="email@exemple.com" />
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Séjour */}
              <TabsContent value="stay" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Dates et occupants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date_arrival"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'arrivée *</FormLabel>
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
                            <FormLabel>Date de départ *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="planned_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure d'arrivée prévue</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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

                      <FormField
                        control={form.control}
                        name="children"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enfants</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="rate_total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarif total (XOF)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Statut */}
              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Statut et source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                               <SelectContent>
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="option">Option</SelectItem>
                                <SelectItem value="pending_payment">En attente paiement</SelectItem>
                                <SelectItem value="confirmed">Confirmée</SelectItem>
                                <SelectItem value="checked_in">Arrivé</SelectItem>
                                <SelectItem value="checked_out">Parti</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                                <SelectItem value="modified">Modifiée</SelectItem>
                               </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="walk_in">Walk-in</SelectItem>
                                <SelectItem value="phone">Téléphone</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="website">Site web</SelectItem>
                                <SelectItem value="booking_com">Booking.com</SelectItem>
                                <SelectItem value="airbnb">Airbnb</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="source_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence source</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Numéro de confirmation externe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Détails */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes et notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="special_requests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demandes spéciales</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Lit bébé, vue mer, étage élevé..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes internes</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Notes pour l'équipe..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}