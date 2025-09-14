import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  QrCode, 
  Smartphone, 
  CreditCard, 
  Nfc,
  Scan,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Wifi,
  WifiOff,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  Copy,
  Share2,
  Printer,
  Camera,
  Bluetooth,
  Radio,
  Fingerprint,
  Lock,
  Unlock,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Timer,
  Target,
  Coins,
  Banknote,
  Wallet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface ContactlessPayment {
  id: string;
  type: 'qr_code' | 'nfc' | 'bluetooth' | 'biometric';
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  reference: string;
  qrCodeData: string;
  status: 'pending' | 'scanning' | 'processing' | 'success' | 'failed' | 'expired';
  timestamp: Date;
  expiresAt: Date;
  paymentMethod: string;
  location: string;
  deviceId: string;
  fees: number;
  description: string;
  hotelService: string;
  culturalContext?: string;
}

interface PaymentTerminal {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'pos' | 'kiosk';
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  capabilities: string[];
  lastActivity: Date;
  dailyVolume: number;
  transactionCount: number;
  batteryLevel?: number;
  signalStrength?: number;
}

interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  culturalTheme: string;
  colors: string[];
  pattern: string;
  logo: string;
  isDefault: boolean;
}

interface AfricanContactlessPaymentProps {
  className?: string;
}

export function AfricanContactlessPayment({ className }: AfricanContactlessPaymentProps) {
  const [payments, setPayments] = useState<ContactlessPayment[]>([]);
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [qrTemplates, setQrTemplates] = useState<QRCodeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Templates QR Code culturels africains
  const culturalQRTemplates: QRCodeTemplate[] = [
    {
      id: 'bogolan',
      name: 'Bogolan Mali',
      description: 'Motifs traditionnels maliens en terre cuite',
      culturalTheme: 'Mali - Bogolan',
      colors: ['#8B4513', '#D2691E', '#F4A460'],
      pattern: 'geometric_mud_cloth',
      logo: '🏺',
      isDefault: true
    },
    {
      id: 'kente',
      name: 'Kente Ghana',
      description: 'Tissage royal ghanéen multicolore',
      culturalTheme: 'Ghana - Kente',
      colors: ['#FFD700', '#FF6600', '#228B22', '#DC143C'],
      pattern: 'kente_weaving',
      logo: '👑',
      isDefault: false
    },
    {
      id: 'adinkra',
      name: 'Adinkra Akan',
      description: 'Symboles akan de sagesse et philosophie',
      culturalTheme: 'Ghana - Adinkra',
      colors: ['#8B4513', '#FFD700', '#000000'],
      pattern: 'adinkra_symbols',
      logo: '⚡',
      isDefault: false
    },
    {
      id: 'wax',
      name: 'Wax Africain',
      description: 'Imprimés wax colorés et vibrants',
      culturalTheme: 'Afrique - Wax',
      colors: ['#FF6600', '#00D4AA', '#FFCC00', '#E60012'],
      pattern: 'wax_print',
      logo: '🌺',
      isDefault: false
    },
    {
      id: 'baobab',
      name: 'Baobab Savane',
      description: 'Inspiration de l\'arbre de vie africain',
      culturalTheme: 'Afrique - Baobab',
      colors: ['#8B4513', '#228B22', '#87CEEB', '#F4A460'],
      pattern: 'baobab_tree',
      logo: '🌳',
      isDefault: false
    }
  ];

  // Terminaux de paiement simulés
  const mockTerminals: PaymentTerminal[] = [
    {
      id: 'term_001',
      name: 'Réception Principale',
      type: 'tablet',
      location: 'Hall d\'accueil',
      status: 'online',
      capabilities: ['qr_code', 'nfc', 'bluetooth', 'biometric'],
      lastActivity: new Date(),
      dailyVolume: 2450000,
      transactionCount: 67,
      batteryLevel: 85,
      signalStrength: 95
    },
    {
      id: 'term_002',
      name: 'Restaurant Teranga',
      type: 'mobile',
      location: 'Restaurant principal',
      status: 'online',
      capabilities: ['qr_code', 'nfc'],
      lastActivity: new Date(Date.now() - 300000), // 5 min ago
      dailyVolume: 890000,
      transactionCount: 34,
      batteryLevel: 62,
      signalStrength: 78
    },
    {
      id: 'term_003',
      name: 'Spa Ubuntu',
      type: 'pos',
      location: 'Centre bien-être',
      status: 'online',
      capabilities: ['qr_code', 'nfc', 'biometric'],
      lastActivity: new Date(Date.now() - 120000), // 2 min ago
      dailyVolume: 340000,
      transactionCount: 12,
      batteryLevel: 100,
      signalStrength: 88
    },
    {
      id: 'term_004',
      name: 'Kiosque Harambee',
      type: 'kiosk',
      location: 'Lobby bar',
      status: 'maintenance',
      capabilities: ['qr_code', 'nfc'],
      lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
      dailyVolume: 0,
      transactionCount: 0,
      batteryLevel: 45,
      signalStrength: 0
    }
  ];

  // Paiements sans contact simulés
  const mockPayments: ContactlessPayment[] = [
    {
      id: '1',
      type: 'qr_code',
      amount: 125000,
      currency: 'XOF',
      customerName: 'Aminata Traoré',
      customerPhone: '+223 76 12 34 56',
      reference: 'QR-PAY-001247',
      qrCodeData: 'africasuite://pay?ref=QR-PAY-001247&amount=125000&currency=XOF',
      status: 'success',
      timestamp: new Date('2024-09-13T14:30:00'),
      expiresAt: new Date('2024-09-13T14:45:00'),
      paymentMethod: 'Orange Money',
      location: 'Réception Principale',
      deviceId: 'term_001',
      fees: 1875,
      description: 'Paiement chambre Deluxe avec QR Bogolan',
      hotelService: 'Hébergement',
      culturalContext: 'QR Code avec motifs bogolan maliens'
    },
    {
      id: '2',
      type: 'nfc',
      amount: 85000,
      currency: 'XOF',
      customerName: 'Kwame Asante',
      customerPhone: '+233 24 567 89 01',
      reference: 'NFC-PAY-001248',
      qrCodeData: '',
      status: 'success',
      timestamp: new Date('2024-09-13T13:15:00'),
      expiresAt: new Date('2024-09-13T13:30:00'),
      paymentMethod: 'MTN Mobile Money',
      location: 'Restaurant Teranga',
      deviceId: 'term_002',
      fees: 1020,
      description: 'Paiement NFC restaurant avec thème Kente',
      hotelService: 'Restauration',
      culturalContext: 'Interface NFC aux couleurs kente ghanéennes'
    },
    {
      id: '3',
      type: 'biometric',
      amount: 45000,
      currency: 'XOF',
      customerName: 'Fatou Diop',
      customerPhone: '+221 77 123 45 67',
      reference: 'BIO-PAY-001249',
      qrCodeData: '',
      status: 'processing',
      timestamp: new Date('2024-09-13T12:45:00'),
      expiresAt: new Date('2024-09-13T13:00:00'),
      paymentMethod: 'Wave Money',
      location: 'Spa Ubuntu',
      deviceId: 'term_003',
      fees: 0,
      description: 'Paiement biométrique spa avec Ubuntu',
      hotelService: 'Bien-être',
      culturalContext: 'Authentification biométrique avec philosophie Ubuntu'
    },
    {
      id: '4',
      type: 'qr_code',
      amount: 15000,
      currency: 'XOF',
      customerName: 'Ibrahim Sankara',
      customerPhone: '+226 70 98 76 54',
      reference: 'QR-PAY-001250',
      qrCodeData: 'africasuite://pay?ref=QR-PAY-001250&amount=15000&currency=XOF',
      status: 'expired',
      timestamp: new Date('2024-09-13T11:20:00'),
      expiresAt: new Date('2024-09-13T11:35:00'),
      paymentMethod: 'Moov Money',
      location: 'Kiosque Harambee',
      deviceId: 'term_004',
      fees: 270,
      description: 'QR Code expiré - Boissons bar',
      hotelService: 'Bar',
      culturalContext: 'QR Code Wax africain coloré'
    }
  ];

  // Données pour analytics
  const paymentMethodData = [
    { method: 'QR Code', transactions: 156, volume: 8450000, pourcentage: 45.2 },
    { method: 'NFC', transactions: 89, volume: 4230000, pourcentage: 25.8 },
    { method: 'Biométrique', transactions: 67, volume: 3120000, pourcentage: 19.4 },
    { method: 'Bluetooth', transactions: 33, volume: 1650000, pourcentage: 9.6 }
  ];

  const hourlyVolumeData = [
    { heure: '08h', qr: 120000, nfc: 80000, bio: 45000, bt: 20000 },
    { heure: '10h', qr: 280000, nfc: 150000, bio: 90000, bt: 40000 },
    { heure: '12h', qr: 450000, nfc: 280000, bio: 180000, bt: 85000 },
    { heure: '14h', qr: 380000, nfc: 220000, bio: 140000, bt: 65000 },
    { heure: '16h', qr: 320000, nfc: 180000, bio: 110000, bt: 50000 },
    { heure: '18h', qr: 520000, nfc: 350000, bio: 220000, bt: 120000 },
    { heure: '20h', qr: 680000, nfc: 420000, bio: 280000, bt: 150000 },
    { heure: '22h', qr: 420000, nfc: 250000, bio: 160000, bt: 80000 }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setPayments(mockPayments);
      setTerminals(mockTerminals);
      setQrTemplates(culturalQRTemplates);
      setSelectedTemplate('bogolan');
      setIsLoading(false);
    }, 1200);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'scanning': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'scanning': return <Scan className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'expired': return <Timer className="h-4 w-4 text-gray-600" />;
      default: return <Smartphone className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qr_code': return <QrCode className="h-4 w-4 text-blue-600" />;
      case 'nfc': return <Nfc className="h-4 w-4 text-green-600" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4 text-purple-600" />;
      case 'biometric': return <Fingerprint className="h-4 w-4 text-orange-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTerminalStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateQRCode = () => {
    if (!paymentAmount || !customerInfo.name) return;

    const reference = `QR-PAY-${Date.now()}`;
    const qrData = `africasuite://pay?ref=${reference}&amount=${paymentAmount}&currency=XOF&template=${selectedTemplate}`;
    
    const newPayment: ContactlessPayment = {
      id: Date.now().toString(),
      type: 'qr_code',
      amount: parseInt(paymentAmount),
      currency: 'XOF',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      reference: reference,
      qrCodeData: qrData,
      status: 'pending',
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      paymentMethod: 'En attente',
      location: 'Dashboard Admin',
      deviceId: 'admin_panel',
      fees: parseInt(paymentAmount) * 0.015,
      description: `QR Code généré avec template ${selectedTemplate}`,
      hotelService: 'Paiement personnalisé',
      culturalContext: qrTemplates.find(t => t.id === selectedTemplate)?.description
    };

    setPayments(prev => [newPayment, ...prev]);
    setGeneratedQR(qrData);
    
    // Simulation de scan après 5 secondes
    setTimeout(() => {
      setPayments(prev => prev.map(p => 
        p.id === newPayment.id 
          ? { ...p, status: 'scanning' }
          : p
      ));
      
      // Simulation de succès après 3 secondes supplémentaires
      setTimeout(() => {
        setPayments(prev => prev.map(p => 
          p.id === newPayment.id 
            ? { ...p, status: 'success', paymentMethod: 'Orange Money' }
            : p
        ));
      }, 3000);
    }, 5000);
  };

  const toggleNFC = () => {
    setNfcEnabled(!nfcEnabled);
    if (!nfcEnabled) {
      // Simulation de détection NFC
      setTimeout(() => {
        const nfcPayment: ContactlessPayment = {
          id: Date.now().toString(),
          type: 'nfc',
          amount: 25000,
          currency: 'XOF',
          customerName: 'Client NFC',
          customerPhone: '+225 07 XX XX XX XX',
          reference: `NFC-PAY-${Date.now()}`,
          qrCodeData: '',
          status: 'processing',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          paymentMethod: 'MTN Mobile Money',
          location: 'Terminal NFC',
          deviceId: 'nfc_reader',
          fees: 300,
          description: 'Paiement NFC détecté automatiquement',
          hotelService: 'Paiement express',
          culturalContext: 'Interface NFC avec design africain'
        };
        
        setPayments(prev => [nfcPayment, ...prev]);
        
        setTimeout(() => {
          setPayments(prev => prev.map(p => 
            p.id === nfcPayment.id 
              ? { ...p, status: 'success' }
              : p
          ));
        }, 2000);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <QrCode className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800">Initialisation des terminaux sans contact...</p>
            <p className="text-sm text-blue-600">QR Code, NFC, Bluetooth, Biométrie</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut global */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Paiements Sans Contact Africains</CardTitle>
                <CardDescription className="text-blue-100">
                  QR Codes culturels, NFC, Bluetooth et biométrie
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Zap className="h-3 w-3 mr-1" />
                4 Technologies
              </Badge>
              <Badge className="bg-white/20 text-white">
                🎨 Design Africain
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{payments.length}</div>
              <div className="text-sm text-blue-100">Paiements Aujourd'hui</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm text-blue-100">Volume Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {Math.round((payments.filter(p => p.status === 'success').length / payments.length) * 100)}%
              </div>
              <div className="text-sm text-blue-100">Taux de Succès</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {terminals.filter(t => t.status === 'online').length}
              </div>
              <div className="text-sm text-blue-100">Terminaux Actifs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes de statut */}
      {nfcEnabled && (
        <Alert className="border-green-200 bg-green-50">
          <Nfc className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            NFC Activé - En Écoute
          </AlertTitle>
          <AlertDescription className="text-green-700">
            Le terminal NFC est prêt à recevoir les paiements sans contact.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="qr-generator">QR Culturels</TabsTrigger>
          <TabsTrigger value="terminals">Terminaux</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques par type de paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">QR Codes</p>
                    <p className="text-xl font-bold text-blue-900">
                      {payments.filter(p => p.type === 'qr_code').length}
                    </p>
                  </div>
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">NFC</p>
                    <p className="text-xl font-bold text-green-900">
                      {payments.filter(p => p.type === 'nfc').length}
                    </p>
                  </div>
                  <Nfc className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Biométrique</p>
                    <p className="text-xl font-bold text-orange-900">
                      {payments.filter(p => p.type === 'biometric').length}
                    </p>
                  </div>
                  <Fingerprint className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Bluetooth</p>
                    <p className="text-xl font-bold text-purple-900">
                      {payments.filter(p => p.type === 'bluetooth').length}
                    </p>
                  </div>
                  <Bluetooth className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contrôles rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Contrôles Rapides</CardTitle>
                <CardDescription>Actions instantanées pour les paiements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={toggleNFC}
                    className={`flex-1 ${nfcEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <Nfc className="h-4 w-4 mr-2" />
                    {nfcEnabled ? 'Désactiver NFC' : 'Activer NFC'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setScannerActive(!scannerActive)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scanner QR
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Test Biométrie
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Bluetooth
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Graphique volume horaire */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Volume Horaire par Type</CardTitle>
                <CardDescription>Répartition des paiements sans contact</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={hourlyVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="heure" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="qr" stroke="#3B82F6" strokeWidth={2} name="QR Code" />
                    <Line type="monotone" dataKey="nfc" stroke="#10B981" strokeWidth={2} name="NFC" />
                    <Line type="monotone" dataKey="bio" stroke="#F59E0B" strokeWidth={2} name="Biométrique" />
                    <Line type="monotone" dataKey="bt" stroke="#8B5CF6" strokeWidth={2} name="Bluetooth" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qr-generator" className="space-y-6">
          {/* Générateur QR Code culturel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Générateur QR Code Culturel</CardTitle>
                <CardDescription>
                  Créez des QR codes avec designs africains authentiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template Culturel</Label>
                    <select 
                      id="template"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {qrTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.logo} {template.name} - {template.culturalTheme}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="customer-name">Nom du client</Label>
                    <Input
                      id="customer-name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Aminata Traoré"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customer-phone">Téléphone (optionnel)</Label>
                    <Input
                      id="customer-phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+223 76 12 34 56"
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
                  
                  {selectedTemplate && paymentAmount && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Aperçu du QR Code</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Template :</span>
                          <span className="font-semibold">
                            {qrTemplates.find(t => t.id === selectedTemplate)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant :</span>
                          <span className="font-semibold">{formatCurrency(parseInt(paymentAmount) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thème culturel :</span>
                          <span className="font-semibold">
                            {qrTemplates.find(t => t.id === selectedTemplate)?.culturalTheme}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={generateQRCode}
                    disabled={!selectedTemplate || !paymentAmount || !customerInfo.name}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Générer QR Code
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates culturels disponibles */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Templates Culturels Disponibles</CardTitle>
                <CardDescription>Designs inspirés des traditions africaines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrTemplates.map((template) => (
                  <div 
                    key={template.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.logo}</span>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.culturalTheme}</p>
                        </div>
                      </div>
                      {template.isDefault && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Star className="h-3 w-3 mr-1" />
                          Défaut
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                    <div className="flex gap-1">
                      {template.colors.map((color, index) => (
                        <div 
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terminals" className="space-y-6">
          {/* Liste des terminaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {terminals.map((terminal) => (
              <Card 
                key={terminal.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {terminal.type === 'mobile' && <Smartphone className="h-6 w-6 text-blue-600" />}
                        {terminal.type === 'tablet' && <Smartphone className="h-6 w-6 text-blue-600" />}
                        {terminal.type === 'pos' && <CreditCard className="h-6 w-6 text-blue-600" />}
                        {terminal.type === 'kiosk' && <Radio className="h-6 w-6 text-blue-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{terminal.name}</CardTitle>
                        <CardDescription>{terminal.location}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getTerminalStatusColor(terminal.status)}>
                      {terminal.status === 'online' && <Wifi className="h-3 w-3 mr-1" />}
                      {terminal.status === 'offline' && <WifiOff className="h-3 w-3 mr-1" />}
                      {terminal.status === 'maintenance' && <Settings className="h-3 w-3 mr-1" />}
                      {terminal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Volume journalier</p>
                      <p className="font-semibold">{formatCurrency(terminal.dailyVolume)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Transactions</p>
                      <p className="font-semibold">{terminal.transactionCount}</p>
                    </div>
                  </div>
                  
                  {terminal.batteryLevel && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Batterie</span>
                        <span>{terminal.batteryLevel}%</span>
                      </div>
                      <Progress value={terminal.batteryLevel} className="h-2" />
                    </div>
                  )}
                  
                  {terminal.signalStrength && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Signal</span>
                        <span>{terminal.signalStrength}%</span>
                      </div>
                      <Progress value={terminal.signalStrength} className="h-2" />
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Capacités :</p>
                    <div className="flex flex-wrap gap-1">
                      {terminal.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability === 'qr_code' && <QrCode className="h-3 w-3 mr-1" />}
                          {capability === 'nfc' && <Nfc className="h-3 w-3 mr-1" />}
                          {capability === 'bluetooth' && <Bluetooth className="h-3 w-3 mr-1" />}
                          {capability === 'biometric' && <Fingerprint className="h-3 w-3 mr-1" />}
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={terminal.status !== 'online'}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurer Terminal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Liste des transactions sans contact */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Transactions Sans Contact</CardTitle>
                  <CardDescription>Historique des paiements QR, NFC, Bluetooth et biométriques</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Actualiser
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(payment.type)}
                        <div>
                          <p className="font-semibold text-sm">{payment.reference}</p>
                          <p className="text-xs text-gray-600">{payment.customerName}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">{payment.location}</p>
                        <p className="text-xs text-gray-500">{payment.deviceId}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-600">
                          {payment.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {payment.timestamp.toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.type === 'qr_code' && (
                          <Button variant="ghost" size="sm">
                            <QrCode className="h-4 w-4" />
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

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics des paiements sans contact */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Analytics Paiements Sans Contact</CardTitle>
              <CardDescription>Performance et tendances par type de technologie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'volume' ? formatCurrency(value as number) : value,
                      name === 'volume' ? 'Volume' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="volume" fill="#3B82F6" name="Volume" />
                  <Bar dataKey="transactions" fill="#10B981" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

