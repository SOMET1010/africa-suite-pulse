import React from 'react';
import { useUserSettings, useUpdateUserSettings } from '@/services/userSettings.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Settings, Bell, Globe, Palette, Shield } from 'lucide-react';
import { MainAppLayout } from '@/core/layout/MainAppLayout';

export default function ProfilePage() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettingsMutation = useUpdateUserSettings();

  const handleSettingsUpdate = (updates: any) => {
    updateSettingsMutation.mutate(updates, {
      onSuccess: () => {
        toast.success('Paramètres mis à jour');
      },
      onError: (error) => {
        toast.error('Erreur lors de la mise à jour');
        console.error(error);
      },
    });
  };

  if (isLoading) {
    return (
      <MainAppLayout>
        <div className="p-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="h-64 bg-muted animate-pulse rounded" />
              <div className="h-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Vos informations de base et contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Votre nom complet"
                  disabled
                  value="Utilisateur"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  disabled
                  value="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+225 XX XX XX XX"
                  disabled
                  value=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Préférences d'affichage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Préférences d'affichage
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Thème</Label>
                  <p className="text-sm text-muted-foreground">
                    Choisissez votre thème préféré
                  </p>
                </div>
                <Select
                  value={settings?.theme || 'system'}
                  onValueChange={(value) => handleSettingsUpdate({ theme: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Langue</Label>
                  <p className="text-sm text-muted-foreground">
                    Langue de l'interface
                  </p>
                </div>
                <Select
                  value={settings?.language || 'fr'}
                  onValueChange={(value) => handleSettingsUpdate({ language: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications activées</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir toutes les notifications
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings?.notifications_enabled ?? true}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ notifications_enabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications par email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings?.email_notifications ?? true}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ email_notifications: checked })
                  }
                  disabled={!settings?.notifications_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications push du navigateur
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings?.push_notifications ?? true}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ push_notifications: checked })
                  }
                  disabled={!settings?.notifications_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-notifications">Sons</Label>
                  <p className="text-sm text-muted-foreground">
                    Sons de notification
                  </p>
                </div>
                <Switch
                  id="sound-notifications"
                  checked={settings?.sound_notifications ?? true}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ sound_notifications: checked })
                  }
                  disabled={!settings?.notifications_enabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notification-frequency">Fréquence</Label>
                  <p className="text-sm text-muted-foreground">
                    À quelle fréquence recevoir les notifications
                  </p>
                </div>
                <Select
                  value={settings?.notification_frequency || 'instant'}
                  onValueChange={(value) => 
                    handleSettingsUpdate({ notification_frequency: value })
                  }
                  disabled={!settings?.notifications_enabled}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instantané</SelectItem>
                    <SelectItem value="hourly">Horaire</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full">
                Gérer les sessions actives
              </Button>
              <Button variant="outline" className="w-full">
                Télécharger mes données
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainAppLayout>
  );
}