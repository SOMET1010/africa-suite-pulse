import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  BookOpen, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';

interface ModuleStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'overview' | 'hands-on' | 'practice';
  completed?: boolean;
}

interface ModuleGuideProps {
  moduleId: string;
  moduleName: string;
  description: string;
  totalDuration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  steps: ModuleStep[];
  onStepComplete: (stepId: string) => void;
  onModuleComplete: () => void;
}

const stepTypeConfig = {
  overview: {
    icon: BookOpen,
    label: 'Vue d\'ensemble',
    color: 'text-blue-600'
  },
  'hands-on': {
    icon: PlayCircle,
    label: 'Pratique guidée',
    color: 'text-green-600'
  },
  practice: {
    icon: Star,
    label: 'Exercice',
    color: 'text-yellow-600'
  }
};

export function ModuleGuide({
  moduleId,
  moduleName,
  description,
  totalDuration,
  difficulty,
  steps,
  onStepComplete,
  onModuleComplete
}: ModuleGuideProps) {
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  const isCompleted = completedSteps === steps.length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{moduleName}</CardTitle>
              <CardDescription className="text-base mt-2">
                {description}
              </CardDescription>
            </div>
            {isCompleted && (
              <Badge className="bg-success text-white">
                <CheckCircle className="h-4 w-4 mr-1" />
                Complété
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {totalDuration}
            </Badge>
            <Badge variant="outline">
              Niveau {difficulty}
            </Badge>
            <Badge variant="outline">
              {completedSteps}/{steps.length} étapes
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

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const StepIcon = stepTypeConfig[step.type].icon;
          const isActive = !step.completed && (index === 0 || steps[index - 1]?.completed);
          
          return (
            <Card 
              key={step.id} 
              className={`transition-all ${
                step.completed 
                  ? 'bg-success/5 border-success/20' 
                  : isActive 
                    ? 'border-primary/50 shadow-sm' 
                    : 'opacity-60'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    step.completed 
                      ? 'bg-success/20' 
                      : isActive 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <StepIcon className={`h-5 w-5 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${
                        step.completed ? 'text-success' : 'text-foreground'
                      }`}>
                        Étape {index + 1}: {step.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${stepTypeConfig[step.type].color}`}
                      >
                        {stepTypeConfig[step.type].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {step.duration}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {step.description}
                    </p>
                    
                    {isActive && !step.completed && (
                      <Button 
                        onClick={() => onStepComplete(step.id)}
                        size="sm"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Commencer cette étape
                      </Button>
                    )}
                    
                    {step.completed && (
                      <div className="flex items-center gap-2 text-success text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Étape complétée
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module Completion */}
      {isCompleted && (
        <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Module Complété !</h3>
            <p className="text-muted-foreground mb-4">
              Félicitations ! Vous maîtrisez maintenant le module {moduleName}.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                Revoir le module
              </Button>
              <Button onClick={onModuleComplete}>
                Module suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}