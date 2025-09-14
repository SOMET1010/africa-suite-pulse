import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Printer, 
  CreditCard, 
  Scan, 
  Scale, 
  Monitor, 
  Wifi, 
  Usb, 
  Settings, 
  Download, 
  Upload,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";

interface HardwareDevice {
  id: string;
  name: string;
  type: 'printer' | 'payment_terminal' | 'scanner' | 'scale' | 'display';
  status: 'connected' | 'disconnected' | 'error';
  connectionType: 'usb' | 'network' | 'bluetooth';
  lastSeen: string;
  configuration: any;
}

interface PrinterTemplate {
  id: string;
  name: string;
  type: 'receipt' | 'kitchen' | 'bar' | 'report';
  width: number;
  content: string[];
  isDefault: boolean;
}

export function HardwareConfigModule() {
  const { settings, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("printers");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [testingDevice, setTestingDevice] = useState<string>("");

  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  // Données simulées des périphériques
  const [devices, setDevices] = useState<HardwareDevice[]>([
    {
      id: "printer_1",
      name: "Epson TM-T88VI (Caisse)",
      type: "printer",
      status: "connected",
      connectionType: "usb",
      lastSeen: "Maintenant",
      configuration: {
        paperWidth: 80,
        autocut: true,
        encoding: "utf-8"
      }
    },
    {
      id: "printer_2",
      name: "Star TSP143 (Cuisine)",
      type: "printer",
      status: "connected",
      connectionType: "network",
      lastSeen: "Maintenant",
      configuration: {
        paperWidth: 80,
        autocut: true,
        encoding: "utf-8",
        ipAddress: "192.168.1.100"
      }
    },
    {
      id: "terminal_1",
      name: "Ingenico iPP350",
      type: "payment_terminal",
      status: "connected",
      connectionType: "network",
      lastSeen: "Il y a 2 min",
      configuration: {
        terminalId: "12345678",
        merchantId: "ABCD1234",
        acquirer: "worldline"
      }
    },
    {
      id: "scanner_1",
      name: "Honeywell Voyager 1400g",
      type: "scanner",
      status: "error",
      connectionType: "usb",
      lastSeen: "Il y a 15 min",
      configuration: {
        scanMode: "continuous",
        beepEnabled: true
      }
    }
  ]);

  const printerTemplates: PrinterTemplate[] = [
    {
      id: "receipt_default",
      name: "Reçu Standard",
      type: "receipt",
      width: 80,
      content: [
        "header_logo",
        "company_info",
        "separator",
        "order_items",
        "totals",
        "payment_info",
        "footer_text"
      ],
      isDefault: true
    },
    {
      id: "kitchen_order",
      name: "Bon de Cuisine",
      type: "kitchen",
      width: 80,
      content: [
        "order_number",
        "table_info",
        "order_time",
        "separator",
        "kitchen_items",
        "special_instructions"
      ],
      isDefault: true
    },
    {
      id: "bar_order",
      name: "Bon de Bar",
      type: "bar",
      width: 58,
      content: [
        "order_number",
        "table_info",
        "separator",
        "drink_items",
        "special_instructions"
      ],
      isDefault: false
    }
  ];

  const testDevice = async (deviceId: string) => {
    setTestingDevice(deviceId);
    
    // Simulation du test
    setTimeout(() => {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        if (device.type === 'printer') {
          // Test d'impression
          console.log(`Test d'impression sur ${device.name}`);
        } else if (device.type === 'payment_terminal') {
          // Test de connexion terminal
          console.log(`Test de connexion sur ${device.name}`);
        }
      }
      setTestingDevice("");
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'usb':
        return <Usb className="w-4 h-4" />;
      case 'network':
        return <Wifi className="w-4 h-4" />;
      case 'bluetooth':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Configuration Matérielle</h2>
            <p className="text-muted-foreground">
              Gestion des imprimantes, terminaux de paiement et périphériques
            </p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="printers">Imprimantes</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="peripherals">Périphériques</TabsTrigger>
          <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
          <TabsTrigger value="network">Réseau</TabsTrigger>
        </TabsList>

        <TabsContent value="printers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Gestion des Imprimantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Liste des imprimantes */}
              <div className="space-y-4">
                {devices.filter(d => d.type === 'printer').map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Printer className="w-5 h-5 text-primary" />
                        <div>
                          <h5 className="font-medium">{device.name}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getConnectionIcon(device.connectionType)}
                            <span>{device.connectionType.toUpperCase()}</span>
                            <span>•</span>
                            <span>Vu {device.lastSeen}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(device.status)}
                        <Badge variant={device.status === 'connected' ? 'default' : 'destructive'}>
                          {device.status === 'connected' ? 'Connecté' : 
                           device.status === 'error' ? 'Erreur' : 'Déconnecté'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Largeur papier:</span>
                        <p>{device.configuration.paperWidth}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coupe auto:</span>
                        <p>{device.configuration.autocut ? 'Activée' : 'Désactivée'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Encodage:</span>
                        <p>{device.configuration.encoding.toUpperCase()}</p>
                      </div>
                      {device.configuration.ipAddress && (
                        <div>
                          <span className="text-muted-foreground">IP:</span>
                          <p>{device.configuration.ipAddress}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testDevice(device.id)}
                        disabled={testingDevice === device.id}
                        className="gap-1"
                      >
                        {testingDevice === device.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <TestTube className="w-3 h-3" />
                        )}
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Templates d'impression */}
              <div>
                <h4 className="font-medium mb-4">Templates d'impression</h4>
                <div className="space-y-3">
                  {printerTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{template.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {template.type} - {template.width}mm
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {template.isDefault && (
                            <Badge variant="default">Par défaut</Badge>
                          )}
                          <Button variant="outline" size="sm">Modifier</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.content.map((section, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {section.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Configuration globale</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Impression automatique cuisine</Label>
                      <p className="text-sm text-muted-foreground">
                        Imprimer automatiquement en cuisine
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_kitchen_print', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_kitchen_print', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Impression duplicata</Label>
                      <p className="text-sm text-muted-foreground">
                        Permettre l'impression de duplicatas
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('allow_duplicate_print', true)}
                      onCheckedChange={(checked) => handleSettingChange('allow_duplicate_print', checked)}
                    />
                  </div>
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
                Terminaux de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration des terminaux */}
              <div className="space-y-4">
                {devices.filter(d => d.type === 'payment_terminal').map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <h5 className="font-medium">{device.name}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getConnectionIcon(device.connectionType)}
                            <span>{device.connectionType.toUpperCase()}</span>
                            <span>•</span>
                            <span>Vu {device.lastSeen}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(device.status)}
                        <Badge variant={device.status === 'connected' ? 'default' : 'destructive'}>
                          {device.status === 'connected' ? 'Connecté' : 'Déconnecté'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID Terminal:</span>
                        <p>{device.configuration.terminalId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID Marchand:</span>
                        <p>{device.configuration.merchantId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Acquéreur:</span>
                        <p className="capitalize">{device.configuration.acquirer}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testDevice(device.id)}
                        disabled={testingDevice === device.id}
                        className="gap-1"
                      >
                        {testingDevice === device.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <TestTube className="w-3 h-3" />
                        )}
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Fournisseurs de paiement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Worldline", logo: "WL", supported: true, protocols: ["EMV", "NFC"] },
                    { name: "Ingenico", logo: "IG", supported: true, protocols: ["EMV", "NFC", "Magstripe"] },
                    { name: "Verifone", logo: "VF", supported: true, protocols: ["EMV", "NFC"] },
                    { name: "SumUp", logo: "SU", supported: false, protocols: ["NFC", "Chip"] }
                  ].map((provider) => (
                    <div key={provider.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                            {provider.logo}
                          </div>
                          <h5 className="font-medium">{provider.name}</h5>
                        </div>
                        <Badge variant={provider.supported ? "default" : "secondary"}>
                          {provider.supported ? "Supporté" : "Bientôt"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provider.protocols.map((protocol, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {protocol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Configuration des paiements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Validation automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Valider automatiquement les paiements CB
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_payment_validation', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_payment_validation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Impression ticket CB</Label>
                      <p className="text-sm text-muted-foreground">
                        Imprimer automatiquement les tickets CB
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_payment_receipt', false)}
                      onCheckedChange={(checked) => handleSettingChange('auto_payment_receipt', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peripherals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Autres Périphériques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lecteurs codes-barres */}
              <div>
                <h4 className="font-medium mb-4">Lecteurs codes-barres</h4>
                <div className="space-y-3">
                  {devices.filter(d => d.type === 'scanner').map((device) => (
                    <div key={device.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Scan className="w-5 h-5 text-primary" />
                          <div>
                            <h5 className="font-medium">{device.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getConnectionIcon(device.connectionType)}
                              <span>{device.connectionType.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(device.status)}
                          <Button variant="outline" size="sm">
                            Configurer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Balances */}
              <div>
                <h4 className="font-medium mb-4">Balances</h4>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune balance configurée</p>
                  <Button variant="outline" className="mt-2">
                    Ajouter une balance
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Afficheurs client */}
              <div>
                <h4 className="font-medium mb-4">Afficheurs client</h4>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun afficheur configuré</p>
                  <Button variant="outline" className="mt-2">
                    Ajouter un afficheur
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Configuration des périphériques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Détection automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Détecter automatiquement les nouveaux périphériques
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_device_detection', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_device_detection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Connexion automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Se connecter automatiquement aux périphériques connus
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_device_connect', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_device_connect', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Sauvegarde et Restauration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sauvegarde Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sauvegardez toute la configuration matérielle et les paramètres
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        Exporter Configuration
                      </Button>
                      <Button variant="outline" className="w-full gap-2">
                        <Upload className="w-4 h-4" />
                        Importer Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Migration Données</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Migrez vos données vers un nouveau système
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        Préparer Migration
                      </Button>
                      <Button variant="outline" className="w-full gap-2">
                        <Upload className="w-4 h-4" />
                        Restaurer Migration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Sauvegarde automatique</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde quotidienne</Label>
                      <p className="text-sm text-muted-foreground">
                        Sauvegarde automatique chaque jour à 2h00
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('daily_backup', true)}
                      onCheckedChange={(checked) => handleSettingChange('daily_backup', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="backup_location">Emplacement de sauvegarde</Label>
                      <Select 
                        value={getSetting('backup_location', 'local')} 
                        onValueChange={(value) => handleSettingChange('backup_location', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="usb">Clé USB</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                          <SelectItem value="network">Réseau</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="retention_days">Rétention (jours)</Label>
                      <Select 
                        value={getSetting('backup_retention', '30')} 
                        onValueChange={(value) => handleSettingChange('backup_retention', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 jours</SelectItem>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                          <SelectItem value="365">1 an</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h5 className="font-medium mb-2">Dernières sauvegardes</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Configuration complète</span>
                    <span className="text-muted-foreground">Hier 02:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Données transactionnelles</span>
                    <span className="text-muted-foreground">Hier 02:15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paramètres utilisateurs</span>
                    <span className="text-muted-foreground">Hier 02:30</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Configuration Réseau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="network_interface">Interface réseau</Label>
                  <Select 
                    value={getSetting('network_interface', 'auto')} 
                    onValueChange={(value) => handleSettingChange('network_interface', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatique</SelectItem>
                      <SelectItem value="ethernet">Ethernet</SelectItem>
                      <SelectItem value="wifi">Wi-Fi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ip_config">Configuration IP</Label>
                  <Select 
                    value={getSetting('ip_config', 'dhcp')} 
                    onValueChange={(value) => handleSettingChange('ip_config', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhcp">DHCP</SelectItem>
                      <SelectItem value="static">IP Statique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {getSetting('ip_config', 'dhcp') === 'static' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="static_ip">Adresse IP</Label>
                    <Input
                      id="static_ip"
                      value={getSetting('static_ip', '')}
                      onChange={(e) => handleSettingChange('static_ip', e.target.value)}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subnet_mask">Masque de sous-réseau</Label>
                    <Input
                      id="subnet_mask"
                      value={getSetting('subnet_mask', '')}
                      onChange={(e) => handleSettingChange('subnet_mask', e.target.value)}
                      placeholder="255.255.255.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gateway">Passerelle</Label>
                    <Input
                      id="gateway"
                      value={getSetting('gateway', '')}
                      onChange={(e) => handleSettingChange('gateway', e.target.value)}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dns_server">Serveur DNS</Label>
                    <Input
                      id="dns_server"
                      value={getSetting('dns_server', '')}
                      onChange={(e) => handleSettingChange('dns_server', e.target.value)}
                      placeholder="8.8.8.8"
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Sécurité réseau</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pare-feu activé</Label>
                      <p className="text-sm text-muted-foreground">
                        Protection contre les accès non autorisés
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('firewall_enabled', true)}
                      onCheckedChange={(checked) => handleSettingChange('firewall_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>VPN automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Connexion VPN pour les communications sécurisées
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_vpn', false)}
                      onCheckedChange={(checked) => handleSettingChange('auto_vpn', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h5 className="font-medium mb-2">État du réseau</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Connecté
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP:</span>
                    <p>192.168.1.145</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latence:</span>
                    <p>2ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Débit:</span>
                    <p>100 Mbps</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}