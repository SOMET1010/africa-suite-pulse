import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CreditCard, 
  Scan, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Utensils,
  Heart
} from 'lucide-react';
import { CollectiveBeneficiary } from '@/types/collectivites';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BadgeScannerProps {
  onBeneficiarySelect: (beneficiary: CollectiveBeneficiary | null) => void;
  onClose: () => void;
}

export function BadgeScanner({ onBeneficiarySelect, onClose }: BadgeScannerProps) {
  const [scanMode, setScanMode] = useState<'nfc' | 'qr' | 'manual'>('nfc');
  const [isScanning, setIsScanning] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [beneficiary, setBeneficiary] = useState<CollectiveBeneficiary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock beneficiary data for demo
  const mockBeneficiary: CollectiveBeneficiary = {
    id: '1',
    org_id: '1',
    collective_organization_id: '1',
    beneficiary_code: 'ETU2024001',
    first_name: 'Marie',
    last_name: 'Dupont',
    email: 'marie.dupont@universite.edu',
    phone: '+225 07 12 34 56 78',
    photo_url: '/placeholder.svg',
    category: 'student',
    grade_level: 'L3 Informatique',
    department: 'Informatique',
    dietary_restrictions: ['vegetarian'],
    allergies: ['nuts'],
    credit_balance: 12500, // 125.00 XOF
    monthly_allowance: 50000, // 500.00 XOF
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  const handleScan = (scannedValue: string) => {
    setIsScanning(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      if (scannedValue === 'DEMO123' || scannedValue === mockBeneficiary.beneficiary_code) {
        setBeneficiary(mockBeneficiary);
        setError(null);
      } else {
        setError('Badge non reconnu. Vérifiez le numéro ou contactez l\'administration.');
        setBeneficiary(null);
      }
      setIsScanning(false);
    }, 1000);
  };

  const handleManualEntry = () => {
    if (cardNumber.trim()) {
      handleScan(cardNumber.trim());
    }
  };

  const handleSelect = () => {
    onBeneficiarySelect(beneficiary);
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toFixed(0)} FCFA`;
  };

  const getCategoryInfo = (category: string) => {
    const categories = {
      student: { label: 'Étudiant', color: 'bg-blue-500', icon: '🎓' },
      employee: { label: 'Employé', color: 'bg-green-500', icon: '💼' },
      teacher: { label: 'Enseignant', color: 'bg-purple-500', icon: '👨‍🏫' },
      visitor: { label: 'Visiteur', color: 'bg-gray-500', icon: '👤' }
    };
    return categories[category as keyof typeof categories] || categories.visitor;
  };

  const getStatusColor = (isActive: boolean, balance: number) => {
    if (!isActive) return 'bg-red-500';
    if (balance <= 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Scanner Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner RestoBadge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Buttons */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'nfc' ? 'default' : 'outline'}
              onClick={() => setScanMode('nfc')}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              NFC
            </Button>
            <Button
              variant={scanMode === 'qr' ? 'default' : 'outline'}
              onClick={() => setScanMode('qr')}
              className="flex-1"
            >
              <Scan className="mr-2 h-4 w-4" />
              QR Code
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Manuel
            </Button>
          </div>

          {/* Scanner Interface */}
          {scanMode === 'nfc' && (
            <div className="text-center p-8 border-2 border-dashed border-muted-foreground rounded-lg">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Approchez le badge NFC</p>
              <p className="text-sm text-muted-foreground">Badge détecté automatiquement</p>
              <Button 
                onClick={() => handleScan('DEMO123')} 
                className="mt-4"
                disabled={isScanning}
              >
                {isScanning ? 'Lecture...' : 'Simuler scan NFC'}
              </Button>
            </div>
          )}

          {scanMode === 'qr' && (
            <div className="text-center p-8 border-2 border-dashed border-muted-foreground rounded-lg">
              <Scan className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Scannez le QR Code</p>
              <p className="text-sm text-muted-foreground">Pointez la caméra vers le code</p>
              <Button 
                onClick={() => handleScan('DEMO123')} 
                className="mt-4"
                disabled={isScanning}
              >
                {isScanning ? 'Lecture...' : 'Simuler scan QR'}
              </Button>
            </div>
          )}

          {scanMode === 'manual' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Numéro de badge ou code étudiant"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                />
                <Button onClick={handleManualEntry} disabled={isScanning}>
                  {isScanning ? 'Recherche...' : 'Rechercher'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Saisissez le numéro de badge ou le code étudiant/employé
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Beneficiary Profile */}
      {beneficiary && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Bénéficiaire identifié
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={beneficiary.photo_url} alt={`${beneficiary.first_name} ${beneficiary.last_name}`} />
                <AvatarFallback className="text-lg">
                  {beneficiary.first_name[0]}{beneficiary.last_name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {beneficiary.first_name} {beneficiary.last_name}
                </h3>
                <p className="text-muted-foreground">{beneficiary.beneficiary_code}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getCategoryInfo(beneficiary.category).color} text-white`}>
                    {getCategoryInfo(beneficiary.category).icon} {getCategoryInfo(beneficiary.category).label}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(beneficiary.is_active, beneficiary.credit_balance)}`} />
                </div>
              </div>

              {/* Credit Balance */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Solde disponible</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(beneficiary.credit_balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Forfait mensuel: {formatCurrency(beneficiary.monthly_allowance)}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Niveau/Département</p>
                <p className="text-sm">{beneficiary.grade_level || beneficiary.department || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="text-sm">{beneficiary.email || beneficiary.phone || 'Non renseigné'}</p>
              </div>
            </div>

            {/* Dietary Info */}
            {(beneficiary.dietary_restrictions.length > 0 || beneficiary.allergies.length > 0) && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Régime alimentaire</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {beneficiary.dietary_restrictions.map((restriction) => (
                    <Badge key={restriction} variant="secondary" className="text-xs">
                      🥗 {restriction}
                    </Badge>
                  ))}
                  {beneficiary.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSelect} className="flex-1">
                <User className="mr-2 h-4 w-4" />
                Sélectionner ce bénéficiaire
              </Button>
              <Button variant="outline" onClick={() => setBeneficiary(null)}>
                Nouveau scan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Retour
        </Button>
        {beneficiary && (
          <Button onClick={handleSelect}>
            Continuer avec {beneficiary.first_name}
          </Button>
        )}
      </div>
    </div>
  );
}