import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  QrCode, 
  Smartphone, 
  Globe, 
  Palette, 
  Camera, 
  Download,
  ExternalLink,
  Settings,
  Eye,
  Share2
} from 'lucide-react';

export function MenuDigitalInterface() {
  const [qrSettings, setQrSettings] = useState({
    includeImages: true,
    showPrices: true,
    showDescriptions: true,
    showAllergens: true,
    multilingual: false,
    darkMode: false
  });

  const [customization, setCustomization] = useState({
    restaurantName: 'Restaurant Le Gourmet',
    primaryColor: '#3B82F6',
    welcomeMessage: 'Bienvenue ! Découvrez notre carte et commandez directement depuis votre téléphone.',
    showLogo: true
  });

  const menuCategories = [
    { name: 'Entrées', items: 12, active: true },
    { name: 'Plats principaux', items: 18, active: true },
    { name: 'Desserts', items: 8, active: true },
    { name: 'Boissons', items: 25, active: true },
    { name: 'Vins', items: 15, active: false },
    { name: 'Menu enfants', items: 6, active: true }
  ];

  const languages = [
    { code: 'fr', name: 'Français', active: true },
    { code: 'en', name: 'English', active: false },
    { code: 'es', name: 'Español', active: false },
    { code: 'de', name: 'Deutsch', active: false }
  ];

  return (
    <div className="space-y-6">
      {/* Configuration générale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configuration du Menu
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence et le contenu de votre menu digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nom du restaurant</label>
              <Input 
                value={customization.restaurantName}
                onChange={(e) => setCustomization({...customization, restaurantName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Message d'accueil</label>
              <Textarea 
                value={customization.welcomeMessage}
                onChange={(e) => setCustomization({...customization, welcomeMessage: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Couleur principale</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={customization.primaryColor}
                  onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                  className="w-12 h-10 rounded border border-border cursor-pointer"
                />
                <Input 
                  value={customization.primaryColor}
                  onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Afficher les images</label>
                <Switch 
                  checked={qrSettings.includeImages}
                  onCheckedChange={(checked) => setQrSettings({...qrSettings, includeImages: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Afficher les prix</label>
                <Switch 
                  checked={qrSettings.showPrices}
                  onCheckedChange={(checked) => setQrSettings({...qrSettings, showPrices: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Afficher les descriptions</label>
                <Switch 
                  checked={qrSettings.showDescriptions}
                  onCheckedChange={(checked) => setQrSettings({...qrSettings, showDescriptions: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Afficher les allergènes</label>
                <Switch 
                  checked={qrSettings.showAllergens}
                  onCheckedChange={(checked) => setQrSettings({...qrSettings, showAllergens: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode sombre</label>
                <Switch 
                  checked={qrSettings.darkMode}
                  onCheckedChange={(checked) => setQrSettings({...qrSettings, darkMode: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              QR Code & Accès
            </CardTitle>
            <CardDescription>
              Générateur de QR code et liens d'accès au menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aperçu QR Code */}
            <div className="bg-white p-6 rounded-lg border border-border text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">QR Code généré automatiquement</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Télécharger QR Code
              </Button>
              <Button className="w-full" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Imprimer QR Code
              </Button>
              <Button className="w-full" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Partager le lien
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Lien direct</p>
              <p className="text-sm font-mono break-all">
                https://menu.restaurant.app/le-gourmet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catégories et langues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Catégories du Menu</CardTitle>
            <CardDescription>
              Gérez les catégories visibles dans le menu digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {menuCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={category.active}
                      onCheckedChange={() => {}}
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.items} articles</p>
                    </div>
                  </div>
                  <Badge variant={category.active ? "default" : "secondary"}>
                    {category.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Langues Disponibles
            </CardTitle>
            <CardDescription>
              Configuration du support multilingue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {languages.map((language, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={language.active}
                      onCheckedChange={() => {}}
                    />
                    <div>
                      <p className="font-medium">{language.name}</p>
                      <p className="text-sm text-muted-foreground">{language.code.toUpperCase()}</p>
                    </div>
                  </div>
                  <Badge variant={language.active ? "default" : "secondary"}>
                    {language.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Ajouter une langue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Testez et partagez votre menu digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col gap-2">
              <Eye className="w-6 h-6" />
              Prévisualiser
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Smartphone className="w-6 h-6" />
              Test Mobile
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <ExternalLink className="w-6 h-6" />
              Ouvrir Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}