import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Smartphone, 
  Send, 
  Download, 
  CreditCard, 
  Wallet, 
  QrCode,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  RefreshCw,
  Eye,
  Settings,
  Phone,
  MessageSquare,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Star,
  Award,
  Target,
  Coins
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface MobileMoneyProvider {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo: string;
  countries: string[];
  apiEndpoint: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  fees: {
    send: number;
    receive: number;
    cashout: number;
  };
}

interface MobileMoneyTransaction {
  id: string;
  type: 'send' | 'receive' | 'cashout' | 'cashin' | 'payment';
  provider: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  customerName: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  timestamp: Date;
  fees: number;
  description: string;
  hotelService?: string;
}

interface MobileMoneyStats {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageAmount: number;
  topProvider: string;
  dailyVolume: number;
  monthlyVolume: number;
  pendingTransactions: number;
}

interface AfricanMobileMoneyDashboardProps {
  className?: string;
}

export function AfricanMobileMoneyDashboard({ className }: AfricanMobileMoneyDashboardProps) {
  const [stats, setStats] = useState<MobileMoneyStats | null>(null);
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [providers, setProviders] = useState<MobileMoneyProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fournisseurs Mobile Money africains
  const mobileMoneyProviders: MobileMoneyProvider[] = [
    {
      id: 'orange',
      name: 'Orange Money',
      shortName: 'OM',
      color: '#FF6600',
      logo: '🟠',
      countries: ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Niger'],
      apiEndpoint: 'https://api.orange.com/orange-money-webpay/dev/v1',
      isActive: true,
      dailyLimit: 1000000, // 1M F CFA
      monthlyLimit: 5000000, // 5M F CFA
      fees: {
        send: 1.5, // %
        receive: 0,
        cashout: 2.0
      }
    },
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      shortName: 'MTN',
      color: '#FFCC00',
      logo: '🟡',
      countries: ['Côte d\'Ivoire', 'Ghana', 'Cameroun', 'Ouganda', 'Rwanda'],
      apiEndpoint: 'https://sandbox.momodeveloper.mtn.com',
      isActive: true,
      dailyLimit: 2000000, // 2M F CFA
      monthlyLimit: 10000000, // 10M F CFA
      fees: {
        send: 1.2,
        receive: 0,
        cashout: 1.8
      }
    },
    {
      id: 'moov',
      name: 'Moov Money',
      shortName: 'MOOV',
      color: '#0066CC',
      logo: '🔵',
      countries: ['Côte d\'Ivoire', 'Bénin', 'Togo', 'Burkina Faso'],
      apiEndpoint: 'https://api.moov-africa.com/v1',
      isActive: true,
      dailyLimit: 500000, // 500K F CFA
      monthlyLimit: 3000000, // 3M F CFA
      fees: {
        send: 1.8,
        receive: 0,
        cashout: 2.2
      }
    },
    {
      id: 'wave',
      name: 'Wave Money',
      shortName: 'WAVE',
      color: '#00D4AA',
      logo: '🌊',
      countries: ['Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso'],
      apiEndpoint: 'https://api.wave.com/v1',
      isActive: true,
      dailyLimit: 1500000,
      monthlyLimit: 7500000,
      fees: {
        send: 0, // Gratuit
        receive: 0,
        cashout: 1.0
      }
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      shortName: 'AIRTEL',
      color: '#E60012',
      logo: '🔴',
      countries: ['Niger', 'Tchad', 'Madagascar', 'Zambie'],
      apiEndpoint: 'https://openapiuat.airtel.africa',
      isActive: true,
      dailyLimit: 800000,
      monthlyLimit: 4000000,
      fees: {
        send: 1.5,
        receive: 0,
        cashout: 2.0
      }
    }
  ];

  // Transactions simulées
  const mockTransactions: MobileMoneyTransaction[] = [
    {
      id: '1',
      type: 'payment',
      provider: 'orange',
      amount: 125000,
      currency: 'XOF',
      phoneNumber: '+225 07 12 34 56 78',
      customerName: 'Kouassi Akwaba',
      reference: 'HTL-PAY-001247',
      status: 'success',
      timestamp: new Date('2024-09-13T14:30:00'),
      fees: 1875,
      description: 'Paiement chambre Deluxe - 2 nuits',
      hotelService: 'Hébergement'
    },
    {
      id: '2',
      type: 'payment',
      provider: 'mtn',
      amount: 85000,
      currency: 'XOF',
      phoneNumber: '+233 24 567 89 01',
      customerName: 'Kwame Mensah',
      reference: 'HTL-PAY-001248',
      status: 'success',
      timestamp: new Date('2024-09-13T13:15:00'),
      fees: 1020,
      description: 'Restaurant - Dîner gastronomique',
      hotelService: 'Restauration'
    },
    {
      id: '3',
      type: 'payment',
      provider: 'wave',
      amount: 45000,
      currency: 'XOF',
      phoneNumber: '+221 77 123 45 67',
      customerName: 'Aminata Diallo',
      reference: 'HTL-PAY-001249',
      status: 'pending',
      timestamp: new Date('2024-09-13T12:45:00'),
      fees: 0,
      description: 'Spa - Massage traditionnel',
      hotelService: 'Bien-être'
    },
    {
      id: '4',
      type: 'cashout',
      provider: 'moov',
      amount: 200000,
      currency: 'XOF',
      phoneNumber: '+225 05 98 76 54 32',
      customerName: 'Hôtel Baobab',
      reference: 'HTL-OUT-001250',
      status: 'success',
      timestamp: new Date('2024-09-13T11:20:00'),
      fees: 4400,
      description: 'Retrait espèces - Caisse hôtel',
      hotelService: 'Trésorerie'
    }
  ];

  const mockStats: MobileMoneyStats = {
    totalTransactions: 1247,
    totalVolume: 45680000, // 45.68M F CFA
    successRate: 97.8,
    averageAmount: 36650,
    topProvider: 'Orange Money',
    dailyVolume: 2340000,
    monthlyVolume: 45680000,
    pendingTransactions: 12
  };

  // Données pour les graphiques
  const volumeData = [
    { jour: 'Lun', orange: 850000, mtn: 650000, moov: 320000, wave: 180000, airtel: 120000 },
    { jour: 'Mar', orange: 920000, mtn: 720000, moov: 380000, wave: 220000, airtel: 150000 },
    { jour: 'Mer', orange: 780000, mtn: 580000, moov: 290000, wave: 160000, airtel: 110000 },
    { jour: 'Jeu', orange: 1100000, mtn: 850000, moov: 420000, wave: 280000, airtel: 180000 },
    { jour: 'Ven', orange: 1250000, mtn: 950000, moov: 480000, wave: 320000, airtel: 200000 },
    { jour: 'Sam', orange: 980000, mtn: 750000, moov: 360000, wave: 240000, airtel: 160000 },
    { jour: 'Dim', orange: 650000, mtn: 480000, moov: 240000, wave: 140000, airtel: 90000 }
  ];

  const providerDistributionData = [
    { provider: 'Orange Money', volume: 18500000, transactions: 485, color: '#FF6600' },
    { provider: 'MTN Money', volume: 14200000, transactions: 378, color: '#FFCC00' },
    { provider: 'Wave Money', volume: 7800000, transactions: 245, color: '#00D4AA' },
    { provider: 'Moov Money', volume: 3900000, transactions: 98, color: '#0066CC' },
    { provider: 'Airtel Money', volume: 1280000, transactions: 41, color: '#E60012' }
  ];

  const serviceTypeData = [
    { service: 'Hébergement', montant: 28500000, pourcentage: 62.4 },
    { service: 'Restauration', montant: 12300000, pourcentage: 26.9 },
    { service: 'Bien-être', montant: 3200000, pourcentage: 7.0 },
    { service: 'Autres', montant: 1680000, pourcentage: 3.7 }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setStats(mockStats);
      setTransactions(mockTransactions);
      setProviders(mobileMoneyProviders);
      setIsLoading(false);
    }, 1200);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default: return <Smartphone className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'send': return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      case 'receive': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'cashout': return <Banknote className="h-4 w-4 text-purple-600" />;
      case 'cashin': return <Wallet className="h-4 w-4 text-indigo-600" />;
      default: return <Smartphone className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!selectedProvider || !paymentAmount || !phoneNumber) return;
    
    // Simulation de traitement de paiement
    const newTransaction: MobileMoneyTransaction = {
      id: Date.now().toString(),
      type: 'payment',
      provider: selectedProvider,
      amount: parseInt(paymentAmount),
      currency: 'XOF',
      phoneNumber: phoneNumber,
      customerName: 'Client Test',
      reference: `HTL-PAY-${Date.now()}`,
      status: 'pending',
      timestamp: new Date(),
      fees: parseInt(paymentAmount) * 0.015,
      description: 'Paiement test depuis dashboard',
      hotelService: 'Test'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulation de confirmation après 3 secondes
    setTimeout(() => {
      setTransactions(prev => prev.map(t => 
        t.id === newTransaction.id 
          ? { ...t, status: Math.random() > 0.1 ? 'success' : 'failed' }
          : t
      ));
    }, 3000);

    // Reset form
    setPaymentAmount('');
    setPhoneNumber('');
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-orange-50 to-yellow-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Smartphone className="h-8 w-8 animate-pulse text-orange-600 mx-auto mb-4" />
            <p className="text-orange-800">Connexion aux opérateurs Mobile Money...</p>
            <p className="text-sm text-orange-600">Orange, MTN, Moov, Wave, Airtel</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut global */}
      <Card className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Mobile Money Africain</CardTitle>
                <CardDescription className="text-orange-100">
                  Intégration native avec tous les opérateurs africains
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Globe className="h-3 w-3 mr-1" />
                5 Opérateurs
              </Badge>
              <Badge className="bg-white/20 text-white">
                📱 Mobile Money
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.totalTransactions}</div>
              <div className="text-sm text-orange-100">Transactions Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(stats?.totalVolume || 0)}</div>
              <div className="text-sm text-orange-100">Volume Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.successRate}%</div>
              <div className="text-sm text-orange-100">Taux de Succès</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.pendingTransactions}</div>
              <div className="text-sm text-orange-100">En Attente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes de statut */}
      {stats && stats.pendingTransactions > 10 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            {stats.pendingTransactions} Transactions en Attente
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Plusieurs paiements Mobile Money nécessitent une vérification manuelle.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="providers">Opérateurs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment">Nouveau Paiement</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Volume Journalier</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(stats?.dailyVolume || 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Montant Moyen</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(stats?.averageAmount || 0)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Top Opérateur</p>
                    <p className="text-lg font-bold text-purple-900">{stats?.topProvider}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Taux Succès</p>
                    <p className="text-xl font-bold text-orange-900">{stats?.successRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de volume */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume par opérateur */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-900">Volume par Opérateur Mobile Money</CardTitle>
                <CardDescription>Évolution hebdomadaire des transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line 
                      type="monotone" 
                      dataKey="orange" 
                      stroke="#FF6600" 
                      strokeWidth={3}
                      name="Orange Money"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mtn" 
                      stroke="#FFCC00" 
                      strokeWidth={2}
                      name="MTN Money"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wave" 
                      stroke="#00D4AA" 
                      strokeWidth={2}
                      name="Wave Money"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="moov" 
                      stroke="#0066CC" 
                      strokeWidth={2}
                      name="Moov Money"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="airtel" 
                      stroke="#E60012" 
                      strokeWidth={2}
                      name="Airtel Money"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par service */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-900">Paiements par Service Hôtelier</CardTitle>
                <CardDescription>Distribution des revenus Mobile Money</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="montant"
                      label={({ service, pourcentage }) => `${service}: ${pourcentage}%`}
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#FF6600' :
                          index === 1 ? '#FFCC00' :
                          index === 2 ? '#00D4AA' : '#0066CC'
                        } />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* Liste des opérateurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card 
                key={provider.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="text-2xl p-2 rounded-full"
                        style={{ backgroundColor: `${provider.color}20` }}
                      >
                        {provider.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg" style={{ color: provider.color }}>
                          {provider.name}
                        </CardTitle>
                        <CardDescription>{provider.shortName}</CardDescription>
                      </div>
                    </div>
                    <Badge className={provider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {provider.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Pays supportés :</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.countries.map((country, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Limite journalière</p>
                      <p className="font-semibold">{formatCurrency(provider.dailyLimit)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limite mensuelle</p>
                      <p className="font-semibold">{formatCurrency(provider.monthlyLimit)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Frais de transaction :</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Envoi</p>
                        <p className="font-semibold">{provider.fees.send}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Réception</p>
                        <p className="font-semibold">{provider.fees.receive}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Retrait</p>
                        <p className="font-semibold">{provider.fees.cashout}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      style={{ borderColor: provider.color, color: provider.color }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Liste des transactions */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900">Transactions Mobile Money Récentes</CardTitle>
                  <CardDescription>Historique des paiements et transferts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Actualiser
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
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="font-semibold text-sm">{transaction.reference}</p>
                          <p className="text-xs text-gray-600">{transaction.customerName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className="text-lg"
                          style={{ 
                            color: providers.find(p => p.id === transaction.provider)?.color 
                          }}
                        >
                          {providers.find(p => p.id === transaction.provider)?.logo}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.phoneNumber}</p>
                          <p className="text-xs text-gray-500">
                            {providers.find(p => p.id === transaction.provider)?.shortName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                        <p className="text-xs text-gray-600">
                          Frais: {formatCurrency(transaction.fees)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.timestamp.toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transaction.status === 'pending' && (
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {/* Nouveau paiement */}
          <Card className="bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-orange-900">Nouveau Paiement Mobile Money</CardTitle>
              <CardDescription>
                Initier un paiement via les opérateurs africains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider">Opérateur Mobile Money</Label>
                  <select 
                    id="provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Sélectionner un opérateur</option>
                    {providers.filter(p => p.isActive).map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.logo} {provider.name} - {provider.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 12 34 56 78"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Montant (F CFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="50000"
                  />
                </div>
                
                {selectedProvider && paymentAmount && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Résumé du paiement</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Montant :</span>
                        <span className="font-semibold">{formatCurrency(parseInt(paymentAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais ({providers.find(p => p.id === selectedProvider)?.fees.send}%) :</span>
                        <span>{formatCurrency((parseInt(paymentAmount) || 0) * (providers.find(p => p.id === selectedProvider)?.fees.send || 0) / 100)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total :</span>
                        <span>{formatCurrency((parseInt(paymentAmount) || 0) * (1 + (providers.find(p => p.id === selectedProvider)?.fees.send || 0) / 100))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handlePayment}
                  disabled={!selectedProvider || !paymentAmount || !phoneNumber}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Initier le Paiement
                </Button>
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics avancées */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-900">Analytics Mobile Money Avancées</CardTitle>
              <CardDescription>Insights et tendances des paiements mobiles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={providerDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'volume' ? formatCurrency(value as number) : value,
                      name === 'volume' ? 'Volume' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="volume" name="Volume">
                    {providerDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="transactions" name="Transactions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

