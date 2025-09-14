import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { guestsApi } from "@/services/guests.api";
import { useOrgId } from "@/core/auth/useOrg";
import type { GuestInsert } from "@/types/guest";
import { DocumentScanner } from "./DocumentScanner";

const guestSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  
  // Documents
  document_type: z.string().optional(),
  document_number: z.string().optional(),
  document_expiry: z.string().optional(),
  document_issuing_country: z.string().optional(),
  
  // Adresse
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  
  // Entreprise
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  tax_id: z.string().optional(),
  
  // Autres
  guest_type: z.string(),
  vip_status: z.boolean(),
  preferred_communication: z.string(),
  marketing_consent: z.boolean(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface CreateGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGuestDialog({ open, onOpenChange }: CreateGuestDialogProps) {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      guest_type: "individual",
      vip_status: false,
      preferred_communication: "email",
      marketing_consent: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: GuestInsert) => guestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Client créé avec succès");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: unknown) => {
      toast.error("Erreur lors de la création du client");
      // Error creating guest
    },
  });

  const onSubmit = async (data: GuestFormData) => {
    if (!orgId) return;
    
    setIsSubmitting(true);
    
    const guestData: GuestInsert = {
      org_id: orgId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      nationality: data.nationality,
      document_type: data.document_type,
      document_number: data.document_number,
      document_expiry: data.document_expiry,
      document_issuing_country: data.document_issuing_country,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      state_province: data.state_province,
      postal_code: data.postal_code,
      country: data.country,
      company_name: data.company_name,
      company_address: data.company_address,
      tax_id: data.tax_id,
      guest_type: data.guest_type,
      vip_status: data.vip_status,
      preferred_communication: data.preferred_communication,
      marketing_consent: data.marketing_consent,
      special_requests: data.special_requests,
      notes: data.notes,
      preferences: {},
    };
    
    await createMutation.mutateAsync(guestData);
    setIsSubmitting(false);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "passport": return "Passeport";
      case "id_card": return "Carte d'identité";
      case "driving_license": return "Permis de conduire";
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Client</DialogTitle>
          <DialogDescription>
            Créez un nouveau profil client avec toutes les informations nécessaires.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personnel</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="address">Adresse</TabsTrigger>
                <TabsTrigger value="company">Entreprise</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationalité</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="guest_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Particulier</SelectItem>
                            <SelectItem value="corporate">Entreprise</SelectItem>
                            <SelectItem value="group">Groupe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferred_communication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication préférée</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Téléphone</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="vip_status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Client VIP</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="marketing_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Marketing</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-6">
                {/* Document Scanner */}
                <DocumentScanner
                  onDataExtracted={(data) => {
                    if (data.first_name) form.setValue("first_name", data.first_name);
                    if (data.last_name) form.setValue("last_name", data.last_name);
                    if (data.date_of_birth) form.setValue("date_of_birth", data.date_of_birth);
                    if (data.nationality) form.setValue("nationality", data.nationality);
                    if (data.document_type) form.setValue("document_type", data.document_type);
                    if (data.document_number) form.setValue("document_number", data.document_number);
                    if (data.document_expiry) form.setValue("document_expiry", data.document_expiry);
                    if (data.document_issuing_country) form.setValue("document_issuing_country", data.document_issuing_country);
                  }}
                  documentType={form.watch("document_type") as 'passport' | 'id_card' | 'driving_license' || 'passport'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de document</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passport">Passeport</SelectItem>
                            <SelectItem value="id_card">Carte d'identité</SelectItem>
                            <SelectItem value="driving_license">Permis de conduire</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="document_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro du document</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'expiration</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="document_issuing_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays d'émission</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse ligne 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse ligne 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>État/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="company" className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse de l'entreprise</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro fiscal</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="special_requests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demandes spéciales</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer le client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}