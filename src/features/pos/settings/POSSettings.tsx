import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Printer, Receipt, CreditCard, Percent, DollarSign, Globe, Bell } from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";
import { useToast } from "@/hooks/use-toast";

export function POSSettings() {
  const { settings, isLoading, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const { toast } = useToast();

  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  // Helper function to update setting
  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  const handleSave = () => {
    saveSettings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Paramètres POS
          </h1>
          <p className="text-muted-foreground">
            Configuration du système de point de vente
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90"
        >
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="payment">Paiements</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
          <TabsTrigger value="receipt">Reçus</TabsTrigger>
          <TabsTrigger value="printer">Imprimante</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration Générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pos_name">Nom du point de vente</Label>
                  <Input
                    id="pos_name"
                    value={getSetting('pos_name', '')}
                    onChange={(e) => handleSettingChange('pos_name', e.target.value)}
                    placeholder="Mon Restaurant POS"
                  />
                </div>
                
                <div>
                  <Label htmlFor="default_currency">Devise par défaut</Label>
                  <Select 
                    value={getSetting('default_currency', 'XOF')} 
                    onValueChange={(value) => handleSettingChange('default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="table_prefix">Préfixe des tables</Label>
                  <Input
                    id="table_prefix"
                    value={getSetting('table_prefix', 'T')}
                    onChange={(e) => handleSettingChange('table_prefix', e.target.value)}
                    placeholder="T"
                  />
                </div>

                <div>
                  <Label htmlFor="order_prefix">Préfixe des commandes</Label>
                  <Input
                    id="order_prefix"
                    value={getSetting('order_prefix', 'CMD')}
                    onChange={(e) => handleSettingChange('order_prefix', e.target.value)}
                    placeholder="CMD"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_print_kitchen">Impression cuisine automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement les commandes en cuisine
                    </p>
                  </div>
                  <Switch
                    id="auto_print_kitchen"
                    checked={getSetting('auto_print_kitchen', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_print_kitchen', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_discount">Autoriser les remises</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux utilisateurs d'appliquer des remises
                    </p>
                  </div>
                  <Switch
                    id="allow_discount"
                    checked={getSetting('allow_discount', true)}
                    onCheckedChange={(checked) => handleSettingChange('allow_discount', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require_customer">Client obligatoire</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger la sélection d'un client pour chaque commande
                    </p>
                  </div>
                  <Switch
                    id="require_customer"
                    checked={getSetting('require_customer', false)}
                    onCheckedChange={(checked) => handleSettingChange('require_customer', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Méthodes de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_cash_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_cash_enabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_card_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_card_enabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Orange Money, MTN, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Activé</Badge>
                    <Switch
                      checked={getSetting('payment_mobile_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('payment_mobile_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_payment_method">Méthode par défaut</Label>
                  <Select 
                    value={getSetting('default_payment_method', 'cash')} 
                    onValueChange={(value) => handleSettingChange('default_payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cash_rounding">Arrondi espèces</Label>
                  <Select 
                    value={getSetting('cash_rounding', '1')} 
                    onValueChange={(value) => handleSettingChange('cash_rounding', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 FCFA</SelectItem>
                      <SelectItem value="5">5 FCFA</SelectItem>
                      <SelectItem value="10">10 FCFA</SelectItem>
                      <SelectItem value="25">25 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Taxes et Frais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax_enabled">Activation des taxes</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le calcul automatique des taxes
                    </p>
                  </div>
                  <Switch
                    id="tax_enabled"
                    checked={getSetting('tax_enabled', true)}
                    onCheckedChange={(checked) => handleSettingChange('tax_enabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default_tax_rate">Taux de TVA par défaut (%)</Label>
                    <Input
                      id="default_tax_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getSetting('default_tax_rate', 18)}
                      onChange={(e) => handleSettingChange('default_tax_rate', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="service_charge_rate">Frais de service (%)</Label>
                    <Input
                      id="service_charge_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getSetting('service_charge_rate', 0)}
                      onChange={(e) => handleSettingChange('service_charge_rate', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tax_inclusive">Prix TTC</Label>
                    <p className="text-sm text-muted-foreground">
                      Les prix affichés incluent les taxes
                    </p>
                  </div>
                  <Switch
                    id="tax_inclusive"
                    checked={getSetting('tax_inclusive', true)}
                    onCheckedChange={(checked) => handleSettingChange('tax_inclusive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_service_charge">Frais de service automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Appliquer automatiquement les frais de service
                    </p>
                  </div>
                  <Switch
                    id="auto_service_charge"
                    checked={getSetting('auto_service_charge', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_service_charge', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Configuration des Reçus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="receipt_header">En-tête du reçu</Label>
                  <Textarea
                    id="receipt_header"
                    value={getSetting('receipt_header', 'Mon Restaurant\nAdresse du restaurant\nTél: +225 XX XX XX XX')}
                    onChange={(e) => handleSettingChange('receipt_header', e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="receipt_footer">Pied de page du reçu</Label>
                  <Textarea
                    id="receipt_footer"
                    value={getSetting('receipt_footer', 'Merci de votre visite!\nÀ bientôt!')}
                    onChange={(e) => handleSettingChange('receipt_footer', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_print_receipt">Impression automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement le reçu après paiement
                    </p>
                  </div>
                  <Switch
                    id="auto_print_receipt"
                    checked={getSetting('auto_print_receipt', true)}
                    onCheckedChange={(checked) => handleSettingChange('auto_print_receipt', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_tax_details">Détail des taxes</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher le détail des taxes sur le reçu
                    </p>
                  </div>
                  <Switch
                    id="show_tax_details"
                    checked={getSetting('show_tax_details', true)}
                    onCheckedChange={(checked) => handleSettingChange('show_tax_details', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_qr_code">Code QR</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclure un code QR sur le reçu
                    </p>
                  </div>
                  <Switch
                    id="show_qr_code"
                    checked={getSetting('show_qr_code', false)}
                    onCheckedChange={(checked) => handleSettingChange('show_qr_code', checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receipt_width">Largeur du reçu</Label>
                <Select 
                  value={getSetting('receipt_width', '80mm')} 
                  onValueChange={(value) => handleSettingChange('receipt_width', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Configuration Imprimante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="receipt_printer">Imprimante reçus</Label>
                  <Select 
                    value={getSetting('receipt_printer', 'default')} 
                    onValueChange={(value) => handleSettingChange('receipt_printer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Imprimante par défaut</SelectItem>
                      <SelectItem value="thermal">Imprimante thermique</SelectItem>
                      <SelectItem value="network">Imprimante réseau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="kitchen_printer">Imprimante cuisine</Label>
                  <Select 
                    value={getSetting('kitchen_printer', 'none')} 
                    onValueChange={(value) => handleSettingChange('kitchen_printer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="thermal">Imprimante thermique</SelectItem>
                      <SelectItem value="network">Imprimante réseau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="printer_ip">Adresse IP imprimante réseau</Label>
                  <Input
                    id="printer_ip"
                    value={getSetting('printer_ip', '')}
                    onChange={(e) => handleSettingChange('printer_ip', e.target.value)}
                    placeholder="192.168.1.100"
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline">
                    Tester Imprimante Reçus
                  </Button>
                  <Button variant="outline">
                    Tester Imprimante Cuisine
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound_enabled">Sons système</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les notifications sonores
                    </p>
                  </div>
                  <Switch
                    id="sound_enabled"
                    checked={getSetting('sound_enabled', true)}
                    onCheckedChange={(checked) => handleSettingChange('sound_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="order_sound">Son nouvelle commande</Label>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son lors de nouvelles commandes
                    </p>
                  </div>
                  <Switch
                    id="order_sound"
                    checked={getSetting('order_sound', true)}
                    onCheckedChange={(checked) => handleSettingChange('order_sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment_sound">Son paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son lors des paiements
                    </p>
                  </div>
                  <Switch
                    id="payment_sound"
                    checked={getSetting('payment_sound', true)}
                    onCheckedChange={(checked) => handleSettingChange('payment_sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low_stock_alerts">Alertes stock faible</Label>
                    <p className="text-sm text-muted-foreground">
                      Notification en cas de stock faible
                    </p>
                  </div>
                  <Switch
                    id="low_stock_alerts"
                    checked={getSetting('low_stock_alerts', true)}
                    onCheckedChange={(checked) => handleSettingChange('low_stock_alerts', checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notification_volume">Volume des notifications</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={getSetting('notification_volume', 50)}
                    onChange={(e) => handleSettingChange('notification_volume', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-center">
                    {getSetting('notification_volume', 50)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}