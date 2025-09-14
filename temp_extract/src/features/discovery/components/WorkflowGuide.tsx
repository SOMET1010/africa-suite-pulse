import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  CreditCard,
  UtensilsCrossed,
  FileText,
  AlertCircle
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
  tips?: string[];
  warning?: string;
}

interface WorkflowData {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  steps: WorkflowStep[];
}

const workflows: Record<string, WorkflowData> = {
  checkin: {
    title: 'Check-in Client',
    description: 'Processus complet d\'arrivée d\'un client avec allocation de chambre et remise des clés',
    duration: '3-5 min',
    difficulty: 'Débutant',
    steps: [
      {
        id: 'verification',
        title: 'Vérification de la réservation',
        description: 'Localiser et confirmer la réservation du client',
        icon: User,
        details: [
          'Rechercher par nom, numéro de réservation ou téléphone',
          'Vérifier les détails de la réservation',
          'Confirmer les dates et le type de chambre'
        ],
        tips: [
          'Toujours demander une pièce d\'identité',
          'Vérifier l\'orthographe du nom'
        ]
      },
      {
        id: 'room-assignment',
        title: 'Attribution de chambre',
        description: 'Sélectionner et attribuer une chambre disponible',
        icon: MapPin,
        details: [
          'Consulter le rack des chambres disponibles',
          'Sélectionner une chambre du type réservé',
          'Vérifier l\'état de propreté de la chambre'
        ],
        tips: [
          'Privilégier les chambres avec vue si disponibles',
          'Vérifier que la chambre est prête'
        ]
      },
      {
        id: 'registration',
        title: 'Enregistrement',
        description: 'Compléter la fiche client et saisir les informations',
        icon: FileText,
        details: [
          'Saisir ou vérifier les informations personnelles',
          'Enregistrer la pièce d\'identité',
          'Faire signer la fiche client'
        ]
      },
      {
        id: 'payment',
        title: 'Gestion du paiement',
        description: 'Traitement des arrhes ou prépaiement',
        icon: CreditCard,
        details: [
          'Vérifier le mode de paiement prévu',
          'Encaisser les arrhes si nécessaire',
          'Expliquer les modalités de facturation'
        ],
        warning: 'Toujours confirmer les conditions de paiement avant la remise des clés'
      },
      {
        id: 'key-delivery',
        title: 'Remise des clés',
        description: 'Finalisation du check-in et remise des clés',
        icon: CheckCircle,
        details: [
          'Programmer les clés avec les dates du séjour',
          'Expliquer les services de l\'hôtel',
          'Remettre le plan et les informations pratiques'
        ],
        tips: [
          'Toujours tester les clés avant remise',
          'Informer sur les horaires des services'
        ]
      }
    ]
  },
  'restaurant-order': {
    title: 'Commande Restaurant',
    description: 'Prise de commande et facturation au restaurant',
    duration: '2-3 min',
    difficulty: 'Débutant',
    steps: [
      {
        id: 'table-selection',
        title: 'Sélection de table',
        description: 'Choisir ou assigner une table au client',
        icon: MapPin,
        details: [
          'Consulter le plan des tables',
          'Sélectionner une table libre',
          'Définir le nombre de couverts'
        ]
      },
      {
        id: 'order-taking',
        title: 'Prise de commande',
        description: 'Saisir les articles commandés par le client',
        icon: UtensilsCrossed,
        details: [
          'Naviguer dans le catalogue produits',
          'Ajouter les articles au panier',
          'Spécifier les quantités et options'
        ]
      },
      {
        id: 'order-validation',
        title: 'Validation',
        description: 'Confirmer la commande et l\'envoyer en cuisine',
        icon: CheckCircle,
        details: [
          'Vérifier le récapitulatif de commande',
          'Confirmer avec le client',
          'Envoyer la commande en cuisine'
        ]
      },
      {
        id: 'billing',
        title: 'Facturation',
        description: 'Établir la facture et encaisser',
        icon: CreditCard,
        details: [
          'Générer la facture',
          'Appliquer les remises si nécessaire',
          'Encaisser le paiement'
        ]
      }
    ]
  }
};

export function WorkflowGuide({ workflowId }: { workflowId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const workflow = workflows[workflowId];
  if (!workflow) return null;

  const progress = (completedSteps.length / workflow.steps.length) * 100;
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const canAccessStep = (stepIndex: number) => stepIndex === 0 || completedSteps.includes(stepIndex - 1);

  const completeStep = (stepIndex: number) => {
    if (!isStepCompleted(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex]);
      if (stepIndex < workflow.steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
  };

  const StepIcon = workflow.steps[currentStep].icon;

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{workflow.title}</CardTitle>
          <CardDescription className="text-base">
            {workflow.description}
          </CardDescription>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {workflow.duration}
            </Badge>
            <Badge variant="outline">
              Niveau {workflow.difficulty}
            </Badge>
            <Badge variant="outline">
              {completedSteps.length}/{workflow.steps.length} étapes
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Steps Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {workflow.steps.map((step, index) => (
          <Button
            key={step.id}
            variant={currentStep === index ? "default" : isStepCompleted(index) ? "secondary" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => canAccessStep(index) && setCurrentStep(index)}
            disabled={!canAccessStep(index)}
          >
            {isStepCompleted(index) && <CheckCircle className="h-4 w-4 mr-1" />}
            Étape {index + 1}
          </Button>
        ))}
      </div>

      {/* Current Step Detail */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Étape {currentStep + 1}: {workflow.steps[currentStep].title}
              </CardTitle>
              <CardDescription>
                {workflow.steps[currentStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Details */}
          <div>
            <h4 className="font-semibold mb-3">Actions à effectuer :</h4>
            <div className="space-y-2">
              {workflow.steps[currentStep].details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {workflow.steps[currentStep].tips && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Conseils :
              </h4>
              <div className="space-y-1">
                {workflow.steps[currentStep].tips!.map((tip, index) => (
                  <p key={index} className="text-sm text-blue-700 dark:text-blue-300">
                    • {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          {workflow.steps[currentStep].warning && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Attention :
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {workflow.steps[currentStep].warning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Actions */}
          <div className="flex gap-4 pt-4 border-t">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Étape précédente
              </Button>
            )}
            
            {!isStepCompleted(currentStep) && (
              <Button onClick={() => completeStep(currentStep)}>
                {currentStep === workflow.steps.length - 1 ? 'Terminer le workflow' : 'Étape suivante'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            {isStepCompleted(currentStep) && currentStep < workflow.steps.length - 1 && (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Étape suivante
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion */}
      {completedSteps.length === workflow.steps.length && (
        <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Workflow Complété !</h3>
            <p className="text-muted-foreground mb-4">
              Félicitations ! Vous maîtrisez maintenant le processus "{workflow.title}".
            </p>
            <Button variant="outline">
              Recommencer le workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}