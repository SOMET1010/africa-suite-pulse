import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, CreditCard, Key, Clock, MapPin } from 'lucide-react';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'clean' | 'dirty' | 'maintenance';
}

interface Reservation {
  id: string;
  confirmationNumber: string;
  guest: Guest;
  room?: Room;
  dateArrival: string;
  dateDeparture: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
}

interface CheckinWorkflowProps {
  reservation: Reservation;
  availableRooms: Room[];
  onComplete: (data: CheckinResult) => void;
  onCancel: () => void;
}

interface CheckinResult {
  reservationId: string;
  roomId: string;
  guestSignature?: string;
  documentsUploaded: boolean;
  paymentReceived: boolean;
}

type CheckinStep = 'room-assignment' | 'documents' | 'payment';

export function CheckinWorkflow({ 
  reservation, 
  availableRooms, 
  onComplete, 
  onCancel 
}: CheckinWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<CheckinStep>('room-assignment');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(reservation.room || null);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { key: 'room-assignment', label: 'Assignation Chambre', icon: MapPin },
    { key: 'documents', label: 'Documents', icon: User },
    { key: 'payment', label: 'Paiement', icon: CreditCard }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleNext = () => {
    if (currentStep === 'room-assignment' && selectedRoom) {
      setCurrentStep('documents');
    } else if (currentStep === 'documents') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!selectedRoom) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      onComplete({
        reservationId: reservation.id,
        roomId: selectedRoom.id,
        documentsUploaded,
        paymentReceived
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'room-assignment':
        return selectedRoom !== null;
      case 'documents':
        return documentsUploaded;
      case 'payment':
        return paymentReceived;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Check-in Express</h2>
            <p className="text-muted-foreground">
              Confirmation #{reservation.confirmationNumber}
            </p>
          </div>
          <Badge variant="info" className="text-sm px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Guest Info */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-soft-primary text-primary font-medium">
                {reservation.guest.firstName[0]}{reservation.guest.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {reservation.guest.firstName} {reservation.guest.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reservation.guest.email} • {reservation.guest.phone}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{reservation.adults + reservation.children} pers.</p>
              <p className="text-sm text-muted-foreground">
                {new Date(reservation.dateArrival).toLocaleDateString('fr-FR')} - 
                {new Date(reservation.dateDeparture).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center space-x-2">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-smooth",
                  isCompleted && "bg-success text-success-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-success",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-4",
                    index < currentStepIndex ? "bg-success" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 'room-assignment' && (
          <RoomAssignmentStep
            availableRooms={availableRooms}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
            preferredType={reservation.room?.type}
          />
        )}

        {currentStep === 'documents' && (
          <DocumentsStep
            guest={reservation.guest}
            documentsUploaded={documentsUploaded}
            onDocumentsChange={setDocumentsUploaded}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentStep
            reservation={reservation}
            paymentReceived={paymentReceived}
            onPaymentChange={setPaymentReceived}
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        
        <div className="flex gap-2">
          {currentStepIndex > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(steps[currentStepIndex - 1].key as CheckinStep)}
            >
              Précédent
            </Button>
          )}
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Traitement...
              </div>
            ) : currentStep === 'payment' ? (
              <>
                <Key className="w-4 h-4 mr-2" />
                Finaliser Check-in
              </>
            ) : (
              'Suivant'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function RoomAssignmentStep({ 
  availableRooms, 
  selectedRoom, 
  onRoomSelect, 
  preferredType 
}: {
  availableRooms: Room[];
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  preferredType?: string;
}) {
  const groupedRooms = availableRooms.reduce((acc, room) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Sélectionner une chambre</h3>
        <p className="text-muted-foreground">
          Choisissez une chambre disponible pour ce client
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedRooms).map(([type, rooms]) => (
          <div key={type} className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              {type}
              {type === preferredType && (
                <Badge variant="accent" className="text-xs">Recommandé</Badge>
              )}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {rooms.map(room => (
                <Button
                  key={room.id}
                  variant={selectedRoom?.id === room.id ? "default" : "outline"}
                  className={cn(
                    "h-auto p-3 flex flex-col items-center gap-1",
                    selectedRoom?.id === room.id && "ring-2 ring-primary"
                  )}
                  onClick={() => onRoomSelect(room)}
                >
                  <span className="font-medium">{room.number}</span>
                  <span className="text-xs opacity-70">Étage {room.floor}</span>
                  <Badge 
                    variant={room.status === 'clean' ? 'success' : 'warning'} 
                    className="text-xs mt-1"
                  >
                    {room.status === 'clean' ? 'Propre' : 'À nettoyer'}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsStep({ 
  guest, 
  documentsUploaded, 
  onDocumentsChange 
}: {
  guest: Guest;
  documentsUploaded: boolean;
  onDocumentsChange: (uploaded: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Documents & Signature</h3>
        <p className="text-muted-foreground">
          Vérification d'identité et signature électronique
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Informations client</Label>
            <div className="mt-2 space-y-2">
              <Input value={`${guest.firstName} ${guest.lastName}`} readOnly />
              <Input value={guest.email} readOnly />
              <Input value={guest.nationality} readOnly />
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant={documentsUploaded ? "default" : "outline"}
              className="w-full"
              onClick={() => onDocumentsChange(!documentsUploaded)}
            >
              {documentsUploaded ? (
                <><CheckCircle className="w-4 h-4 mr-2" />Documents vérifiés</>
              ) : (
                'Scanner pièce d\'identité'
              )}
            </Button>
          </div>
        </div>

        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          <div className="space-y-2">
            <User className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Zone de signature électronique
            </p>
            {documentsUploaded && (
              <Badge variant="success" className="mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Signé
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentStep({ 
  reservation, 
  paymentReceived, 
  onPaymentChange 
}: {
  reservation: Reservation;
  paymentReceived: boolean;
  onPaymentChange: (received: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Paiement & Finalisation</h3>
        <p className="text-muted-foreground">
          Encaissement et finalisation du check-in
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-3">
          <h4 className="font-medium text-foreground">Résumé du séjour</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hébergement ({reservation.nights} nuits)</span>
              <span className="font-medium">{reservation.totalAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxe de séjour</span>
              <span className="font-medium">5.50 €</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{(reservation.totalAmount + 5.50).toFixed(2)} €</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={paymentReceived ? "default" : "outline"}
              onClick={() => onPaymentChange(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Carte
            </Button>
            <Button variant="outline">
              Espèces
            </Button>
          </div>
          
          {paymentReceived && (
            <div className="text-center p-4 bg-soft-success rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-sm text-success font-medium">
                Paiement encaissé avec succès
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}