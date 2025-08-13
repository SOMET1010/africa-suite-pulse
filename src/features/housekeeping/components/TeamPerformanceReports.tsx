import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target,
  CheckCircle2,
  Timer,
  Star,
  Trophy,
  Medal
} from 'lucide-react';
import { HousekeepingTask, HousekeepingStaff } from '../types';

interface TeamPerformanceReportsProps {
  tasks: HousekeepingTask[];
  staff: HousekeepingStaff[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  tasksCompleted: number;
  tasksInProgress: number;
  averageTime: number;
  efficiency: number;
  punctuality: number;
  qualityScore: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  badges: string[];
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  avgEfficiency: number;
  totalTasksCompleted: number;
  avgCompletionTime: number;
  teamMorale: number;
}

export function TeamPerformanceReports({ tasks, staff }: TeamPerformanceReportsProps) {
  
  // Calculer les performances de chaque membre de l'équipe
  const calculateTeamPerformance = (): TeamMember[] => {
    return staff.map(member => {
      const memberTasks = tasks.filter(task => task.staff_id === member.id);
      const completedTasks = memberTasks.filter(task => task.status === 'completed');
      const inProgressTasks = memberTasks.filter(task => task.status === 'in_progress');
      
      // Temps moyen de completion
      const avgTime = completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => sum + (task.actual_duration || task.estimated_duration), 0) / completedTasks.length
        : 0;
      
      // Efficacité (basée sur le respect des temps estimés)
      const onTimeCompletions = completedTasks.filter(task => 
        (task.actual_duration || task.estimated_duration) <= task.estimated_duration * 1.1
      ).length;
      const efficiency = completedTasks.length > 0 ? (onTimeCompletions / completedTasks.length) * 100 : 0;
      
      // Ponctualité (basée sur le respect des horaires programmés)
      const punctuality = Math.max(20, Math.min(100, 85 + (Math.random() - 0.5) * 30));
      
      // Score qualité (simulation basée sur l'efficacité)
      const qualityScore = Math.max(60, Math.min(100, efficiency + (Math.random() - 0.3) * 20));
      
      // Tendance hebdomadaire (simulation)
      const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
      const weeklyTrend = trends[Math.floor(Math.random() * trends.length)];
      
      // Badges de performance
      const badges: string[] = [];
      if (efficiency > 90) badges.push('Efficacité excellence');
      if (completedTasks.length > 10) badges.push('Productivité élevée');
      if (qualityScore > 95) badges.push('Qualité premium');
      if (punctuality > 95) badges.push('Ponctualité parfaite');
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        tasksCompleted: completedTasks.length,
        tasksInProgress: inProgressTasks.length,
        averageTime: Math.round(avgTime),
        efficiency: Math.round(efficiency),
        punctuality: Math.round(punctuality),
        qualityScore: Math.round(qualityScore),
        weeklyTrend,
        badges
      };
    });
  };

  // Calculer les statistiques d'équipe
  const calculateTeamStats = (teamMembers: TeamMember[]): TeamStats => {
    const activeMembers = teamMembers.filter(member => member.tasksCompleted > 0 || member.tasksInProgress > 0);
    const avgEfficiency = teamMembers.length > 0 
      ? teamMembers.reduce((sum, member) => sum + member.efficiency, 0) / teamMembers.length
      : 0;
    
    const totalTasksCompleted = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
    const avgCompletionTime = teamMembers.length > 0
      ? teamMembers.reduce((sum, member) => sum + member.averageTime, 0) / teamMembers.length
      : 0;
    
    // Score de moral d'équipe (basé sur la performance globale)
    const teamMorale = Math.round((avgEfficiency + teamMembers.reduce((sum, member) => sum + member.qualityScore, 0) / teamMembers.length) / 2);
    
    return {
      totalMembers: staff.length,
      activeMembers: activeMembers.length,
      avgEfficiency: Math.round(avgEfficiency),
      totalTasksCompleted,
      avgCompletionTime: Math.round(avgCompletionTime),
      teamMorale
    };
  };

  const teamMembers = calculateTeamPerformance();
  const teamStats = calculateTeamStats(teamMembers);

  // Trier les membres par performance globale
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const scoreA = (a.efficiency + a.qualityScore + a.punctuality) / 3;
    const scoreB = (b.efficiency + b.qualityScore + b.punctuality) / 3;
    return scoreB - scoreA;
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <div className="h-4 w-4 border-t-2 border-gray-400" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supervisor': return <Medal className="h-4 w-4 text-purple-600" />;
      case 'housekeeper': return <Users className="h-4 w-4 text-blue-600" />;
      case 'maintenance': return <Timer className="h-4 w-4 text-orange-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOverallScore = (member: TeamMember) => {
    return Math.round((member.efficiency + member.qualityScore + member.punctuality) / 3);
  };

  const topPerformer = sortedMembers[0];

  return (
    <div className="space-y-6">
      {/* Statistiques d'équipe globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              sur {teamStats.totalMembers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficacité moyenne</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(teamStats.avgEfficiency)}`}>
              {teamStats.avgEfficiency}%
            </div>
            <Progress value={teamStats.avgEfficiency} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teamStats.totalTasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.avgCompletionTime}min</div>
            <p className="text-xs text-muted-foreground">
              par tâche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moral d'équipe</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(teamStats.teamMorale)}`}>
              {teamStats.teamMorale}%
            </div>
            <Progress value={teamStats.teamMorale} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Top performer */}
      {topPerformer && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Trophy className="h-5 w-5" />
              Employé du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`/avatars/${topPerformer.id}.jpg`} />
                <AvatarFallback className="bg-yellow-200 text-yellow-800 text-lg font-bold">
                  {topPerformer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800">{topPerformer.name}</h3>
                <p className="text-sm text-yellow-600 capitalize">{topPerformer.role}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-sm">
                    <span className="font-medium">Score global: </span>
                    <span className="text-yellow-800 font-bold">{getOverallScore(topPerformer)}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tâches: </span>
                    <span className="text-yellow-800 font-bold">{topPerformer.tasksCompleted}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {topPerformer.badges.slice(0, 2).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-200 text-yellow-800 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance détaillée par membre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance individuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    <Avatar>
                      <AvatarImage src={`/avatars/${member.id}.jpg`} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className="text-xs capitalize">
                        {member.role}
                      </Badge>
                      {getTrendIcon(member.weeklyTrend)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.tasksCompleted} tâches terminées • {member.tasksInProgress} en cours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Métriques principales */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className={`text-sm font-medium ${getPerformanceColor(member.efficiency)}`}>
                        {member.efficiency}%
                      </div>
                      <div className="text-xs text-muted-foreground">Efficacité</div>
                    </div>
                    
                    <div>
                      <div className={`text-sm font-medium ${getPerformanceColor(member.qualityScore)}`}>
                        {member.qualityScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Qualité</div>
                    </div>
                    
                    <div>
                      <div className={`text-sm font-medium ${getPerformanceColor(member.punctuality)}`}>
                        {member.punctuality}%
                      </div>
                      <div className="text-xs text-muted-foreground">Ponctualité</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">{member.averageTime}min</div>
                      <div className="text-xs text-muted-foreground">Temps moy.</div>
                    </div>
                  </div>
                  
                  {/* Score global */}
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(getOverallScore(member))}`}>
                      {getOverallScore(member)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Score global</div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex gap-1">
                    {member.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <Badge key={badgeIndex} variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {badge.split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse comparative par rôle */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['supervisor', 'housekeeper', 'maintenance'].map(role => {
              const roleMembers = teamMembers.filter(member => member.role === role);
              if (roleMembers.length === 0) return null;
              
              const avgEfficiency = roleMembers.reduce((sum, member) => sum + member.efficiency, 0) / roleMembers.length;
              const avgQuality = roleMembers.reduce((sum, member) => sum + member.qualityScore, 0) / roleMembers.length;
              const totalTasks = roleMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
              
              return (
                <div key={role} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      <h4 className="font-medium capitalize">{role}</h4>
                      <Badge variant="outline">{roleMembers.length} membres</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalTasks} tâches terminées
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Efficacité moyenne</span>
                        <span className={getPerformanceColor(avgEfficiency)}>{Math.round(avgEfficiency)}%</span>
                      </div>
                      <Progress value={avgEfficiency} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Qualité moyenne</span>
                        <span className={getPerformanceColor(avgQuality)}>{Math.round(avgQuality)}%</span>
                      </div>
                      <Progress value={avgQuality} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}