import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { TButton } from '@/components/ui/TButton';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, Wifi, KeyRound, MapPin, MessageSquare } from 'lucide-react';

export default function UXFoundationsDemo() {
  const demoActions = [
    { id: "checkin", label: "Check-in", variant: "primary" as const, onClick: () => {}, icon: <KeyRound size={18} /> },
    { id: "assign", label: "Assigner", variant: "accent" as const, onClick: () => {}, icon: <MapPin size={18} /> },
    { id: "note", label: "Note", variant: "ghost" as const, onClick: () => {}, icon: <MessageSquare size={18} /> },
    { id: "details", label: "Détails", variant: "ghost" as const, onClick: () => {} },
  ];

  return (
    <UnifiedLayout
      hotelDate="2025-08-13"
      shiftLabel="Jour"
      orgName="AfricaSuite PMS - Sprint 1"
      showBottomBar={true}
      actions={demoActions}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Sprint 1 - Fondations UX</h1>
          <p className="text-muted-foreground">Design system hôtelier tactile-first avec tokens AA+</p>
        </div>

        {/* Design Tokens Demo */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">Composants Tactiles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="space-y-3">
              <h3 className="font-medium">TButton Variants</h3>
              <div className="space-y-2">
                <TButton variant="primary" className="w-full">Primaire Hôtelier</TButton>
                <TButton variant="accent" className="w-full">Accent Or</TButton>
                <TButton variant="success" className="w-full">Succès</TButton>
                <TButton variant="danger" className="w-full">Danger</TButton>
                <TButton variant="ghost" className="w-full">Ghost</TButton>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <h3 className="font-medium">Badge Métier</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Confirmé</Badge>
                <Badge variant="info">Présent</Badge>
                <Badge variant="warning">Option</Badge>
                <Badge variant="danger">Annulé</Badge>
                <Badge variant="muted">En attente</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Chambre 305</h3>
              <Badge variant="success">Propre</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Type: Deluxe • Capacité: 2 personnes
              </div>
              <div className="flex gap-2">
                <TButton size="md" variant="accent">Assigner</TButton>
                <TButton size="md" variant="ghost">Détails</TButton>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Réservation #12345</h3>
              <Badge variant="info">Confirmé</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Kouassi A. • 2 nuits • 85 000 XOF
              </div>
              <div className="flex gap-2">
                <TButton size="md" variant="success">Check-in</TButton>
                <TButton size="md" variant="ghost">Modifier</TButton>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Table 12</h3>
              <Badge variant="warning">Occupée</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                4 couverts • Service en cours
              </div>
              <div className="flex gap-2">
                <TButton size="md" variant="primary">Facturer</TButton>
                <TButton size="md" variant="ghost">Commande</TButton>
              </div>
            </div>
          </div>
        </div>

        {/* Status Demo */}
        <div className="bg-card rounded-xl p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">Statuts Métier</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-4 h-4 mx-auto rounded-full room-dot-clean"></div>
              <div className="text-sm">Propre</div>
            </div>
            <div className="space-y-2">
              <div className="w-4 h-4 mx-auto rounded-full room-dot-inspected"></div>
              <div className="text-sm">Inspectée</div>
            </div>
            <div className="space-y-2">
              <div className="w-4 h-4 mx-auto rounded-full room-dot-dirty"></div>
              <div className="text-sm">Sale</div>
            </div>
            <div className="space-y-2">
              <div className="w-4 h-4 mx-auto rounded-full room-dot-maintenance"></div>
              <div className="text-sm">Maintenance</div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}