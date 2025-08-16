import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Users } from 'lucide-react';

interface ServiceModeSelectorProps {
  onModeSelect: (mode: 'direct' | 'table') => void;
}

export function ServiceModeSelector({ onModeSelect }: ServiceModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Mode de Service</h1>
          <p className="text-lg text-muted-foreground">
            Choisissez votre mode de fonctionnement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mode Vente Directe */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vente Directe</CardTitle>
              <CardDescription className="text-base">
                Caisse directe - Paiement immédiat
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• Vente au comptoir</li>
                <li>• Tickets numérotés</li>
                <li>• Paiement immédiat</li>
                <li>• Pas de gestion de table</li>
              </ul>
              <Button 
                onClick={() => onModeSelect('direct')}
                className="w-full"
                size="lg"
              >
                Commencer Vente Directe
              </Button>
            </CardContent>
          </Card>

          {/* Mode Service en Salle */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Service en Salle</CardTitle>
              <CardDescription className="text-base">
                Gestion des tables et serveurs
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• Gestion des tables</li>
                <li>• Attribution des serveurs</li>
                <li>• Commandes différées</li>
                <li>• Paiement en fin de service</li>
              </ul>
              <Button 
                onClick={() => onModeSelect('table')}
                className="w-full"
                size="lg"
              >
                Commencer Service en Salle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}