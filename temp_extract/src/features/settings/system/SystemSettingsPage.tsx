import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SystemSettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres Système</h1>
        <p className="text-muted-foreground">Configuration technique et avancée du système</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration de Base</CardTitle>
            <CardDescription>Paramètres généraux du système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="timezone">Fuseau Horaire</Label>
              <Input id="timezone" placeholder="Europe/Paris" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="language">Langue par Défaut</Label>
              <Input id="language" placeholder="Français" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="maintenance" />
              <Label htmlFor="maintenance">Mode Maintenance</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance & Cache</CardTitle>
            <CardDescription>Optimisation des performances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="cache" defaultChecked />
              <Label htmlFor="cache">Cache Activé</Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="cache-duration">Durée du Cache (minutes)</Label>
              <Input id="cache-duration" type="number" placeholder="60" />
            </div>
            <Button variant="outline">Vider le Cache</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sauvegarde & Maintenance</CardTitle>
            <CardDescription>Gestion des sauvegardes automatiques</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="auto-backup" defaultChecked />
              <Label htmlFor="auto-backup">Sauvegarde Automatique</Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="backup-frequency">Fréquence (heures)</Label>
              <Input id="backup-frequency" type="number" placeholder="24" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Créer Sauvegarde</Button>
              <Button variant="outline">Restaurer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}