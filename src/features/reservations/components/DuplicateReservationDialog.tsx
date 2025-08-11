import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Calendar, Users, MapPin, CreditCard, Mail, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";

const duplicateReservationSchema = z.object({
  date_arrival: z.string().min(1, "La date d'arrivée est requise"),
  date_departure: z.string().min(1, "La date de départ est requise"),
  guest_name: z.string().optional(),
  guest_email: z.string().email().optional().or(z.literal("")),
  guest_phone: z.string().optional(),
  adults: z.coerce.number().min(1),
  children: z.coerce.number().min(0),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  create_as_option: z.boolean().default(true),
});

type FormData = z.infer<typeof duplicateReservationSchema>;

interface DuplicateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: any;
  onSuccess?: () => void;
}

interface ReservationAction {
  id: string;
  type: 'email_sent' | 'pdf_generated' | 'duplicated' | 'created_by_duplication';
  description: string;
  timestamp: string;
  details?: any;
}

export function DuplicateReservationDialog({ 
  open, 
  onOpenChange, 
  reservation,
  onSuccess
}: DuplicateReservationDialogProps) {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("duplicate");
  const [mockActions] = useState<ReservationAction[]>([
    {
      id: "1",
      type: "email_sent",
      description: "Email de confirmation envoyé à john.doe@email.com",
      timestamp: "2024-01-15T10:30:00Z",
      details: { action: "confirmation", recipient: "john.doe@email.com" }
    },
    {
      id: "2", 
      type: "pdf_generated",
      description: "PDF de confirmation généré",
      timestamp: "2024-01-15T10:25:00Z",
      details: { template: "standard", action: "confirmation" }
    }
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(duplicateReservationSchema),
    defaultValues: {
      date_arrival: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      date_departure: format(addDays(new Date(), 2), "yyyy-MM-dd"),
      guest_name: reservation?.guest_name || "",
      guest_email: reservation?.guest_email || "",
      guest_phone: reservation?.guest_phone || "",
      adults: reservation?.adults || 2,
      children: reservation?.children || 0,
      special_requests: reservation?.special_requests || "",
      notes: "",
      create_as_option: true,
    },
  });

  // Duplicate reservation mutation
  const duplicateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await supabase.functions.invoke('duplicate-reservation', {
        body: {
          originalReservationId: reservation.id,
          modifications: {
            date_arrival: data.date_arrival,
            date_departure: data.date_departure,
            guest_name: data.guest_name || reservation.guest_name,
            guest_email: data.guest_email || reservation.guest_email,
            guest_phone: data.guest_phone || reservation.guest_phone,
            adults: data.adults,
            children: data.children,
            special_requests: data.special_requests,
            notes: data.notes,
          },
          createAsOption: data.create_as_option,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Réservation dupliquée",
        description: `Nouvelle réservation créée: ${data.duplicate.reference}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["reservations-management", orgId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error duplicating reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer la réservation",
        variant: "destructive",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (action: 'confirmation' | 'modification' | 'cancellation') => {
      const response = await supabase.functions.invoke('send-reservation-email', {
        body: {
          reservationId: reservation.id,
          action,
          sendPdf: true,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data, action) => {
      toast({
        title: "Email envoyé",
        description: `Email de ${action} envoyé avec succès`,
      });
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email",
        variant: "destructive",
      });
    },
  });

  // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: async (action: 'confirmation' | 'modification' | 'cancellation') => {
      const response = await supabase.functions.invoke('generate-reservation-pdf', {
        body: {
          reservationId: reservation.id,
          action,
          template: 'standard',
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data, action) => {
      // In a real implementation, you would trigger a download
      toast({
        title: "PDF généré",
        description: `Document de ${action} prêt à télécharger`,
      });
    },
    onError: (error) => {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await duplicateMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email_sent': return <Mail className="h-4 w-4" />;
      case 'pdf_generated': return <FileText className="h-4 w-4" />;
      case 'duplicated': return <Copy className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'email_sent': return 'blue';
      case 'pdf_generated': return 'green';
      case 'duplicated': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Actions sur la réservation
          </DialogTitle>
          <DialogDescription>
            Dupliquez, gérez et automatisez les actions sur la réservation {reservation?.reference || reservation?.id}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="duplicate">Dupliquer</TabsTrigger>
            <TabsTrigger value="automation">Automatisation</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          {/* Duplicate Tab */}
          <TabsContent value="duplicate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Dupliquer la réservation
                </CardTitle>
                <CardDescription>
                  Créez une nouvelle réservation basée sur celle-ci avec des modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date_arrival"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nouvelle date d'arrivée</FormLabel>
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
                            <FormLabel>Nouvelle date de départ</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guest_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du client</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Laisser vide pour garder l'original" />
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
                              <Input {...field} type="email" placeholder="Laisser vide pour garder l'original" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="adults"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adultes</FormLabel>
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

                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          id="create_as_option"
                          {...form.register("create_as_option")}
                          className="rounded"
                        />
                        <label htmlFor="create_as_option" className="text-sm">
                          Créer comme option
                        </label>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="special_requests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demandes spéciales</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Modifier les demandes spéciales..." />
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
                          <FormLabel>Notes additionnelles</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Notes pour la nouvelle réservation..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Duplication..." : "Dupliquer la réservation"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Envoi d'emails
                  </CardTitle>
                  <CardDescription>
                    Envoyez automatiquement des emails de confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => sendEmailMutation.mutate('confirmation')}
                    disabled={sendEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email de confirmation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => sendEmailMutation.mutate('modification')}
                    disabled={sendEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email de modification
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => sendEmailMutation.mutate('cancellation')}
                    disabled={sendEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email d'annulation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Génération PDF
                  </CardTitle>
                  <CardDescription>
                    Générez des documents PDF personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generatePdfMutation.mutate('confirmation')}
                    disabled={generatePdfMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF de confirmation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generatePdfMutation.mutate('modification')}
                    disabled={generatePdfMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF de modification
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generatePdfMutation.mutate('cancellation')}
                    disabled={generatePdfMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF d'annulation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Journal d'actions
                </CardTitle>
                <CardDescription>
                  Historique complet des actions effectuées sur cette réservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune action enregistrée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockActions.map((action) => (
                      <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          <Badge variant="outline" className={`text-${getActionColor(action.type)}-600`}>
                            {getActionIcon(action.type)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {action.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(action.timestamp), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                          {action.details && (
                            <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                              <pre>{JSON.stringify(action.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la réservation</CardTitle>
                <CardDescription>
                  Informations complètes sur la réservation originale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Référence:</span>
                    <p className="text-muted-foreground">{reservation?.reference || reservation?.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span>
                    <p className="text-muted-foreground">{reservation?.status}</p>
                  </div>
                  <div>
                    <span className="font-medium">Client:</span>
                    <p className="text-muted-foreground">{reservation?.guest_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{reservation?.guest_email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Arrivée:</span>
                    <p className="text-muted-foreground">
                      {reservation?.date_arrival ? format(new Date(reservation.date_arrival), "dd/MM/yyyy", { locale: fr }) : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Départ:</span>
                    <p className="text-muted-foreground">
                      {reservation?.date_departure ? format(new Date(reservation.date_departure), "dd/MM/yyyy", { locale: fr }) : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Chambre:</span>
                    <p className="text-muted-foreground">{reservation?.room_number ? `Ch. ${reservation.room_number}` : 'Non assignée'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tarif total:</span>
                    <p className="text-muted-foreground">
                      {reservation?.rate_total ? `${reservation.rate_total.toLocaleString()} F CFA` : 'Non défini'}
                    </p>
                  </div>
                </div>

                {reservation?.special_requests && (
                  <div>
                    <span className="font-medium">Demandes spéciales:</span>
                    <p className="text-muted-foreground mt-1 p-3 bg-muted/30 rounded">
                      {reservation.special_requests}
                    </p>
                  </div>
                )}

                {reservation?.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-muted-foreground mt-1 p-3 bg-muted/30 rounded">
                      {reservation.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}