/**
 * Atomic Mode Selector Component - Phase 1: Architecture Foundation
 * Reusable mode selection component
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calculator, BarChart3 } from "lucide-react";

export type POSMode = 'serveur-rush' | 'caissier' | 'manager';

interface Mode {
  id: POSMode;
  name: string;
  description: string;
  icon: typeof Clock;
  color: string;
  features: string[];
}

const MODES: Mode[] = [
  {
    id: 'serveur-rush',
    name: 'Serveur Rush',
    description: 'Prise de commande rapide avec codes',
    icon: Clock,
    color: 'bg-orange-500',
    features: ['Clavier codes', 'Plan de salle', 'Envoi cuisine instantané'],
  },
  {
    id: 'caissier',
    name: 'Caissier',
    description: 'Interface visuelle et paiements',
    icon: Calculator,
    color: 'bg-blue-500',
    features: ['Clavier visuel', 'Paiements multiples', 'Tickets & factures'],
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Supervision et rapports',
    icon: BarChart3,
    color: 'bg-purple-500',
    features: ['Analytics temps réel', 'Supervision équipe', 'Rapports détaillés'],
  },
];

interface ModeSelectorProps {
  selectedMode?: POSMode;
  onModeSelect: (mode: POSMode) => void;
  className?: string;
}

export function ModeSelector({ selectedMode, onModeSelect, className = '' }: ModeSelectorProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;
        
        return (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => onModeSelect(mode.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${mode.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{mode.name}</h3>
                    {isSelected && (
                      <Badge variant="default">Sélectionné</Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">
                    {mode.description}
                  </p>
                  
                  <div className="space-y-1">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-1 w-1 bg-current rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}