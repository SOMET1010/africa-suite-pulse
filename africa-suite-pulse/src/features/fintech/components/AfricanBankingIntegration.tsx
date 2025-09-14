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
  Building2, 
  Banknote, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  Copy,
  Share2,
  Printer,
  FileText,
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Timer,
  Target,
  Coins,
  Wallet,
  Lock,
  Unlock,
  Star,
  Award,
  Flag,
  Home,
  Building,
  University,
  Landmark
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface BankAccount {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  accountType: 'checking' | 'savings' | 'business' | 'escrow';
  status: 'active' | 'inactive' | 'frozen' | 'pending';
  country: string;
  zone: 'UEMOA' | 'CEMAC' | 'Other';
  swiftCode: string;
  iban?: string;
  lastSync: Date;
  dailyLimit: number;
  monthlyLimit: number;
  fees: {
    transfer: number;
    withdrawal: number;
    maintenance: number;
  };
}

interface BankTransaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit' | 'transfer' | 'fee' | 'interest';
  amount: number;
  currency: string;
  reference: string;
  description: string;
  counterparty: string;
  counterpartyAccount?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  valueDate: Date;
  fees: number;
  exchangeRate?: number;
  hotelService?: string;
  customerReference?: string;
  regulatoryCode?: string;
}

interface CentralBankConnection {
  id: string;
  name: string;
  code: string;
  zone: 'UEMOA' | 'CEMAC';
  countries: string[];
  currency: string;
  apiEndpoint: string;
  status: 'connected' | 'disconnected' | 'maintenance';
  lastSync: Date;
  regulations: string[];
  reportingRequirements: string[];
}

interface AfricanBankingIntegrationProps {
  className?: string;
}

export function AfricanBankingIntegration({ className }: AfricanBankingIntegrationProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [centralBanks, setCentralBanks] = useState<CentralBankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDestination, setTransferDestination] = useState('');

  // Connexions banques centrales africaines
  const centralBankConnections: CentralBankConnection[] = [
    {
      id: 'bceao',
      name: 'Banque Centrale des États de l\'Afrique de l\'Ouest',
      code: 'BCEAO',
      zone: 'UEMOA',
      countries: ['Bénin', 'Burkina Faso', 'Côte d\'Ivoire', 'Guinée-Bissau', 'Mali', 'Niger', 'Sénégal', 'Togo'],
      currency: 'XOF',
      apiEndpoint: 'https://api.bceao.int/v2',
      status: 'connected',
      lastSync: new Date(),
      regulations: ['SYSCOHADA', 'UEMOA Banking Law', 'AML/CFT Directive'],
      reportingRequirements: ['Daily Position Report', 'Monthly Statistics', 'Suspicious Transaction Reports']
    },
    {
      id: 'beac',
      name: 'Banque des États de l\'Afrique Centrale',
      code: 'BEAC',
      zone: 'CEMAC',
      countries: ['Cameroun', 'République Centrafricaine', 'Tchad', 'République du Congo', 'Guinée Équatoriale', 'Gabon'],
      currency: 'XAF',
      apiEndpoint: 'https://api.beac.int/v2',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000), // 5 min ago
      regulations: ['CEMAC Banking Regulation', 'COBAC Prudential Rules', 'AML/CFT Framework'],
      reportingRequirements: ['Weekly Liquidity Report', 'Monthly Balance Sheet', 'Quarterly Risk Assessment']
    }
  ];

  // Comptes bancaires simulés
  const mockAccounts: BankAccount[] = [
    {
      id: 'acc_001',
      bankCode: 'CI-SGBCI',
      bankName: 'Société Générale Côte d\'Ivoire',
      accountNumber: '00123456789',
      accountName: 'Africa Suite Pulse SARL',
      currency: 'XOF',
      balance: 45680000, // 45.68M F CFA
      accountType: 'business',
      status: 'active',
      country: 'Côte d\'Ivoire',
      zone: 'UEMOA',
      swiftCode: 'SGBCCIAB',
      iban: 'CI93CI0123456789012345678901',
      lastSync: new Date(),
      dailyLimit: 50000000,
      monthlyLimit: 500000000,
      fees: {
        transfer: 2500,
        withdrawal: 1000,
        maintenance: 15000
      }
    },
    {
      id: 'acc_002',
      bankCode: 'CI-BACI',
      bankName: 'Bank of Africa Côte d\'Ivoire',
      accountNumber: '00987654321',
      accountName: 'Africa Suite Pulse - Escrow',
      currency: 'XOF',
      balance: 12340000, // 12.34M F CFA
      accountType: 'escrow',
      status: 'active',
      country: 'Côte d\'Ivoire',
      zone: 'UEMOA',
      swiftCode: 'BACIABCI',
      iban: 'CI93CI0987654321098765432109',
      lastSync: new Date(Date.now() - 600000), // 10 min ago
      dailyLimit: 20000000,
      monthlyLimit: 200000000,
      fees: {
        transfer: 3000,
        withdrawal: 1500,
        maintenance: 25000
      }
    },
    {
      id: 'acc_003',
      bankCode: 'SN-CBAO',
      bankName: 'Compagnie Bancaire de l\'Afrique Occidentale',
      accountNumber: '00555666777',
      accountName: 'Africa Suite Pulse Sénégal',
      currency: 'XOF',
      balance: 8750000, // 8.75M F CFA
      accountType: 'business',
      status: 'active',
      country: 'Sénégal',
      zone: 'UEMOA',
      swiftCode: 'CBAOSNDX',
      iban: 'SN12SN0555666777055566677705',
      lastSync: new Date(Date.now() - 1800000), // 30 min ago
      dailyLimit: 30000000,
      monthlyLimit: 300000000,
      fees: {
        transfer: 2000,
        withdrawal: 800,
        maintenance: 12000
      }
    },
    {
      id: 'acc_004',
      bankCode: 'CM-BICEC',
      bankName: 'Banque Internationale du Cameroun pour l\'Épargne et le Crédit',
      accountNumber: '00111222333',
      accountName: 'Africa Suite Pulse Cameroun',
      currency: 'XAF',
      balance: 15420000, // 15.42M F CFA
      accountType: 'business',
      status: 'active',
      country: 'Cameroun',
      zone: 'CEMAC',
      swiftCode: 'BICECMCX',
      lastSync: new Date(Date.now() - 900000), // 15 min ago
      dailyLimit: 25000000,
      monthlyLimit: 250000000,
      fees: {
        transfer: 2800,
        withdrawal: 1200,
        maintenance: 18000
      }
    }
  ];

  // Transactions bancaires simulées
  const mockTransactions: BankTransaction[] = [
    {
      id: '1',
      accountId: 'acc_001',
      type: 'credit',
      amount: 2450000,
      currency: 'XOF',
      reference: 'TRF-IN-001247',
      description: 'Virement client - Réservation groupe entreprise',
      counterparty: 'PETROCI Holding',
      counterpartyAccount: 'CI93CI0999888777099988877709',
      status: 'completed',
      timestamp: new Date('2024-09-13T14:30:00'),
      valueDate: new Date('2024-09-13T14:30:00'),
      fees: 2500,
      hotelService: 'Hébergement',
      customerReference: 'RES-2024-001247',
      regulatoryCode: 'BCEAO-TRF-001'
    },
    {
      id: '2',
      accountId: 'acc_001',
      type: 'debit',
      amount: 850000,
      currency: 'XOF',
      reference: 'TRF-OUT-001248',
      description: 'Paiement fournisseur - Approvisionnement restaurant',
      counterparty: 'SIVAC Côte d\'Ivoire',
      counterpartyAccount: 'CI93CI0777666555077766655507',
      status: 'completed',
      timestamp: new Date('2024-09-13T13:15:00'),
      valueDate: new Date('2024-09-13T13:15:00'),
      fees: 2500,
      hotelService: 'Restauration',
      customerReference: 'SUPP-2024-001248',
      regulatoryCode: 'BCEAO-TRF-002'
    },
    {
      id: '3',
      accountId: 'acc_002',
      type: 'transfer',
      amount: 1200000,
      currency: 'XOF',
      reference: 'ESC-TRF-001249',
      description: 'Transfert escrow vers compte principal',
      counterparty: 'Africa Suite Pulse SARL',
      counterpartyAccount: 'CI93CI0123456789012345678901',
      status: 'processing',
      timestamp: new Date('2024-09-13T12:45:00'),
      valueDate: new Date('2024-09-13T16:00:00'),
      fees: 3000,
      hotelService: 'Trésorerie',
      customerReference: 'ESC-2024-001249',
      regulatoryCode: 'BCEAO-ESC-001'
    },
    {
      id: '4',
      accountId: 'acc_003',
      type: 'credit',
      amount: 680000,
      currency: 'XOF',
      reference: 'TRF-IN-001250',
      description: 'Virement Orange Money - Paiements clients',
      counterparty: 'Orange Money Sénégal',
      counterpartyAccount: 'SN12SN0999888777099988877709',
      status: 'completed',
      timestamp: new Date('2024-09-13T11:20:00'),
      valueDate: new Date('2024-09-13T11:20:00'),
      fees: 2000,
      hotelService: 'Mobile Money',
      customerReference: 'OM-2024-001250',
      regulatoryCode: 'BCEAO-MM-001'
    },
    {
      id: '5',
      accountId: 'acc_004',
      type: 'debit',
      amount: 420000,
      currency: 'XAF',
      reference: 'TRF-OUT-001251',
      description: 'Paiement salaires équipe Cameroun',
      counterparty: 'Employés Africa Suite Cameroun',
      status: 'completed',
      timestamp: new Date('2024-09-13T10:00:00'),
      valueDate: new Date('2024-09-13T10:00:00'),
      fees: 2800,
      hotelService: 'RH',
      customerReference: 'SAL-2024-001251',
      regulatoryCode: 'BEAC-SAL-001'
    }
  ];

  // Données pour les graphiques
  const accountBalanceData = [
    { account: 'SGBCI Business', balance: 45680000, currency: 'XOF', zone: 'UEMOA' },
    { account: 'BOA Escrow', balance: 12340000, currency: 'XOF', zone: 'UEMOA' },
    { account: 'CBAO Sénégal', balance: 8750000, currency: 'XOF', zone: 'UEMOA' },
    { account: 'BICEC Cameroun', balance: 15420000, currency: 'XAF', zone: 'CEMAC' }
  ];

  const dailyFlowData = [
    { jour: 'Lun', entrees: 3200000, sorties: 1800000, net: 1400000 },
    { jour: 'Mar', entrees: 2800000, sorties: 2200000, net: 600000 },
    { jour: 'Mer', entrees: 4100000, sorties: 1600000, net: 2500000 },
    { jour: 'Jeu', entrees: 3600000, sorties: 2800000, net: 800000 },
    { jour: 'Ven', entrees: 5200000, sorties: 3400000, net: 1800000 },
    { jour: 'Sam', entrees: 2900000, sorties: 1200000, net: 1700000 },
    { jour: 'Dim', entrees: 1800000, sorties: 900000, net: 900000 }
  ];

  const zoneDistributionData = [
    { zone: 'UEMOA (XOF)', montant: 66770000, comptes: 3, pourcentage: 81.2 },
    { zone: 'CEMAC (XAF)', montant: 15420000, comptes: 1, pourcentage: 18.8 }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
      setCentralBanks(centralBankConnections);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'connected': return 'bg-green-100 text-green-800';
      case 'processing': case 'pending': return 'bg-orange-100 text-orange-800';
      case 'inactive': case 'failed': case 'disconnected': return 'bg-red-100 text-red-800';
      case 'frozen': case 'cancelled': case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'inactive': case 'failed': case 'disconnected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'frozen': case 'cancelled': case 'maintenance': return <Lock className="h-4 w-4 text-gray-600" />;
      default: return <Building2 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'debit': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'fee': return <Calculator className="h-4 w-4 text-orange-600" />;
      case 'interest': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Banknote className="h-4 w-4 text-gray-600" />;
    }
  };

  const getZoneFlag = (zone: string) => {
    switch (zone) {
      case 'UEMOA': return '🇨🇮'; // Représentant UEMOA
      case 'CEMAC': return '🇨🇲'; // Représentant CEMAC
      default: return '🌍';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTransfer = async () => {
    if (!selectedAccount || !transferAmount || !transferDestination) return;
    
    const newTransaction: BankTransaction = {
      id: Date.now().toString(),
      accountId: selectedAccount,
      type: 'transfer',
      amount: parseInt(transferAmount),
      currency: accounts.find(a => a.id === selectedAccount)?.currency || 'XOF',
      reference: `TRF-${Date.now()}`,
      description: 'Virement initié depuis dashboard',
      counterparty: transferDestination,
      status: 'pending',
      timestamp: new Date(),
      valueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // J+1
      fees: 2500,
      hotelService: 'Trésorerie',
      customerReference: `DASH-${Date.now()}`,
      regulatoryCode: 'BCEAO-TRF-DASH'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulation de traitement
    setTimeout(() => {
      setTransactions(prev => prev.map(t => 
        t.id === newTransaction.id 
          ? { ...t, status: 'processing' }
          : t
      ));
      
      setTimeout(() => {
        setTransactions(prev => prev.map(t => 
          t.id === newTransaction.id 
            ? { ...t, status: 'completed' }
            : t
        ));
      }, 3000);
    }, 2000);

    // Reset form
    setTransferAmount('');
    setTransferDestination('');
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-green-50 to-emerald-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="h-8 w-8 animate-pulse text-green-600 mx-auto mb-4" />
            <p className="text-green-800">Connexion aux banques centrales africaines...</p>
            <p className="text-sm text-green-600">BCEAO, BEAC et banques partenaires</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut global */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Intégration Bancaire Africaine</CardTitle>
                <CardDescription className="text-green-100">
                  Connexions BCEAO, BEAC et banques partenaires
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Globe className="h-3 w-3 mr-1" />
                2 Zones Monétaires
              </Badge>
              <Badge className="bg-white/20 text-white">
                🏦 {accounts.length} Comptes
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{accounts.length}</div>
              <div className="text-sm text-green-100">Comptes Bancaires</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </div>
              <div className="text-sm text-green-100">Solde Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{transactions.length}</div>
              <div className="text-sm text-green-100">Transactions Aujourd'hui</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {centralBanks.filter(cb => cb.status === 'connected').length}
              </div>
              <div className="text-sm text-green-100">Banques Centrales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes de conformité */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">
          Conformité Réglementaire Africaine
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Toutes les transactions sont conformes aux réglementations SYSCOHADA, BCEAO et BEAC.
          Rapports automatiques transmis aux autorités compétentes.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="central-banks">Banques Centrales</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques par zone monétaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇨🇮</span>
                  <div>
                    <CardTitle className="text-orange-900">Zone UEMOA</CardTitle>
                    <CardDescription>Franc CFA Ouest (XOF)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-orange-700">Comptes actifs :</span>
                    <span className="font-semibold text-orange-900">
                      {accounts.filter(a => a.zone === 'UEMOA').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Solde total :</span>
                    <span className="font-semibold text-orange-900">
                      {formatCurrency(accounts.filter(a => a.zone === 'UEMOA').reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Pays couverts :</span>
                    <span className="font-semibold text-orange-900">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇨🇲</span>
                  <div>
                    <CardTitle className="text-blue-900">Zone CEMAC</CardTitle>
                    <CardDescription>Franc CFA Central (XAF)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Comptes actifs :</span>
                    <span className="font-semibold text-blue-900">
                      {accounts.filter(a => a.zone === 'CEMAC').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Solde total :</span>
                    <span className="font-semibold text-blue-900">
                      {formatCurrency(accounts.filter(a => a.zone === 'CEMAC').reduce((sum, a) => sum + a.balance, 0), 'XAF')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Pays couverts :</span>
                    <span className="font-semibold text-blue-900">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de flux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flux quotidiens */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-900">Flux Bancaires Quotidiens</CardTitle>
                <CardDescription>Entrées, sorties et solde net par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line 
                      type="monotone" 
                      dataKey="entrees" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Entrées"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sorties" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Sorties"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Net"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par zone */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-900">Répartition par Zone Monétaire</CardTitle>
                <CardDescription>Distribution des avoirs bancaires</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={zoneDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="montant"
                      label={({ zone, pourcentage }) => `${zone}: ${pourcentage}%`}
                    >
                      {zoneDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#F59E0B' : '#3B82F6'
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

        <TabsContent value="accounts" className="space-y-6">
          {/* Liste des comptes bancaires */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accounts.map((account) => (
              <Card 
                key={account.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.bankName}</CardTitle>
                        <CardDescription>{account.accountName}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(account.status)}>
                        {getStatusIcon(account.status)}
                        <span className="ml-1 capitalize">{account.status}</span>
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getZoneFlag(account.zone)} {account.zone}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Numéro de compte</p>
                      <p className="font-semibold font-mono">{account.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Code SWIFT</p>
                      <p className="font-semibold font-mono">{account.swiftCode}</p>
                    </div>
                  </div>
                  
                  {account.iban && (
                    <div>
                      <p className="text-sm text-gray-600">IBAN</p>
                      <p className="font-semibold font-mono text-sm">{account.iban}</p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Solde disponible</span>
                      <span className="text-2xl font-bold text-green-900">
                        {formatCurrency(account.balance, account.currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Limite journalière</p>
                      <p className="font-semibold">{formatCurrency(account.dailyLimit, account.currency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limite mensuelle</p>
                      <p className="font-semibold">{formatCurrency(account.monthlyLimit, account.currency)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Frais bancaires :</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Virement</p>
                        <p className="font-semibold">{formatCurrency(account.fees.transfer, account.currency)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Retrait</p>
                        <p className="font-semibold">{formatCurrency(account.fees.withdrawal, account.currency)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Tenue</p>
                        <p className="font-semibold">{formatCurrency(account.fees.maintenance, account.currency)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedAccount(account.id)}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Virement
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      RIB
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulaire de virement */}
          {selectedAccount && (
            <Card className="bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-green-900">Nouveau Virement Bancaire</CardTitle>
                <CardDescription>
                  Initier un virement depuis {accounts.find(a => a.id === selectedAccount)?.bankName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="destination">Compte destinataire</Label>
                    <Input
                      id="destination"
                      value={transferDestination}
                      onChange={(e) => setTransferDestination(e.target.value)}
                      placeholder="CI93CI0999888777099988877709"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Montant ({accounts.find(a => a.id === selectedAccount)?.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="1000000"
                    />
                  </div>
                  
                  {transferAmount && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Résumé du virement</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Montant :</span>
                          <span className="font-semibold">
                            {formatCurrency(parseInt(transferAmount) || 0, accounts.find(a => a.id === selectedAccount)?.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais :</span>
                          <span>
                            {formatCurrency(accounts.find(a => a.id === selectedAccount)?.fees.transfer || 0, accounts.find(a => a.id === selectedAccount)?.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total à débiter :</span>
                          <span>
                            {formatCurrency((parseInt(transferAmount) || 0) + (accounts.find(a => a.id === selectedAccount)?.fees.transfer || 0), accounts.find(a => a.id === selectedAccount)?.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleTransfer}
                    disabled={!transferAmount || !transferDestination}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Initier le Virement
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedAccount('')}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Liste des transactions */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-900">Transactions Bancaires</CardTitle>
                  <CardDescription>Historique des mouvements sur tous les comptes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Synchroniser
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
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-semibold text-sm">{transaction.reference}</p>
                          <p className="text-xs text-gray-600">{transaction.counterparty}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {accounts.find(a => a.id === transaction.accountId)?.bankName}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Frais: {formatCurrency(transaction.fees, transaction.currency)}
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
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="central-banks" className="space-y-6">
          {/* Connexions banques centrales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {centralBanks.map((bank) => (
              <Card 
                key={bank.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Landmark className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bank.code}</CardTitle>
                        <CardDescription>{bank.name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(bank.status)}>
                      {getStatusIcon(bank.status)}
                      <span className="ml-1 capitalize">{bank.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Zone monétaire</p>
                      <p className="font-semibold">{getZoneFlag(bank.zone)} {bank.zone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Devise</p>
                      <p className="font-semibold">{bank.currency}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Pays membres :</p>
                    <div className="flex flex-wrap gap-1">
                      {bank.countries.map((country, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Réglementations :</p>
                    <div className="space-y-1">
                      {bank.regulations.map((regulation, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{regulation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Rapports obligatoires :</p>
                    <div className="space-y-1">
                      {bank.reportingRequirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={bank.status !== 'connected'}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurer Connexion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Tableau de bord conformité */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-900">Tableau de Bord Conformité</CardTitle>
              <CardDescription>
                Suivi des obligations réglementaires SYSCOHADA, BCEAO et BEAC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">Conformité SYSCOHADA</p>
                    <p className="text-2xl font-bold text-green-800">100%</p>
                    <p className="text-sm text-green-600">Toutes obligations respectées</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-blue-900">Rapports BCEAO/BEAC</p>
                    <p className="text-2xl font-bold text-blue-800">À jour</p>
                    <p className="text-sm text-blue-600">Dernière transmission: Aujourd'hui</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-semibold text-orange-900">Alertes AML/CFT</p>
                    <p className="text-2xl font-bold text-orange-800">0</p>
                    <p className="text-sm text-orange-600">Aucune transaction suspecte</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Prochaines échéances réglementaires :</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Rapport mensuel BCEAO</p>
                        <p className="text-sm text-blue-700">Position de change et liquidité</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Dans 5 jours
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Déclaration trimestrielle BEAC</p>
                        <p className="text-sm text-green-700">Évaluation des risques</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Dans 12 jours
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-900">Audit AML/CFT</p>
                        <p className="text-sm text-orange-700">Contrôle annuel obligatoire</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Dans 45 jours
                    </Badge>
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

