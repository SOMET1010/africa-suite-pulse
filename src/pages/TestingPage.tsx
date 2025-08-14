/**
 * 🧪 Testing Module - Main Dashboard
 * 
 * Interface principale pour les tests de qualité de la plateforme AfricaSuite PMS.
 * Permet aux testeurs de sélectionner des modules et d'effectuer des tests interactifs.
 */

import React from 'react';
import { Plus, FileCheck, BarChart3, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TestingPage = () => {
  const navigate = useNavigate();
  
  // Récupérer les sessions de test récentes
  const { data: recentSessions, isLoading } = useQuery({
    queryKey: ['test-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Modules disponibles pour les tests
  const availableModules = [
    {
      id: 'restaurant',
      name: 'Restaurant POS',
      description: 'Test des fonctionnalités de point de vente',
      icon: '🍽️',
      testCount: 25,
      status: 'active'
    },
    {
      id: 'hotel',
      name: 'Gestion Hôtelière',
      description: 'Test du rack, arrivées, facturations',
      icon: '🏨',
      testCount: 32,
      status: 'active'
    },
    {
      id: 'housekeeping',
      name: 'Ménage',
      description: 'Test du planning et tâches de ménage',
      icon: '🧹',
      testCount: 18,
      status: 'draft'
    },
    {
      id: 'guests',
      name: 'Clients',
      description: 'Test de la gestion des clients',
      icon: '👥',
      testCount: 15,
      status: 'active'
    },
    {
      id: 'cardex',
      name: 'Cardex',
      description: 'Test des folios et facturation',
      icon: '💳',
      testCount: 22,
      status: 'draft'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      description: 'Test de la gestion des équipements',
      icon: '🔧',
      testCount: 14,
      status: 'draft'
    },
    {
      id: 'analytics',
      name: 'Analytics & Rapports',
      description: 'Test des tableaux de bord',
      icon: '📊',
      testCount: 20,
      status: 'draft'
    },
    {
      id: 'settings',
      name: 'Paramètres',
      description: 'Test des configurations système',
      icon: '⚙️',
      testCount: 12,
      status: 'draft'
    }
  ];

  const handleStartTest = (moduleId: string) => {
    navigate(`/testing/module/${moduleId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'draft':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🧪 Module de Test</h1>
          <p className="text-muted-foreground mt-2">
            Système intégré de tests de qualité pour AfricaSuite PMS
          </p>
        </div>
        <Button onClick={() => navigate('/testing/session/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Session
        </Button>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modules Actifs</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {availableModules.filter(m => m.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  sur {availableModules.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tests Disponibles</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {availableModules.reduce((acc, m) => acc + m.testCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  cas de test définis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentSessions?.filter(s => s.status === 'in_progress').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Couverture</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  fonctionnalités testées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des modules */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableModules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{module.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(module.status)}>
                      {module.status === 'active' ? 'Actif' : 'Brouillon'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tests disponibles:</span>
                    <span className="font-medium">{module.testCount}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartTest(module.id)}
                    className="w-full"
                    disabled={module.status !== 'active'}
                  >
                    {module.status === 'active' ? 'Démarrer Test' : 'Bientôt Disponible'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sessions Récentes</CardTitle>
              <CardDescription>
                Historique des dernières sessions de test
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : (
                <div className="space-y-4">
                  {recentSessions?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune session de test trouvée
                    </div>
                  ) : (
                    recentSessions?.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{session.session_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Module: {session.module_name} • Testeur: {session.tester_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.started_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Badge 
                            className={
                              session.status === 'completed' ? 'bg-success text-success-foreground' :
                              session.status === 'in_progress' ? 'bg-warning text-warning-foreground' :
                              'bg-muted text-muted-foreground'
                            }
                          >
                            {session.status === 'completed' ? 'Terminé' :
                             session.status === 'in_progress' ? 'En cours' : 'En pause'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Test</CardTitle>
              <CardDescription>
                Génération et consultation des rapports de qualité
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Fonctionnalité à venir - Rapports automatisés
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Tests</CardTitle>
              <CardDescription>
                Paramétrage des templates et environnements de test
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Fonctionnalité à venir - Gestion des templates
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingPage;