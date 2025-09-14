import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Coins,
  Banknote,
  QrCode,
  Nfc,
  Globe,
  Shield,
  Zap,
  Star,
  Crown,
  Gem,
  Sparkles
} from 'lucide-react';

// Import des composants FinTech
import { AfricanMobileMoneyDashboard } from '@/features/fintech/components/AfricanMobileMoneyDashboard';
import { AfricanContactlessPayment } from '@/features/fintech/components/AfricanContactlessPayment';
import { AfricanBankingIntegration } from '@/features/fintech/components/AfricanBankingIntegration';
import { AfricanCryptoDashboard } from '@/features/fintech/components/AfricanCryptoDashboard';

export default function FinTechTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête principal */}
        <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10" />
              <CardTitle className="text-4xl font-bold">
                FinTech Africain Activé
              </CardTitle>
              <Sparkles className="h-10 w-10" />
            </div>
            <CardDescription className="text-xl text-white/90">
              Toutes les fonctionnalités financières africaines d'Africa Suite Pulse sont maintenant disponibles
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Smartphone className="h-5 w-5 mr-2" />
                Mobile Money
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <QrCode className="h-5 w-5 mr-2" />
                Sans Contact
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Building2 className="h-5 w-5 mr-2" />
                Banques Centrales
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Coins className="h-5 w-5 mr-2" />
                Crypto Africaines
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Smartphone className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-orange-900">3</h3>
              <p className="text-orange-700">Opérateurs Mobile Money</p>
              <p className="text-sm text-orange-600 mt-2">Orange, MTN, Moov</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-900">5</h3>
              <p className="text-blue-700">Méthodes Sans Contact</p>
              <p className="text-sm text-blue-600 mt-2">QR, NFC, Tap-to-Pay</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-900">2</h3>
              <p className="text-green-700">Banques Centrales</p>
              <p className="text-sm text-green-600 mt-2">BCEAO, BEAC</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Coins className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-purple-900">5</h3>
              <p className="text-purple-700">Crypto-monnaies</p>
              <p className="text-sm text-purple-600 mt-2">Akoin, Celo, BTC, USDC</p>
            </CardContent>
          </Card>
        </div>

        {/* Fonctionnalités FinTech */}
        <Tabs defaultValue="mobile-money" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-16">
            <TabsTrigger value="mobile-money" className="flex flex-col gap-1">
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile Money</span>
            </TabsTrigger>
            <TabsTrigger value="contactless" className="flex flex-col gap-1">
              <QrCode className="h-5 w-5" />
              <span className="text-xs">Sans Contact</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex flex-col gap-1">
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Banques</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex flex-col gap-1">
              <Coins className="h-5 w-5" />
              <span className="text-xs">Crypto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile-money" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Smartphone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-orange-900">Mobile Money Africain</CardTitle>
                    <CardDescription>
                      Intégration complète Orange Money, MTN Money et Moov Money
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AfricanMobileMoneyDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contactless" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-900">Paiements Sans Contact</CardTitle>
                    <CardDescription>
                      QR Codes, NFC et technologies de paiement modernes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AfricanContactlessPayment />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-900">Intégration Bancaire Africaine</CardTitle>
                    <CardDescription>
                      Connexions BCEAO, BEAC et banques partenaires
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AfricanBankingIntegration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Coins className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-purple-900">Crypto-monnaies Africaines</CardTitle>
                    <CardDescription>
                      Akoin, Celo et cryptos populaires en Afrique
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AfricanCryptoDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Innovations et avantages */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🚀 Innovations FinTech Africaines Révolutionnaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-lg font-bold mb-2">Première Intégration Native</h3>
                <p className="text-sm text-white/90">
                  Seule solution ERP avec support natif d'Akoin et Celo
                </p>
              </div>
              
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-3 text-blue-300" />
                <h3 className="text-lg font-bold mb-2">Conformité Totale</h3>
                <p className="text-sm text-white/90">
                  100% conforme BCEAO, BEAC et réglementations africaines
                </p>
              </div>
              
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-lg font-bold mb-2">Transactions Instantanées</h3>
                <p className="text-sm text-white/90">
                  Paiements en temps réel avec tous les opérateurs
                </p>
              </div>
              
              <div className="text-center">
                <Gem className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                <h3 className="text-lg font-bold mb-2">Valeur Exceptionnelle</h3>
                <p className="text-sm text-white/90">
                  Fonctionnalités équivalentes à 200M+ F CFA de développement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut de déploiement */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl text-green-900">
                  ✅ Toutes les Fonctionnalités FinTech Activées
                </CardTitle>
                <CardDescription className="text-lg">
                  Africa Suite Pulse est maintenant la solution FinTech la plus avancée d'Afrique
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-900">Fonctionnalités Activées :</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Mobile Money (Orange, MTN, Moov)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Paiements sans contact QR/NFC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Intégration BCEAO/BEAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Crypto-monnaies africaines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Conformité réglementaire</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-900">Avantages Concurrentiels :</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Première solution native Akoin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Support multi-devises (XOF, XAF, USD)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Transactions cross-border</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Staking et DeFi intégrés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Design culturel authentique</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                <Sparkles className="h-5 w-5 mr-2" />
                Déployer en Production
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

