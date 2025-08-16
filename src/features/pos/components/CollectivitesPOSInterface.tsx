import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  CreditCard, 
  Receipt, 
  Users, 
  Calculator,
  Info,
  CheckCircle
} from 'lucide-react';
import { CollectiveBeneficiary } from '@/types/collectivites';
import { BadgeScanner } from './BadgeScanner';

interface CollectivitesPOSInterfaceProps {
  onBack: () => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subsidyAmount?: number;
}

const MOCK_MENU_ITEMS = [
  { id: '1', name: 'Menu Étudiant', price: 350, category: 'menus' },
  { id: '2', name: 'Menu Complet', price: 500, category: 'menus' },
  { id: '3', name: 'Salade Composée', price: 250, category: 'entrees' },
  { id: '4', name: 'Sandwich Thon', price: 200, category: 'snacks' },
  { id: '5', name: 'Boisson 33cl', price: 150, category: 'boissons' },
  { id: '6', name: 'Café', price: 100, category: 'boissons' },
];

export function CollectivitesPOSInterface({ onBack }: CollectivitesPOSInterfaceProps) {
  const [step, setStep] = useState<'scanner' | 'ordering' | 'payment'>('scanner');
  const [beneficiary, setBeneficiary] = useState<CollectiveBeneficiary | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subsidyInfo, setSubsidyInfo] = useState<{total: number, subsidy: number, toPay: number} | null>(null);

  const handleBeneficiarySelect = (selectedBeneficiary: CollectiveBeneficiary | null) => {
    setBeneficiary(selectedBeneficiary);
    if (selectedBeneficiary) {
      setStep('ordering');
    }
  };

  const addToCart = (item: typeof MOCK_MENU_ITEMS[0]) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1,
          subsidyAmount: calculateSubsidy(item.price)
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prev.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const calculateSubsidy = (basePrice: number): number => {
    // Mock subsidy calculation - 70% subsidy for students
    if (beneficiary?.category === 'student') {
      return Math.round(basePrice * 0.7);
    }
    return Math.round(basePrice * 0.5); // 50% for employees
  };

  const calculateTotals = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subsidy = cart.reduce((sum, item) => sum + ((item.subsidyAmount || 0) * item.quantity), 0);
    const toPay = total - subsidy;
    return { total, subsidy, toPay };
  };

  useEffect(() => {
    if (cart.length > 0) {
      setSubsidyInfo(calculateTotals());
    } else {
      setSubsidyInfo(null);
    }
  }, [cart, beneficiary]);

  const formatCurrency = (amount: number) => {
    return `${amount} FCFA`;
  };

  const handlePayment = () => {
    // Simulate payment processing
    setStep('payment');
    setTimeout(() => {
      // Reset for next customer
      setBeneficiary(null);
      setCart([]);
      setSubsidyInfo(null);
      setStep('scanner');
    }, 3000);
  };

  if (step === 'scanner') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🏫 Mode Collectivités</h2>
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
        </div>
        <BadgeScanner 
          onBeneficiarySelect={handleBeneficiarySelect}
          onClose={onBack}
        />
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Paiement effectué !</h3>
            <p className="text-muted-foreground mb-4">
              Transaction enregistrée pour {beneficiary?.first_name} {beneficiary?.last_name}
            </p>
            <div className="space-y-2 text-sm">
              <p>Total: {formatCurrency(subsidyInfo?.total || 0)}</p>
              <p className="text-green-600">Subvention: -{formatCurrency(subsidyInfo?.subsidy || 0)}</p>
              <p className="font-semibold">Payé: {formatCurrency(subsidyInfo?.toPay || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column - Menu Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Menu du jour</h2>
          <Button variant="outline" size="sm" onClick={() => setStep('scanner')}>
            Changer de bénéficiaire
          </Button>
        </div>

        {/* Beneficiary Info Bar */}
        {beneficiary && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>{beneficiary.first_name} {beneficiary.last_name}</strong> 
              ({beneficiary.category}) - Solde: {formatCurrency(beneficiary.credit_balance)}
            </AlertDescription>
          </Alert>
        )}

        {/* Menu Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_MENU_ITEMS.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{item.name}</h3>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{formatCurrency(item.price)}</p>
                  {beneficiary && (
                    <p className="text-sm text-green-600">
                      Subvention: -{formatCurrency(calculateSubsidy(item.price))}
                    </p>
                  )}
                  <Button onClick={() => addToCart(item)} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column - Cart & Payment */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Panier vide
              </p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      {item.subsidyAmount && (
                        <p className="text-xs text-green-600">
                          Subvention: -{formatCurrency(item.subsidyAmount * item.quantity)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart({ 
                          id: item.id, 
                          name: item.name, 
                          price: item.price, 
                          category: 'menus' 
                        })}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {subsidyInfo && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(subsidyInfo.total)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Subvention</span>
                    <span>-{formatCurrency(subsidyInfo.subsidy)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>À payer</span>
                    <span>{formatCurrency(subsidyInfo.toPay)}</span>
                  </div>
                </div>

                {subsidyInfo.toPay > beneficiary!.credit_balance && (
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Solde insuffisant. Recharge nécessaire.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handlePayment} 
                  className="w-full"
                  disabled={cart.length === 0 || subsidyInfo.toPay > beneficiary!.credit_balance}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Finaliser la commande
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Historique repas
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="mr-2 h-4 w-4" />
              Solde & forfaits
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Gestion groupes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}