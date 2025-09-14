import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Users, Calendar, CreditCard, Package, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { reservationsApi } from "@/services/reservations.api";
import { guestsApi } from "@/services/guests.api";
import { format, addDays } from "date-fns";
import type { ReservationInsert } from "@/types/reservation";
import type { Guest } from "@/types/guest";

const advancedReservationSchema = z.object({
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
  promotion_code: z.string().optional(),
  tariff_id: z.string().optional(),
  
  // Statut et source
  status: z.enum(["option", "confirmed"]),
  source: z.enum(["walk_in", "phone", "email", "website", "booking_com", "airbnb", "other"]),
  source_reference: z.string().optional(),
  
  // Groupe (nouveau)
  is_group: z.boolean().default(false),
  group_name: z.string().optional(),
  group_rooms: z.coerce.number().min(1).default(1),
  
  // Allotement (nouveau)
  allotment_id: z.string().optional(),
  
  // Notes
  special_requests: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof advancedReservationSchema>;

export default function AdvancedReservationPage() {
  const navigate = useNavigate();
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(advancedReservationSchema),
    defaultValues: {
      date_arrival: format(new Date(), "yyyy-MM-dd"),
      date_departure: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      adults: 2,
      children: 0,
      status: "option",
      source: "walk_in",
      is_group: false,
      group_rooms: 1,
    },
  });

  // Load guests for search
  const { data: guests = [] } = useQuery({
    queryKey: ["guests", orgId, { search: searchTerm }],
    queryFn: () => guestsApi.list(orgId!, { search: searchTerm }),
    enabled: !!orgId && searchTerm.length > 2,
    select: (result) => result.data || [],
  });

  // Load tariffs
  const { data: tariffs = [] } = useQuery({
    queryKey: ["tariffs", orgId],
    queryFn: () => fetch(`/api/tariffs?org_id=${orgId}`).then(r => r.json()),
    enabled: !!orgId,
  });

  // Load allotments
  const { data: allotments = [] } = useQuery({
    queryKey: ["allotments", orgId],
    queryFn: () => fetch(`/api/allotments?org_id=${orgId}`).then(r => r.json()),
    enabled: !!orgId,
  });

  const watchedDates = form.watch(["date_arrival", "date_departure", "adults", "children"]);

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
        console.error("Error checking availability:", error);
      }
    }
  };

  React.useEffect(() => {
    checkAvailability();
  }, [watchedDates, orgId]);

  const selectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    form.setValue("guest_id", guest.id);
    form.setValue("guest_name", `${guest.first_name} ${guest.last_name}`);
    form.setValue("guest_email", guest.email || "");
    form.setValue("guest_phone", guest.phone || "");
    setSearchTerm("");
  };

  const applyPromotionCode = async (code: string) => {
    if (!code || !orgId) return;
    
    try {
      // Simulate promotion lookup
      const promotion = {
        code,
        label: "Promotion Test",
        discount_type: "percentage",
        discount_value: 10,
      };
      setAppliedPromotion(promotion);
      toast({
        title: "Code promo appliqué",
        description: `Réduction de ${promotion.discount_value}% appliquée`,
      });
    } catch (error) {
      toast({
        title: "Code promo invalide",
        description: "Ce code promo n'existe pas ou a expiré",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!orgId) return;

    setIsSubmitting(true);
    
    try {
      // Créer un guest si nécessaire
      let guestId = data.guest_id;
      
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
      
      if (data.is_group && data.group_name) {
        // Create group reservation logic
        // This would involve creating a reservation group first
        toast({
          title: "Fonctionnalité en développement",
          description: "La création de groupes sera bientôt disponible",
          variant: "default",
        });
        return;
      }
      
      await reservationsApi.create(reservationData);
      
      toast({
        title: "Réservation créée",
        description: "La réservation avancée a été créée avec succès.",
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
      <div className="max-w-6xl mx-auto">
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
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Réservation Avancée
            </h1>
            <p className="text-muted-foreground text-lg">
              Configuration complète avec toutes les options
            </p>
          </div>
        </div>

        {/* Advanced Form */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration détaillée
            </CardTitle>
            <CardDescription>
              Accédez à toutes les options de réservation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="client" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="client">Client</TabsTrigger>
                    <TabsTrigger value="sejour">Séjour</TabsTrigger>
                    <TabsTrigger value="tarifs">Tarifs</TabsTrigger>
                    <TabsTrigger value="groupe">Groupe</TabsTrigger>
                    <TabsTrigger value="details">Détails</TabsTrigger>
                  </TabsList>

                  {/* Tab Client */}
                  <TabsContent value="client" className="space-y-6">
                    <div className="space-y-4">
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
                            <Button type="button" variant="outline" className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              Nouveau Client
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
                                      {guest.vip_status && <Badge variant="secondary">VIP</Badge>}
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
                    </div>
                  </TabsContent>

                  {/* Tab Séjour */}
                  <TabsContent value="sejour" className="space-y-6">
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner le statut" />
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
                            <FormLabel>Source de réservation</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la source" />
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
                  </TabsContent>

                  {/* Tab Tarifs & Promotions */}
                  <TabsContent value="tarifs" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="room_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chambre</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une chambre" />
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
                              <Input {...field} type="number" placeholder="Montant total" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="promotion_code"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Code promo</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="PROMO2024" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-8"
                          onClick={() => applyPromotionCode(form.getValues("promotion_code") || "")}
                        >
                          Appliquer
                        </Button>
                      </div>

                      {appliedPromotion && (
                        <Card className="bg-success/10 border-success/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-success" />
                              <span className="font-medium text-success">
                                {appliedPromotion.label} - {appliedPromotion.discount_value}% de réduction
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab Groupe */}
                  <TabsContent value="groupe" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="is_group"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Réservation de groupe</FormLabel>
                            <FormDescription>
                              Créer une réservation pour plusieurs chambres
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("is_group") && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="group_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du groupe</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Délégation commerciale Abidjan" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="group_rooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de chambres</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" max="20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab Détails */}
                  <TabsContent value="details" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="source_reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence source</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Référence booking, numéro de dossier..." />
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
                            <Textarea {...field} placeholder="Lit bébé, chambre calme, vue mer..." />
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
                            <Textarea {...field} placeholder="Notes visibles uniquement par l'équipe..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/reservations/new/quick")}
                    className="flex-1"
                  >
                    Mode Express
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Création..." : "Créer la Réservation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}