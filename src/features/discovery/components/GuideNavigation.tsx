import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  User, 
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuideNavigation {
  guideId: string;
  title: string;
  description: string;
  category: 'overview' | 'workflow' | 'feature';
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  completed?: boolean;
}

const guides: GuideNavigation[] = [
  {
    guideId: 'dashboard-overview',
    title: 'Vue d\'ensemble du Dashboard',
    description: 'Découvrez les principales métriques et KPIs de votre établissement',
    category: 'overview',
    difficulty: 'Débutant',
    duration: '3 min'
  },
  {
    guideId: 'checkin-workflow',
    title: 'Processus Check-in',
    description: 'Maîtrisez l\'arrivée des clients et l\'attribution des chambres',
    category: 'workflow',
    difficulty: 'Débutant',
    duration: '5 min'
  },
  {
    guideId: 'pos-workflow',
    title: 'Commande Restaurant',
    description: 'Apprenez à prendre des commandes et encaisser au restaurant',
    category: 'workflow',
    difficulty: 'Débutant',
    duration: '4 min'
  },
  {
    guideId: 'rack-management',
    title: 'Gestion du Rack',
    description: 'Optimisez la visualisation et gestion de vos chambres',
    category: 'feature',
    difficulty: 'Intermédiaire',
    duration: '6 min'
  },
  {
    guideId: 'advanced-analytics',
    title: 'Analytics Avancés',
    description: 'Exploitez les rapports et analyses pour prendre de meilleures décisions',
    category: 'feature',
    difficulty: 'Avancé',
    duration: '8 min'
  }
];

interface GuideNavigationProps {
  selectedGuide?: string;
  onGuideSelect: (guideId: string) => void;
  completedGuides?: string[];
}

const categoryConfig = {
  overview: {
    label: 'Vue d\'ensemble',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  workflow: {
    label: 'Processus',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  feature: {
    label: 'Fonctionnalité',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
};

const difficultyConfig = {
  'Débutant': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Intermédiaire': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Avancé': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function GuideNavigation({ 
  selectedGuide, 
  onGuideSelect, 
  completedGuides = [] 
}: GuideNavigationProps) {
  const totalGuides = guides.length;
  const completedCount = completedGuides.length;
  const progress = (completedCount / totalGuides) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Progression Globale</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} guides complétés sur {totalGuides}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Terminé</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/guide?tab=welcome">
            <div className="text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Commencer</div>
              <div className="text-xs text-muted-foreground">Guide de bienvenue</div>
            </div>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/guide?tab=workflows">
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Workflows</div>
              <div className="text-xs text-muted-foreground">Processus métier</div>
            </div>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-auto p-4">
          <Link to="/guide?tab=demo">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Démo</div>
              <div className="text-xs text-muted-foreground">Mode interactif</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Guides List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Guides Disponibles</h3>
        
        {guides.map((guide) => {
          const isCompleted = completedGuides.includes(guide.guideId);
          const isSelected = selectedGuide === guide.guideId;
          
          return (
            <Card 
              key={guide.guideId}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                isSelected ? 'border-primary/50 bg-primary/5' : ''
              } ${isCompleted ? 'bg-success/5 border-success/20' : ''}`}
              onClick={() => onGuideSelect(guide.guideId)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-foreground">{guide.title}</h4>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {guide.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={categoryConfig[guide.category].color}
                      >
                        {categoryConfig[guide.category].label}
                      </Badge>
                      
                      <Badge 
                        variant="outline"
                        className={difficultyConfig[guide.difficulty]}
                      >
                        {guide.difficulty}
                      </Badge>
                      
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {guide.duration}
                      </Badge>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}