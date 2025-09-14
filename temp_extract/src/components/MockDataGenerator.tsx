import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Database, Users, Hotel, ShoppingCart } from 'lucide-react';
import { MockDataService } from '@/services/MockDataService';
import { useToast } from '@/components/ui/use-toast';

interface GenerationCounts {
  customers: number;
  reservations: number;
  transactions: number;
}

export const MockDataGenerator = () => {
  const { toast } = useToast();
  const [counts, setCounts] = useState<GenerationCounts>({
    customers: 100,
    reservations: 50,
    transactions: 200
  });
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (type: 'customers' | 'reservations' | 'transactions' | 'complete') => {
    setIsGenerating(true);
    
    try {
      let data: any;
      let filename: string;

      switch (type) {
        case 'customers':
          data = MockDataService.generateIvoirianCustomers(counts.customers);
          filename = `clients_ivoiriens_${counts.customers}`;
          break;
        case 'reservations':
          data = MockDataService.generateHotelReservations(counts.reservations);
          filename = `reservations_hotel_${counts.reservations}`;
          break;
        case 'transactions':
          data = MockDataService.generatePOSTransactions(counts.transactions);
          filename = `transactions_pos_${counts.transactions}`;
          break;
        case 'complete':
          data = MockDataService.generateCompleteTestDataset(counts);
          filename = `dataset_complet_cote_ivoire`;
          break;
        default:
          throw new Error('Type de données non supporté');
      }

      MockDataService.downloadData(data, filename, format);

      toast({
        title: 'Données générées avec succès',
        description: `${type === 'complete' ? 'Dataset complet' : type} téléchargé en format ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur lors de la génération',
        description: 'Impossible de générer les données de test',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCount = (type: keyof GenerationCounts, value: string) => {
    const numValue = parseInt(value) || 0;
    setCounts(prev => ({ ...prev, [type]: Math.max(0, Math.min(10000, numValue)) }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Générateur de Données de Test
        </h1>
        <p className="text-center text-muted-foreground mb-4">
          Jeux de données réalistes adaptés au contexte ivoirien
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">🇨🇮 Côte d'Ivoire</Badge>
          <Badge variant="secondary">🏨 Hôtellerie</Badge>
          <Badge variant="secondary">🍽️ Restauration</Badge>
          <Badge variant="secondary">💼 Commerce</Badge>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Données Individuelles</TabsTrigger>
          <TabsTrigger value="complete">Dataset Complet</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clients Ivoiriens
                </CardTitle>
                <CardDescription>
                  Noms, prénoms, contacts et adresses typiquement ivoiriens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customers-count">Nombre de clients</Label>
                  <Input
                    id="customers-count"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.customers}
                    onChange={(e) => updateCount('customers', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleGenerate('customers')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Générer Clients
                </Button>
              </CardContent>
            </Card>

            {/* Réservations Hôtel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Réservations Hôtel
                </CardTitle>
                <CardDescription>
                  Réservations avec types de chambres et prix en FCFA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reservations-count">Nombre de réservations</Label>
                  <Input
                    id="reservations-count"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.reservations}
                    onChange={(e) => updateCount('reservations', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleGenerate('reservations')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Générer Réservations
                </Button>
              </CardContent>
            </Card>

            {/* Transactions POS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Transactions POS
                </CardTitle>
                <CardDescription>
                  Ventes avec produits locaux (Attiéké, Alloco, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transactions-count">Nombre de transactions</Label>
                  <Input
                    id="transactions-count"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.transactions}
                    onChange={(e) => updateCount('transactions', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleGenerate('transactions')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Générer Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset Complet - Côte d'Ivoire
              </CardTitle>
              <CardDescription>
                Génère un jeu de données complet avec tous les types d'enregistrements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="complete-customers">Clients</Label>
                  <Input
                    id="complete-customers"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.customers}
                    onChange={(e) => updateCount('customers', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="complete-reservations">Réservations</Label>
                  <Input
                    id="complete-reservations"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.reservations}
                    onChange={(e) => updateCount('reservations', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="complete-transactions">Transactions</Label>
                  <Input
                    id="complete-transactions"
                    type="number"
                    min="1"
                    max="10000"
                    value={counts.transactions}
                    onChange={(e) => updateCount('transactions', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Le dataset complet inclut :</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Clients :</strong> Noms ivoiriens, adresses à Abidjan, téléphones +225</li>
                  <li>• <strong>Réservations :</strong> Types de chambres locaux, prix en FCFA, nationalités africaines</li>
                  <li>• <strong>Transactions :</strong> Plats ivoiriens (Attiéké, Kedjenou), TVA 18%, Mobile Money</li>
                  <li>• <strong>Métadonnées :</strong> Informations sur la génération et statistiques</li>
                </ul>
              </div>

              <div className="text-center">
                <span className="text-lg font-semibold">
                  Total : {counts.customers + counts.reservations + counts.transactions} enregistrements
                </span>
              </div>

              <Button 
                onClick={() => handleGenerate('complete')}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                <Database className="h-5 w-5 mr-2" />
                Générer Dataset Complet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Options de format */}
      <Card>
        <CardHeader>
          <CardTitle>Options d'Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Format de fichier</Label>
              <Select value={format} onValueChange={(value: 'json' | 'csv') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (recommandé pour APIs)</SelectItem>
                  <SelectItem value="csv">CSV (recommandé pour Excel)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle>À propos des données générées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Spécificités ivoiriennes :</h4>
              <ul className="space-y-1">
                <li>• Prénoms : Kouadio, Adjoua, Fatou, Mamadou...</li>
                <li>• Villes : Abidjan, Bouaké, Yamoussoukro...</li>
                <li>• Quartiers : Cocody, Plateau, Marcory...</li>
                <li>• Téléphones : Format +225 XX XX XX XX</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Données réalistes :</h4>
              <ul className="space-y-1">
                <li>• Prix en Francs CFA (FCFA)</li>
                <li>• TVA à 18% (taux ivoirien)</li>
                <li>• Produits locaux authentiques</li>
                <li>• Moyens de paiement : Mobile Money, Orange Money</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};