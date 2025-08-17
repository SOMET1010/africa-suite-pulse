import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, User, CreditCard, FileText, Camera, Signature } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { SmartWidget } from './SmartWidget';
import { DigitalSignature } from './DigitalSignature';
import { cn } from '@/lib/utils';

interface CheckinStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
  icon: React.ReactNode;
}

interface MobileCheckinFlowProps {
  guestName: string;
  roomNumber?: string;
  reference: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function MobileCheckinFlow({
  guestName,
  roomNumber,
  reference,
  onComplete,
  onCancel
}: MobileCheckinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);

  const steps: CheckinStep[] = [
    {
      id: 'verification',
      title: 'Vérification Documents',
      description: 'Scanner et vérifier la pièce d\'identité',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'room',
      title: 'Chambre Assignée',
      description: 'Confirmation de l\'attribution de chambre',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'payment',
      title: 'Paiement',
      description: 'Règlement et facturation',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'signature',
      title: 'Signature',
      description: 'Signature numérique du client',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      icon: <Signature className="h-5 w-5" />
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return documentVerified;
      case 1: return !!roomNumber;
      case 2: return paymentConfirmed;
      case 3: return signatureComplete;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1 && canProceed()) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SmartWidget
            title="Vérification Documents"
            data={{}}
            className="mb-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scannez la pièce d'identité du client
                </p>
              </div>
              
              <TouchButton
                intent={documentVerified ? "success" : "outline"}
                touchSize="spacious"
                className="w-full"
                onClick={() => setDocumentVerified(!documentVerified)}
              >
                {documentVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Document vérifié
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Scanner le document
                  </>
                )}
              </TouchButton>
            </div>
          </SmartWidget>
        );

      case 1:
        return (
          <SmartWidget
            title="Attribution de Chambre"
            data={{}}
            className="mb-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {roomNumber || "---"}
                </div>
                <p className="text-lg font-medium">Chambre assignée</p>
                <p className="text-sm text-muted-foreground">
                  Prête pour l'accueil du client
                </p>
              </div>
              
              {!roomNumber && (
                <TouchButton
                  intent="outline"
                  touchSize="spacious"
                  className="w-full"
                  onClick={() => {/* Auto-assign room */}}
                >
                  Auto-assigner une chambre
                </TouchButton>
              )}
            </div>
          </SmartWidget>
        );

      case 2:
        return (
          <SmartWidget
            title="Paiement et Facturation"
            data={{}}
            className="mb-6"
          >
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Montant à régler</span>
                  <span className="text-lg font-bold">45 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mode de paiement</span>
                  <Badge variant="outline">Espèces</Badge>
                </div>
              </div>
              
              <TouchButton
                intent={paymentConfirmed ? "success" : "primary"}
                touchSize="spacious"
                className="w-full"
                onClick={() => setPaymentConfirmed(!paymentConfirmed)}
              >
                {paymentConfirmed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Paiement confirmé
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Confirmer le paiement
                  </>
                )}
              </TouchButton>
            </div>
          </SmartWidget>
        );

      case 3:
        return (
          <SmartWidget
            title="Signature Numérique"
            data={{}}
            className="mb-6"
          >
            <div className="space-y-4">
              <DigitalSignature
                onSignatureComplete={(signature) => {
                  setSignatureComplete(true);
                  console.log('Signature saved:', signature);
                }}
                placeholder="Signature du client requise"
              />
            </div>
          </SmartWidget>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{guestName}</h2>
            <p className="text-sm text-muted-foreground">Réf: {reference}</p>
          </div>
          <TouchButton
            intent="ghost"
            touchSize="compact"
            onClick={onCancel}
          >
            Annuler
          </TouchButton>
        </div>
        
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Étape {currentStep + 1} sur {steps.length}
        </p>
      </div>

      {/* Steps Navigation */}
      <div className="px-4 py-6">
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center text-center flex-1",
                index < steps.length - 1 && "relative"
              )}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute top-6 left-1/2 w-full h-0.5 -z-10",
                  step.status === 'completed' ? "bg-success" : "bg-muted"
                )} />
              )}
              
              {/* Step circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all",
                step.status === 'completed' && "bg-success border-success text-white",
                step.status === 'current' && "bg-primary border-primary text-white",
                step.status === 'pending' && "bg-background border-muted text-muted-foreground"
              )}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              
              {/* Step label */}
              <span className={cn(
                "text-xs font-medium",
                step.status === 'current' && "text-primary",
                step.status === 'completed' && "text-success",
                step.status === 'pending' && "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <TouchButton
            intent="outline"
            touchSize="spacious"
            className="flex-1"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Précédent
          </TouchButton>
          
          <TouchButton
            intent="primary"
            touchSize="spacious"
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
          </TouchButton>
        </div>
      </div>
    </div>
  );
}