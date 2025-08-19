import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Users, Utensils, Coffee } from 'lucide-react';

export type ServiceMode = 'direct' | 'table';

interface ServiceModeSelectorProps {
  onModeSelect: (mode: ServiceMode) => void;
}

export function ServiceModeSelector({ onModeSelect }: ServiceModeSelectorProps) {
  // Persist service mode in session storage (not global - per session)
  const [selectedMode, setSelectedMode] = useState<ServiceMode | null>(() => {
    return (sessionStorage.getItem('pos.serviceMode') as ServiceMode) || null;
  });

  useEffect(() => {
    if (selectedMode) {
      sessionStorage.setItem('pos.serviceMode', selectedMode);
    }
  }, [selectedMode]);

  const handleModeSelect = (mode: ServiceMode) => {
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header avec style africain */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Utensils className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🍽️ Restaurant Africain
          </h1>
          <p className="text-xl text-muted-foreground">
            Choisissez votre mode de service pour commencer
          </p>
          <Badge variant="outline" className="mt-4 px-4 py-2 text-base">
            Interface optimisée pour la restauration africaine
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mode Vente Directe - Style Maquis */}
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-400 bg-gradient-to-br from-white to-orange-50/50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-orange-800">🥘 Maquis Express</CardTitle>
              <CardDescription className="text-lg text-orange-600">
                Vente directe au comptoir - Style traditionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-base text-muted-foreground mb-8 space-y-3 text-left">
                <li className="flex items-center gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Commande et paiement immédiat</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Service rapide à emporter</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Parfait pour les plats populaires</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Tickets numérotés automatiques</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleModeSelect('direct')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                size="lg"
              >
                🚀 Démarrer Maquis Express
              </Button>
            </CardContent>
          </Card>

          {/* Mode Service en Salle - Style Restaurant */}
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-400 bg-gradient-to-br from-white to-amber-50/50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-amber-800">🏛️ Restaurant Service</CardTitle>
              <CardDescription className="text-lg text-amber-600">
                Service complet avec gestion des tables
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-base text-muted-foreground mb-8 space-y-3 text-left">
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">•</span>
                  <span>Gestion complète des tables</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">•</span>
                  <span>Attribution des serveurs</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">•</span>
                  <span>Commandes différées et modifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">•</span>
                  <span>Paiement en fin de repas</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleModeSelect('table')}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white"
                size="lg"
              >
                🍽️ Démarrer Service Restaurant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informations additionnelles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white/50 rounded-xl border border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Service Rapide</h4>
            <p className="text-sm text-muted-foreground">
              Interface optimisée pour la rapidité du service africain
            </p>
          </div>
          <div className="p-6 bg-white/50 rounded-xl border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🍛</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Plats Africains</h4>
            <p className="text-sm text-muted-foreground">
              Catalogue adapté aux spécialités culinaires locales
            </p>
          </div>
          <div className="p-6 bg-white/50 rounded-xl border border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Paiements Flexibles</h4>
            <p className="text-sm text-muted-foreground">
              Support des devises locales et méthodes de paiement populaires
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}