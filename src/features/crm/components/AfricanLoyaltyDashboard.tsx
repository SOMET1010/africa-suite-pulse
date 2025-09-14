import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Star, 
  Gift, 
  Crown, 
  Heart, 
  TrendingUp, 
  Award, 
  Coins,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Diamond,
  Gem,
  Shield,
  Flame,
  Mountain,
  Sun,
  Moon,
  TreePine,
  Waves,
  Coffee,
  Utensils,
  Bed,
  Car,
  Plane,
  Camera,
  Music,
  Palette
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Cell, RadialBarChart, RadialBar } from 'recharts';

interface LoyaltyMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveau: 'bronze' | 'argent' | 'or' | 'diamant' | 'ubuntu';
  points: number;
  pointsLifetime: number;
  sejours: number;
  depenseTotal: number;
  dateInscription: Date;
  dernierSejour: Date;
  prochainNiveau: string;
  pointsManquants: number;
  avatar?: string;
  preferences: {
    cuisine: string[];
    activites: string[];
    chambre: string;
  };
  culturalProfile: {
    origine: string;
    langues: string[];
    traditions: string[];
    philosophie: 'ubuntu' | 'teranga' | 'harambee' | 'sankofa';
  };
}

interface LoyaltyProgram {
  id: string;
  nom: string;
  description: string;
  niveau: string;
  couleur: string;
  icone: React.ReactNode;
  seuilPoints: number;
  avantages: string[];
  philosophieAfricaine: string;
  proverbe: string;
}

interface LoyaltyStats {
  totalMembres: number;
  membresActifs: number;
  pointsDistribues: number;
  recompensesUtilisees: number;
  tauxFidelisation: number;
  valeurVieMoyenne: number;
  niveauMoyen: string;
}

interface AfricanLoyaltyDashboardProps {
  className?: string;
}

export function AfricanLoyaltyDashboard({ className }: AfricanLoyaltyDashboardProps) {
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  // Programmes de fidélité avec philosophies africaines
  const loyaltyPrograms: LoyaltyProgram[] = [
    {
      id: '1',
      nom: 'Baobab Bronze',
      description: 'Premiers pas dans la famille Ubuntu',
      niveau: 'bronze',
      couleur: '#CD7F32',
      icone: <TreePine className="h-5 w-5" />,
      seuilPoints: 0,
      avantages: ['Wi-Fi gratuit', 'Accueil Teranga', 'Newsletter culturelle'],
      philosophieAfricaine: 'Ubuntu - Nous grandissons ensemble',
      proverbe: 'Un arbre ne fait pas une forêt'
    },
    {
      id: '2',
      nom: 'Savane Argent',
      description: 'Voyageur régulier de la communauté',
      niveau: 'argent',
      couleur: '#C0C0C0',
      icone: <Mountain className="h-5 w-5" />,
      seuilPoints: 1000,
      avantages: ['Check-in prioritaire', 'Surclassement gratuit', 'Petit-déjeuner offert'],
      philosophieAfricaine: 'Teranga - Hospitalité chaleureuse',
      proverbe: 'L\'hospitalité est la richesse du cœur'
    },
    {
      id: '3',
      nom: 'Soleil Or',
      description: 'Membre privilégié de la famille',
      niveau: 'or',
      couleur: '#FFD700',
      icone: <Sun className="h-5 w-5" />,
      seuilPoints: 5000,
      avantages: ['Lounge VIP', 'Spa 20% réduction', 'Concierge personnel', 'Late check-out'],
      philosophieAfricaine: 'Harambee - Travaillons ensemble vers l\'excellence',
      proverbe: 'Seul on va plus vite, ensemble on va plus loin'
    },
    {
      id: '4',
      nom: 'Étoile Diamant',
      description: 'Ambassadeur de l\'excellence africaine',
      niveau: 'diamant',
      couleur: '#B9F2FF',
      icone: <Diamond className="h-5 w-5" />,
      seuilPoints: 15000,
      avantages: ['Suite gratuite', 'Transfert aéroport', 'Dîner gastronomique', 'Expériences culturelles'],
      philosophieAfricaine: 'Sankofa - Apprendre du passé pour exceller',
      proverbe: 'Il n\'est jamais trop tard pour revenir chercher ce qu\'on a oublié'
    },
    {
      id: '5',
      nom: 'Ubuntu Prestige',
      description: 'Sage de la communauté hôtelière',
      niveau: 'ubuntu',
      couleur: '#8B4513',
      icone: <Crown className="h-5 w-5" />,
      seuilPoints: 50000,
      avantages: ['Accès illimité', 'Expériences sur mesure', 'Mentor culturel', 'Événements exclusifs'],
      philosophieAfricaine: 'Ubuntu Suprême - Je suis parce que nous sommes',
      proverbe: 'La sagesse d\'un homme profite à toute la communauté'
    }
  ];

  // Membres simulés avec profils culturels
  const mockMembers: LoyaltyMember[] = [
    {
      id: '1',
      nom: 'Kouassi',
      prenom: 'Akwaba',
      email: 'akwaba.kouassi@email.com',
      telephone: '+225 07 12 34 56 78',
      niveau: 'or',
      points: 7850,
      pointsLifetime: 12450,
      sejours: 15,
      depenseTotal: 4500000,
      dateInscription: new Date('2023-03-15'),
      dernierSejour: new Date('2024-09-01'),
      prochainNiveau: 'Étoile Diamant',
      pointsManquants: 7150,
      preferences: {
        cuisine: ['Ivoirienne', 'Française', 'Libanaise'],
        activites: ['Spa', 'Golf', 'Excursions culturelles'],
        chambre: 'Vue mer'
      },
      culturalProfile: {
        origine: 'Côte d\'Ivoire',
        langues: ['Français', 'Baoulé', 'Anglais'],
        traditions: ['Masques Dan', 'Musique Zouglou', 'Cuisine Attiéké'],
        philosophie: 'teranga'
      }
    },
    {
      id: '2',
      nom: 'Diallo',
      prenom: 'Aminata',
      email: 'aminata.diallo@email.com',
      telephone: '+221 77 123 45 67',
      niveau: 'diamant',
      points: 18750,
      pointsLifetime: 28900,
      sejours: 28,
      depenseTotal: 8750000,
      dateInscription: new Date('2022-08-20'),
      dernierSejour: new Date('2024-09-10'),
      prochainNiveau: 'Ubuntu Prestige',
      pointsManquants: 31250,
      preferences: {
        cuisine: ['Sénégalaise', 'Marocaine', 'Internationale'],
        activites: ['Wellness', 'Shopping', 'Gastronomie'],
        chambre: 'Suite présidentielle'
      },
      culturalProfile: {
        origine: 'Sénégal',
        langues: ['Français', 'Wolof', 'Arabe'],
        traditions: ['Sabar', 'Thieboudienne', 'Boubou'],
        philosophie: 'teranga'
      }
    },
    {
      id: '3',
      nom: 'Mensah',
      prenom: 'Kwame',
      email: 'kwame.mensah@email.com',
      telephone: '+233 24 123 45 67',
      niveau: 'ubuntu',
      points: 65400,
      pointsLifetime: 89750,
      sejours: 45,
      depenseTotal: 15600000,
      dateInscription: new Date('2021-11-10'),
      dernierSejour: new Date('2024-09-12'),
      prochainNiveau: 'Niveau Maximum',
      pointsManquants: 0,
      preferences: {
        cuisine: ['Ghanéenne', 'Fusion', 'Végétarienne'],
        activites: ['Conférences', 'Networking', 'Art'],
        chambre: 'Villa privée'
      },
      culturalProfile: {
        origine: 'Ghana',
        langues: ['Anglais', 'Twi', 'Français'],
        traditions: ['Kente', 'Adinkra', 'Highlife'],
        philosophie: 'ubuntu'
      }
    }
  ];

  const mockStats: LoyaltyStats = {
    totalMembres: 2847,
    membresActifs: 1923,
    pointsDistribues: 1250000,
    recompensesUtilisees: 847,
    tauxFidelisation: 87.5,
    valeurVieMoyenne: 3250000,
    niveauMoyen: 'Savane Argent'
  };

  // Données pour les graphiques
  const loyaltyTrendData = [
    { mois: 'Jan', nouveaux: 145, actifs: 1650, points: 95000 },
    { mois: 'Fév', nouveaux: 167, actifs: 1720, points: 102000 },
    { mois: 'Mar', nouveaux: 189, actifs: 1780, points: 108000 },
    { mois: 'Avr', nouveaux: 203, actifs: 1845, points: 115000 },
    { mois: 'Mai', nouveaux: 178, actifs: 1890, points: 121000 },
    { mois: 'Jun', nouveaux: 195, actifs: 1920, points: 128000 },
    { mois: 'Jul', nouveaux: 212, actifs: 1950, points: 135000 },
    { mois: 'Aoû', nouveaux: 234, actifs: 1980, points: 142000 },
    { mois: 'Sep', nouveaux: 198, actifs: 1923, points: 125000 }
  ];

  const niveauxDistributionData = [
    { niveau: 'Bronze', membres: 1245, couleur: '#CD7F32' },
    { niveau: 'Argent', membres: 892, couleur: '#C0C0C0' },
    { niveau: 'Or', membres: 456, couleur: '#FFD700' },
    { niveau: 'Diamant', membres: 189, couleur: '#B9F2FF' },
    { niveau: 'Ubuntu', membres: 65, couleur: '#8B4513' }
  ];

  const culturalPhilosophyData = [
    { philosophie: 'Ubuntu', membres: 1156, couleur: '#8B4513' },
    { philosophie: 'Teranga', membres: 987, couleur: '#FF8C00' },
    { philosophie: 'Harambee', membres: 456, couleur: '#228B22' },
    { philosophie: 'Sankofa', membres: 248, couleur: '#FFD700' }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setLoyaltyStats(mockStats);
      setMembers(mockMembers);
      setPrograms(loyaltyPrograms);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getNiveauColor = (niveau: string) => {
    const program = programs.find(p => p.niveau === niveau);
    return program?.couleur || '#gray';
  };

  const getNiveauIcon = (niveau: string) => {
    const program = programs.find(p => p.niveau === niveau);
    return program?.icone || <Star className="h-4 w-4" />;
  };

  const getPhilosophyIcon = (philosophie: string) => {
    switch (philosophie) {
      case 'ubuntu': return <Heart className="h-4 w-4 text-amber-700" />;
      case 'teranga': return <Sparkles className="h-4 w-4 text-orange-600" />;
      case 'harambee': return <Zap className="h-4 w-4 text-green-600" />;
      case 'sankofa': return <Trophy className="h-4 w-4 text-yellow-600" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-8 w-8 animate-pulse text-purple-600 mx-auto mb-4" />
            <p className="text-purple-800">Chargement du CRM Ubuntu...</p>
            <p className="text-sm text-purple-600">Analyse des profils culturels</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statistiques globales */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">CRM Ubuntu - Fidélité Africaine</CardTitle>
                <CardDescription className="text-purple-100">
                  Programme de fidélité avec philosophies africaines authentiques
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Heart className="h-3 w-3 mr-1" />
                {loyaltyStats?.membresActifs} Actifs
              </Badge>
              <Badge className="bg-white/20 text-white">
                🌍 Culturel
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{loyaltyStats?.totalMembres}</div>
              <div className="text-sm text-purple-100">Membres Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{loyaltyStats?.tauxFidelisation}%</div>
              <div className="text-sm text-purple-100">Taux Fidélisation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{loyaltyStats?.pointsDistribues?.toLocaleString()}</div>
              <div className="text-sm text-purple-100">Points Distribués</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(loyaltyStats?.valeurVieMoyenne || 0)}</div>
              <div className="text-sm text-purple-100">Valeur Vie Moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="members">Membres VIP</TabsTrigger>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="cultural">Profils Culturels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques de fidélité */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Nouveaux Membres</p>
                    <p className="text-2xl font-bold text-blue-900">198</p>
                    <p className="text-xs text-blue-600">Ce mois</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Récompenses Utilisées</p>
                    <p className="text-2xl font-bold text-green-900">{loyaltyStats?.recompensesUtilisees}</p>
                    <p className="text-xs text-green-600">Ce mois</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Niveau Moyen</p>
                    <p className="text-lg font-bold text-orange-900">{loyaltyStats?.niveauMoyen}</p>
                    <p className="text-xs text-orange-600">Progression +5%</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Score Ubuntu Moyen</p>
                    <p className="text-2xl font-bold text-purple-900">8.7/10</p>
                    <p className="text-xs text-purple-600">Excellent</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques d'analyse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution de la fidélité */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Évolution Programme Fidélité</CardTitle>
                <CardDescription>Croissance des membres et engagement Ubuntu</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={loyaltyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="nouveaux" 
                      stroke="#8B4513" 
                      strokeWidth={2}
                      name="Nouveaux Membres"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actifs" 
                      stroke="#FFD700" 
                      strokeWidth={2}
                      name="Membres Actifs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#228B22" 
                      strokeWidth={3}
                      name="Points Distribués"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribution par niveau */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-900">Répartition par Niveau</CardTitle>
                <CardDescription>Distribution des membres selon philosophies africaines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={niveauxDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="niveau" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="membres" name="Membres">
                      {niveauxDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.couleur} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Philosophies culturelles */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-900">🎭 Répartition par Philosophie Africaine</CardTitle>
              <CardDescription>Préférences culturelles des membres fidèles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {culturalPhilosophyData.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border" style={{ borderColor: item.couleur }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold" style={{ color: item.couleur }}>
                        {item.philosophie}
                      </h4>
                      {getPhilosophyIcon(item.philosophie.toLowerCase())}
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{item.membres}</div>
                      <Progress 
                        value={(item.membres / loyaltyStats!.totalMembres) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-600">
                        {((item.membres / loyaltyStats!.totalMembres) * 100).toFixed(1)}% des membres
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Liste des membres VIP */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-purple-900">Membres VIP Ubuntu</CardTitle>
                  <CardDescription>Profils détaillés avec contexte culturel africain</CardDescription>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Users className="h-4 w-4 mr-1" />
                  Ajouter Membre
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback style={{ backgroundColor: getNiveauColor(member.niveau) }}>
                            {member.prenom[0]}{member.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {member.prenom} {member.nom}
                            </h3>
                            <Badge 
                              className="text-white"
                              style={{ backgroundColor: getNiveauColor(member.niveau) }}
                            >
                              {getNiveauIcon(member.niveau)}
                              <span className="ml-1 capitalize">{member.niveau}</span>
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getPhilosophyIcon(member.culturalProfile.philosophie)}
                              <span className="text-sm capitalize">{member.culturalProfile.philosophie}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Contact</p>
                              <p className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </p>
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.telephone}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600">Activité</p>
                              <p>{member.sejours} séjours</p>
                              <p>{formatCurrency(member.depenseTotal)} dépensé</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600">Profil Culturel</p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {member.culturalProfile.origine}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.culturalProfile.langues.join(', ')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Progression vers {member.prochainNiveau}
                              </span>
                              <span className="text-sm font-medium">
                                {member.points.toLocaleString()} points
                              </span>
                            </div>
                            <Progress 
                              value={member.pointsManquants > 0 ? 
                                (member.points / (member.points + member.pointsManquants)) * 100 : 100
                              } 
                              className="h-2"
                            />
                            {member.pointsManquants > 0 && (
                              <p className="text-xs text-gray-500">
                                {member.pointsManquants.toLocaleString()} points manquants
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Gift className="h-4 w-4 mr-1" />
                          Récompenser
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Historique
                        </Button>
                      </div>
                    </div>
                    
                    {/* Préférences culturelles */}
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2">🎭 Préférences Culturelles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-amber-700 font-medium">Cuisine</p>
                          <p className="text-amber-800">{member.preferences.cuisine.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-amber-700 font-medium">Activités</p>
                          <p className="text-amber-800">{member.preferences.activites.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-amber-700 font-medium">Traditions</p>
                          <p className="text-amber-800">{member.culturalProfile.traditions.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          {/* Programmes de fidélité */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card 
                key={program.id} 
                className="bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow"
                style={{ borderColor: program.couleur }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full text-white"
                        style={{ backgroundColor: program.couleur }}
                      >
                        {program.icone}
                      </div>
                      <div>
                        <CardTitle className="text-lg" style={{ color: program.couleur }}>
                          {program.nom}
                        </CardTitle>
                        <CardDescription>{program.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Seuil d'entrée</p>
                    <p className="text-xl font-bold" style={{ color: program.couleur }}>
                      {program.seuilPoints.toLocaleString()} points
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Avantages inclus :</p>
                    <ul className="space-y-1">
                      {program.avantages.map((avantage, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span style={{ color: program.couleur }}>•</span>
                          {avantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${program.couleur}20` }}>
                    <p className="text-sm font-medium" style={{ color: program.couleur }}>
                      🎭 {program.philosophieAfricaine}
                    </p>
                    <p className="text-sm italic mt-1" style={{ color: program.couleur }}>
                      "{program.proverbe}"
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {niveauxDistributionData.find(n => n.niveau.toLowerCase().includes(program.niveau))?.membres || 0} membres
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-6">
          {/* Analyse culturelle approfondie */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-900">🌍 Analyse Culturelle Approfondie</CardTitle>
              <CardDescription>
                Insights sur les préférences culturelles et philosophiques de nos membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition par philosophie */}
                <div>
                  <h4 className="font-semibold mb-4">Philosophies Africaines Préférées</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={culturalPhilosophyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="membres"
                        label={({ philosophie, membres }) => `${philosophie}: ${membres}`}
                      >
                        {culturalPhilosophyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.couleur} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Insights culturels */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Insights Culturels Clés</h4>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <Heart className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-amber-900">Ubuntu Dominant</h5>
                        <p className="text-sm text-amber-800">
                          40% de nos membres privilégient la philosophie Ubuntu, 
                          recherchant l'esprit communautaire et l'interconnexion.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-orange-900">Hospitalité Teranga</h5>
                        <p className="text-sm text-orange-800">
                          35% valorisent l'hospitalité Teranga, appréciant 
                          l'accueil chaleureux et personnalisé.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2">
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-green-900">Esprit Harambee</h5>
                        <p className="text-sm text-green-800">
                          16% préfèrent Harambee, recherchant des expériences 
                          collaboratives et des activités de groupe.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-900">Sagesse Sankofa</h5>
                        <p className="text-sm text-yellow-800">
                          9% choisissent Sankofa, valorisant l'apprentissage 
                          continu et les traditions ancestrales.
                        </p>
                      </div>
                    </div>
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

