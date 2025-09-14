import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  Zap,
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Monitor,
  Heart,
  Cpu,
  HardDrive,
  Network,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Smartphone,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: Date;
  culturalContext?: string;
}

interface Alert {
  id: string;
  type: 'system' | 'business' | 'security' | 'cultural';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  culturalWisdom?: string;
  ubuntuAction?: string;
}

interface AfricanMonitoringDashboardProps {
  className?: string;
}

export function AfricanMonitoringDashboard({ className }: AfricanMonitoringDashboardProps) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Métriques système simulées avec contexte africain
  const mockSystemMetrics: SystemMetric[] = [
    {
      id: '1',
      name: 'Santé Serveur Ubuntu',
      value: 94,
      unit: '%',
      status: 'healthy',
      threshold: 90,
      trend: 'stable',
      lastUpdate: new Date(),
      culturalContext: 'Comme un baobab robuste, notre serveur reste stable'
    },
    {
      id: '2',
      name: 'Performance Base de Données',
      value: 87,
      unit: '%',
      status: 'healthy',
      threshold: 80,
      trend: 'up',
      lastUpdate: new Date(),
      culturalContext: 'Mémoire collective numérique en harmonie'
    },
    {
      id: '3',
      name: 'Connectivité Réseau',
      value: 76,
      unit: '%',
      status: 'warning',
      threshold: 85,
      trend: 'down',
      lastUpdate: new Date(),
      culturalContext: 'Liens communautaires à renforcer selon Harambee'
    },
    {
      id: '4',
      name: 'Sécurité Teranga',
      value: 98,
      unit: '%',
      status: 'healthy',
      threshold: 95,
      trend: 'stable',
      lastUpdate: new Date(),
      culturalContext: 'Protection bienveillante de nos données'
    },
    {
      id: '5',
      name: 'Satisfaction Utilisateurs',
      value: 92,
      unit: '%',
      status: 'healthy',
      threshold: 85,
      trend: 'up',
      lastUpdate: new Date(),
      culturalContext: 'Esprit Ubuntu : nos utilisateurs sont heureux'
    },
    {
      id: '6',
      name: 'Efficacité Énergétique',
      value: 83,
      unit: '%',
      status: 'healthy',
      threshold: 75,
      trend: 'stable',
      lastUpdate: new Date(),
      culturalContext: 'Respect de la terre mère - consommation optimisée'
    }
  ];

  // Alertes simulées avec sagesse africaine
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'system',
      severity: 'medium',
      title: 'Connectivité Réseau Dégradée',
      description: 'La bande passante a diminué de 15% dans les 2 dernières heures',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: false,
      culturalWisdom: 'Comme dit le proverbe akan : "Quand les fourmis s\'unissent, elles peuvent porter un éléphant"',
      ubuntuAction: 'Collaboration avec l\'équipe technique pour résoudre ensemble'
    },
    {
      id: '2',
      type: 'business',
      severity: 'high',
      title: 'Pic d\'Activité Inattendu',
      description: 'Augmentation de 40% du trafic - capacité à 85%',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false,
      culturalWisdom: 'Prospérité soudaine - bénédiction des ancêtres',
      ubuntuAction: 'Mobilisation collective pour gérer l\'affluence'
    },
    {
      id: '3',
      type: 'security',
      severity: 'low',
      title: 'Tentative d\'Accès Inhabituelle',
      description: '3 tentatives de connexion depuis une nouvelle localisation',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      resolved: true,
      culturalWisdom: 'Vigilance Teranga : accueillir avec prudence',
      ubuntuAction: 'Protection communautaire activée'
    },
    {
      id: '4',
      type: 'cultural',
      severity: 'medium',
      title: 'Score Ubuntu en Baisse',
      description: 'Collaboration d\'équipe descendue à 78% (-5% cette semaine)',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      resolved: false,
      culturalWisdom: 'Ubuntu : "Je suis parce que nous sommes" - renforcer les liens',
      ubuntuAction: 'Session de team building prévue demain'
    }
  ];

  // Données pour les graphiques de monitoring
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 67, network: 78, ubuntu: 87 },
    { time: '04:00', cpu: 52, memory: 71, network: 82, ubuntu: 89 },
    { time: '08:00', cpu: 78, memory: 85, network: 76, ubuntu: 85 },
    { time: '12:00', cpu: 85, memory: 89, network: 74, ubuntu: 82 },
    { time: '16:00', cpu: 92, memory: 94, network: 71, ubuntu: 78 },
    { time: '20:00', cpu: 67, memory: 78, network: 79, ubuntu: 84 },
    { time: '24:00', cpu: 54, memory: 69, network: 83, ubuntu: 88 }
  ];

  const alertsDistributionData = [
    { name: 'Système', value: 35, color: '#8B4513' },
    { name: 'Business', value: 25, color: '#FFD700' },
    { name: 'Sécurité', value: 20, color: '#D2691E' },
    { name: 'Culturel', value: 20, color: '#228B22' }
  ];

  const uptimeData = [
    { date: 'Lun', uptime: 99.8, incidents: 1 },
    { date: 'Mar', uptime: 99.9, incidents: 0 },
    { date: 'Mer', uptime: 99.7, incidents: 2 },
    { date: 'Jeu', uptime: 99.9, incidents: 0 },
    { date: 'Ven', uptime: 99.6, incidents: 3 },
    { date: 'Sam', uptime: 99.9, incidents: 0 },
    { date: 'Dim', uptime: 99.8, incidents: 1 }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setSystemMetrics(mockSystemMetrics);
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);

    // Simulation de mise à jour en temps réel
    const interval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5)),
        lastUpdate: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-green-200 bg-green-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      case 'high': return 'border-red-200 bg-red-50';
      case 'critical': return 'border-red-500 bg-red-100';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Monitor className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800">Initialisation du monitoring...</p>
            <p className="text-sm text-blue-600">Connexion aux systèmes Ubuntu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statut global */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Monitoring Ubuntu Africain</CardTitle>
                <CardDescription className="text-blue-100">
                  Surveillance intelligente avec philosophie Ubuntu
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Heart className="h-3 w-3 mr-1" />
                Système Sain
              </Badge>
              <Badge className="bg-white/20 text-white">
                🌍 Monitoring Africain
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">99.2%</div>
              <div className="text-sm text-blue-100">Uptime Global</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{activeAlerts.length}</div>
              <div className="text-sm text-blue-100">Alertes Actives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">6</div>
              <div className="text-sm text-blue-100">Systèmes Surveillés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-blue-100">Surveillance Continue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes critiques */}
      {(criticalAlerts > 0 || highAlerts > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Attention Requise - Esprit Ubuntu
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalAlerts > 0 && `${criticalAlerts} alerte(s) critique(s) `}
            {highAlerts > 0 && `${highAlerts} alerte(s) haute priorité `}
            nécessitent une action collective immédiate.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1h">1 Heure</TabsTrigger>
          <TabsTrigger value="24h">24 Heures</TabsTrigger>
          <TabsTrigger value="7d">7 Jours</TabsTrigger>
          <TabsTrigger value="30d">30 Jours</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="space-y-6">
          {/* Métriques système principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric) => (
              <Card key={metric.id} className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{metric.value.toFixed(1)}</span>
                    <span className="text-lg text-gray-600">{metric.unit}</span>
                  </div>
                  
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'healthy' ? 'bg-green-100' :
                      metric.status === 'warning' ? 'bg-orange-100' : 'bg-red-100'
                    }`}
                  />
                  
                  <div className="text-xs text-gray-600">
                    Seuil: {metric.threshold}{metric.unit} | 
                    Mis à jour: {metric.lastUpdate.toLocaleTimeString('fr-FR')}
                  </div>
                  
                  {metric.culturalContext && (
                    <div className="p-2 bg-amber-50 rounded text-xs text-amber-800 italic">
                      💭 {metric.culturalContext}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graphiques de performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance temps réel */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Performance Système Ubuntu</CardTitle>
                <CardDescription>Métriques en temps réel avec score Ubuntu</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#8B4513" 
                      strokeWidth={2}
                      name="CPU %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      name="Mémoire %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="network" 
                      stroke="#D2691E" 
                      strokeWidth={2}
                      name="Réseau %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ubuntu" 
                      stroke="#228B22" 
                      strokeWidth={3}
                      name="Score Ubuntu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Uptime et incidents */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Disponibilité et Incidents</CardTitle>
                <CardDescription>Stabilité du système selon philosophie Sankofa</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={uptimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#228B22" 
                      fill="#228B22" 
                      fillOpacity={0.3}
                      name="Uptime %"
                    />
                    <Bar 
                      dataKey="incidents" 
                      fill="#FF6B6B" 
                      name="Incidents"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertes actives */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertes Actives - Gestion Ubuntu
              </CardTitle>
              <CardDescription>
                Résolution collaborative selon l'esprit "Je suis parce que nous sommes"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-800 font-medium">Aucune alerte active</p>
                    <p className="text-green-600 text-sm">Tous les systèmes fonctionnent en harmonie Ubuntu</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                            <Badge 
                              className={
                                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                          <p className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleString('fr-FR')}
                          </p>
                          
                          {alert.culturalWisdom && (
                            <div className="mt-3 p-2 bg-amber-50 rounded text-sm">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-600">🌍</span>
                                <div>
                                  <p className="font-medium text-amber-900">Sagesse Africaine :</p>
                                  <p className="text-amber-800 italic">{alert.culturalWisdom}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {alert.ubuntuAction && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                              <div className="flex items-start gap-2">
                                <span className="text-green-600">🤝</span>
                                <div>
                                  <p className="font-medium text-green-900">Action Ubuntu :</p>
                                  <p className="text-green-800">{alert.ubuntuAction}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résoudre
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques et insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Systèmes Sains</p>
                    <p className="text-2xl font-bold text-green-900">
                      {systemMetrics.filter(m => m.status === 'healthy').length}/6
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Alertes Moyennes</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {alerts.filter(a => a.severity === 'medium' && !a.resolved).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Score Ubuntu Moyen</p>
                    <p className="text-2xl font-bold text-blue-900">87%</p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Temps de Réponse</p>
                    <p className="text-2xl font-bold text-purple-900">1.2s</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

