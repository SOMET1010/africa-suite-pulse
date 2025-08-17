import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, UserPlus, Calendar, Users, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { guestsApi } from "@/services/guests.api";
import { reservationsApi } from "@/services/reservations.api";
import { CreateGuestDialog } from "@/features/guests/components/CreateGuestDialog";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { ReservationInsert } from "@/types/reservation";
import type { Guest } from "@/types/guest";
import React from "react";

const reservationSchema = z.object({
  // Client
  guest_id: z.string().optional(),
  guest_name: z.string().min(1, "Le nom du client est requis"),
  guest_email: z.string().email().optional().or(z.literal("")),
  guest_phone: z.string().optional(),
  
  // Dates et occupants
  date_arrival: z.string().min(1, "La date d'arrivée est requise"),
  date_departure: z.string().min(1, "La date de départ est requise"),
  planned_time: z.string().optional(),
  adults: z.coerce.number().min(1, "Au moins 1 adulte requis"),
  children: z.coerce.number().min(0),
  
  // Chambre et tarification
  room_id: z.string().optional(),
  rate_total: z.coerce.number().optional(),
  
  // Autres
  status: z.enum(["option", "confirmed"]),
  source: z.enum(["walk_in", "phone", "email", "website", "booking_com", "airbnb", "other"]),
  source_reference: z.string().optional(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof reservationSchema>;

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReservationDialog({ open, onOpenChange }: CreateReservationDialogProps) {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateGuest, setShowCreateGuest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date_arrival: format(new Date(), "yyyy-MM-dd"),
      date_departure: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      adults: 2,
      children: 0,
      status: "option",
      source: "walk_in",
    },
  });

  // Charger les clients
  const { data: guests = [] } = useQuery({
    queryKey: ["guests", orgId, { search: searchTerm }],
    queryFn: () => guestsApi.list(orgId!, { search: searchTerm }),
    enabled: !!orgId && searchTerm.length > 2,
    select: (result) => result.data || [],
  });

  // Surveiller les dates pour calculer les chambres disponibles
  const watchedDates = form.watch(["date_arrival", "date_departure", "adults", "children"]);

  // Calculer disponibilité quand les dates changent
  const checkAvailability = async () => {
    const [dateArrival, dateDeparture, adults, children] = watchedDates;
    
    if (dateArrival && dateDeparture && orgId) {
      try {
        const rooms = await reservationsApi.checkAvailability(orgId, {
          date_arrival: dateArrival,
          date_departure: dateDeparture,
          adults: adults || 2,
          children: children || 0,
        });
        setAvailableRooms(rooms);
      } catch (error) {
        console.error("Erreur lors de la vérification de disponibilité:", error);
      }
    }
  };

  // Re-calculer quand les dates changent
  React.useEffect(() => {
    checkAvailability();
  }, [watchedDates, orgId]);

  const onSubmit = async (data: FormData) => {
    if (!orgId) return;

    setIsSubmitting(true);
    
    try {
      let guestId = data.guest_id;
      
      // Si pas de guest_id mais qu'on a des données de guest, créer un nouveau guest
      if (!guestId && (data.guest_name || data.guest_email || data.guest_phone)) {
        const [firstName, ...lastNameParts] = data.guest_name.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        
        const newGuest = await guestsApi.create({
          org_id: orgId,
          first_name: firstName,
          last_name: lastName,
          email: data.guest_email || undefined,
          phone: data.guest_phone || undefined,
          guest_type: 'individual',
          vip_status: false,
          marketing_consent: false,
          preferred_communication: 'email',
        });
        
        guestId = newGuest.data?.id;
      }

      const reservationData: ReservationInsert = {
        org_id: orgId,
        guest_id: guestId,
        date_arrival: data.date_arrival,
        date_departure: data.date_departure,
        planned_time: data.planned_time || undefined,
        adults: data.adults,
        children: data.children,
        room_id: data.room_id || undefined,
        rate_total: data.rate_total || undefined,
        status: data.status,
        source: data.source,
        source_reference: data.source_reference || undefined,
        special_requests: data.special_requests || undefined,
        notes: data.notes || undefined,
      };
      
      await reservationsApi.create(reservationData);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["reservations-management", orgId] });
      queryClient.invalidateQueries({ queryKey: ["reservations-stats", orgId] });
      
      toast({
        title: "Réservation créée",
        description: "La réservation a été créée avec succès.",
      });
      
      onOpenChange(false);
      form.reset();
      setSelectedGuest(null);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    form.setValue("guest_id", guest.id);
    form.setValue("guest_name", `${guest.first_name} ${guest.last_name}`);
    form.setValue("guest_email", guest.email || "");
    form.setValue("guest_phone", guest.phone || "");
    setSearchTerm("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Réservation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle réservation en sélectionnant un client et en définissant les détails du séjour.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="guest" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="guest">Client</TabsTrigger>
                  <TabsTrigger value="stay">Séjour</TabsTrigger>
                  <TabsTrigger value="room">Chambre</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>

                {/* Onglet Client */}
                <TabsContent value="guest" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Sélection du client
                      </CardTitle>
                      <CardDescription>
                        Recherchez un client existant ou créez-en un nouveau
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!selectedGuest ? (
                        <>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                placeholder="Rechercher un client par nom, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCreateGuest(true)}
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Nouveau
                            </Button>
                          </div>

                          {searchTerm.length > 2 && guests.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {guests.map((guest) => (
                                <Card
                                  key={guest.id}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => selectGuest(guest)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                                        <p className="text-sm text-muted-foreground">{guest.email}</p>
                                      </div>
                                      {guest.vip_status && (
                                        <Badge variant="secondary">VIP</Badge>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{selectedGuest.first_name} {selectedGuest.last_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedGuest.email}</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGuest(null)}
                              >
                                Changer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
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
                      </div>

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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Chambre */}
                <TabsContent value="room" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Sélection de chambre
                      </CardTitle>
                      <CardDescription>
                        Chambres disponibles pour les dates sélectionnées
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {availableRooms.length > 0 ? (
                        <FormField
                          control={form.control}
                          name="room_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chambre disponible</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une chambre" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableRooms.map((room) => (
                                    <SelectItem key={room.id} value={room.id}>
                                      Chambre {room.number} ({room.type})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Laisser vide pour assigner plus tard
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucune chambre disponible pour ces dates</p>
                          <p className="text-sm">La chambre pourra être assignée plus tard</p>
                        </div>
                      )}

                      <Separator className="my-4" />

                      <FormField
                        control={form.control}
                        name="rate_total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tarif total (XOF)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" />
                            </FormControl>
                            <FormDescription>
                              Tarif total pour le séjour complet
                            </FormDescription>
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
                      <CardTitle>Informations complémentaires</CardTitle>
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
                                  <SelectItem value="option">Option</SelectItem>
                                  <SelectItem value="confirmed">Confirmée</SelectItem>
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
                  {isSubmitting ? "Création..." : "Créer la réservation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CreateGuestDialog
        open={showCreateGuest}
        onOpenChange={setShowCreateGuest}
      />
    </>
  );
}