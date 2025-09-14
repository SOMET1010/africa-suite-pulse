import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Zap,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface PredictionData {
  id: string;
  type: 'occupancy' | 'revenue' | 'satisfaction' | 'staff_performance';
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  culturalInsight: string;
  recommendations: string[];
}

interface AIAnalyticsDashboardProps {
  className?: string;
  hotelData?: any;
}

export function AIAnalyticsDashboard({ className, hotelData }: AIAnalyticsDashboardProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Données de prédiction simulées avec contexte africain
  const mockPredictions: PredictionData[] = [
    {
      id: '1',
      type: 'occupancy',
      title: 'Taux d\'Occupation Prévu',
      currentValue: 78,
      predictedValue: 85,
      confidence: 92,
      timeframe: '7 prochains jours',
      trend: 'up',
      impact: 'high',
      culturalInsight: 'Période favorable selon le calendrier traditionnel akan - les voyages d\'affaires augmentent',
      recommendations: [
        'Préparer 12 chambres supplémentaires',
        'Renforcer l\'équipe d\'accueil Teranga',
        'Activer les packages culturels premium'
      ]
    },
    {
      id: '2',
      type: 'revenue',
      title: 'Revenus Restaurant',
      currentValue: 2500000,
      predictedValue: 2850000,
      confidence: 88,
      timeframe: '30 prochains jours',
      trend: 'up',
      impact: 'high',
      culturalInsight: 'Saison des festivités locales - demande accrue pour cuisine traditionnelle',
      recommendations: [
        'Augmenter stock ingrédients locaux',
        'Former équipe sur plats traditionnels',
        'Créer menu spécial festivités'
      ]
    },
    {
      id: '3',
      type: 'satisfaction',
      title: 'Score Satisfaction Client',
      currentValue: 4.2,
      predictedValue: 4.6,
      confidence: 85,
      timeframe: '14 prochains jours',
      trend: 'up',
      impact: 'medium',
      culturalInsight: 'Amélioration continue selon philosophie Kaizen adaptée au contexte africain',
      recommendations: [
        'Intensifier formation Teranga',
        'Personnaliser accueil par origine',
        'Intégrer plus d\'éléments culturels'
      ]
    },
    {
      id: '4',
      type: 'staff_performance',
      title: 'Performance Équipe Ubuntu',
      currentValue: 87,
      predictedValue: 82,
      confidence: 79,
      timeframe: '21 prochains jours',
      trend: 'down',
      impact: 'medium',
      culturalInsight: 'Période de fatigue collective - besoin de renforcer l\'esprit Ubuntu',
      recommendations: [
        'Organiser session team building',
        'Répartir charges de travail',
        'Célébrer succès collectifs'
      ]
    }
  ];

  // Données pour les graphiques
  const occupancyTrendData = [
    { date: 'Lun', actual: 75, predicted: 78, ubuntu: 85 },
    { date: 'Mar', actual: 78, predicted: 80, ubuntu: 87 },
    { date: 'Mer', actual: 82, predicted: 83, ubuntu: 89 },
    { date: 'Jeu', actual: 79, predicted: 85, ubuntu: 86 },
    { date: 'Ven', actual: 85, predicted: 88, ubuntu: 92 },
    { date: 'Sam', actual: 92, predicted: 94, ubuntu: 95 },
    { date: 'Dim', actual: 88, predicted: 90, ubuntu: 91 }
  ];

  const revenueBySourceData = [
    { name: 'Hébergement', value: 45, color: '#8B4513' },
    { name: 'Restaurant', value: 30, color: '#FFD700' },
    { name: 'Bar', value: 15, color: '#D2691E' },
    { name: 'Services', value: 10, color: '#228B22' }
  ];

  const culturalMetricsData = [
    { metric: 'Score Ubuntu', value: 87, target: 90, color: '#A0522D' },
    { metric: 'Rating Teranga', value: 92, target: 95, color: '#FF8C00' },
    { metric: 'Index Harambee', value: 78, target: 85, color: '#228B22' },
    { metric: 'Coeff Sankofa', value: 85, target: 88, color: '#FFD700' }
  ];

  useEffect(() => {
    // Simulation du chargement des prédictions
    setTimeout(() => {
      setPredictions(mockPredictions);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-amber-50 to-orange-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-pulse text-amber-600 mx-auto mb-4" />
            <p className="text-amber-800">Analyse IA en cours...</p>
            <p className="text-sm text-amber-600">Génération des prédictions africaines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec métriques globales */}
      <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Analytics IA Africaine</CardTitle>
                <CardDescription className="text-amber-100">
                  Prédictions intelligentes avec sagesse culturelle
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Active
              </Badge>
              <Badge className="bg-white/20 text-white">
                🌍 Contexte Africain
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">92%</div>
              <div className="text-sm text-amber-100">Précision IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm text-amber-100">Prédictions Actives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">+15%</div>
              <div className="text-sm text-amber-100">Amélioration Prévue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">7j</div>
              <div className="text-sm text-amber-100">Horizon Prédiction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="7d">7 Jours</TabsTrigger>
          <TabsTrigger value="30d">30 Jours</TabsTrigger>
          <TabsTrigger value="90d">3 Mois</TabsTrigger>
          <TabsTrigger value="1y">1 Année</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="space-y-6">
          {/* Prédictions principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-amber-900">{prediction.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend)}
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Actuel</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {prediction.type === 'revenue' 
                          ? formatCurrency(prediction.currentValue)
                          : prediction.type === 'satisfaction'
                          ? `${prediction.currentValue}/5`
                          : `${prediction.currentValue}%`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prévu ({prediction.timeframe})</p>
                      <p className={`text-2xl font-bold ${
                        prediction.trend === 'up' ? 'text-green-600' : 
                        prediction.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {prediction.type === 'revenue' 
                          ? formatCurrency(prediction.predictedValue)
                          : prediction.type === 'satisfaction'
                          ? `${prediction.predictedValue}/5`
                          : `${prediction.predictedValue}%`
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Confiance IA</span>
                      <span className="text-sm font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Insight Culturel</p>
                        <p className="text-sm text-amber-800">{prediction.culturalInsight}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Recommandations IA :</p>
                    <ul className="space-y-1">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-amber-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graphiques d'analyse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendance d'occupation */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">Tendance d'Occupation avec Score Ubuntu</CardTitle>
                <CardDescription>Corrélation entre performance d'équipe et occupation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={occupancyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8B4513" 
                      strokeWidth={2}
                      name="Occupation Réelle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Prédiction IA"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ubuntu" 
                      stroke="#228B22" 
                      strokeWidth={2}
                      name="Score Ubuntu"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition des revenus */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">Prédiction Revenus par Source</CardTitle>
                <CardDescription>Analyse IA des sources de revenus optimales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={revenueBySourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {revenueBySourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métriques culturelles */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">🎭 Métriques Culturelles Africaines</CardTitle>
              <CardDescription>Performance selon les philosophies africaines intégrées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {culturalMetricsData.map((metric, index) => (
                  <div key={index} className="p-4 rounded-lg border" style={{ borderColor: metric.color }}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm" style={{ color: metric.color }}>
                        {metric.metric}
                      </h4>
                      <Star className="h-4 w-4" style={{ color: metric.color }} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{metric.value}%</span>
                        <span className="text-sm text-gray-600">/ {metric.target}%</span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-600">
                        Objectif: {metric.target}% 
                        ({metric.value >= metric.target ? '✅ Atteint' : `📈 +${metric.target - metric.value}% requis`})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertes et recommandations IA */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes IA et Actions Recommandées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Action Urgente - 24h</h4>
                    <p className="text-sm text-orange-800">
                      Baisse prévue du score Ubuntu (-5%). Organiser une session de team building selon la tradition africaine.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Opportunité - 7 jours</h4>
                    <p className="text-sm text-green-800">
                      Pic d'occupation prévu (+7%). Préparer packages culturels premium pour maximiser les revenus.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Optimisation Continue</h4>
                    <p className="text-sm text-blue-800">
                      Intégrer plus d'éléments Teranga dans l'accueil pour améliorer la satisfaction client (+0.4 points prévus).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

