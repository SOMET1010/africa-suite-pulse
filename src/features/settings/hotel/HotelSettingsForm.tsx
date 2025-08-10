import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MapPin, Mail, Globe, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useOrgId } from '@/core/auth/useOrg';
import { HotelService } from './hotelService';
import { hotelSettingsSchema, type HotelSettingsFormData } from '../utils';
import { CURRENCIES, TIMEZONES, COUNTRIES, type HotelSettings, type HotelSettingsUpdate } from '../types';

export default function HotelSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const { toast } = useToast();
  const orgId = useOrgId();

  const form = useForm<HotelSettingsFormData>({
    resolver: zodResolver(hotelSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      country: '',
      timezone: 'Africa/Abidjan',
      currency: 'XOF',
      logo_url: '',
    },
  });

  useEffect(() => {
    if (orgId) {
      loadSettings();
    }
  }, [orgId]);

  const loadSettings = async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const data = await HotelService.getHotelSettings(orgId);
      if (data) {
        setSettings(data);
        form.reset({
          name: data.name,
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          timezone: data.timezone,
          currency: data.currency,
          logo_url: data.logo_url || '',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HotelSettingsFormData) => {
    if (!orgId) return;

    setSaving(true);
    try {
      if (settings) {
        const updated = await HotelService.updateHotelSettings(settings.id, data as HotelSettingsUpdate);
        setSettings(updated);
        toast({
          title: 'Succès',
          description: 'Paramètres mis à jour avec succès',
        });
      } else {
        const created = await HotelService.createHotelSettings(orgId, data as any);
        setSettings(created);
        toast({
          title: 'Succès',
          description: 'Paramètres créés avec succès',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Paramètres Hôtel
          </h1>
          <p className="text-muted-foreground">
            Configuration générale de votre établissement
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Identification
                </CardTitle>
                <CardDescription>
                  Informations principales de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'hôtel *</FormLabel>
                        <FormControl>
                          <Input placeholder="Grand Hôtel Ivoire" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL du logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de votre établissement..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact
                </CardTitle>
                <CardDescription>
                  Informations de contact de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@hotel.com" {...field} />
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
                          <Input placeholder="+225 XX XX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.hotel.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Localisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </CardTitle>
                <CardDescription>
                  Adresse et localisation géographique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Boulevard de la Paix" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Abidjan" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un pays" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Préférences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Préférences Régionales
                </CardTitle>
                <CardDescription>
                  Fuseau horaire et devise par défaut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuseau horaire *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Devise *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 -mx-4">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}