import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RefreshCw, Database, Shield, Bell, Clock, Users, Printer } from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";

export function SystemSettings() {
  const {
    settings,
    isLoading,
    updateSetting,
    saveSettings,
    isSaving
  } = useSystemSettings();

  const getSetting = (key: string, defaultValue: any = {}) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paramètres Système</h1>
          <p className="text-muted-foreground">
            Configuration globale du système POS
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Database className="w-4 h-4 mr-2" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="kitchen">
            <Clock className="w-4 h-4 mr-2" />
            Cuisine
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="printing">
            <Printer className="w-4 h-4 mr-2" />
            Impression
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Générale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise par Défaut</Label>
                  <Select 
                    value={getSetting('default_currency', { value: 'FCFA' }).value}
                    onValueChange={(value) => handleSettingChange('default_currency', { value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA (Franc CFA)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau Horaire</Label>
                  <Select 
                    value={getSetting('timezone', { value: 'Africa/Abidjan' }).value}
                    onValueChange={(value) => handleSettingChange('timezone', { value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fuseau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Abidjan">Abidjan (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Dakar">Dakar (GMT+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select 
                    value={getSetting('language', { value: 'fr' }).value}
                    onValueChange={(value) => handleSettingChange('language', { value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intégrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Connexion PMS Hôtel</Label>
                    <p className="text-sm text-muted-foreground">
                      Synchronisation avec le système hôtelier
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('pms_integration', { enabled: false }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('pms_integration', { enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode Offline</Label>
                    <p className="text-sm text-muted-foreground">
                      Fonctionnement hors connexion
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('offline_mode', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('offline_mode', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Stocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Déduction Automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Déduire le stock lors des ventes
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('auto_deduct_stock', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('auto_deduct_stock', { enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seuil d'Alerte Stock (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={getSetting('stock_alert_threshold', { percentage: 20 }).percentage}
                    onChange={(e) => 
                      handleSettingChange('stock_alert_threshold', { 
                        percentage: parseInt(e.target.value) 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contrôle Strict des Stocks</Label>
                    <p className="text-sm text-muted-foreground">
                      Interdire la vente sans stock suffisant
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('strict_stock_control', { enabled: false }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('strict_stock_control', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Valorisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Méthode de Coût</Label>
                  <Select 
                    value={getSetting('costing_method', { method: 'fifo' }).method}
                    onValueChange={(value) => 
                      handleSettingChange('costing_method', { method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Méthode de valorisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO (Premier entré, premier sorti)</SelectItem>
                      <SelectItem value="lifo">LIFO (Dernier entré, premier sorti)</SelectItem>
                      <SelectItem value="average">Coût moyen pondéré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gestion par Lots</Label>
                    <p className="text-sm text-muted-foreground">
                      Traçabilité par numéro de lot
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('batch_tracking', { enabled: false }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('batch_tracking', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kitchen" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Affichage Cuisine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Délai d'Affichage (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={getSetting('kitchen_display_timeout', { minutes: 15 }).minutes}
                    onChange={(e) => 
                      handleSettingChange('kitchen_display_timeout', { 
                        minutes: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Temps d'affichage des commandes terminées
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Impression Automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement en cuisine
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('auto_print_kitchen', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('auto_print_kitchen', { enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temps de Préparation par Défaut (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={getSetting('default_prep_time', { minutes: 15 }).minutes}
                    onChange={(e) => 
                      handleSettingChange('default_prep_time', { 
                        minutes: parseInt(e.target.value) 
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organisation des Commandes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tri des Commandes</Label>
                  <Select 
                    value={getSetting('order_sorting', { method: 'time' }).method}
                    onValueChange={(value) => 
                      handleSettingChange('order_sorting', { method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Méthode de tri" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Par heure de commande</SelectItem>
                      <SelectItem value="priority">Par priorité</SelectItem>
                      <SelectItem value="preparation">Par temps de préparation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Regroupement par Table</Label>
                    <p className="text-sm text-muted-foreground">
                      Grouper les commandes d'une même table
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('group_by_table', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('group_by_table', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Alertes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Alertes Stock</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stock Faible</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de stock bas
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('low_stock_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('low_stock_alert', { enabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rupture de Stock</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de stock épuisé
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('out_of_stock_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('out_of_stock_alert', { enabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Expiration Produits</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de date d'expiration
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('expiry_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('expiry_alert', { enabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Alertes Opérationnelles</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Commandes en Retard</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de dépassement temps
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('late_order_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('late_order_alert', { enabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Erreurs de Paiement</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes d'échec de transaction
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('payment_error_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('payment_error_alert', { enabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Synchronisation PMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de problème sync
                      </p>
                    </div>
                    <Switch 
                      checked={getSetting('sync_error_alert', { enabled: true }).enabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('sync_error_alert', { enabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité d'Accès</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Délai de Verrouillage (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={getSetting('session_timeout', { minutes: 30 }).minutes}
                    onChange={(e) => 
                      handleSettingChange('session_timeout', { 
                        minutes: parseInt(e.target.value) 
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Verrouillage automatique après inactivité
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Double Authentification</Label>
                    <p className="text-sm text-muted-foreground">
                      Validation manager pour actions sensibles
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('require_manager_auth', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('require_manager_auth', { enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tentatives de Connexion Max</Label>
                  <Input
                    type="number"
                    min="3"
                    max="10"
                    value={getSetting('max_login_attempts', { count: 5 }).count}
                    onChange={(e) => 
                      handleSettingChange('max_login_attempts', { 
                        count: parseInt(e.target.value) 
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit et Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Journalisation Complète</Label>
                    <p className="text-sm text-muted-foreground">
                      Enregistrer toutes les actions
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('full_audit_log', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('full_audit_log', { enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rétention des Logs (jours)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="365"
                    value={getSetting('log_retention_days', { days: 90 }).days}
                    onChange={(e) => 
                      handleSettingChange('log_retention_days', { 
                        days: parseInt(e.target.value) 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sauvegarde Automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Backup quotidien des données
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('auto_backup', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('auto_backup', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="printing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Imprimantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Imprimante Tickets</Label>
                  <Select 
                    value={getSetting('receipt_printer', { name: 'default' }).name}
                    onValueChange={(value) => 
                      handleSettingChange('receipt_printer', { name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'imprimante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Imprimante par défaut</SelectItem>
                      <SelectItem value="epson_tm">Epson TM-T88</SelectItem>
                      <SelectItem value="star_tsp">Star TSP650</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Imprimante Cuisine</Label>
                  <Select 
                    value={getSetting('kitchen_printer', { name: 'default' }).name}
                    onValueChange={(value) => 
                      handleSettingChange('kitchen_printer', { name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'imprimante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Imprimante par défaut</SelectItem>
                      <SelectItem value="kitchen_01">Cuisine - Station 1</SelectItem>
                      <SelectItem value="kitchen_02">Cuisine - Station 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Taille des Tickets</Label>
                  <Select 
                    value={getSetting('receipt_size', { width: '80mm' }).width}
                    onValueChange={(value) => 
                      handleSettingChange('receipt_size', { width: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Taille du papier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="112mm">112mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options d'Impression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Impression Automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimer automatiquement les tickets
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('auto_print_receipt', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('auto_print_receipt', { enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nombre de Copies</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={getSetting('receipt_copies', { count: 1 }).count}
                    onChange={(e) => 
                      handleSettingChange('receipt_copies', { 
                        count: parseInt(e.target.value) 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Code QR sur Ticket</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajouter un QR code pour la traçabilité
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('qr_code_receipt', { enabled: false }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('qr_code_receipt', { enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Logo sur Ticket</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclure le logo de l'établissement
                    </p>
                  </div>
                  <Switch 
                    checked={getSetting('logo_on_receipt', { enabled: true }).enabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('logo_on_receipt', { enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}