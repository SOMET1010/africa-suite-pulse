import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Upload, 
  QrCode,
  Building,
  Calculator,
  Receipt,
  Archive,
  RefreshCw,
  Globe,
  Lock,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Percent,
  FileCheck,
  Send,
  RefreshCw,
  Eye,
  Settings,
  Database,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface FiscalTransaction {
  id: string;
  type: 'facture' | 'avoir' | 'proforma';
  numero: string;
  montantHT: number;
  montantTTC: number;
  tva: number;
  client: string;
  date: Date;
  statut: 'en_attente' | 'transmis' | 'valide' | 'erreur';
  qrCode?: string;
  numeroFNE?: string;
  dateTransmission?: Date;
}

interface FiscalStats {
  totalFactures: number;
  totalTVA: number;
  totalHT: number;
  totalTTC: number;
  tauxConformite: number;
  facturesTransmises: number;
  facturesEnAttente: number;
  facturesErreur: number;
}

interface IvorianFiscalDashboardProps {
  className?: string;
}

export function IvorianFiscalDashboard({ className }: IvorianFiscalDashboardProps) {
  const [fiscalStats, setFiscalStats] = useState<FiscalStats | null>(null);
  const [transactions, setTransactions] = useState<FiscalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedToDGI, setIsConnectedToDGI] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mois');

  // Données simulées pour la démonstration
  const mockFiscalStats: FiscalStats = {
    totalFactures: 1247,
    totalTVA: 45680000, // 45,68M F CFA
    totalHT: 253777778, // 253,78M F CFA
    totalTTC: 299457778, // 299,46M F CFA
    tauxConformite: 98.5,
    facturesTransmises: 1225,
    facturesEnAttente: 15,
    facturesErreur: 7
  };

  const mockTransactions: FiscalTransaction[] = [
    {
      id: '1',
      type: 'facture',
      numero: 'FAC-2024-001247',
      montantHT: 850000,
      montantTTC: 1003000,
      tva: 153000,
      client: 'Hôtel Ivoire Palace',
      date: new Date('2024-09-13'),
      statut: 'valide',
      qrCode: 'QR-DGI-2024-001247',
      numeroFNE: 'FNE-CI-2024-001247',
      dateTransmission: new Date('2024-09-13T10:30:00')
    },
    {
      id: '2',
      type: 'facture',
      numero: 'FAC-2024-001246',
      montantHT: 1200000,
      montantTTC: 1416000,
      tva: 216000,
      client: 'Restaurant Akwaba',
      date: new Date('2024-09-13'),
      statut: 'transmis',
      qrCode: 'QR-DGI-2024-001246',
      numeroFNE: 'FNE-CI-2024-001246',
      dateTransmission: new Date('2024-09-13T09:15:00')
    },
    {
      id: '3',
      type: 'facture',
      numero: 'FAC-2024-001245',
      montantHT: 750000,
      montantTTC: 885000,
      tva: 135000,
      client: 'Société Teranga SARL',
      date: new Date('2024-09-12'),
      statut: 'en_attente',
      qrCode: 'QR-DGI-2024-001245'
    },
    {
      id: '4',
      type: 'avoir',
      numero: 'AV-2024-000012',
      montantHT: -150000,
      montantTTC: -177000,
      tva: -27000,
      client: 'Hôtel Baobab',
      date: new Date('2024-09-12'),
      statut: 'erreur'
    }
  ];

  // Données pour les graphiques fiscaux
  const tvaEvolutionData = [
    { mois: 'Jan', tva: 38500000, factures: 980 },
    { mois: 'Fév', tva: 42300000, factures: 1050 },
    { mois: 'Mar', tva: 39800000, factures: 1020 },
    { mois: 'Avr', tva: 44200000, factures: 1180 },
    { mois: 'Mai', tva: 41900000, factures: 1090 },
    { mois: 'Jun', tva: 46800000, factures: 1250 },
    { mois: 'Jul', tva: 43600000, factures: 1150 },
    { mois: 'Aoû', tva: 47200000, factures: 1280 },
    { mois: 'Sep', tva: 45680000, factures: 1247 }
  ];

  const repartitionTVAData = [
    { secteur: 'Hébergement', montant: 20500000, pourcentage: 45, color: '#8B4513' },
    { secteur: 'Restauration', montant: 13700000, pourcentage: 30, color: '#FFD700' },
    { secteur: 'Bar & Boissons', montant: 6850000, pourcentage: 15, color: '#D2691E' },
    { secteur: 'Services', montant: 4630000, pourcentage: 10, color: '#228B22' }
  ];

  const conformiteData = [
    { jour: 'Lun', conformite: 98.2, transmissions: 45 },
    { jour: 'Mar', conformite: 99.1, transmissions: 52 },
    { jour: 'Mer', conformite: 97.8, transmissions: 48 },
    { jour: 'Jeu', conformite: 98.9, transmissions: 56 },
    { jour: 'Ven', conformite: 99.3, transmissions: 62 },
    { jour: 'Sam', conformite: 98.7, transmissions: 58 },
    { jour: 'Dim', conformite: 98.5, transmissions: 41 }
  ];

  useEffect(() => {
    // Simulation du chargement des données fiscales
    setTimeout(() => {
      setFiscalStats(mockFiscalStats);
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1200);

    // Simulation de vérification de connexion DGI
    const checkDGIConnection = setInterval(() => {
      // Simulation d'une connexion stable à 95%
      setIsConnectedToDGI(Math.random() > 0.05);
    }, 30000);

    return () => clearInterval(checkDGIConnection);
  }, []);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'valide': return 'bg-green-100 text-green-800';
      case 'transmis': return 'bg-blue-100 text-blue-800';
      case 'en_attente': return 'bg-orange-100 text-orange-800';
      case 'erreur': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'valide': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'transmis': return <Send className="h-4 w-4 text-blue-600" />;
      case 'en_attente': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'erreur': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTransmissionFNE = async (transactionId: string) => {
    // Simulation de transmission vers FNE
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, statut: 'transmis', dateTransmission: new Date() }
        : t
    ));
  };

  const handleRetransmission = async () => {
    // Simulation de retransmission des factures en erreur
    setTransactions(prev => prev.map(t => 
      t.statut === 'erreur' 
        ? { ...t, statut: 'en_attente' }
        : t
    ));
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-green-50 to-emerald-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building className="h-8 w-8 animate-pulse text-green-600 mx-auto mb-4" />
            <p className="text-green-800">Connexion à la DGI Côte d'Ivoire...</p>
            <p className="text-sm text-green-600">Chargement des données fiscales</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut DGI */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Fiscalité Ivoirienne - DGI</CardTitle>
                <CardDescription className="text-green-100">
                  Intégration native avec la Direction Générale des Impôts
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${isConnectedToDGI ? 'bg-white/20' : 'bg-red-500'} text-white`}>
                <Globe className="h-3 w-3 mr-1" />
                {isConnectedToDGI ? 'DGI Connectée' : 'DGI Déconnectée'}
              </Badge>
              <Badge className="bg-white/20 text-white">
                🇨🇮 Côte d'Ivoire
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{fiscalStats?.tauxConformite}%</div>
              <div className="text-sm text-green-100">Conformité Fiscale</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{fiscalStats?.facturesTransmises}</div>
              <div className="text-sm text-green-100">Factures Transmises</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(fiscalStats?.totalTVA || 0)}</div>
              <div className="text-sm text-green-100">TVA Collectée</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{fiscalStats?.facturesEnAttente}</div>
              <div className="text-sm text-green-100">En Attente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes de conformité */}
      {!isConnectedToDGI && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Connexion DGI Interrompue</AlertTitle>
          <AlertDescription className="text-red-700">
            La connexion avec api.dgi.gouv.ci est temporairement indisponible. 
            Les factures sont mises en queue pour transmission automatique.
          </AlertDescription>
        </Alert>
      )}

      {fiscalStats && fiscalStats.facturesErreur > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            {fiscalStats.facturesErreur} Facture(s) en Erreur
          </AlertTitle>
          <AlertDescription className="text-orange-700 flex items-center justify-between">
            <span>Certaines factures nécessitent une retransmission vers la DGI.</span>
            <Button 
              size="sm" 
              onClick={handleRetransmission}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retransmettre
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jour">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="semaine">Cette Semaine</TabsTrigger>
          <TabsTrigger value="mois">Ce Mois</TabsTrigger>
          <TabsTrigger value="annee">Cette Année</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Statistiques fiscales principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Total HT</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(fiscalStats?.totalHT || 0)}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">TVA (18%)</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(fiscalStats?.totalTVA || 0)}
                    </p>
                  </div>
                  <Percent className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Total TTC</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(fiscalStats?.totalTTC || 0)}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Factures</p>
                    <p className="text-xl font-bold text-orange-900">
                      {fiscalStats?.totalFactures || 0}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques d'analyse fiscale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution TVA */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-900">Évolution TVA Collectée</CardTitle>
                <CardDescription>Suivi mensuel de la TVA selon réglementation ivoirienne</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tvaEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'tva' ? formatCurrency(value as number) : value,
                        name === 'tva' ? 'TVA Collectée' : 'Nombre de Factures'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tva" 
                      stroke="#228B22" 
                      strokeWidth={3}
                      name="TVA"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="factures" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      name="Factures"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition TVA par secteur */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-900">Répartition TVA par Secteur</CardTitle>
                <CardDescription>Analyse sectorielle de la collecte TVA</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={repartitionTVAData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="montant"
                      label={({ secteur, pourcentage }) => `${secteur}: ${pourcentage}%`}
                    >
                      {repartitionTVAData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conformité et transmissions */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-900">Conformité DGI et Transmissions</CardTitle>
              <CardDescription>Suivi quotidien de la conformité fiscale ivoirienne</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conformiteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="conformite" 
                    fill="#228B22" 
                    name="Conformité %"
                  />
                  <Bar 
                    dataKey="transmissions" 
                    fill="#FFD700" 
                    name="Transmissions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Liste des transactions récentes */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-900">Transactions Fiscales Récentes</CardTitle>
                  <CardDescription>Factures et avoirs avec statut DGI</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Synchroniser DGI
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatutIcon(transaction.statut)}
                        <div>
                          <p className="font-semibold text-sm">{transaction.numero}</p>
                          <p className="text-xs text-gray-600">{transaction.client}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.montantTTC)}</p>
                        <p className="text-xs text-gray-600">
                          TVA: {formatCurrency(transaction.tva)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatutColor(transaction.statut)}>
                        {transaction.statut.replace('_', ' ')}
                      </Badge>
                      
                      {transaction.qrCode && (
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-1" />
                          QR DGI
                        </Button>
                      )}
                      
                      {transaction.statut === 'en_attente' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleTransmissionFNE(transaction.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Transmettre
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration DGI */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration DGI Côte d'Ivoire
              </CardTitle>
              <CardDescription>
                Paramètres d'intégration avec la Direction Générale des Impôts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-endpoint">Point d'accès API DGI</Label>
                    <Input 
                      id="api-endpoint"
                      value="https://api.dgi.gouv.ci/v1"
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ifu">Identifiant Fiscal Unique (IFU)</Label>
                    <Input 
                      id="ifu"
                      value="1234567890123"
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="regime">Régime Fiscal</Label>
                    <Input 
                      id="regime"
                      value="Régime Réel Normal"
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Statut de Connexion</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800">Connecté à la DGI</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Dernière synchronisation: {new Date().toLocaleString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Fonctionnalités Actives</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>✅ Transmission automatique FNE</li>
                      <li>✅ Génération QR Codes DGI</li>
                      <li>✅ Archivage NF525</li>
                      <li>✅ Retry automatique</li>
                      <li>✅ Conformité SYSCOHADA</li>
                    </ul>
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

