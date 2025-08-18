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
import { ShieldCheck, FileText, Globe, Calculator, Upload } from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  category: string;
  productTypes: string[];
  isActive: boolean;
}

interface CertificationConfig {
  nf525Enabled: boolean;
  certificateNumber: string;
  softwareVersion: string;
  chainValidation: boolean;
  digitalSignature: boolean;
}

export function RegulatoryConfigModule() {
  const { settings, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("taxes");

  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  // Données de taxes pré-configurées pour l'Afrique de l'Ouest
  const predefinedTaxRates: TaxRate[] = [
    { id: "1", name: "TVA Standard", rate: 18, category: "standard", productTypes: ["alimentaire", "service"], isActive: true },
    { id: "2", name: "TVA Réduite", rate: 5, category: "reduced", productTypes: ["médicament", "livre"], isActive: true },
    { id: "3", name: "Exonération", rate: 0, category: "exempt", productTypes: ["export", "formation"], isActive: true },
    { id: "4", name: "Régime spécial", rate: 12, category: "special", productTypes: ["agriculture"], isActive: false }
  ];

  const certificationConfig: CertificationConfig = {
    nf525Enabled: getSetting('nf525_enabled', false),
    certificateNumber: getSetting('certificate_number', ''),
    softwareVersion: getSetting('software_version', 'POS-V1.0.0'),
    chainValidation: getSetting('chain_validation', true),
    digitalSignature: getSetting('digital_signature', true)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Configuration Réglementaire</h2>
            <p className="text-muted-foreground">
              Configuration fiscale et certifications NF525
            </p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="taxes">TVA & Taxes</TabsTrigger>
          <TabsTrigger value="certification">Certification NF525</TabsTrigger>
          <TabsTrigger value="fne">FNE DGI</TabsTrigger>
          <TabsTrigger value="currencies">Multi-devises</TabsTrigger>
          <TabsTrigger value="exemptions">Exonérations</TabsTrigger>
        </TabsList>

        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Configuration TVA Avancée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tax_jurisdiction">Juridiction fiscale</Label>
                  <Select 
                    value={getSetting('tax_jurisdiction', 'SN')} 
                    onValueChange={(value) => handleSettingChange('tax_jurisdiction', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SN">Sénégal</SelectItem>
                      <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                      <SelectItem value="BF">Burkina Faso</SelectItem>
                      <SelectItem value="ML">Mali</SelectItem>
                      <SelectItem value="NE">Niger</SelectItem>
                      <SelectItem value="TG">Togo</SelectItem>
                      <SelectItem value="BJ">Bénin</SelectItem>
                      <SelectItem value="GW">Guinée-Bissau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="company_nin">Numéro d'Identification Nationale</Label>
                  <Input
                    id="company_nin"
                    value={getSetting('company_nin', '')}
                    onChange={(e) => handleSettingChange('company_nin', e.target.value)}
                    placeholder="NIN de l'entreprise"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Taux de TVA configurés</h4>
                <div className="space-y-3">
                  {predefinedTaxRates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{rate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rate.rate}% - {rate.productTypes.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rate.isActive ? "default" : "secondary"}>
                          {rate.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Switch
                          checked={rate.isActive}
                          onCheckedChange={(checked) => {
                            // Logic to update tax rate status
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Calcul automatique des taxes</Label>
                  <p className="text-sm text-muted-foreground">
                    Calcul automatique selon les règles fiscales locales
                  </p>
                </div>
                <Switch
                  checked={getSetting('auto_tax_calculation', true)}
                  onCheckedChange={(checked) => handleSettingChange('auto_tax_calculation', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certification NF525
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="certificate_number">Numéro de certificat</Label>
                  <Input
                    id="certificate_number"
                    value={certificationConfig.certificateNumber}
                    onChange={(e) => handleSettingChange('certificate_number', e.target.value)}
                    placeholder="NF525-YYYY-XXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="software_version">Version logiciel</Label>
                  <Input
                    id="software_version"
                    value={certificationConfig.softwareVersion}
                    onChange={(e) => handleSettingChange('software_version', e.target.value)}
                    placeholder="POS-V1.0.0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Certification NF525 activée</Label>
                    <p className="text-sm text-muted-foreground">
                      Active les contrôles de conformité fiscale
                    </p>
                  </div>
                  <Switch
                    checked={certificationConfig.nf525Enabled}
                    onCheckedChange={(checked) => handleSettingChange('nf525_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Validation de chaîne</Label>
                    <p className="text-sm text-muted-foreground">
                      Vérifie l'intégrité de la chaîne cryptographique
                    </p>
                  </div>
                  <Switch
                    checked={certificationConfig.chainValidation}
                    onCheckedChange={(checked) => handleSettingChange('chain_validation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Signature numérique</Label>
                    <p className="text-sm text-muted-foreground">
                      Signature cryptographique des données fiscales
                    </p>
                  </div>
                  <Switch
                    checked={certificationConfig.digitalSignature}
                    onCheckedChange={(checked) => handleSettingChange('digital_signature', checked)}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h5 className="font-medium mb-2">Status de certification</h5>
                <div className="flex items-center gap-2">
                  <Badge variant={certificationConfig.nf525Enabled ? "default" : "secondary"}>
                    {certificationConfig.nf525Enabled ? "Certifié NF525" : "Non certifié"}
                  </Badge>
                  {certificationConfig.nf525Enabled && (
                    <Badge variant="outline">
                      Valide jusqu'au 31/12/2024
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fne" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Intégration FNE DGI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fne_endpoint">URL Endpoint FNE</Label>
                  <Input
                    id="fne_endpoint"
                    value={getSetting('fne_endpoint', '')}
                    onChange={(e) => handleSettingChange('fne_endpoint', e.target.value)}
                    placeholder="https://fne.impots.sn/api/v1"
                  />
                </div>

                <div>
                  <Label htmlFor="fne_company_id">Identifiant entreprise</Label>
                  <Input
                    id="fne_company_id"
                    value={getSetting('fne_company_id', '')}
                    onChange={(e) => handleSettingChange('fne_company_id', e.target.value)}
                    placeholder="ID FNE entreprise"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Transmission automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoi automatique des factures au FNE
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('fne_auto_transmission', false)}
                    onCheckedChange={(checked) => handleSettingChange('fne_auto_transmission', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Validation temps réel</Label>
                    <p className="text-sm text-muted-foreground">
                      Validation des factures en temps réel avec le FNE
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('fne_realtime_validation', false)}
                    onCheckedChange={(checked) => handleSettingChange('fne_realtime_validation', checked)}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">Codes fiscaux configurés</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vente de biens</span>
                    <Badge variant="outline">TP01</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prestation de services</span>
                    <Badge variant="outline">TP02</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Importation</span>
                    <Badge variant="outline">TP03</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configuration Multi-devises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="base_currency">Devise de base</Label>
                  <Select 
                    value={getSetting('base_currency', 'XOF')} 
                    onValueChange={(value) => handleSettingChange('base_currency', value)}
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
                  <Label htmlFor="exchange_rate_provider">Fournisseur taux de change</Label>
                  <Select 
                    value={getSetting('exchange_rate_provider', 'manual')} 
                    onValueChange={(value) => handleSettingChange('exchange_rate_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuel</SelectItem>
                      <SelectItem value="bceao">BCEAO</SelectItem>
                      <SelectItem value="ecb">BCE</SelectItem>
                      <SelectItem value="api">API externe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mise à jour automatique des taux</Label>
                    <p className="text-sm text-muted-foreground">
                      Mise à jour quotidienne des taux de change
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('auto_exchange_rates', false)}
                    onCheckedChange={(checked) => handleSettingChange('auto_exchange_rates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Conversion temps réel</Label>
                    <p className="text-sm text-muted-foreground">
                      Affichage des prix convertis en temps réel
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('realtime_conversion', false)}
                    onCheckedChange={(checked) => handleSettingChange('realtime_conversion', checked)}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">Taux de change actuels</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">EUR → XOF</span>
                    <Badge variant="outline">655.957</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">USD → XOF</span>
                    <Badge variant="outline">605.123</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Dernière mise à jour: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Gestion des Exonérations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exonération export</Label>
                    <p className="text-sm text-muted-foreground">
                      Exonération automatique pour les ventes à l'export
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('export_exemption', true)}
                    onCheckedChange={(checked) => handleSettingChange('export_exemption', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Régime diplomatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Exonération pour le corps diplomatique
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('diplomatic_exemption', true)}
                    onCheckedChange={(checked) => handleSettingChange('diplomatic_exemption', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Organisations internationales</Label>
                    <p className="text-sm text-muted-foreground">
                      Exonération pour les organisations internationales
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('international_org_exemption', true)}
                    onCheckedChange={(checked) => handleSettingChange('international_org_exemption', checked)}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">Codes d'exonération</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export_code">Code export</Label>
                    <Input
                      id="export_code"
                      value={getSetting('export_exemption_code', 'EXP001')}
                      onChange={(e) => handleSettingChange('export_exemption_code', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diplomatic_code">Code diplomatique</Label>
                    <Input
                      id="diplomatic_code"
                      value={getSetting('diplomatic_exemption_code', 'DIP001')}
                      onChange={(e) => handleSettingChange('diplomatic_exemption_code', e.target.value)}
                    />
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