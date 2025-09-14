import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Users, Coffee, Utensils, Sparkles, Clock } from "lucide-react";
import type { POSOutlet } from "../types";

interface ModernOutletSelectorProps {
  outlets: POSOutlet[];
  onSelectOutlet: (outlet: POSOutlet) => void;
}

const getOutletIcon = (type: string) => {
  switch (type) {
    case 'restaurant':
      return Utensils;
    case 'bar':
      return Coffee;
    case 'spa':
      return Sparkles;
    case 'room_service':
      return Users;
    default:
      return Store;
  }
};

const getOutletColor = (type: string) => {
  switch (type) {
    case 'restaurant':
      return 'from-red-500/10 to-orange-500/10 border-red-200/50 hover:border-red-300';
    case 'bar':
      return 'from-amber-500/10 to-yellow-500/10 border-amber-200/50 hover:border-amber-300';
    case 'spa':
      return 'from-purple-500/10 to-pink-500/10 border-purple-200/50 hover:border-purple-300';
    case 'room_service':
      return 'from-blue-500/10 to-cyan-500/10 border-blue-200/50 hover:border-blue-300';
    default:
      return 'from-gray-500/10 to-slate-500/10 border-gray-200/50 hover:border-gray-300';
  }
};

export function ModernOutletSelector({ outlets, onSelectOutlet }: ModernOutletSelectorProps) {
  if (outlets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <Store className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Aucun point de vente configuré</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Configurez vos points de vente pour commencer à utiliser le POS
            </p>
            <Card className="p-6 bg-muted/30">
              <p className="text-muted-foreground">
                Contactez votre administrateur pour configurer les points de vente
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
              <Store className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choisissez votre point de vente
          </h1>
          <p className="text-xl text-muted-foreground">
            Sélectionnez l'outlet pour commencer la prise de commandes
          </p>
        </div>

        {/* Outlets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => {
            const Icon = getOutletIcon(outlet.outlet_type);
            const colorClasses = getOutletColor(outlet.outlet_type);
            
            return (
              <Card
                key={outlet.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br ${colorClasses}`}
                onClick={() => onSelectOutlet(outlet)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/80 rounded-2xl shadow-sm">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">{outlet.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {outlet.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/60 text-foreground backdrop-blur-sm"
                    >
                      {outlet.outlet_type.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="bg-white/40 border-white/60 text-foreground"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-12 p-6 bg-card/80 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Chaque point de vente a ses propres produits, catégories et configurations
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}