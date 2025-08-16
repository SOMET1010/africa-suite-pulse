import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

interface StaffSelectorProps {
  mode: 'direct' | 'table';
  onStaffSelect: (staff: Staff) => void;
  onBack: () => void;
}

// Mock staff data - in real app this would come from database
const mockStaff: Staff[] = [
  { id: '1', name: 'Marie Diallo', role: 'cashier', initials: 'MD' },
  { id: '2', name: 'Ahmed Traoré', role: 'server', initials: 'AT' },
  { id: '3', name: 'Fatou Koné', role: 'server', initials: 'FK' },
  { id: '4', name: 'Moussa Camara', role: 'cashier', initials: 'MC' },
];

export function StaffSelector({ mode, onStaffSelect, onBack }: StaffSelectorProps) {
  // Persist staff ID in session storage (scoped to session)
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(() => 
    sessionStorage.getItem('pos.staffId') || undefined
  );

  useEffect(() => {
    if (selectedStaffId) {
      sessionStorage.setItem('pos.staffId', selectedStaffId);
    }
  }, [selectedStaffId]);

  const filteredStaff = mockStaff.filter(staff => 
    mode === 'direct' ? staff.role === 'cashier' : staff.role === 'server'
  );

  const title = mode === 'direct' ? 'Sélectionner Vendeur' : 'Sélectionner Serveur';
  const description = mode === 'direct' 
    ? 'Choisissez le vendeur pour cette session'
    : 'Choisissez le serveur pour cette session';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredStaff.map((staff) => (
            <Card 
              key={staff.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
              onClick={() => {
                setSelectedStaffId(staff.id);
                onStaffSelect(staff);
              }}
            >
              <CardContent className="flex items-center p-6">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {staff.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{staff.name}</h3>
                  <p className="text-muted-foreground capitalize">
                    {staff.role === 'cashier' ? 'Vendeur' : 'Serveur'}
                  </p>
                </div>
                <User className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Aucun staff disponible</h3>
              <p className="text-muted-foreground">
                Aucun {mode === 'direct' ? 'vendeur' : 'serveur'} n'est disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}