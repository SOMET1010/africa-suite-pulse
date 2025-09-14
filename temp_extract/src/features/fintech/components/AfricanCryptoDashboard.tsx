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
  Coins, 
  Bitcoin, 
  TrendingUp,
  TrendingDown,
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
  Calculator,
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
  Banknote,
  Wallet,
  Lock,
  Unlock,
  Star,
  Award,
  Flag,
  Smartphone,
  CreditCard,
  QrCode,
  Nfc,
  Building2,
  University,
  Landmark,
  Sparkles,
  Crown,
  Gem,
  Hexagon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

interface AfricanCrypto {
  id: string;
  name: string;
  symbol: string;
  fullName: string;
  country: string;
  flag: string;
  description: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply?: number;
  rank: number;
  isNative: boolean;
  useCase: string;
  blockchain: string;
  consensus: string;
  launchDate: Date;
  website: string;
  whitepaper: string;
  socialMedia: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

interface CryptoTransaction {
  id: string;
  type: 'buy' | 'sell' | 'send' | 'receive' | 'stake' | 'unstake' | 'swap';
  cryptoId: string;
  amount: number;
  priceAtTime: number;
  totalValue: number;
  fees: number;
  fromAddress?: string;
  toAddress?: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  timestamp: Date;
  confirmations: number;
  requiredConfirmations: number;
  hotelService?: string;
  customerReference?: string;
}

interface CryptoWallet {
  id: string;
  name: string;
  type: 'hot' | 'cold' | 'hardware' | 'multisig';
  address: string;
  cryptoId: string;
  balance: number;
  balanceUSD: number;
  balanceXOF: number;
  isActive: boolean;
  lastActivity: Date;
  securityLevel: 'basic' | 'enhanced' | 'enterprise';
  stakingRewards?: number;
  stakingAPY?: number;
}

interface AfricanCryptoDashboardProps {
  className?: string;
}

export function AfricanCryptoDashboard({ className }: AfricanCryptoDashboardProps) {
  const [cryptos, setCryptos] = useState<AfricanCrypto[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // Crypto-monnaies africaines et supportées
  const africanCryptos: AfricanCrypto[] = [
    {
      id: 'akoin',
      name: 'Akoin',
      symbol: 'AKN',
      fullName: 'Akoin',
      country: 'Sénégal',
      flag: '🇸🇳',
      description: 'Crypto-monnaie panafricaine créée par Akon pour l\'écosystème Akon City',
      currentPrice: 0.0234, // USD
      priceChange24h: 0.0012,
      priceChangePercent24h: 5.4,
      marketCap: 23400000,
      volume24h: 1200000,
      circulatingSupply: 1000000000,
      totalSupply: 5000000000,
      maxSupply: 5000000000,
      rank: 1,
      isNative: true,
      useCase: 'Paiements, DeFi, Écosystème Akon City',
      blockchain: 'Stellar',
      consensus: 'Stellar Consensus Protocol',
      launchDate: new Date('2020-05-15'),
      website: 'https://akoin.io',
      whitepaper: 'https://akoin.io/whitepaper',
      socialMedia: {
        twitter: '@akoin_official',
        telegram: 'akoin_official'
      }
    },
    {
      id: 'celo',
      name: 'Celo',
      symbol: 'CELO',
      fullName: 'Celo',
      country: 'Global (Focus Afrique)',
      flag: '🌍',
      description: 'Blockchain mobile-first pour l\'inclusion financière en Afrique',
      currentPrice: 0.68,
      priceChange24h: -0.023,
      priceChangePercent24h: -3.3,
      marketCap: 340000000,
      volume24h: 15600000,
      circulatingSupply: 500000000,
      totalSupply: 1000000000,
      maxSupply: 1000000000,
      rank: 2,
      isNative: false,
      useCase: 'Paiements mobiles, Stablecoins, DeFi',
      blockchain: 'Celo',
      consensus: 'Proof of Stake',
      launchDate: new Date('2020-04-22'),
      website: 'https://celo.org',
      whitepaper: 'https://celo.org/papers',
      socialMedia: {
        twitter: '@CeloOrg',
        discord: 'celo'
      }
    },
    {
      id: 'cudos',
      name: 'Cudos',
      symbol: 'CUDOS',
      fullName: 'Cudos Network',
      country: 'Afrique du Sud',
      flag: '🇿🇦',
      description: 'Réseau de cloud computing décentralisé avec focus sur l\'Afrique',
      currentPrice: 0.0089,
      priceChange24h: 0.0004,
      priceChangePercent24h: 4.7,
      marketCap: 89000000,
      volume24h: 2300000,
      circulatingSupply: 10000000000,
      totalSupply: 10000000000,
      rank: 3,
      isNative: true,
      useCase: 'Cloud computing, NFTs, Gaming',
      blockchain: 'Cosmos',
      consensus: 'Tendermint',
      launchDate: new Date('2021-01-15'),
      website: 'https://cudos.org',
      whitepaper: 'https://cudos.org/whitepaper',
      socialMedia: {
        twitter: '@CUDOS_',
        telegram: 'cudostelegram'
      }
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      fullName: 'Bitcoin',
      country: 'Global',
      flag: '🌍',
      description: 'Première crypto-monnaie, largement adoptée en Afrique',
      currentPrice: 43250.00,
      priceChange24h: 1250.00,
      priceChangePercent24h: 2.98,
      marketCap: 847000000000,
      volume24h: 18500000000,
      circulatingSupply: 19600000,
      totalSupply: 19600000,
      maxSupply: 21000000,
      rank: 4,
      isNative: false,
      useCase: 'Réserve de valeur, Paiements internationaux',
      blockchain: 'Bitcoin',
      consensus: 'Proof of Work',
      launchDate: new Date('2009-01-03'),
      website: 'https://bitcoin.org',
      whitepaper: 'https://bitcoin.org/bitcoin.pdf',
      socialMedia: {
        twitter: '@bitcoin'
      }
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      fullName: 'USD Coin',
      country: 'Global',
      flag: '🇺🇸',
      description: 'Stablecoin adossé au dollar américain, populaire en Afrique',
      currentPrice: 1.00,
      priceChange24h: 0.001,
      priceChangePercent24h: 0.1,
      marketCap: 25000000000,
      volume24h: 3200000000,
      circulatingSupply: 25000000000,
      totalSupply: 25000000000,
      rank: 5,
      isNative: false,
      useCase: 'Stablecoin, Paiements, Trading',
      blockchain: 'Ethereum',
      consensus: 'Proof of Stake',
      launchDate: new Date('2018-09-26'),
      website: 'https://centre.io',
      whitepaper: 'https://centre.io/pdfs/centre-whitepaper.pdf',
      socialMedia: {
        twitter: '@centre_io'
      }
    }
  ];

  // Portefeuilles crypto simulés
  const mockWallets: CryptoWallet[] = [
    {
      id: 'wallet_001',
      name: 'Portefeuille Principal Akoin',
      type: 'hot',
      address: 'GAKOIN123456789ABCDEF123456789ABCDEF123456789',
      cryptoId: 'akoin',
      balance: 125000,
      balanceUSD: 2925,
      balanceXOF: 1755000,
      isActive: true,
      lastActivity: new Date(),
      securityLevel: 'enhanced',
      stakingRewards: 156.78,
      stakingAPY: 12.5
    },
    {
      id: 'wallet_002',
      name: 'Portefeuille Celo Mobile',
      type: 'hot',
      address: '0xCELO123456789ABCDEF123456789ABCDEF12345678',
      cryptoId: 'celo',
      balance: 2500,
      balanceUSD: 1700,
      balanceXOF: 1020000,
      isActive: true,
      lastActivity: new Date(Date.now() - 300000),
      securityLevel: 'basic'
    },
    {
      id: 'wallet_003',
      name: 'Portefeuille Bitcoin Sécurisé',
      type: 'cold',
      address: 'bc1qBTC123456789ABCDEF123456789ABCDEF123456789',
      cryptoId: 'bitcoin',
      balance: 0.05,
      balanceUSD: 2162.5,
      balanceXOF: 1297500,
      isActive: true,
      lastActivity: new Date(Date.now() - 86400000),
      securityLevel: 'enterprise'
    },
    {
      id: 'wallet_004',
      name: 'Portefeuille USDC Stable',
      type: 'hot',
      address: '0xUSDC123456789ABCDEF123456789ABCDEF12345678',
      cryptoId: 'usdc',
      balance: 5000,
      balanceUSD: 5000,
      balanceXOF: 3000000,
      isActive: true,
      lastActivity: new Date(Date.now() - 1800000),
      securityLevel: 'enhanced'
    }
  ];

  // Transactions crypto simulées
  const mockTransactions: CryptoTransaction[] = [
    {
      id: '1',
      type: 'receive',
      cryptoId: 'akoin',
      amount: 5000,
      priceAtTime: 0.0234,
      totalValue: 117,
      fees: 0.5,
      fromAddress: 'GAKOIN987654321FEDCBA987654321FEDCBA987654321',
      toAddress: 'GAKOIN123456789ABCDEF123456789ABCDEF123456789',
      txHash: '0xakoin123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
      status: 'confirmed',
      timestamp: new Date('2024-09-13T14:30:00'),
      confirmations: 15,
      requiredConfirmations: 6,
      hotelService: 'Paiement client',
      customerReference: 'PAY-AKN-001247'
    },
    {
      id: '2',
      type: 'buy',
      cryptoId: 'celo',
      amount: 500,
      priceAtTime: 0.68,
      totalValue: 340,
      fees: 3.4,
      txHash: '0xcelo123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
      status: 'confirmed',
      timestamp: new Date('2024-09-13T13:15:00'),
      confirmations: 25,
      requiredConfirmations: 12,
      hotelService: 'Achat crypto',
      customerReference: 'BUY-CELO-001248'
    },
    {
      id: '3',
      type: 'stake',
      cryptoId: 'akoin',
      amount: 10000,
      priceAtTime: 0.0234,
      totalValue: 234,
      fees: 0,
      txHash: '0xstake123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
      status: 'confirmed',
      timestamp: new Date('2024-09-13T12:45:00'),
      confirmations: 50,
      requiredConfirmations: 6,
      hotelService: 'Staking rewards',
      customerReference: 'STAKE-AKN-001249'
    },
    {
      id: '4',
      type: 'send',
      cryptoId: 'bitcoin',
      amount: 0.001,
      priceAtTime: 43250,
      totalValue: 43.25,
      fees: 2.5,
      fromAddress: 'bc1qBTC123456789ABCDEF123456789ABCDEF123456789',
      toAddress: 'bc1qBTC987654321FEDCBA987654321FEDCBA987654321',
      txHash: '0xbtc123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
      status: 'pending',
      timestamp: new Date('2024-09-13T11:20:00'),
      confirmations: 2,
      requiredConfirmations: 6,
      hotelService: 'Paiement fournisseur',
      customerReference: 'PAY-BTC-001250'
    }
  ];

  // Données pour les graphiques
  const priceHistoryData = [
    { date: '09/07', akoin: 0.0198, celo: 0.72, bitcoin: 41200, usdc: 1.00 },
    { date: '09/08', akoin: 0.0205, celo: 0.69, bitcoin: 42100, usdc: 1.00 },
    { date: '09/09', akoin: 0.0212, celo: 0.71, bitcoin: 41800, usdc: 0.999 },
    { date: '09/10', akoin: 0.0219, celo: 0.68, bitcoin: 42500, usdc: 1.001 },
    { date: '09/11', akoin: 0.0226, celo: 0.70, bitcoin: 43000, usdc: 1.00 },
    { date: '09/12', akoin: 0.0222, celo: 0.70, bitcoin: 42800, usdc: 1.00 },
    { date: '09/13', akoin: 0.0234, celo: 0.68, bitcoin: 43250, usdc: 1.00 }
  ];

  const portfolioDistributionData = [
    { crypto: 'Akoin (AKN)', valeur: 1755000, pourcentage: 23.4 },
    { crypto: 'Bitcoin (BTC)', valeur: 1297500, pourcentage: 17.3 },
    { crypto: 'Celo (CELO)', valeur: 1020000, pourcentage: 13.6 },
    { crypto: 'USDC', valeur: 3000000, pourcentage: 40.0 },
    { crypto: 'Autres', valeur: 427500, pourcentage: 5.7 }
  ];

  const tradingVolumeData = [
    { heure: '08h', volume: 45000, transactions: 12 },
    { heure: '10h', volume: 78000, transactions: 23 },
    { heure: '12h', volume: 125000, transactions: 34 },
    { heure: '14h', volume: 98000, transactions: 28 },
    { heure: '16h', volume: 156000, transactions: 45 },
    { heure: '18h', volume: 203000, transactions: 56 },
    { heure: '20h', volume: 178000, transactions: 41 },
    { heure: '22h', volume: 89000, transactions: 19 }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setCryptos(africanCryptos);
      setTransactions(mockTransactions);
      setWallets(mockWallets);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default: return <Coins className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'sell': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'send': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'receive': return <Download className="h-4 w-4 text-green-600" />;
      case 'stake': return <Lock className="h-4 w-4 text-purple-600" />;
      case 'unstake': return <Unlock className="h-4 w-4 text-orange-600" />;
      case 'swap': return <RefreshCw className="h-4 w-4 text-indigo-600" />;
      default: return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const getWalletTypeIcon = (type: string) => {
    switch (type) {
      case 'hot': return <Smartphone className="h-4 w-4 text-orange-600" />;
      case 'cold': return <Lock className="h-4 w-4 text-blue-600" />;
      case 'hardware': return <Shield className="h-4 w-4 text-green-600" />;
      case 'multisig': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-orange-100 text-orange-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'XOF' ? 0 : 2
    }).format(amount);
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: symbol === 'BTC' ? 8 : 4,
      maximumFractionDigits: symbol === 'BTC' ? 8 : 4
    })} ${symbol}`;
  };

  const handleTrade = async () => {
    if (!selectedCrypto || !tradeAmount) return;
    
    const crypto = cryptos.find(c => c.id === selectedCrypto);
    if (!crypto) return;

    const newTransaction: CryptoTransaction = {
      id: Date.now().toString(),
      type: tradeType,
      cryptoId: selectedCrypto,
      amount: parseFloat(tradeAmount),
      priceAtTime: crypto.currentPrice,
      totalValue: parseFloat(tradeAmount) * crypto.currentPrice,
      fees: parseFloat(tradeAmount) * crypto.currentPrice * 0.01, // 1% fees
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
      status: 'pending',
      timestamp: new Date(),
      confirmations: 0,
      requiredConfirmations: 6,
      hotelService: 'Trading crypto',
      customerReference: `${tradeType.toUpperCase()}-${crypto.symbol}-${Date.now()}`
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulation de confirmation
    setTimeout(() => {
      setTransactions(prev => prev.map(t => 
        t.id === newTransaction.id 
          ? { ...t, status: 'confirmed', confirmations: 6 }
          : t
      ));
    }, 5000);

    // Reset form
    setTradeAmount('');
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-purple-50 to-indigo-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Coins className="h-8 w-8 animate-pulse text-purple-600 mx-auto mb-4" />
            <p className="text-purple-800">Connexion aux réseaux blockchain africains...</p>
            <p className="text-sm text-purple-600">Akoin, Celo, Bitcoin, USDC</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut global */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Crypto-monnaies Africaines</CardTitle>
                <CardDescription className="text-purple-100">
                  Akoin, Celo et cryptos populaires en Afrique
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Globe className="h-3 w-3 mr-1" />
                {cryptos.length} Cryptos
              </Badge>
              <Badge className="bg-white/20 text-white">
                💎 Blockchain Africaine
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{wallets.length}</div>
              <div className="text-sm text-purple-100">Portefeuilles Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(wallets.reduce((sum, w) => sum + w.balanceXOF, 0))}
              </div>
              <div className="text-sm text-purple-100">Valeur Totale</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{transactions.length}</div>
              <div className="text-sm text-purple-100">Transactions 24h</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {cryptos.filter(c => c.isNative).length}
              </div>
              <div className="text-sm text-purple-100">Cryptos Africaines</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes crypto */}
      <Alert className="border-purple-200 bg-purple-50">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800">
          Innovation Blockchain Africaine
        </AlertTitle>
        <AlertDescription className="text-purple-700">
          Support natif des crypto-monnaies africaines comme Akoin et Celo, 
          avec intégration complète aux systèmes de paiement locaux.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="cryptos">Cryptos Africaines</TabsTrigger>
          <TabsTrigger value="wallets">Portefeuilles</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Gains 24h</p>
                    <p className="text-xl font-bold text-green-900">
                      +{formatCurrency(45680)}
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
                    <p className="text-sm text-blue-700">Staking Rewards</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(93750)}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Volume Trading</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(1250000)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">APY Moyen</p>
                    <p className="text-xl font-bold text-orange-900">12.5%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution des prix */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Évolution des Prix (7 jours)</CardTitle>
                <CardDescription>Performance des crypto-monnaies africaines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="akoin" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      name="Akoin (USD)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="celo" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Celo (USD)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition du portefeuille */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Répartition du Portefeuille</CardTitle>
                <CardDescription>Distribution des avoirs crypto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={portfolioDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="valeur"
                      label={({ crypto, pourcentage }) => `${crypto}: ${pourcentage}%`}
                    >
                      {portfolioDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#8B5CF6' :
                          index === 1 ? '#F59E0B' :
                          index === 2 ? '#10B981' :
                          index === 3 ? '#3B82F6' : '#6B7280'
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

        <TabsContent value="cryptos" className="space-y-6">
          {/* Liste des crypto-monnaies */}
          <div className="grid grid-cols-1 gap-4">
            {cryptos.map((crypto) => (
              <Card 
                key={crypto.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Coins className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{crypto.name}</h3>
                            <Badge variant="outline">{crypto.symbol}</Badge>
                            {crypto.isNative && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Africaine
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <span>{crypto.flag}</span>
                            {crypto.country}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${crypto.currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 4 })}
                        </p>
                        <div className={`flex items-center gap-1 ${
                          crypto.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crypto.priceChangePercent24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-semibold">
                            {crypto.priceChangePercent24h >= 0 ? '+' : ''}
                            {crypto.priceChangePercent24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Market Cap</p>
                        <p className="font-semibold">
                          ${(crypto.marketCap / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Volume 24h</p>
                        <p className="font-semibold">
                          ${(crypto.volume24h / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rang</p>
                        <Badge className="bg-gray-100 text-gray-800">
                          #{crypto.rank}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">{crypto.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Blockchain</p>
                        <p className="font-semibold">{crypto.blockchain}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Consensus</p>
                        <p className="font-semibold">{crypto.consensus}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Use Case</p>
                        <p className="font-semibold">{crypto.useCase}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lancement</p>
                        <p className="font-semibold">
                          {crypto.launchDate.getFullYear()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCrypto(crypto.id)}
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-1" />
                      Acheter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          {/* Liste des portefeuilles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <Card 
                key={wallet.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        {getWalletTypeIcon(wallet.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <CardDescription>
                          {cryptos.find(c => c.id === wallet.cryptoId)?.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {wallet.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge className={getSecurityLevelColor(wallet.securityLevel)} variant="outline">
                        {wallet.securityLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                      {wallet.address}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-700">Solde</span>
                      <span className="text-2xl font-bold text-purple-900">
                        {formatCrypto(wallet.balance, cryptos.find(c => c.id === wallet.cryptoId)?.symbol || '')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">Valeur USD:</span>
                      <span className="font-semibold">${wallet.balanceUSD.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">Valeur XOF:</span>
                      <span className="font-semibold">{formatCurrency(wallet.balanceXOF)}</span>
                    </div>
                  </div>
                  
                  {wallet.stakingRewards && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">Staking Rewards</span>
                        <span className="font-bold text-green-900">
                          {formatCrypto(wallet.stakingRewards, cryptos.find(c => c.id === wallet.cryptoId)?.symbol || '')}
                        </span>
                      </div>
                      {wallet.stakingAPY && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-green-600">APY:</span>
                          <span className="font-semibold">{wallet.stakingAPY}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{wallet.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dernière activité</p>
                      <p className="font-semibold">
                        {wallet.lastActivity.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="h-4 w-4 mr-1" />
                      Envoyer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Recevoir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          {/* Interface de trading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Trading Crypto</CardTitle>
                <CardDescription>
                  Acheter et vendre des crypto-monnaies africaines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="crypto-select">Crypto-monnaie</Label>
                    <select 
                      id="crypto-select"
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Sélectionner une crypto</option>
                      {cryptos.map((crypto) => (
                        <option key={crypto.id} value={crypto.id}>
                          {crypto.flag} {crypto.name} ({crypto.symbol}) - ${crypto.currentPrice}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={tradeType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setTradeType('buy')}
                      className="flex-1"
                    >
                      Acheter
                    </Button>
                    <Button 
                      variant={tradeType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setTradeType('sell')}
                      className="flex-1"
                    >
                      Vendre
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Quantité</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="1000"
                      step="0.0001"
                    />
                  </div>
                  
                  {selectedCrypto && tradeAmount && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Résumé de l'ordre</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Quantité :</span>
                          <span className="font-semibold">
                            {formatCrypto(parseFloat(tradeAmount) || 0, cryptos.find(c => c.id === selectedCrypto)?.symbol || '')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix unitaire :</span>
                          <span className="font-semibold">
                            ${cryptos.find(c => c.id === selectedCrypto)?.currentPrice.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valeur totale :</span>
                          <span className="font-semibold">
                            ${((parseFloat(tradeAmount) || 0) * (cryptos.find(c => c.id === selectedCrypto)?.currentPrice || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais (1%) :</span>
                          <span>
                            ${(((parseFloat(tradeAmount) || 0) * (cryptos.find(c => c.id === selectedCrypto)?.currentPrice || 0)) * 0.01).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total :</span>
                          <span>
                            ${(((parseFloat(tradeAmount) || 0) * (cryptos.find(c => c.id === selectedCrypto)?.currentPrice || 0)) * 1.01).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleTrade}
                    disabled={!selectedCrypto || !tradeAmount}
                    className={`flex-1 ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {tradeType === 'buy' ? 'Acheter' : 'Vendre'}
                  </Button>
                  <Button variant="outline">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Graphique de volume de trading */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Volume de Trading</CardTitle>
                <CardDescription>Activité de trading par heure</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tradingVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="heure" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'volume' ? formatCurrency(value as number) : value,
                      name === 'volume' ? 'Volume' : 'Transactions'
                    ]} />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      name="Volume"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Transactions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Liste des transactions crypto */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-purple-900">Transactions Crypto</CardTitle>
                  <CardDescription>Historique des opérations blockchain</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
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
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-semibold text-sm">
                            {transaction.customerReference}
                          </p>
                          <p className="text-xs text-gray-600">
                            {cryptos.find(c => c.id === transaction.cryptoId)?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">
                          {formatCrypto(transaction.amount, cryptos.find(c => c.id === transaction.cryptoId)?.symbol || '')}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${transaction.totalValue.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(transaction.totalValue * 600)} {/* USD to XOF */}
                        </p>
                        <p className="text-xs text-gray-600">
                          Frais: ${transaction.fees.toFixed(2)}
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
                          {transaction.confirmations}/{transaction.requiredConfirmations} confirmations
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

